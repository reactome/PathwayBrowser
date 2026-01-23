import {Injectable, signal} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import cytoscape, {NodeCollection, NodeSingular} from "cytoscape";
import {catchError, map, Observable, of, switchMap} from "rxjs";
import {
  CustomInteraction,
  Interactor,
  Interactors,
  InteractorToken,
  PsicquicResource,
  ResourceAndType,
  ResourceType
} from "../model/interactor.model";


import InteractorsLayout from "../layout/interactors-layout";
import {DiagramService} from "../../services/diagram.service";
import {PathwayBrowserConfigService} from "../../services/pathway-browser-config.service";

@Injectable({
  providedIn: 'root',
})

export class InteractorService {

  private _PREFIX_INTERACTOR!: string;
  private _PREFIX_DISEASE!: string;

  private _STATIC_URL!: string;
  private _PSICQUIC_RESOURCE_URL!: string;
  private _PSICQUIC_URL!: string;
  public UPLOAD_URL!: string;
  public UPLOAD_PSICQUIC_URL!: string;
  private _TOKEN_URL!: string;

  private DISGENET_URL!: string;

  private readonly DEFAULT_INTERACTOR_WIDTH = 100;
  private readonly DEFAULT_DISGENET_WIDTH = 250
  private readonly INTERACTOR_PADDING = 20;
  private readonly CHAR_WIDTH = 10;
  private readonly CHAR_HEIGHT = 12;
  private readonly GENE_DECORATION_HEIGHT = 20;


  identifiers: string = '';
  cyToSelectedResource = new Map<cytoscape.Core, string>();

  currentResource = signal<ResourceAndType>({type: null, name: null})

  constructor(private http: HttpClient, private diagramService: DiagramService, private config: PathwayBrowserConfigService) {
    this._PREFIX_INTERACTOR = `${this.config.CONTENT_SERVICE}/interactors/`;
    this._PREFIX_DISEASE = `${this.config.OVERLAYS}/disgenet/`;
    this._STATIC_URL = this._PREFIX_INTERACTOR + 'static/molecules/details';
    this._PSICQUIC_RESOURCE_URL = this._PREFIX_INTERACTOR + 'psicquic/resources/';
    this._PSICQUIC_URL = this._PREFIX_INTERACTOR + 'psicquic/molecules/';
    this.UPLOAD_URL = this._PREFIX_INTERACTOR + 'upload/tuple/';
    this.UPLOAD_PSICQUIC_URL = this._PREFIX_INTERACTOR + 'upload/psicquic/url';
    this._TOKEN_URL = this._PREFIX_INTERACTOR + 'token/';
    this.DISGENET_URL = this._PREFIX_DISEASE + 'findByGenes';
  }
  private getIdentifiers(cy: cytoscape.Core): void {
    this.identifiers = this.getIdentifiersFromGraph(cy);
  }

  private updateIdentifiers(cy: cytoscape.Core): void {
    const currentIdentifiers = this.getIdentifiersFromGraph(cy);

    if (!this.identifiers || !this.areSame(this.identifiers, currentIdentifiers)) {
      this.identifiers = currentIdentifiers;
    } else {
      this.getIdentifiers(cy);
    }
  }

  areSame(idsA: string, idsB: string): boolean {
    const normalize = (str: string): string => str.split(',').sort().join(',');
    return normalize(idsA) === normalize(idsB);
  }


  public getIdentifiersFromGraph(cy: cytoscape.Core) {
    const graphNodes = cy?.nodes(`[graph]`);
    const result: string[] = [];

    graphNodes?.forEach(entity => {
      const schemaClass = entity.data("graph").schemaClass;
      if (schemaClass === "EntityWithAccessionedSequence" || schemaClass === "SimpleEntity") {
        result.push(entity.data("acc"));
      }
    });

    // Concatenate elements from the set values into a single string
    return [...new Set(result)].join(',')

  }

