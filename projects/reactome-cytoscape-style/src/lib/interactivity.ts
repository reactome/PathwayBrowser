import cytoscape from "cytoscape";
import {extract} from "./properties-utils";
import {Properties} from "./properties";
import {ReactomeEvent, ReactomeEventTypes} from "./model/reactome-event.model";
import Layers, {IHTMLLayer, layers, LayersPlugin} from 'cytoscape-layers';
import * as _ from "lodash";
import {isPromise} from "rxjs/internal/util/isPromise";


cytoscape.use(Layers)
type RenderableHTMLElement = HTMLElement & { render: _.DebouncedFunc<() => void> };

export class Interactivity {

  isMobile = 'ontouchstart' in document || navigator.maxTouchPoints > 0;

  constructor(private cy: cytoscape.Core, private properties: Properties) {
    console.log('is mobile', this.isMobile)
    // @ts-ignore
    cy.elements().ungrabify().panify();
    this.initHover(cy);
    this.initSelect(cy);
    this.initClick(cy);
    this.initZoom(cy);
    this.initStructureVideo(cy);
    this.initStructureMolecule(cy);
  }

  expandReaction(reactionNode: cytoscape.NodeCollection) {
    return reactionNode.connectedEdges().add(reactionNode);
  }

  applyToReaction = (action: (col: cytoscape.Collection) => void, stateKey: keyof State) => (reactionNode: cytoscape.NodeCollection) => {
    if (state[stateKey]) return;
    state[stateKey] = true;
    action(this.expandReaction(reactionNode));
    state[stateKey] = false;
  };

