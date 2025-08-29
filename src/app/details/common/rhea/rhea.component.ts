import {Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, input, viewChildren} from '@angular/core';
import {DatabaseIdentifier} from "../../../model/graph/database-identifier.model";
import {rxResource} from "@angular/core/rxjs-interop";
import {RheaService} from "../../../services/rhea.service";
import {forkJoin} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {template} from "lodash";
import {layers} from "cytoscape-layers";
import '@swissprot/rhea-reaction-viz-test';
import {DarkService} from "../../../services/dark.service";

export type Layout = {
  columns: string;
  areas: string;
}

interface LabelLayout {
  left: number;   // horizontal center position
  width: number;  // width of the g element scaled
}

interface SvgLayout {
  labels: LabelLayout[];
}

@Component({
  selector: 'cr-rhea',
  imports: [],
  templateUrl: './rhea.component.html',
  styleUrl: './rhea.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class RheaComponent {

  readonly _xRefs = input.required<DatabaseIdentifier[]>({alias: 'crossRefs'});

  //todo: custom layout, remove it when dropping this layout
  reactionContainer = viewChildren<ElementRef<HTMLDivElement>>('reactionContainer');

  //layouts = signal<Layout[]>([{columns: '', areas: ''}]);


  constructor(private rheaService: RheaService,
              private http: HttpClient,
              private dark: DarkService) {

    //todo: custom layout, remove it when dropping this layout

    // effect(() => {
    //   const results: Layout[] = [];
    //   const svgs = this._structureSVGs.value();
    //   if (!svgs) return;
    //   setTimeout(() => {
    //     this.reactionContainer().forEach((container, rowIndex) => {
    //         const svg = container.nativeElement.querySelector('svg');
    //         if (!svg) return;
    //         const layout = this.getColumns(svg);
    //         if (!layout) return;
    //         console.log("layout", layout);
    //         results.push(layout);
    //       }
    //     )
    //     this.layouts.set(results);
    //   }, 10) // wait until DOM updates
    // });

    effect(() => {
      const bgColor = this.dark.isDark() ? '{filter:hue-rotate(180deg) invert(1)}' : '{fill:transparent !important}';
      if (this.rheaResources()) {
        console.log("run...")
        setTimeout(() => {
          const elements = document.querySelectorAll('rhea-visualizer') as NodeListOf<HTMLElement>;
          if (!elements) return;

          elements.forEach(element => {

            if (!element.shadowRoot) return;
            //
            // const atommap = element.shadowRoot.querySelector('.rhea-reaction-visualizer .atommap  rhea-atommap') as HTMLElement;
            // const svg = atommap?.querySelector('.rhea-mapping-container2')?.querySelector('svg');
            //
            // if (!svg) return;
            // const svgHeight = svg.getAttribute('height');
            // const svgBBoxHeight = svg.getBoundingClientRect().height;
            // if (!svgHeight) return;
            // const height = Math.ceil(parseInt(svgHeight));
            // console.log('svgHeight ', svgHeight)
            // console.log('svg ', svg)
            // console.log('svg ', height);


            let css = `
             .rhea-reaction-source {
               display: none;
              }
             .tabs {
               border-bottom: 1px var(--outline) solid;
              }
             .tab {
               margin-right: 0;
             }
             .tabpanel {
               border: none;
             }
             .tabpanel.atommap {
               height: fit-content !important;
               padding-bottom: 20px;
               overflow: hidden;
              }
             .rhea-mapping-container2 svg rect ${bgColor}
             .rhea-reaction-container img ${bgColor}
             .tab.selected {
               border-bottom: 2px var(--primary) solid;
               color: var(--primary);
             }
             .tab {
               background: transparent !important;
               width: 100%;
               text-align: center;
               color: var(--on-surface)
             }
             input[type="checkbox"] {
               accent-color: var(--primary);}
           `
            // if (svgBBoxHeight > 200) {
            //   css += `
            //       .rhea-mapping-container2 {
            //       height: ${height}px !important;
            //       }
            //   `
            // }
            const sheet = new CSSStyleSheet;
            sheet.replaceSync(css);
            element.shadowRoot.adoptedStyleSheets = [sheet];

          })
        }, 0)

      }
    });
  }


  _rheaResources = rxResource({
    request: () => this._xRefs(),
    loader: (params) => {

      const identifiers = params.request;

      /*
       Remove duplicated object in the list when they have same identifier
       */
      const unique = new Set<string>();
      const xRefs = identifiers.filter(i => {
        if (unique.has(i.identifier)) return false;
        unique.add(i.identifier);
        return true;
      })

      return forkJoin((
        xRefs.map(xRef => this.rheaService.getRheaJson(xRef))
      ))
    }
  })

  rheaResources = computed(() => this._rheaResources.value());


  //todo: custom layout, remove it when dropping this layout

  // _structureSVGs = rxResource({
  //   request: () => this.rheaResources() || [],
  //   loader: (params) => {
  //     const rheas = params.request;
  //
  //     return forkJoin((
  //       rheas.map(rhea => {
  //
  //         // Id and URL when not using widget for participants
  //         // const id =  participant.idprefix ==='chebi' ? participant.id : participant.reactivePart[0].id;
  //         // https://www.rhea-db.org/chebi/${participant.id}
  //
  //         const id = rhea.id;
  //         return this.http.get(`https://www.rhea-db.org/rhea/${id}/svg`, {responseType: 'text'}).pipe(
  //           map(result => [rhea.id, result] as unknown as [string, string | undefined]),
  //           //  catchError(() => of([rhea.id, undefined] as [string, undefined])) // fallback if error
  //         )
  //       })
  //     )).pipe(
  //       map(entries => new Map(entries)) // Transform to Map [id, result] from tuple arrays
  //     )
  //   }
  // })


  allParticipantStructures = computed(() => {
    return this.rheaResources()?.flatMap(rheaJson => rheaJson.participants);
  })


  //todo: custom layout, remove it when dropping this layout

  // structuredSVGs = computed(() => this._structureSVGs.value() || new Map<string, string | undefined>());

  //todo: custom layout, remove it when dropping this layout

  // getColumns(svg: SVGSVGElement) {
  //   // Get the actual rendered dimensions of the SVG
  //   const svgRect = svg.getBoundingClientRect();
  //   const svgWidth = svgRect.width;
  //
  //   if (svgWidth === 0) return null;
  //
  //   const parentG = svg.querySelector('g');
  //   if (!parentG) return null;
  //
  //   // Get direct children <g> elements
  //   const participants = Array.from(parentG.children)
  //     .filter(el => el.tagName.toLowerCase() === 'g') as SVGGElement[];
  //
  //   console.log("length ", participants.length);
  //
  //   if (participants.length === 0) return null;
  //
  //   // Get actual rendered positions using getBoundingClientRect
  //   const positions = participants.map(compound => {
  //     const compoundRect = compound.getBoundingClientRect();
  //
  //     // Calculate position relative to SVG container
  //     const relativeLeft = compoundRect.left - svgRect.left;
  //     const relativeRight = compoundRect.right - svgRect.left;
  //
  //     return {
  //       start: relativeLeft,
  //       end: relativeRight,
  //       width: compoundRect.width,
  //       center: relativeLeft + (compoundRect.width / 2)
  //     };
  //   });
  //
  //   console.log('Actual rendered positions:', positions);
  //
  //   // Create grid columns based on actual rendered positions
  //   const columns: string[] = [];
  //   let lastEnd = 0;
  //
  //   positions.forEach((pos, index) => {
  //     // Add gap before this compound if needed
  //     if (pos.start > lastEnd) {
  //       const gap = ((pos.start - lastEnd) / svgWidth) * 100;
  //       if (gap > 0.1) { // Only add significant gaps
  //         columns.push(`${gap.toFixed(2)}%`);
  //       }
  //     }
  //
  //     // Add the compound width
  //     const width = (pos.width / svgWidth) * 100;
  //     columns.push(`${width.toFixed(2)}%`);
  //
  //     lastEnd = pos.end;
  //   });
  //
  //   // Add remaining space if any
  //   if (lastEnd < svgWidth) {
  //     const remaining = ((svgWidth - lastEnd) / svgWidth) * 100;
  //     if (remaining > 0.1) {
  //       columns.push(`${remaining.toFixed(2)}%`);
  //     }
  //   }
  //
  //   // Create grid template areas
  //   let participantIndex = 0;
  //   const hasInitialGap = positions[0].start > 1;
  //
  //   const gridAreas = columns.map((col, colIndex) => {
  //     const isCompoundColumn = hasInitialGap ?
  //       (colIndex % 2 === 1) :
  //       (colIndex % 2 === 0);
  //
  //     if (isCompoundColumn && participantIndex < participants.length) {
  //       return `p${participantIndex++}`;
  //     } else {
  //       return '.'; // Empty area for gaps
  //     }
  //   }).join(' ');
  //
  //   return {
  //     columns: columns.join(' '),
  //     areas: `"${gridAreas}"`
  //   };
  // }

  protected readonly template = template;
  protected readonly layers = layers;
}