  public fetchInteractorData(cy: cytoscape.Core, resource: string): Observable<Interactors> {
    this.updateIdentifiers(cy);
    let url;
    if (resource === ResourceType.STATIC) {
      url = this._STATIC_URL;
    } else if (resource === ResourceType.DISGENET) {
      url = this.DISGENET_URL;
    } else {
      url = this._PSICQUIC_URL + resource.toLowerCase() + '/details'
    }

    return this.http.post<Interactors>(url, this.identifiers, {
      headers: new HttpHeaders({'Content-Type': 'text/plain'})
    });
  }

  public getCustomInteractorsByAcc(acc: string) {
    const url = `${this.config.CONTENT_SERVICE}/interactors/static/molecule/enhanced/${acc}/details`;
    return this.http.get<CustomInteraction[]>(url,)
  }

  public addInteractorOccurrenceNode(interactors: Interactors, cy: cytoscape.Core, resource: string) {
    if (this.cyToSelectedResource.has(cy) && this.cyToSelectedResource.get(cy) !== resource) {
      const previousResource = this.cyToSelectedResource.get(cy);
      cy.elements(`[resource='${previousResource}']`).remove();
      this.createInteractorOccurrenceNode(interactors, cy, resource);
      this.cyToSelectedResource.set(cy, resource);
    } else if (!this.cyToSelectedResource.has(cy)) {
      this.createInteractorOccurrenceNode(interactors, cy, resource);
      this.cyToSelectedResource.set(cy, resource);
    }
  }

  public createInteractorOccurrenceNode(interactors: Interactors, cy: cytoscape.Core, resource: string) {
    const classes = resource === ResourceType.DISGENET ? ['InteractorOccurrences', 'disease'] : ['InteractorOccurrences'];

    if (interactors.entities === undefined) return;

    interactors.entities
      .filter(interactorEntity => interactorEntity.count > 0)
      .forEach(interactorEntity => {

        const entities = cy?.nodes(`[acc = '${interactorEntity.acc}']`);
        entities?.forEach(entityNode => {

          const pos = {...entityNode.position()};
          pos.x += entityNode.width() / 2;
          pos.y -= entityNode.height() / 2;

          const id = entityNode.id() + '-occ' + '-' + resource.toLowerCase();

          if (!entityNode.classes().includes('Modification')) {
            const occurrenceNode = cy?.add({
              data: {
                ...entityNode.data(),
                exp: undefined,
                id: id,
                displayName: interactorEntity.count,
                entity: entityNode,
                interactors: interactorEntity.interactors,
                resource: resource
              },
              classes: classes,
              pannable: true,
              grabbable: false,
              position: pos
            });

            entityNode.data('occurrence', occurrenceNode);
          }

        });
      });
  }


  public addInteractorNodes(occurrenceNode: cytoscape.NodeSingular, cy: cytoscape.Core) {
    const interactorsData = occurrenceNode.data('interactors');
    const resource = occurrenceNode.data('resource')
    InteractorsLayout.BOX_WIDTH = resource === ResourceType.DISGENET ? this.DEFAULT_DISGENET_WIDTH / 2 : this.DEFAULT_INTERACTOR_WIDTH / 2;
    const numberToAdd = InteractorsLayout.getNumberOfInteractorsToDraw(interactorsData)
    const [dynamicInteractors, existingInteractors] = this.getAllInteractors(interactorsData, cy, numberToAdd);
    const allNodes: Interactor[] = [...dynamicInteractors, ...existingInteractors];
    cy.batch(() => {

      const nodes = this.createInteractorNodes(dynamicInteractors, occurrenceNode, cy, dynamicInteractors.length, resource);
      this.createInteractorEdges(allNodes, occurrenceNode, cy, resource);

      this.displayInteractors(nodes, cy);
    })
  }

  public getAllInteractors(interactorsData: Interactor[], cy: cytoscape.Core, numberToAdd: number) {
    const dynamicInteractors = [];
    const existingInteractors = [];
    // get interactors to draw with a provided a number, collect existing interactors for creating edge
    for (let interactor of interactorsData) {
      const diagramNodes = cy?.nodes(`.PhysicalEntity[acc = '${interactor.acc}']`);

      if (!diagramNodes || diagramNodes.length === 0) {
        dynamicInteractors.push(interactor);
      } else {
        interactor.existingNodes = diagramNodes;
        existingInteractors.push(interactor);
      }
    }

    return [dynamicInteractors.slice(0, numberToAdd), existingInteractors];
  }

