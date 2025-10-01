import {computed, ElementRef, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Analysis} from "../model/analysis.model";
import {isArray} from "lodash";
import {AnalysisService} from "./analysis.service";
import {DataStateService} from "./data-state.service";
import {UrlStateService} from "./url-state.service";
import {GeneralService} from "./general.service";

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

  hasEHLD = computed(() => this.data.currentPathway()?.hasEHLD);

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

  constructor(private http: HttpClient, private analysis: AnalysisService, private data: DataStateService, private state: UrlStateService, private general: GeneralService) {
  }

  getSVGData(id: string): Observable<string> {
    return this.http.get(`${this.general.download()}/ehld/${id}.svg`, {responseType: 'text'})
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

  saturateRegion(regionElement: SVGGElement, setSaturation: boolean, pathway?: Analysis.Pathway | undefined,) {
    const filter = setSaturation ? `saturate(${(pathway?.entities.fdr || 1) <= this.state.significance() ? 1 : 0})` : '';
    for (let i = 0; i < regionElement.childElementCount; i++) {
      const child = regionElement.children.item(i) as SVGElement | null;
      if (child &&
        !child.id.startsWith(this.overlay) &&
        !child.classList.contains(this.analysisInfoId)
      ) child.style.filter = filter;
    }
  }

  createOverlay(stId: string, pathway: Analysis.Pathway | undefined, regionElement: SVGGElement) {
    const targetId = `${this.overlay}${stId}`;
    const overlayElement = regionElement.querySelector(`#${targetId}`);

    this.saturateRegion(regionElement, true, pathway);

    if (overlayElement) {
      let container: SVGRectElement | SVGPathElement | null = overlayElement.querySelector('rect') || overlayElement.querySelector('path');
      if (!container) return;

      const entities = pathway?.entities || {fdr: 1, found: 0, total: 1, exp: undefined};
      const currentExp = entities.exp?.[this.analysis.sampleIndex()];
      const exp = currentExp || entities.fdr;

      const exps: [number | undefined, number][] = [
        [exp, entities.found],
        [undefined, entities.total - entities.found],
      ]
      this.createPattern(stId, exps, regionElement, 'exp');


      this.addInnerStroke(container, this.analysis.palette().scale(exp).hex(), 2);

      container.style.fill = `url(#${this.pattern}${stId}-exp)`;
      container.style.opacity = entities.fdr <= this.state.significance() ? '1' : '0.5';
      container.style.backdropFilter = 'blur(5px)';

      const text = overlayElement.getElementsByTagName('text')[0];
      text?.classList.add('title-text');
    }
  }


  private addInnerStroke(element: SVGRectElement | SVGPathElement | null, color: string, strokeWidth = 2) {
    if (!element) return;
    if (element.tagName === 'rect') {
      const original = element as SVGRectElement;
      const hs = strokeWidth / 2;
      const strokeRect = element.cloneNode() as SVGRectElement;
      strokeRect.classList.add('inner-stroke')
      strokeRect.style.fill = 'none';
      strokeRect.style.filter = 'none';
      strokeRect.style.stroke = color;
      strokeRect.style.strokeWidth = strokeWidth + '';
      strokeRect.style.x = original.x.baseVal.value + hs + '';
      strokeRect.style.y = original.y.baseVal.value + hs + '';
      strokeRect.style.width = original.width.baseVal.value - strokeWidth + '';
      strokeRect.style.height = original.height.baseVal.value - strokeWidth + '';
      strokeRect.style.rx = original.rx.baseVal.value - hs + '';
      element.after(strokeRect)
    } else if (element.tagName === 'path') {
      const path = element as SVGPathElement;

      // Ensure the path has an id (so <use> can reference it)
      if (!path.id) path.id = `path-${Math.random().toString(36).slice(2, 11)}`;

      const maskId = `mask-${Math.random().toString(36).slice(2, 11)}`;

      // Create mask *inline* (not in <defs>)
      const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
      mask.setAttribute("id", maskId);

      const useEl = document.createElementNS("http://www.w3.org/2000/svg", "use");
      useEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${path.id}`);
      useEl.setAttribute("fill", "white");

      mask.appendChild(useEl);

      // Insert mask right after the original path
      path.after(mask);

      // Create stroke path
      const strokePath = path.cloneNode(true) as SVGPathElement;
      strokePath.setAttribute("fill", "none");
      strokePath.setAttribute("stroke", color);
      strokePath.setAttribute("stroke-width", (strokeWidth * 2).toString());
      strokePath.setAttribute("mask", `url(#${maskId})`);

      mask.after(strokePath);
    }

  }

  createPattern(stId: string, values: [number | undefined, number] [], regionElement: SVGGElement, type: 'fdr' | 'exp') {
    const svg = regionElement.closest('svg');
    const defs = svg!.querySelector('defs') || svg!.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));

    const stops: { start: number, stop: number, color: string, exp: number | undefined, width: number }[] = [];
    const size = values.reduce((l: number, e) => e !== undefined && isArray(e) ? l + e[1] : l + 1, 0);
    const delta = 1 / size;
    const palette = type === 'fdr' ? this.analysis.fdrPalette() : this.analysis.palette();
    values.forEach((exp, i) => {
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
          color: palette.scale(realExp).hex(),
          exp: realExp
        })
      }
    })

    const p = `<pattern id="${this.pattern}${stId}-${type}" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 1 1" preserveAspectRatio="none">` +
      stops
        .map((stop, i) => `<rect fill="${stop.color}" x="${stop.start}" height="1" width="${stop.width + 0.01}"/>`)
        .join('') +
      '</pattern>';

    defs.insertAdjacentHTML('beforeend', p);
  }

  showAnalysisInfo(regionElement: SVGGElement, analysisPathway: Analysis.Pathway | undefined) {
    if (!analysisPathway) return;
    const analysisInfoElement = regionElement.querySelector(`g[id^="${this.analysisInfoId}"]`) as SVGGElement;

    if (analysisInfoElement) {
      // Make it visible
      analysisInfoElement.classList.add(`${this.analysisInfoContainer}`);

      const entities = analysisPathway.entities;
      this.createPattern(analysisPathway.stId, [
        [entities.fdr, entities.found],
        [undefined, entities.total - entities.found]
      ], regionElement, "fdr")

      let container: SVGRectElement | SVGPathElement | null = analysisInfoElement.querySelector('rect');
      if (!container) container = analysisInfoElement.querySelector('path');
      if (!container) return;

      container.classList.forEach(token => container.classList.remove(token));

      this.addInnerStroke(container, this.analysis.fdrPalette().scale(entities.fdr).hex(), 2);

      container.style.fill = `url(#${this.pattern}${analysisPathway.stId}-fdr)`;
      container.style.opacity = entities.fdr <= this.state.significance() ? '1' : '0.5';

      const textInfoElement = analysisInfoElement.getElementsByTagName('text')[0];
      textInfoElement.innerHTML = `Hit: ${entities.found}/${entities.total}`;
      // "1.23E4";
      if (this.analysis.hasPValues()) textInfoElement.innerHTML += ` - FDR: ${entities.fdr.toExponential(2).replace('e', 'E')}`;
      textInfoElement.removeAttribute("transform");
      textInfoElement.classList.add('analysis-text');

      const rectBox = (analysisInfoElement.firstChild! as SVGGraphicsElement).getBBox();
      const centerX = rectBox.x + rectBox.width / 2;
      const centerY = rectBox.y + rectBox.height / 2;

      textInfoElement.setAttribute("x", String(centerX));
      textInfoElement.setAttribute("y", String(centerY));
    }

  }

  clearAllOverlay(regionElementsMap: Map<string, SVGGElement>) {
    regionElementsMap.forEach((element: SVGGElement, stId: string) => {
      element.querySelectorAll('rect.inner-stroke').forEach(stroke => stroke.remove())
      const targetId = `${this.overlay}${stId}`;
      const overlayElement = element.querySelector(`#${targetId}`);
      const regionElement = regionElementsMap.get(stId);
      // Clear overlay element
      if (overlayElement) {
        const rect = overlayElement.getElementsByTagName('rect')[0];
        if (rect) rect.removeAttribute("style")
      }
      // Clear region element
      if (regionElement) {
        this.saturateRegion(regionElement, false);
      }
    })
  }

  clearExistingPatterns(svg: SVGElement | null) {
    if (!svg) return;
    const defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));

    Array.from(defs.children)
      .filter(child => child.id.startsWith(this.pattern))
      .forEach(child => defs.removeChild(child));
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
