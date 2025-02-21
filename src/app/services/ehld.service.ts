import {ElementRef, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, forkJoin, map, Observable, of, tap} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Graph} from "../model/graph.model";
import {Analysis} from "../model/analysis.model";
import {isArray} from "lodash";
import {AnalysisService} from "./analysis.service";
import {reportUnhandledError} from "rxjs/internal/util/reportUnhandledError";

export interface LegendItem {
  name: string;
  src: string;
  alt: string;
}

export interface LegendGroup {
  type: string;
  items: LegendItem[];
}


@Injectable({
  providedIn: 'root'
})
export class EhldService {

  private readonly _HAS_EHLD = `${environment.host}/ContentService/data/query/`;

  private _hasEHLD = new BehaviorSubject<boolean | undefined>(undefined);
  hasEHLD$ = this._hasEHLD.asObservable();
  hasEHLD?: boolean

  overlay = "OVERLAY-";
  analysisInfoId = "ANALINFO";
  analysisInfoContainer = "analysis-info-container";
  pattern = "pattern-";

  legendItems: LegendGroup[] = [
    {
      type: "Arrow Type",
      items: [
        {name: "Indication", src: "assets/EHLD-legend/R-ICO-012345.svg", alt: "indication arrow"},
        {name: "Motion", src: "assets/EHLD-legend/R-ICO-012347.svg", alt: "motion arrow"},
        {name: "Process", src: "assets/EHLD-legend/R-ICO-012348.svg", alt: "process arrow"},
        {name: "Inhibition", src: "assets/EHLD-legend/R-ICO-012346.svg", alt: "inhibition arrow"},
        {name: "Transformation", src: "assets/EHLD-legend/R-ICO-012349.svg", alt: "transformation arrow"}
      ]
    },
    {
      type: "Disease Modifiers",
      items: [
        {name: "Not happening", src: "assets/EHLD-legend/R-ICO-012339.svg", alt: "not happening arrow"},
        {name: "Disease related", src: "assets/EHLD-legend/R-ICO-012342.svg", alt: "disease-related arrow"}
      ]
    }
  ];

  constructor(private http: HttpClient, private analysis: AnalysisService) {
  }


  getSVGData(id: string): Observable<{ svg: string; graphData: Graph.Data }> {
    const svgRequest = this.http.get(`${environment.host}/download/current/ehld/${id}.svg`, {responseType: 'text'});
    const grapRequest = this.http.get<Graph.Data>(`${environment.host}/download/current/diagram/${id}.graph.json`)
    return forkJoin({svg: svgRequest, graph: grapRequest}).pipe(
      map(({svg, graph}) => {
        return {
          svg: svg,
          graphData: graph
        };
      })
    );
  }

  // Hover an element
  applyShadow(svgElement: SVGGElement, flaggedElement: (SVGGElement | undefined)[]) {
    const hoveringShadow = `drop-shadow(0 0 7px var(--select-edge))`;
    if (this.isFlagged(svgElement, flaggedElement)) {
      const flagOuterOutline = `drop-shadow(0 0 7px var(--flag))`;
      const hoveringInnerOutline = `drop-shadow(0 0 3px var(--select-edge))`;
      svgElement.style.filter = `${flagOuterOutline} ${hoveringInnerOutline}`;
    } else {
      svgElement.style.filter = hoveringShadow;
    }

  }

  removeShadow(svgElement: SVGGElement, flaggedElement: (SVGGElement | undefined)[]): void {
    svgElement.style.filter = 'none';

    if (this.isFlagged(svgElement, flaggedElement)) {
      this.applyFlagOutline(svgElement);
    }
  }