  public createInteractorNodes(interactorsData: Interactor[], targetNode: NodeSingular, cy: cytoscape.Core, numberToAdd: number, resource: string) {
    const interactorNodes: cytoscape.NodeDefinition[] = [];
    const interactorLayout = new InteractorsLayout();

    interactorsData.forEach((interactor: Interactor, index: number) => {
      const position = interactorLayout.getPosition(targetNode, index, numberToAdd)
      const displayName = interactor.alias ? interactor.alias : interactor.acc;
      const defaultType = ['Protein', 'PhysicalEntity'] // Default interactor type for custom resource when there is no type data provided
      const classes = resource === ResourceType.DISGENET ? ['PhysicalEntity', 'Interactor', 'disease'] : [...this.diagramService.nodeTypeMap.get(interactor.type) || defaultType, 'Interactor'];
      let width = resource === ResourceType.DISGENET ? this.DEFAULT_DISGENET_WIDTH : this.DEFAULT_INTERACTOR_WIDTH;
      let height = this.CHAR_HEIGHT + 2 * this.INTERACTOR_PADDING;
      if (interactor.type === 'Gene') height += this.GENE_DECORATION_HEIGHT;

      const id = 'interactor-' + interactor.acc;
      interactorNodes.push({
        data: {
          ...targetNode.data(),
          id: id,
          graph: {
            ...targetNode.data('graph'),
            leaves: undefined,
            identifier: interactor.acc,
          },
          exp: undefined,
          displayName: displayName.replace(/([/,:;-])/g, "$1\u200b"),
          html: this.diagramService.getStructureVideoHtml({
            id,
            type: interactor.type || "Protein"
          }, width, height, interactor.acc),
          width: width,
          height: height,
          accURL: interactor.accURL,
          score: interactor.score,
          evidences: interactor.evidences,
          evidenceURLs: interactor.evidencesURL,
          resource: resource
        },
        classes: classes,
        position: position,
        selectable: false
      })
    })
    return cy?.add(interactorNodes)
  }


  public createInteractorEdges(interactorsData: Interactor[], occurrenceNode: NodeSingular, cy: cytoscape.Core | undefined, resource: string) {
    if (!cy) return

    const resourceClass = resource === ResourceType.DISGENET ? ['Interactor', 'disease'] : ['Interactor'];

    const interactorEdges: cytoscape.EdgeDefinition[] = [];
    interactorsData.forEach((interactor: Interactor) => {
      const entity = occurrenceNode.data('entity');
      const targetNodes = interactor.existingNodes ? interactor.existingNodes : [cy.getElementById('interactor-' + interactor.acc)];
      targetNodes.forEach(targetNode => {
        interactorEdges.push({
          data: {
            ...targetNode.data(),
            id: interactor.acc + '-' + entity.id(),
            source: entity.id(),
            target: targetNode.id(),
            edgeToTarget: occurrenceNode.id(),
            evidenceURLs: interactor.evidencesURL,
            resource: resource
          },
          classes: resourceClass,
          selectable: false
        })
      })

    })
    cy?.add(interactorEdges)
  }

  public displayInteractors(interactorsToDisplay: NodeCollection, cy: cytoscape.Core) {

    let layoutOptions: cytoscape.LayoutOptions = {
      name: 'preset',
      fit: false
    }
    interactorsToDisplay.layout(layoutOptions).run();
  }

  public removeInteractorNodes(occurrenceNode: cytoscape.NodeSingular) {
    const entityNode = occurrenceNode.data('entity');
    const interactors = entityNode.closedNeighborhood('node.Interactor');

    entityNode.connectedEdges('.Interactor').remove();
    interactors.forEach((interactor: cytoscape.NodeSingular) => {
      if (interactor.connectedEdges().empty()) {
        interactor.remove()
      }
    })
  }