  initHover(cy: cytoscape.Core, mapper = <X>(x: X) => x) {
    const hoverReaction = this.applyToReaction(col => col.addClass('hover'), 'hovering')
    const deHoverReaction = this.applyToReaction(col => col.removeClass('hover'), 'deHovering')


    const container = cy.container()!;
    cy
      .on('mouseover', 'node.PhysicalEntity', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.hover, {
        element: e.target,
        type: "PhysicalEntity",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('mouseover', 'node.Pathway', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.hover, {
        element: e.target,
        type: "Pathway",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('mouseover', 'node.reaction', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.hover, {
        element: e.target,
        type: "reaction",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('mouseover', 'edge.reaction', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.hover, {
        element: e.target.connectedNodes('.reaction'),
        type: "reaction",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))

      .on('mouseout', 'node.PhysicalEntity', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.leave, {
        element: e.target,
        type: "PhysicalEntity",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('mouseout', 'node.Pathway', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.leave, {
        element: e.target,
        type: "Pathway",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('mouseout', 'node.reaction', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.leave, {
        element: e.target,
        type: "reaction",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('mouseout', 'edge.reaction', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.leave, {
        element: e.target.connectedNodes('.reaction'),
        type: "reaction",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))

      .on('mouseover', 'node', e => mapper(e.target).addClass('hover'))
      .on('mouseout', 'node', e => mapper(e.target).removeClass('hover'))

      .on('mouseover', 'node.reaction', e => hoverReaction(mapper(e.target)))
      .on('mouseout', 'node.reaction', e => deHoverReaction(mapper(e.target)))

      .on('mouseover', 'edge', e => {
        const mapped = mapper(e.target);
        if (mapped !== e.target) console.log(mapped, mapped.connectedNodes('.reaction'))

        hoverReaction(mapped.connectedNodes('.reaction'))
      })
      .on('mouseout', 'edge', e => deHoverReaction(mapper(e.target).connectedNodes('.reaction')))

      .on('mouseover', 'node.Modification', e => mapper(cy.nodes(`#${e.target.data('nodeId')}`)).addClass('hover'))
      .on('mouseout', 'node.Modification', e => mapper(cy.nodes(`#${e.target.data('nodeId')}`)).removeClass('hover'))

      .on('mouseover', 'edge.Interactor', e => mapper(cy.edges(`#${e.target.data('id')}`)).addClass('hover'))
      .on('mouseout', 'edge.Interactor', e => mapper(cy.edges(`#${e.target.data('id')}`)).removeClass('hover'))
  }

  initSelect(cy: cytoscape.Core, mapper = <X>(x: X) => x) {
    const selectReaction = this.applyToReaction(col => col.select(), 'selecting')
    const container = cy.container()!;

    cy
      .on('select', 'node.PhysicalEntity', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.select, {
        element: e.target,
        type: "PhysicalEntity",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('select', 'node.Pathway', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.select, {
        element: e.target,
        type: "Pathway",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('select', 'node.reaction', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.select, {
        element: e.target,
        type: "reaction",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('select', 'edge.reaction', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.select, {
        element: e.target.connectedNodes('.reaction'),
        type: "reaction",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))

      .on('unselect', 'node.PhysicalEntity', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.unselect, {
        element: e.target,
        type: "PhysicalEntity",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('unselect', 'node.Pathway', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.unselect, {
        element: e.target,
        type: "Pathway",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('unselect', 'node.reaction', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.unselect, {
        element: e.target,
        type: "reaction",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))
      .on('unselect', 'edge.reaction', e => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.unselect, {
        element: e.target.connectedNodes('.reaction'),
        type: "reaction",
        reactomeId: e.target.data('reactomeId'),
        cy
      })))

      .on('select', 'edge', e => selectReaction(mapper(e.target).connectedNodes('.reaction')))
      .on('unselect', 'edge', () => selectReaction(
        mapper(cy.edges(':selected').connectedNodes('.reaction')
          .add(cy.nodes('.reaction:selected')))
      )) // Avoid single element selection when double-clicking

      .on('select', 'node.reaction', event => selectReaction(mapper(event.target)))
      .on('select', 'node.Modification', e => mapper(cy.nodes(`#${e.target.data('nodeId')}`)).select())

  }

  initClick(cy: cytoscape.Core) {
    const container = cy.container()!;

    cy
      .on('tap', 'node.InteractorOccurrences', e => {
        const openClass = 'opened';
        let eventType = !e.target.hasClass(openClass) ? ReactomeEventTypes.open : ReactomeEventTypes.close;
        e.target.toggleClass(openClass);
        container.dispatchEvent(new ReactomeEvent(eventType, {
          element: e.target,
          type: "Interactor",
          reactomeId: e.target.data('reactomeId'),
          cy
        }))
      })

      .on('tap', '.Interactor', e => {
        const prop = e.target.isNode() ? 'accURL' : 'evidenceURLs';
        const url = e.target.data(prop);
        if (url) window.open(url);
      })
      .on('tap', '.DiseaseInteractor', e => {
        const prop = e.target.isNode() ? 'accURL' : 'evidenceURLs';
        const url = e.target.data(prop);
        if (url) window.open(url);
      })

    // .on('tap', e => {
    //   const openClass = 'opened';
    //   let eventType = !e.target.hasClass(openClass) ? ReactomeEventTypes.open : ReactomeEventTypes.close;
    //   e.target.toggleClass(openClass);
    //   container.dispatchEvent(new ReactomeEvent(eventType, {
    //     element: e.target,
    //     type: "Any",
    //     reactomeId: e.target.data('reactomeId'),
    //     cy
    //   }))
    // });
  }

  private videoLayer?: IHTMLLayer;


  initStructureVideo(cy: cytoscape.Core) {
    const layersPlugin: LayersPlugin = layers(cy);
    this.videoLayer = layersPlugin.append('html');
    if (this.videoLayer) this.videoLayer.node.style.opacity = '0';
    layersPlugin.renderPerNode(
      this.videoLayer!,
      (elem: HTMLElement) => {
        (elem as RenderableHTMLElement).render()
      },
      {
        init: (elem: RenderableHTMLElement, node: cytoscape.NodeSingular) => {
          const name = node.data('displayName');

          elem.innerHTML = node.data('html') || '';
          elem.style.display = "flex";
          const video = elem.children[0] as HTMLVideoElement;

          elem.render = _.throttle(() => {
              if (isElementInViewport(elem)) {
                // console.log('rendering', name)
                if (this.videoLayer?.node.style.opacity !== '0' && video.readyState === video.HAVE_NOTHING && video.networkState === video.NETWORK_IDLE) {
                  video.classList.add('loading');
                  video.oncanplay = e => video.classList.remove('loading')
                  let errors = 0;
                  const sources = video.querySelectorAll('source')!;
                  sources.forEach(source => source.addEventListener('error', (e) => {
                    errors++;
                    if (errors === sources.length) this.removeStructureContainer(video, node)
                  }));

                  video.load();
                }
                elem.style.visibility = node.visible() ? 'visible' : 'hidden';
              }

            }, 500
          );
        },
        transform: `translate(-70%, -50%)`,
        position: 'center',
        uniqueElements: false,
        checkBounds: false, // Need false otherwise destroy nodes when out of view
        selector: '.Protein',
        updateOn: "render", // Need render to call display whenever we move
        queryEachTime: false,
      }
    );

    this.videoLayer?.node.classList.add('video')
    const handler = (action: (video: HTMLVideoElement) => void) => async (event: cytoscape.EventObject) => {
      const videoId = event.target.id();
      const videoElement = this.videoLayer?.node.querySelector(`#video-${videoId}`) as HTMLVideoElement;
      if (videoElement && videoElement.readyState >= videoElement.HAVE_ENOUGH_DATA) {
        action(videoElement)
      }
    };
    if (this.isMobile) {
      this.cy
        .on('select', 'node.Protein', handler(v => v.play()))
        .on('unselect', 'node.Protein', handler(v => v.pause()))
    }
    this.cy
      .on('mouseover', 'node.Protein', handler(v => v.play()))
      .on('mouseout', 'node.Protein', handler(v => v.pause()));
  }

  removeStructureContainer(loadingContainer: HTMLElement, node: cytoscape.NodeSingular) {
    console.log('Remove structure container', loadingContainer, node)
    loadingContainer.classList.remove('loading')

    let baseFontSize = extract(this.properties.font.size);
    node.style({
      'font-size': baseFontSize,
      'text-margin-x': 0,
      'text-max-width': "100%",
    })
    this.structureContainers = this.structureContainers.not(node);
  };

  private moleculeLayer?: IHTMLLayer;

  initStructureMolecule(cy: cytoscape.Core) {
    // @ts-ignore
    const layers: LayersPlugin = cy.layers();

    this.moleculeLayer = layers.append('html');
    this.moleculeLayer.node.classList.add('molecule')

    layers.renderPerNode(
      this.moleculeLayer,
      (elem: HTMLElement, node: cytoscape.NodeSingular) => {
      },
      {
        init: (elem: HTMLElement, node: cytoscape.NodeSingular) => {
          elem.classList.add('molecule-structure')
          elem.classList.add('loading')
          const w = node.data('width') - 4; // retrieve border width
          const h = node.data('height') - 4; // retrieve border width
          const cos45 = 0.7071067811865476;
          const margin = (1 - cos45) * (Math.min(h, w) / 2); // Margin to cut the rounded corner exactly at 45deg
          elem.style.width = (w / 2) - margin + 'px';
          elem.style.height = h - (2 * margin) + 'px';
          elem.style.display = "flex"

          const structureId = node.data('chebiStructureId');
          const initStructure = (id: number) => {
            if (id === undefined) return this.removeStructureContainer(elem, node);
            const svgURL = `https://www.ebi.ac.uk/chebi/backend/api/public/structure/${id}/`;
            fetch(svgURL)
              .then(res => res.text())
              .then(res => {
                elem.innerHTML = res;
                const svg = elem.querySelector('svg');
                if (!svg) return this.removeStructureContainer(elem, node);
                // Remove white background
                svg.querySelector('rect:first-of-type')?.remove()
                // Readjust svg content to fit in the container
                const bbox = svg.getBBox();
                svg.setAttribute("viewBox", `${bbox.x - 1} ${bbox.y - 1} ${bbox.width + 2} ${bbox.height + 2}`);
                elem.classList.remove('loading');
              })
              .catch(e => {
                console.error(e)
                this.removeStructureContainer(elem, node);
              })
          }

          if (isPromise(structureId)) {
            structureId.then(initStructure)
          } else {
            console.log(node, structureId)
            initStructure(structureId)
          }

        },
        transform: `translate(-100%, -50%)`,
        position: 'center',
        uniqueElements: true,
        checkBounds: false,
        selector: '.Molecule',
        queryEachTime: false,
      }
    );
  }

  onZoom: {
    [name: string]: (e?: cytoscape.EventObjectCore) => void
    shadow: (e?: cytoscape.EventObjectCore) => void;
    protein: (e?: cytoscape.EventObjectCore) => void;
  } = {
    shadow: () => undefined,
    protein: () => undefined,
  };

  triggerZoom() {
    Object.values(this.onZoom).forEach(onZoom => onZoom())
  }

  structureContainers!: cytoscape.NodeCollection;

  updateProteins() {
    this.structureContainers = this.cy.nodes('.Protein')
      .or('.Molecule');
  }

  initZoom(cy: cytoscape.Core) {
    const shadows = cy.edges('[?pathway]');
    const shadowLabels = cy.nodes('.Shadow');
    const trivial = cy.elements('.trivial');
    this.updateProteins();

    cy.minZoom(Math.min(cy.zoom(), extract(this.properties.shadow.labelOpacity)[0][0] / 100));
    cy.maxZoom(15);

    let baseFontSize = extract(this.properties.font.size);
    const structureOpacityArray = extract(this.properties.structure.opacity)
    const zoomStart = structureOpacityArray[0][0];
    const zoomEnd = structureOpacityArray[structureOpacityArray.length - 1][0]


    this.onZoom.shadow = () => {
      const zoomLevel = cy.zoom();
      const z = zoomLevel * 100;
      const shadowLabelOpacity = this.interpolate(z, extract(this.properties.shadow.labelOpacity).map(v => this.p(...v))) / 100;
      const trivialOpacity = this.interpolate(z, extract(this.properties.trivial.opacity).map(v => this.p(...v))) / 100;
      const shadowOpacity = this.interpolate(z, extract(this.properties.shadow.opacity).map(v => this.p(...v))) / 100;
      shadows.style({
        'underlay-opacity': shadowOpacity
      });
      shadowLabels.style({
        'text-opacity': shadowLabelOpacity
      });
      trivial.style({
        'opacity': trivialOpacity,
        'underlay-opacity': Math.min(shadowOpacity, trivialOpacity)
      });
    }

    this.onZoom.protein = () => {
      const zoomLevel = cy.zoom();
      const z = zoomLevel * 100;
      const videoOpacity = this.interpolate(z, extract(this.properties.structure.opacity).map(v => this.p(...v))) / 100;

      const maxWidth = this.interpolate(z, [this.p(zoomStart, 100), this.p(zoomEnd, 50)]);
      this.margin = this.interpolate(z, [this.p(zoomStart, 0), this.p(zoomEnd, 0.25)]);
      const fontSize = this.interpolate(z, [this.p(zoomStart, baseFontSize), this.p(zoomEnd, baseFontSize / 2)]);
      this.structureContainers.style(
        {
          'font-size': fontSize,
          'text-margin-x': (n: cytoscape.NodeSingular) => this.margin * n.data("width"),
          'text-max-width': maxWidth + "%",
        })

      if (this.videoLayer) this.videoLayer.node.style.opacity = videoOpacity + '';
      if (this.moleculeLayer) this.moleculeLayer.node.style.opacity = videoOpacity + '';
    };

    cy.on('zoom', this.onZoom.shadow);
    cy.on('zoom', this.onZoom.protein);

    this.triggerZoom()
  }

  margin = 0;

  p(x: number, y: number): P {
    return new P(x, y)
  }

  interpolate(x: number, points: P[]): number {
    if (x < points.at(0)!.x) return points.at(0)!.y;
    if (x > points.at(-1)!.x) return points.at(-1)!.y;
    for (let i = 0; i + 1 < points.length; i++) {
      let y = this.lerp(x, points[i], points[i + 1])
      if (y) return y;
    }
    console.assert(false, "Should not arrive here")
    return 0;
  }

  /**
   * Linear interpolation as described in https://en.wikipedia.org/wiki/Linear_interpolation
   * @param x : number number to determine corresponding value
   * @param p0 : P lower bound point for the linear interpolation
   * @param p1 : P upper bound point for the linear interpolation
   */
  lerp(x: number, p0: P, p1: P): number | undefined {
    if (x < p0.x || x > p1.x) return undefined;
    return (p0.y * (p1.x - x) + p1.y * (x - p0.x)) / (p1.x - p0.x);
  }
}

interface State {
  [k: string]: boolean
}

const state: State = {
  selecting: false,
  hovering: false,
  deHovering: false
}

class P extends Array<number> {
  constructor(x: number, y: number) {
    super(x, y);
  }

  get x() {
    return this[0]
  }

  get y() {
    return this[1]
  }
}


function isElementInViewport(el: HTMLElement) {
  let rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}