  // Select an element
  applyOutline(svgElement: SVGGElement, flaggedElement: (SVGGElement | undefined)[]) {

    const selectionOutline = `drop-shadow(0 0 4px var(--select-edge)) drop-shadow(0 0 4px var(--select-edge)) drop-shadow(0 0 4px var(--select-edge))  drop-shadow(0 0 4px var(--select-edge))`;

    if (this.isFlagged(svgElement, flaggedElement)) {
      const flagOuterOutline = `drop-shadow(0 0 2px var(--flag)) drop-shadow(0 0 2px var(--flag)) drop-shadow(0 0 2px var(--flag)) drop-shadow(0 0 2px var(--flag))`;
      const selectionInnerOutline = `drop-shadow(0 0 1px var(--select-edge)) drop-shadow(0 0 1px var(--select-edge)) drop-shadow(0 0 1px var(--select-edge)) drop-shadow(0 0 1px var(--select-edge))`;
      svgElement.style.filter = `${flagOuterOutline} ${selectionInnerOutline}`;
    } else {
      svgElement.style.filter = selectionOutline;
    }
  }

  removeOutline(svgElement: SVGGElement, flaggedElement: (SVGGElement | undefined)[]) {
    svgElement.style.filter = 'none';
    if (this.isFlagged(svgElement, flaggedElement)) {
      this.applyFlagOutline(svgElement);
    }
  }


  applyFlagOutline(svgElement: SVGGElement) {
    svgElement.style.filter = `drop-shadow(0 0 4px var(--flag)) drop-shadow(0 0 4px var(--flag)) drop-shadow(0 0 4px var(--flag))  drop-shadow(0 0 4px var(--flag))`;
  }

  removeFlagOutline(svgElement: SVGGElement) {
    svgElement.style.filter = 'none'
  }


  isFlagged(element: SVGGElement, flaggedElement: (SVGGElement | undefined)[]): boolean {
    return flaggedElement?.includes(element) ?? false;
  }


  /***
   * Takes as input a string like "OVERVIEW-R-SSS-NNNNNNN"
   * or "REGION-R-SSS-NNNNNN, filters out the first part and
   * keeps only the stable identifier.
   *
   * @param identifier the id of the SVG element
   * @return the stable identifier
   */
  getStableId(identifier: string) {
    const STID_PATTERN_LITE = /R-[A-Z]{3}-[0-9]{3,}/;

    if (identifier && identifier.trim()) {
      const result = STID_PATTERN_LITE.exec(identifier);

      if (result && result.length > 0) {
        return result[0]; // First match
      }
    }
    return null;
  }


  setStIdToSVGGElementMap(container: ElementRef<HTMLDivElement>) {
    const map = new Map<string, SVGGElement>();
    const svgElement = container.nativeElement.querySelectorAll('g[id^="REGION"]') as NodeListOf<SVGGElement>;
    svgElement.forEach(svgElement => {
      const idAttr = svgElement.getAttribute('id');
      if (idAttr) {
        const stId = this.getStableId(idAttr);
        if (stId) {
          map.set(stId, svgElement);
        }
      }
    })
    return map
  }


  setDbIdToSVGGElementMap(container: ElementRef<HTMLDivElement> | undefined) {
    const map = new Map<number, SVGGElement>();
    const svgElement = container!.nativeElement.querySelectorAll('g[id^="REGION"]') as NodeListOf<SVGGElement>;
    svgElement.forEach(svgElement => {
      const idAttr = svgElement.getAttribute('id');
      if (idAttr) {
        const dbId = this.getDbId(idAttr);
        if (dbId) {
          map.set(Number(dbId), svgElement);
        }
      }
    })
    return map
  }

  getDbId(identifier: string) {
    const DBID_PATTERN_LITE = /\d+$/;

    if (identifier && identifier.trim()) {
      const result = DBID_PATTERN_LITE.exec(identifier);
      if (result && result.length > 0) {
        return result[0]; // First match
      }
    }
    return null;
  }


  createOverlay(stId: string, exps: [number | undefined, number][], regionElement: SVGGElement) {
    const targetId = `${this.overlay}${stId}`;
    const overlayElement = regionElement.querySelector(`#${targetId}`);

    if (overlayElement) {
      const rect = overlayElement.getElementsByTagName('rect')[0]
      if (!rect) return;

      this.createPattern(stId, exps, regionElement);

      rect.style.fill = `url(#${this.pattern}${stId})`;
      rect.setAttribute('stroke', '#000000');
      rect.setAttribute('stroke-width', '0.5');

      const text = overlayElement.getElementsByTagName('text')[0];
      text?.classList.add('title-text');
    }
  }


