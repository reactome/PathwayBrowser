import {Injectable} from '@angular/core';
import {catchError, forkJoin, map, Observable, of, switchMap, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Diagram, Edge, Node, NodeConnector, Position, Prop, Rectangle} from "../model/diagram.model";
import {Graph} from "../model/graph.model";
import Reactome, {Style} from "reactome-cytoscape-style";
import {legend} from "../constants/legend"
import {array} from "vectorious";

import cytoscape from "cytoscape";
import cytoscapeFcose, {FcoseLayoutOptions} from "cytoscape-fcose";
import {PathwayBrowserConfigService} from "./pathway-browser-config.service";
import {SchemaClasses} from "../constants/constants";
import {GeneralService} from "./general.service";
import NodeDefinition = Reactome.Types.NodeDefinition;
import ReactionDefinition = Reactome.Types.ReactionDefinition;
import EdgeTypeDefinition = Reactome.Types.EdgeTypeDefinition;

cytoscape.use(cytoscapeFcose)


type RelativePosition = { distances: number[], weights: number[] };

const posToStr = (edge: Edge, pos: Position) => `${edge.id}-${pos.x},${pos.y}`

const pointToStr = (point: Position) => `${point.x};${point.y}`;

const scale = <T extends Position | number>(pos: T, scale = 2): T => {
  if (typeof pos === 'number') return pos * scale as T
  return {
    x: pos.x * scale,
    y: pos.y * scale
  } as T
}

const equal = (pos1: Position, pos2: Position) => pos1.x === pos2.x && pos1.y === pos2.y;

const avg = (positions: Position[]): Position => {
  const sum = {x: 0, y: 0};
  positions.forEach(pos => {
    sum.x += pos.x;
    sum.y += pos.y;
  });
  sum.x /= positions.length;
  sum.y /= positions.length;
  return sum;
}
const squaredDist = (pos1: Position, pos2: Position) => {
  return Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
}

const dist = (pos1: Position, pos2: Position) => Math.sqrt(squaredDist(pos1, pos2))