  public clearAllInteractorNodes(cy: cytoscape.Core) {
    this.cyToSelectedResource.clear();
    const interactorOcc = cy.elements(`.InteractorOccurrences`).remove();
    interactorOcc.forEach(node => {
      if (node.hasClass('opened')) {
        this.removeInteractorNodes(node)
      }
    })
  }

  public getPsicquicResources(): Observable<PsicquicResource[]> {
    return this.http.get<PsicquicResource[]>(this._PSICQUIC_RESOURCE_URL, {
      headers: new HttpHeaders({'Content-Type': 'application/json;charset=UTF-8'})
    }).pipe(
      map((psicquicResources) => {
        return psicquicResources.filter(r => r.name !== ResourceType.STATIC && r.active)
      })
    )
  }


  public getInteractorsToken(name: string, url: string, body: string | FormData) {
    return this.http.post<InteractorToken>(url, body, {
      params: new HttpParams().set('name', name),
    })
  }


  /**
   * This method is used in custom dialog for retrieving interactors with a token , it first generates a token then
   * get interactors data from that token. There are different API calls based on user's selection to generate tokens.
   *
   * @param name custom resource name
   * @param url  different URLs, for instance, add data from a local file, the url will be UPLOAD_URL
   * @param body content
   * @param cy   cytoscape container
   */
  public getInteractorsFromToken(name: string, url: string, body: string | FormData, cy: cytoscape.Core): Observable<{
    token: InteractorToken,
    interactors: Interactors
  }> {
    this.updateIdentifiers(cy);
    return this.getInteractorsToken(name, url, body).pipe(
      switchMap(token => this.fetchCustomInteractors(token, cy))
    );
  }

  public fetchCustomInteractors(token: InteractorToken, cy: cytoscape.Core): Observable<{
    token: InteractorToken,
    interactors: Interactors
  }> {
    this.updateIdentifiers(cy);
    return this.http.post<Interactors>(this._TOKEN_URL + token.summary.token, this.identifiers, {
      headers: new HttpHeaders({'Content-Type': 'text/plain'})
    }).pipe(
      map((interactors) => ({token: token, interactors: interactors}))
    );
  }


  public getResourceTypeStatic(resource: string): ResourceType | null {

    if (resource === ResourceType.STATIC) {
      return ResourceType.STATIC;
    }
    if (resource === ResourceType.DISGENET) {
      return ResourceType.DISGENET;
    }

    // isFromPSICQUIC will be a function with a static dictionary to map to result, not Observable
    if (this.isFromPSICQUIC(resource)) {
      return ResourceType.PSICQUIC;
    }
    // none of above then is custom
    if (this.isCustomResource(resource)) {
      return ResourceType.CUSTOM;
    }

    return null;
  }


  public getResourceType(resource: string): Observable<ResourceType | null> {
    if (resource === ResourceType.STATIC) {
      return of(ResourceType.STATIC);
    }
    if (resource === ResourceType.DISGENET) {
      return of(ResourceType.DISGENET);
    }

    return this.isFromPSICQUIC(resource).pipe(
      switchMap(isPsicquic => {
        if (isPsicquic) {
          return of(ResourceType.PSICQUIC);
        }

        return this.isCustomResource(resource).pipe(
          map(isCustom => isCustom ? ResourceType.CUSTOM : null)
        );
      }),
      catchError(() => of(null))
    );
  }

  public isFromPSICQUIC(resource: string): Observable<boolean> {
    if (!resource) {
      return of(false);
    }

    return this.getPsicquicResources().pipe(
      map(psicquicResources =>
        psicquicResources.some(pr => pr.name === resource && pr.name !== ResourceType.STATIC)
      )
    );
  }

  public isCustomResource(resource: string): Observable<boolean> {
    if (!resource) {
      return of(false);
    }

    return this.getPsicquicResources().pipe(
      map(psicquicResources => {
        const isPsicquic = psicquicResources.some(pr => pr.name === resource && pr.name !== ResourceType.STATIC);
        return resource !== ResourceType.STATIC &&
          resource !== ResourceType.DISGENET &&
          !isPsicquic;
      })
    );
  }
}