  createPattern(stId: string, exps: [number | undefined, number] [], regionElement: SVGGElement) {
    const svg = regionElement.closest('svg');
    const defs = svg!.querySelector('defs') || svg!.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));

    const stops: { start: number, stop: number, color: string, exp: number | undefined, width: number }[] = [];
    const size = exps.reduce((l: number, e) => e !== undefined && isArray(e) ? l + e[1] : l + 1, 0);
    const delta = 1 / size;
    exps.forEach((exp, i) => {
      const p = stops.length - 1;
      const realExp = isArray(exp) ? exp[0] : exp;
      if (stops.length !== 0 && stops[p].exp === realExp) {
        stops[p].stop += delta;
        stops[p].width += delta;
      } else {
        stops.push({
          start: stops[p]?.stop || 0,
          stop: (stops[p]?.stop || 0) + delta * exp[1],
          width: delta * exp[1],
          color: this.analysis.palette().scale(realExp).hex(),
          exp: realExp
        })
      }
    })

    const p = `<pattern id="${this.pattern}${stId}" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 1 1" preserveAspectRatio="none">` +
      stops
        .map((stop, i) => `<rect fill="${stop.color}" x="${stop.start}" height="1" width="${stop.width + 0.01}"/>`)
        .join('') +
      '</pattern>';

    defs.insertAdjacentHTML('beforeend', p);
  }

  showAnalysisInfo(regionElement: SVGGElement, analysisPathway: Analysis.Pathway['entities']) {

    const analysisInfoElement = regionElement.querySelector(`g[id^="${this.analysisInfoId}"]`) as SVGGElement;

    if (analysisInfoElement) {
      // Make it visible
      analysisInfoElement.classList.add(`${this.analysisInfoContainer}`);

      const textInfoElement = analysisInfoElement.getElementsByTagName('text')[0];
      // "1.23E4";
      textInfoElement.innerHTML = "Hit: " + analysisPathway.found + "/" + analysisPathway.total + " - FDR: " + analysisPathway.fdr.toExponential(2).replace('e', 'E');

      textInfoElement.removeAttribute("transform");
      textInfoElement.classList.add('analysis-text');

      const rectBox = analysisInfoElement.getElementsByTagName('rect')[0];
      const centerX = rectBox.getBBox().x + rectBox.getBBox().width / 2;
      const centerY = rectBox.getBBox().y + rectBox.getBBox().height / 2;

      textInfoElement.setAttribute("x", String(centerX));
      textInfoElement.setAttribute("y", String(centerY));
    }

  }

  clearAllOverlay(regionElementsMap: Map<string, SVGGElement>) {
    regionElementsMap.forEach((element: SVGGElement, stId: string) => {
      const targetId = `${this.overlay}${stId}`;
      const overlayElement = element.querySelector(`#${targetId}`);
      if (overlayElement) {
        const rect = overlayElement.getElementsByTagName('rect')[0];
        if (rect) rect.style.fill = "revert-layer";
      }
    })
  }

  clearExistingPatterns(elementsMap: Map<string, SVGGElement>, svg: SVGElement | null) {
    if (!svg) return;
    const defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
    elementsMap.forEach((element: SVGGElement, stId: string) => {
      const patternId = `${this.pattern}${stId}`;
      if (defs.querySelector(`#${patternId}`) !== null) {
        defs.querySelector(`#${patternId}`)!.remove()
      }
    })
  }

  clearAnalysisInfo(elementsMap: Map<string, SVGGElement>) {
    elementsMap.forEach((region: SVGGElement, stId: string) => {
      const analysisInfoElement = region.querySelector(`g[id^="${this.analysisInfoId}"]`);
      if (analysisInfoElement) {
        analysisInfoElement.classList.remove(`${this.analysisInfoContainer}`);
      }
    })
  }

}