const closestToAverage = (positions: Position[]): Position => {
  const average = avg(positions);
  let closest = positions[0];
  let min = squaredDist(closest, average);
  for (let i = 1; i < positions.length; i++) {
    const pos = positions[i];
    const dist = squaredDist(pos, average);
    if (dist < min) {
      min = dist;
      closest = pos
    }
  }
  return closest;
}

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  extraLine: Map<string, Position> = new Map<string, Position>();
  reverseExtraLine: Map<string, Position> = new Map<string, Position>();

  constructor(private http: HttpClient, private general: GeneralService, private config: PathwayBrowserConfigService) {
  }

  nodeTypeMap = new Map<string, NodeDefinition>([
      ['Gene', ['Gene', 'PhysicalEntity']],
      ['RNA', ['RNA', 'PhysicalEntity']],
      ['Protein', ['Protein', 'PhysicalEntity']],
      ['Entity', ['GenomeEncodedEntity', 'PhysicalEntity']],
      ['Complex', ['Complex', 'PhysicalEntity']],
      ['EntitySet', ['EntitySet', 'PhysicalEntity']],
      ['Chemical', ['Molecule', 'PhysicalEntity']],
      ['Cell', ['Cell', 'PhysicalEntity']],

      ['ProteinDrug', ['Protein', 'PhysicalEntity', 'drug']],
      ['ComplexDrug', ['Complex', 'PhysicalEntity', 'drug']],
      ['ChemicalDrug', ['Molecule', 'PhysicalEntity', 'drug']],
      ['RNADrug', ['RNA', 'PhysicalEntity', 'drug']],
      ['EntitySetDrug', ['EntitySet', 'PhysicalEntity', 'drug']],

      ['ProcessNode', ['SUB', 'Pathway']],
      ['EncapsulatedNode', ['Interacting', 'Pathway']]
    ]
  )

  schemaClassToNodeTypeMap = new Map<string, string>([
    ['SimpleEntity', 'Chemical'],
    ['CandidateSet', 'EntitySet'],
    ['DefinedSet', 'EntitySet'],
    ['OtherEntity', 'Entity'],

    ['ReferenceMolecule', 'Chemical'],
    ['ReferenceDNASequence', 'Gene'],
    ['ReferenceRNASequence', 'RNA'],
    ['ReferenceGeneProduct', 'Protein'],
    ['ReferenceIsoform', 'Protein'],
    ['ReferenceTherapeutic', 'ChemicalDrug'],

  ]);

  reactionTypeMap = new Map<string | undefined, ReactionDefinition>([
      [undefined, ['transition', 'reaction']],
      ['transition', ['transition', 'reaction']],
      ['Transition', ['transition', 'reaction']],
      ['Process', ['transition', 'reaction']],

      ['binding', ['association', 'reaction']],
      ['Association', ['association', 'reaction']],

      ['dissociation', ['dissociation', 'reaction']],
      ['Dissociation', ['dissociation', 'reaction']],

      ['omitted', ['omitted', 'reaction']],
      ['Omitted Process', ['omitted', 'reaction']],

      ['uncertain', ['uncertain', 'reaction']],
      ['Uncertain Process', ['uncertain', 'reaction']],
    ]
  )

  edgeTypeMap = new Map<string, EdgeTypeDefinition>([
      ['INPUT', ['consumption', 'incoming', 'reaction']],
      ['ACTIVATOR', ['positive-regulation', 'incoming', 'reaction']],
      ['REQUIRED', ['positive-regulation', 'incoming', 'reaction']],
      ['INHIBITOR', ['negative-regulation', 'incoming', 'reaction']],
      ['CATALYST', ['catalysis', 'incoming', 'reaction']],
      ['OUTPUT', ['production', 'outgoing', 'reaction']],
    ]
  )

  edgeTypeToStr = new Map<string, string>([
      ['INPUT', '-'],
      ['ACTIVATOR', '+'],
      ['REQUIRED', '+>'],
      ['INHIBITOR', '|'],
      ['CATALYST', 'o'],
      ['OUTPUT', '>'],
    ]
  )


  linkClassMap = new Map<string, EdgeTypeDefinition>([
    ['EntitySetAndMemberLink', ['set-to-member', 'incoming']],
    ['EntitySetAndEntitySetLink', ['set-to-member', 'incoming']],
    ['Interaction', ['production', 'outgoing']],
    ['FlowLine', ['production', 'outgoing']]
  ])


  random(min: number, max: number) {
    return Math.floor((Math.random()) * (max - min + 1)) + min;
  }

  pick<T>(values: T[]): T {
    return values[this.random(0, values.length - 1)];
  }

  private readonly COMPARTMENT_SHIFT = 35;

  public getLegend(): Observable<cytoscape.ElementsDefinition> {
    return of(legend)
  }

  public getNormalPathway(id: string): Observable<string> {
    return this.http.get(`${this.config.CONTENT_SERVICE}/data/query/${id}/normalPathway`, {responseType: "text"}).pipe(
      map(data => data.split('\t')[0])
    )
  }

  public getCHEBIStructure(ids: Set<string>): Map<string, Promise<string | undefined>> {
    const chebiIds = [...ids];

    return new Map<string, Promise<string | undefined>>(chebiIds.map(id => [
      id,
      this.loadStructureSvg(parseInt(id))
    ]));
  }

  public async loadStructureSvg(id: number): Promise<string | undefined> {
    return fetch(`https://www.ebi.ac.uk/chebi/backend/api/public/compound/${id}/structure/`, {
    }).then(r => r.ok ? r.text() : undefined)
      .catch(err => undefined)
  }

  public getDiagram(id: number | string): Observable<cytoscape.ElementsDefinition> {
    return forkJoin({
      diagram: this.http.get<Diagram>(`${this.general.download()}/diagram/${id}.json`),
      graph: this.http.get<Graph.Data>(`${this.general.download()}/diagram/${id}.graph.json`)
    }).pipe(
      tap(({diagram, graph}) => console.log('Original diagram:', diagram, 'Original graph', graph)),
      switchMap(({diagram, graph}) => {
        if (diagram.forNormalDraw !== undefined && !diagram.forNormalDraw) {
          return this.getNormalPathway(diagram.stableId).pipe(
            switchMap(normalPathwayId => forkJoin({
              normalDiagram: this.http.get<Diagram>(`${this.general.download()}/diagram/${normalPathwayId}.json`),
              normalGraph: this.http.get<Graph.Data>(`${this.general.download()}/diagram/${normalPathwayId}.graph.json`)
            })),
            tap(({
                   normalGraph,
                   normalDiagram
                 }) => console.log('Normal diagram:', normalGraph, 'Normal graph', normalDiagram)),
            map(({normalGraph, normalDiagram}) => {
              graph.nodes.push(...normalGraph.nodes);
              graph.edges.push(...normalGraph.edges);
              if (normalDiagram.shadows) {
                normalDiagram.shadows.forEach(shadow => shadow.isFadeOut = true);
                diagram.shadows = diagram.shadows || [];
                diagram.shadows.push(...normalDiagram.shadows);

                graph.subpathways = graph.subpathways || [];
                graph.subpathways.push(...normalGraph.subpathways);
              }
              return {diagram, graph};
            }),
            catchError(err => of({diagram, graph}))
          )
        } else {
          return of({diagram, graph});
        }
      }),
      tap((mergedResponse) => console.log('All responses:', mergedResponse)),
      map(mergedResponse => ({
        ...mergedResponse,
        chebiMapping: this.getCHEBIStructure(
          new Set(mergedResponse.graph.nodes
            .filter(node => node.standardIdentifier?.startsWith('chebi:'))
            .map(node => node.identifier)
          )
        )
      })),
      map(({diagram, graph, chebiMapping}) => {
        console.log("edge.reactionType", new Set(diagram.edges.flatMap(edge => edge.reactionType)))
        console.log("node.connectors.types", new Set(diagram.nodes.flatMap(node => node.connectors.flatMap(con => con.type))))
        console.log("node.renderableClass", new Set(diagram.nodes.flatMap(node => node.renderableClass)))
        console.log("links.renderableClass", new Set(diagram.links.flatMap(link => link.renderableClass)))
        console.log("shadow.renderableClass", new Set(diagram.shadows.flatMap(shadow => shadow.renderableClass)))

        const idToEdges = new Map<number, Edge>(diagram.edges.map(edge => [edge.id, edge]));
        const idToNodes = new Map<number, Node>(diagram.nodes.map(node => [node.id, node]));
        const reactomeIdToEdge = new Map<number, Edge>(
          [
            // ...diagram.nodes.map(node => [node.reactomeId, node]),
            ...diagram.edges.map(edge => [edge.reactomeId, edge])
          ] as [number, Edge][]
        );

        const edgeIds = new Map<string, number>();
        const forwardArray = diagram.edges.flatMap(edge => edge.segments.map(segment => [posToStr(edge, scale(segment.from)), scale(segment.to)])) as [string, Position][];
        this.extraLine = new Map<string, Position>(forwardArray);
        console.assert(forwardArray.length === this.extraLine.size, "Some edge diagram have been lost because 2 segments are starting from the same point")

        const backwardArray = diagram.edges.flatMap(edge => edge.segments.map(segment => [posToStr(edge, scale(segment.to)), scale(segment.from)])) as [string, Position][];
        this.reverseExtraLine = new Map<string, Position>(backwardArray);
        console.assert(backwardArray.length == this.reverseExtraLine.size, "Some edge diagram have been lost because 2 segments are ending at the same point")


        const subpathwayIds = new Set<number>(diagram.shadows.map((shadow) => shadow.reactomeId))

        const eventIdToSubPathwayId = new Map<number, number>(graph.subpathways?.flatMap(subpathway => subpathway.events
          .map(event => [event, subpathway.dbId])
          .filter(entry => subpathwayIds.has(entry[1]))) as [number, number][] || [])

        const subpathwayIdToEventIds = new Map<number, number[]>(graph.subpathways?.map(subpathway => [subpathway.dbId, subpathway.events]));
        const subpathwayStIdToEventIds = new Map<string, number[]>(graph.subpathways?.map(subpathway => [subpathway.stId, subpathway.events]));
        // create a node id - graph node mapping
        const dbIdToGraphNode = new Map<number, Graph.Node>(graph.nodes.map(node => ([node.dbId, node])))
        const mappingList: [number, Graph.Node][] = graph.nodes.flatMap(node => {
          if (node.children && node.children.length === 1 && node.diagramIds?.length !== 1) { // Consider homomer complex like their constituents for interactors
            return node.diagramIds?.map(id => [id, dbIdToGraphNode.get(node.children[0])])
              .filter(entry => entry[1] !== undefined) as [number, Graph.Node][]
          } else {
            return node.diagramIds?.map(id => [id, node]) as [number, Graph.Node][]
          }
        }).filter(entry => entry !== undefined);

        const idToGraphNodes = new Map([...mappingList]);
        const idToGraphEdges = new Map(graph.edges.map(edge => [edge.dbId, edge]));

        const getLeaves = (node: Graph.Node, leaves: Set<Graph.Node>) => {
          if (node.children && node.children.length > 0)
            node.children.forEach(child => getLeaves(dbIdToGraphNode.get(child)!, leaves))
          else
            leaves.add(node);
        }

        idToGraphNodes.forEach(node => {
          if (node.children?.length > 0) {
            let leaves = new Set<Graph.Node>();
            getLeaves(node, leaves);
            node.leaves = [...leaves];
          }
        })

        const dbIdToGraphEdge = new Map<number, Graph.Edge>(graph.edges.map(edge => ([edge.dbId, edge])))

        const hasFadeOut = diagram.nodes.some(node => node.isFadeOut);
        const normalNodes = diagram.nodes.filter(node => node.isFadeOut);
        const specialNodes = diagram.nodes.filter(node => !node.isFadeOut);
        const posToNormalNode = new Map(normalNodes.map(node => [pointToStr(node.position), node]));
        const posToSpecialNode = new Map(specialNodes.map(node => [pointToStr(node.position), node]));

        const normalEdges = diagram.edges.filter(edge => edge.isFadeOut);
        const specialEdges = diagram.edges.filter(edge => !edge.isFadeOut);
        const posToNormalEdge = new Map(normalEdges.map(edge => [pointToStr(edge.position), edge]));
        const posToSpecialEdge = new Map(specialEdges.map(edge => [pointToStr(edge.position), edge]));

        //compartment nodes
        const compartmentNodes: cytoscape.NodeDefinition[] = diagram?.compartments.flatMap(item => {
          const propToRects = (prop: Prop): { [p: string]: number } => ({
            left: scale(prop.x),
            top: scale(prop.y),
            right: scale(prop.x + prop.width),
            bottom: scale(prop.x + prop.height),
          })

          let innerCR = 10;
          let outerCR
          if (item.insets) {
            const rects = [propToRects(item.prop), propToRects(item.insets)]
            outerCR = Object.keys(rects[0]).reduce((smallest, key) => Math.min(smallest, Math.abs(rects[0][key] - rects[1][key])), Number.MAX_SAFE_INTEGER);
            outerCR = innerCR + Math.min(outerCR, 100)
          }

          const layers: cytoscape.NodeDefinition[] = [
            {
              data: {
                id: item.id + '-outer',
                displayName: item.displayName,
                textX: scale(item.textPosition.x - (item.prop.x + item.prop.width)) + this.COMPARTMENT_SHIFT,
                textY: scale(item.textPosition.y - (item.prop.y + item.prop.height)) + this.COMPARTMENT_SHIFT,
                width: scale(item.prop.width),
                height: scale(item.prop.height),
                radius: outerCR
              },
              classes: ['Compartment', 'outer'],
              position: scale(item.position),
              selectable: false,
            }
          ];

          if (item.insets) {
            layers.push({
              data: {
                id: item.id + '-inner',
                width: scale(item.insets.width),
                height: scale(item.insets.height),
                radius: innerCR
              },
              classes: ['Compartment', 'inner'],
              position: scale({x: item.insets.x + item.insets.width / 2, y: item.insets.y + item.insets.height / 2}),
              selectable: false,
            })
          }
          return layers;
        });

        const replacementMap = new Map<string, string>();

        //reaction nodes
        const reactionNodes: cytoscape.NodeDefinition[] = diagram?.edges.map(item => {
          let replacement, replacedBy;
          if (item.isFadeOut) {
            replacedBy = posToSpecialEdge.get(pointToStr(item.position))?.id.toString() || specialEdges.find(edge => squaredDist(scale(edge.position), scale(item.position)) < 5 ** 2)?.id.toString();
            if (replacedBy) {
              replacementMap.set(item.id.toString(), replacedBy)
              replacementMap.set(replacedBy, item.id.toString())
            }
          }
          if (!item.isFadeOut) {
            replacement = posToNormalEdge.get(pointToStr(item.position))?.id.toString() || normalEdges.find(edge => squaredDist(scale(edge.position), scale(item.position)) < 5 ** 2)?.id.toString();
          }
          let subpathways = [...subpathwayStIdToEventIds.entries()].flatMap(([subpathwayId, events]) => events.includes(item.reactomeId) ? [subpathwayId] : []);

          return ({
            data: {
              id: item.id + '',
              // displayName: item.displayName,
              inputs: item.inputs,
              output: item.outputs,
              isFadeOut: item.isFadeOut,
              isBackground: item.isFadeOut,
              reactomeId: item.reactomeId,
              reactionId: item.id,
              graph: idToGraphEdges.get(item.reactomeId),
              subpathways: subpathways,
              replacement, replacedBy
            },
            classes: this.reactionTypeMap.get(item.reactionType),
            position: scale(item.position)
          });
        });


        //entity nodes
        const entityNodes: cytoscape.NodeDefinition[] = diagram?.nodes.flatMap(item => {
          let classes = [...this.nodeTypeMap.get(item.renderableClass) || item.renderableClass.toLowerCase()];
          let unitId = undefined;
          if (item.schemaClass === SchemaClasses.POLYMER) {
            const polymerGraphNode = dbIdToGraphNode.get(item.reactomeId)!;
            const unitGraph = dbIdToGraphNode.get(polymerGraphNode.children[0])!;
            const unitClass = this.nodeTypeMap.get(unitGraph.schemaClass) || this.nodeTypeMap.get(this.schemaClassToNodeTypeMap.get(unitGraph.schemaClass === 'EntityWithAccessionedSequence' ? unitGraph.referenceType : unitGraph.schemaClass)!) || ['GenomeEncodedEntity', 'PhysicalEntity'];
            classes = [SchemaClasses.POLYMER, ...unitClass]
            unitId = unitGraph.identifier;
          }
          let replacedBy: string | undefined;
          let replacement: string | undefined;
          if (item.isDisease) classes.push('disease');
          if (item.isCrossed) classes.push('crossed');
          if (item.trivial) classes.push('trivial');
          if (item.needDashedBorder) classes.push('loss-of-function');
          if (item.isFadeOut) {
            replacedBy = posToSpecialNode.get(pointToStr(item.position))?.id.toString()
            if (!replacedBy) {
              replacedBy = specialNodes.find(node => overlapLimited(item, node, 0.8))?.id.toString();
            }
            if (replacedBy) {
              replacementMap.set(item.id.toString(), replacedBy)
              replacementMap.set(replacedBy, item.id.toString())
            }
          }
          if (!item.isFadeOut) replacement = posToNormalNode.get(pointToStr(item.position))?.id.toString() //|| normalNodes.find(node => overlap(item, node))?.id.toString();
          if (classes.some(clazz => clazz === 'RNA')) item.prop.height -= 10;
          if (classes.some(clazz => clazz === 'Cell')) item.prop.height /= 2;
          const isBackground = item.isFadeOut || classes.some(clazz => clazz === 'Pathway') || item.connectors.some(connector => connector.isFadeOut);
          item.isBackground = isBackground;
          let html = undefined;
          let width = scale(item.prop.width);
          let height = scale(item.prop.height);
          const graphData = idToGraphNodes.get(item.id);
          if (!graphData) console.error("Missing graph data for node: ", item.id, ". Potential reason could be a wrong normal pathway for a disease")
          let preferredId = unitId || graphData?.identifier;
          let chebiStructure = preferredId ? chebiMapping.get(preferredId) : undefined
          if (classes.some(clazz => clazz === 'Protein')) {
            html = this.getStructureVideoHtml({...item, type: 'Protein'}, width, height, preferredId);
          }
          if (isBackground && !item.isFadeOut) {
            replacementMap.set(item.id.toString(), item.id.toString())
          }
          const isFadeOut = !item.isCrossed && item.isFadeOut;
          const nodes: cytoscape.NodeDefinition[] = [
            {
              data: {
                id: item.id + '',
                reactomeId: item.reactomeId,
                displayName: item.displayName.replace(/([/,:;-])/g, "$1\u200b"),
                height: height,
                width: width,
                graph: graphData,
                acc: preferredId,
                html,
                chebiStructure,
                isFadeOut,
                isBackground,
                replacement,
                replacedBy
              },
              classes: classes,
              position: scale(item.position)
            }
          ];
          if (item.nodeAttachments) {
            nodes.push(...item.nodeAttachments.map(ptm => ({
              data: {
                id: item.id + '-' + ptm.reactomeId,
                reactomeId: ptm.reactomeId,
                nodeId: item.id,
                nodeReactomeId: item.reactomeId,
                displayName: ptm.label,
                height: scale(ptm.shape.b.y - ptm.shape.a.y),
                width: scale(ptm.shape.b.x - ptm.shape.a.x),
                isFadeOut,
                isBackground,
                replacement,
                replacedBy
              },
              classes: "Modification",
              position: scale(ptm.shape.centre)
            })))
          }
          return nodes
        });

        //sub pathways
        const shadowNodes: cytoscape.NodeDefinition[] = diagram?.shadows.map(item => {
          return {
            data: {
              id: item.id + '',
              displayName: item.displayName,
              height: scale(item.prop.height),
              width: scale(item.prop.width),
              reactomeId: item.reactomeId,
              isFadeOut: item.isFadeOut,
              replacedBy: item.isFadeOut,
              triggerPosition: scale(item.maxX)
            },
            classes: ['Shadow'],
            position: closestToAverage(subpathwayIdToEventIds.get(item.reactomeId)!.map(reactionId => reactomeIdToEdge.get(reactionId)!).map(edge => scale(edge!.position)))
          }
        });

        avoidOverlap(shadowNodes);

        const T = 4;
        const ARROW_MULT = 1.5;
        const EDGE_MARGIN = 6;
        const REACTION_RADIUS = 3 * T;
        const MIN_DIST = EDGE_MARGIN;


        /**
         * Edges: iterate nodes connectors to get all edges information based on the connector type.
         *
         */
        const edges: cytoscape.EdgeDefinition[] =
          diagram.nodes.flatMap(node => {
              return node.connectors.map(connector => {
                const reaction = idToEdges.get(connector.edgeId)!;

                const reactionP = scale(reaction.position);
                const nodeP = scale(node.position);

                const [source, target] = connector.type !== 'OUTPUT' ?
                  [node, reaction] :
                  [reaction, node];

                const sourceP = scale(source.position);
                const targetP = scale(target.position);

                let points = connector.segments
                  .flatMap((segment, i) => i === 0 ? [segment.from, segment.to] : [segment.to])
                  .map(pos => scale(pos));
                if (connector.type === 'OUTPUT') points.reverse();
                if (points.length === 0) points.push(reactionP);

                this.addEdgeInfo(reaction, points, 'backward', sourceP);
                this.addEdgeInfo(reaction, points, 'forward', targetP);

                let [from, to] = [points.shift()!, points.pop()!]
                from = from ?? nodeP; // Quick fix to avoid problem with reaction without visible outputs like R-HSA-2424252 in R-HSA-1474244
                to = to ?? reactionP; // Quick fix to avoid problem with reaction without visible outputs like R-HSA-2424252 in R-HSA-1474244
                if (connector.type === 'CATALYST') {
                  to = scale(connector.endShape.centre);
                }

                // points = addRoundness(from, to, points);
                const relatives = this.absoluteToRelative(from, to, points);

                const classes = [...this.edgeTypeMap.get(connector.type)!];
                if (reaction.isDisease) classes.push('disease');
                if (node.trivial) classes.push('trivial');
                if (eventIdToSubPathwayId.has(reaction.reactomeId)) classes.push('shadow');

                let subpathways = [...subpathwayStIdToEventIds.entries()].flatMap(([subpathwayId, events]) => events.includes(reaction.reactomeId) ? [subpathwayId] : []);

                let d = dist(from, to);
                if (equal(from, reactionP) || equal(to, reactionP)) d -= REACTION_RADIUS;
                if (classes.includes('positive-regulation') || classes.includes('catalysis') || classes.includes('production')) d -= ARROW_MULT * T;
                // console.assert(d > MIN_DIST, `The edge between reaction: R-HSA-${reaction.reactomeId} and entity: R-HSA-${node.reactomeId} in pathway ${id} has a visible length of ${d} which is shorter than ${MIN_DIST}`)
                console.assert(d > MIN_DIST, `${id}\t${diagram.displayName}\t${hasFadeOut}\tR-HSA-${reaction.reactomeId}\tR-HSA-${node.reactomeId}\thttps://release.reactome.org/PathwayBrowser/#/${id}&SEL=R-HSA-${reaction.reactomeId}&FLG=R-HSA-${node.reactomeId}\thttps://reactome-pwp.github.io/PathwayBrowser/${id}?select=${reaction.reactomeId}&flag=${node.reactomeId}`)

                let replacement, replacedBy;
                if (connector.isFadeOut) {
                  // First case: same node is used both special and normal context
                  // replacedBy = node.connectors.find(otherConnector => otherConnector !== connector && !otherConnector.isFadeOut && samePoint(idToEdges.get(otherConnector.edgeId)!.position, reaction.position))?.edgeId;
                  // Second case: different nodes are used between special and normal context
                  // replacedBy = replacedBy || (posToSpecialNode.get(pointToStr(node.position)) && posToSpecialEdge.get(pointToStr(reaction.position)))?.id;

                  replacedBy = replacementMap.get(node.id.toString()) && replacementMap.get(reaction.id.toString())
                }
                if (!connector.isFadeOut) {
                  // First case: same node is used both special and normal context
                  replacement = node.connectors.find(otherConnector => otherConnector !== connector && otherConnector.isFadeOut && samePoint(idToEdges.get(otherConnector.edgeId)!.position, reaction.position))?.edgeId;
                  // console.log("Reaction edge", replacement)

                  // Second case: different nodes are used between special and normal context
                  replacement = replacement || (posToNormalNode.get(pointToStr(node.position)) && posToNormalEdge.get(pointToStr(reaction.position)))?.id;
                  // console.log("Reaction edge", replacement)

                }
                const edge: cytoscape.EdgeDefinition = {
                  data: {
                    id: this.getEdgeId(source, connector, target, edgeIds),
                    graph: dbIdToGraphEdge.get(reaction.reactomeId),
                    source: source.id + '',
                    target: target.id + '',
                    stoichiometry: connector.stoichiometry.value,
                    weights: relatives.weights.join(" "),
                    distances: relatives.distances.join(" "),
                    sourceEndpoint: this.endpoint(sourceP, from),
                    targetEndpoint: this.endpoint(targetP, to),
                    pathway: eventIdToSubPathwayId.get(reaction.reactomeId),
                    reactomeId: reaction.reactomeId,
                    reactionId: reaction.id,
                    isFadeOut: reaction.isFadeOut,
                    isBackground: reaction.isFadeOut,
                    subpathways,
                    replacedBy, replacement
                  },
                  classes: classes
                };
                return edge
              });
            }
          );

        const linkEdges: cytoscape.EdgeDefinition[] = diagram.links
          ?.filter(link => !link.renderableClass.includes('EntitySet') || link.inputs[0].id !== link.outputs[0].id)
          ?.map(link => {
              const source = idToNodes.get(link.inputs[0].id)!;
              const target = idToNodes.get(link.outputs[0].id)!;

              const sourceP = scale(source.position);
              const targetP = scale(target.position);

              let points = link.segments
                .flatMap((segment, i) => i === 0 ? [segment.from, segment.to] : [segment.to])
                .map(pos => scale(pos));

              let [from, to] = [points.shift()!, points.pop()!]
              from = from ?? sourceP; // Quick fix to avoid problem with reaction without visible outputs like R-HSA-2424252 in R-HSA-1474244
              to = to ?? targetP; // Quick fix to avoid problem with reaction without visible outputs like R-HSA-2424252 in R-HSA-1474244

              // points = addRoundness(from, to, points);
              const relatives = this.absoluteToRelative(from, to, points);

              const classes = [...this.linkClassMap.get(link.renderableClass)!];
              if (link.isDisease) classes.push('disease');
              const isBackground = link.isFadeOut ||
                idToNodes.get(link.inputs[0].id)?.isBackground &&
                idToNodes.get(link.outputs[0].id)?.isBackground;

              return {
                data: {
                  id: link.id + '',
                  source: link.inputs[0].id + '',
                  target: link.outputs[0].id + '',
                  weights: relatives.weights.join(" "),
                  distances: relatives.distances.join(" "),
                  sourceEndpoint: this.endpoint(sourceP, from),
                  targetEndpoint: this.endpoint(targetP, to),
                  isFadeOut: link.isFadeOut,
                  isBackground: isBackground
                },
                classes: classes,
                selectable: false
              }
            }
          )

        console.log('All data created')
        return {
          nodes: [...compartmentNodes, ...reactionNodes, ...entityNodes, ...shadowNodes],
          edges: [...edges, ...linkEdges]
        };
      }),
      tap((output) => console.log('Output:', output)),
    )

  }

  getStructureVideoHtml(item: {
    id: string | number,
    type: string
  }, width: number, height: number, uniprotId: string | undefined) {
    if (item.type === 'Protein' && uniprotId) {
      const baseId = uniprotId.split(/[#-]/)[0];
      return `<video loop id="video-${item.id}" width="${width + 10}" height="${height + 10}"  preload="none">
                <source src="${this.config.s3}/structures/${uniprotId}.mov" type="video/quicktime">
                <source src="${this.config.s3}/structures/${uniprotId}.webm" type="video/webm">
                <source src="${this.config.s3}/structures/${baseId}.mov" type="video/quicktime">
                <source src="${this.config.s3}/structures/${baseId}.webm" type="video/webm">
              </video>`;
    }
    return undefined;
  }

  private getEdgeId(source: Edge | Node, connector: NodeConnector, target: Edge | Node, edgeIds: Map<string, number>) {
    let edgeId = `${source.id} --${this.edgeTypeToStr.get(connector.type)} ${target.id}`;

    if (edgeIds.has(edgeId)) {
      let count = edgeIds.get(edgeId)!;
      edgeIds.set(edgeId, count++);
      edgeId += ` (${count})`;
      console.warn('Conflicting edge id: ', edgeId)
    } else {
      edgeIds.set(edgeId, 0)
    }
    return edgeId;
  }

  private addEdgeInfo(edge: Edge, points: Position[], direction: 'forward' | 'backward', stop: Position) {
    const stopPos = posToStr(edge, stop);
    if (direction === 'forward') {
      const map = this.extraLine;
      let pos = posToStr(edge, points.at(-1)!)
      while (map.has(pos) && pos !== stopPos) {
        points.push(map.get(pos)!)
        pos = posToStr(edge, points.at(-1)!)
      }
    } else {
      const map = this.reverseExtraLine;
      let pos = posToStr(edge, points.at(0)!)
      while (map.has(pos) && pos !== stopPos) {
        points.unshift(map.get(pos)!)
        pos = posToStr(edge, points.at(0)!)
      }
    }
  }

  private endpoint(source: Position, point: Position): string {
    return `${point.x - source.x} ${point.y - source.y}`
  }


  /**
   * Use Matrix power to convert points from an absolute coordinate system to an edge relative system
   *
   * Visually explained by https://youtu.be/kYB8IZa5AuE?si=vJKi-MUv2dCRQ5oA<br>
   * Short version ==> https://math.stackexchange.com/q/1855051/683621
   * @param source Position position of the edge source:  {x:number, y:number}
   * @param target Position position of the edge target:  {x:number, y:number}
   * @param toConvert Array of Position to convert to the edge-relative system
   * @return The points converted to relative coordinates {distances: number[], weights: number[]}
   */
  private absoluteToRelative(source: Position, target: Position, toConvert: Position[]): RelativePosition {
    const relatives: RelativePosition = {distances: [], weights: []};
    if (toConvert.length === 0) return relatives;

    const mainVector = array([target.x - source.x, target.y - source.y]); // Edge vector
    const orthoVector = array([-mainVector.y, mainVector.x]) // Perpendicular vector
      .normalize(); //Normalized to have the distance expressed in pixels https://math.stackexchange.com/a/413235/683621
    let transform = array([
      [mainVector.x, mainVector.y],
      [orthoVector.x, orthoVector.y],
    ]).inv(); // Should always be invertible if the ortho vector is indeed perpendicular

    for (let coord of toConvert) {
      const absolute = array([[coord.x - source.x, coord.y - source.y]]);
      const relative = absolute.multiply(transform);
      relatives.weights.push(relative.get(0, 0))
      relatives.distances.push(relative.get(0, 1))
    }
    return relatives;
  }

  public randomNetwork(): Observable<cytoscape.ElementsDefinition> {
    const amount = 100;
    const peTypes = ['Protein', 'EntitySet', 'GenomeEncodedEntity', 'RNA', 'Gene', 'Complex', 'Molecule'];
    // const peTypes = ['Gene'];
    const reactionTypes = ['association', 'dissociation', 'transition', 'uncertain', 'omitted'];

    const physicalEntities: cytoscape.NodeDefinition[] = Array.from({length: amount}, (x, i) => {
      const clazz = this.pick(peTypes);
      return {
        group: 'nodes',
        data: {
          id: i.toString(),
          width: this.random(150, 300),
          height: this.random(50, 150),
          displayName: clazz,
          parent: 'Compartment'
        },
        classes: [clazz, "PhysicalEntity", this.pick(["drug", "", ""])]
      };
    });

    const reactions: cytoscape.NodeDefinition[] = physicalEntities.map((node, i) =>
      ({
        group: 'nodes',
        data: {
          id: `${i}-react`,
          parent: 'Compartment'
        },
        classes: [this.pick(reactionTypes), 'reaction']
      })
    );

    const nodes: cytoscape.NodeDefinition[] = physicalEntities.flatMap((node, i) =>
      [node, reactions[i]]
    );


    const inOut: cytoscape.EdgeDefinition[] = physicalEntities.flatMap((node, i) => [
      {
        group: 'edges',
        data: {
          source: `${i}`,
          target: `${i}-react`,
          stoichiometry: this.pick([undefined, -1, 0, 1, 2])
        },
        classes: ['consumption']
      },
      {
        group: 'edges',
        data: {
          source: `${i}-react`,
          target: `${(i + 1) % amount}`,
          stoichiometry: this.pick([undefined, -1, 0, 1, 2])
        },

        classes: ['production']
      },
    ])

    const additionalIn: cytoscape.EdgeDefinition[] = Array.from({length: amount / 4}).map(() => ({
      group: 'edges',
      data: {
        source: this.pick(physicalEntities).data.id!,
        target: this.pick(reactions).data.id!,
      },
      classes: this.pick(['catalysis', 'positive-regulation', 'negative-regulation', 'set-to-member'])
    }));


    const edges: cytoscape.EdgeDefinition[] = [...inOut, ...additionalIn];

    return of({ // list of graph elements to start with
      nodes: [
        {
          data: {id: 'Compartment'},
          classes: ['Compartment'],
          pannable: true,
          grabbable: false,
          selectable: false
        },
        ...nodes
      ]
      , edges
    })
  }

  getEHLDSvg(id: number | string): Observable<string> {
    return this.http.get(`${this.general.download()}/ehld/${id}.svg`, {responseType: 'text'});
  }
}

function samePoint(p1: Position, p2: Position) {
  return p1.x === p2.x && p1.y === p2.y
}

function overlapLimited(nodeA: Node, nodeB: Node, limit: number = 0.8): boolean {
  if (nodeA.position.x === nodeB.position.x && nodeA.position.y === nodeB.position.y) return true;
  const rectA = getRect(nodeA), rectB = getRect(nodeB);
  const o: Rectangle = {
    left: Math.max(rectA.left, rectB.left),
    right: Math.min(rectA.right, rectB.right),
    top: Math.max(rectA.top, rectB.top),
    bottom: Math.min(rectA.bottom, rectB.bottom)
  }
  return (o.left < o.right && o.top < o.bottom) && ((area(o) / area(rectA)) > limit);
}

function overlap(nodeA: Node, nodeB: Node): boolean {
  if (nodeA.position.x === nodeB.position.x && nodeA.position.y === nodeB.position.y) return true;
  const rectA = getRect(nodeA), rectB = getRect(nodeB);
  return Math.max(rectA.left, rectB.left) < Math.min(rectA.right, rectB.right)
    && Math.max(rectA.top, rectB.top) < Math.min(rectA.bottom, rectB.bottom);
}

function area(rect: Rectangle) {
  return (rect.right - rect.left) * (rect.bottom - rect.top)
}

function getRect(node: Node): Rectangle {
  if (node.rect) return node.rect
  const halfWidth = node.prop.width / 2;
  const halfHeight = node.prop.height / 2;
  node.rect = {
    left: node.position.x - halfWidth,
    right: node.position.x + halfWidth,
    top: node.position.y - halfHeight,
    bottom: node.position.y + halfHeight,
  }
  return node.rect;
}

/**
 * Create a temporary cytoscape session to apply a layout to the nodes in order to avoid them to overlap each others
 */
function avoidOverlap(definitions: cytoscape.NodeDefinition[]) {
  const container = document.createElement("div");

  const style = new Style(container, {});
  const cy = cytoscape({
    container: container,
    style: style.getStyleSheet(),
    elements: definitions,
    layout: {name: 'preset'}
  });

  const nodes = cy.nodes();
  nodes.forEach(node => {
    const bb = node.boundingBox({includeLabels: true, includeNodes: false});
    node.style({width: bb.w, height: bb.h})
  })

  const layout = nodes.layout({
    name: 'fcose',
    nodeRepulsion: 15,
    animate: false,
    fit: true,
    packComponents: false,
    randomize: false,
    tile: false,
  } as FcoseLayoutOptions);
  layout.run()

  definitions.forEach(def => def.position = cy.getElementById(def.data.id!).position());

  cy.destroy()
  container.remove()
}
