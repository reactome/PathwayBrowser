import {computed, Injectable, untracked} from '@angular/core';
import {AnalysisService} from "../services/analysis.service";
import {DownloadOptions, DownloadService} from "../services/download.service";
import {Context} from "svgcanvas";
import {ReacfoamService} from "./reacfoam.service";
import {ReacfoamComponent} from "./reacfoam.component";
import {UrlStateService} from "../services/url-state.service";

namespace SvgDecoration {
  export interface Style {
    surface: string,
    onSurface: string,
    primary: string,
    onPrimary: string,
    sw: number,
    decorationSize: number
  }

  export interface Dimensions {
    x: number,
    y: number,
    width: number,
    height: number
  }

  export interface Output {
    css: string,
    elements: string
  }
}

type FrameDiff = {
  frame: number; // the frame at which the property changes
  style: Partial<Record<string, string>>;
}

@Injectable({
  providedIn: 'root'
})
export class SvgExporterService {

  constructor(private analysis: AnalysisService, private reacfoam: ReacfoamService, private state: UrlStateService) {
  }

  style!: SvgDecoration.Style;
  options!: DownloadOptions & { halfTransition: number, totalTime: number };
  download = new DownloadService();

  hasExpressionFilter = computed(() => this.state.minExpressionFilter() !== undefined || this.state.maxExpressionFilter() !== undefined || this.state.gsaFilter().length > 1)
  isReacfoamLayoutChanging = computed(() => this.state.filterViewMode() !== 'overview' && this.hasExpressionFilter());

  async exportReacfoam(reacfoam: ReacfoamComponent, options: DownloadOptions): Promise<string> {
    this.options = {
      ...options,
      halfTransition: options.transitionTime / 2,
      totalTime: this.analysis.samples().length * options.timePerFrame
    };
    const decorationSize = 25;
    this.style = {
      surface: this.reacfoam.surfaceColor().hex(),
      onSurface: this.reacfoam.onSurfaceColor().hex(),
      primary: this.reacfoam.primaryColor().hex(),
      onPrimary: this.reacfoam.onPrimaryColor().hex(),
      sw: decorationSize / 18,
      decorationSize
    };

    const foamtree = untracked(reacfoam.foamTree)
    const geometry = foamtree.get("geometry", foamtree.get('dataObject'));

    let width = geometry.boxWidth;
    let height = geometry.boxHeight;

    const ctx = new Context(width, height);

    // Optional: for the duration of the export, set the groupMinDiameter and
    // groupLabelMinFontSize options to 0 to ensure that all labels and groups are visible.
    const groupLabelMinFontSize = foamtree.get("groupLabelMinFontSize");
    const groupMinDiameter = foamtree.get("groupMinDiameter");
    foamtree.set("groupLabelMinFontSize", 0);
    foamtree.set("groupMinDiameter", 0);

    let svg: SVGSVGElement | undefined;
    let css = ''
    let [paddingLeft, paddingRight, paddingTop, paddingBottom] = [0, 0, 0, 0];

    const samples = untracked(this.analysis.samples);
    if (samples.length === 0 || !options.animate) {
      await this.waitFor(() => !untracked(reacfoam.relaxing), 50);
      foamtree.drawTo(ctx);
      svg = ctx.getSvg();
      const title = this.generateTitle([this.state.sample() || 'FDR'], {x: 0, y: height, height: decorationSize, width: width});
      css += title.css;
      const titleGroup = this.addElementToSVG('title', title.elements, svg!);
      const bbox = this.measureGroup(titleGroup, width, height, css);
      paddingBottom = bbox.height;
      paddingLeft = Math.max(-bbox.x + this.style.sw, 0);
      paddingRight = Math.max(bbox.width - paddingLeft - width + this.style.sw, 0);

    } else {

      const initSample = untracked(this.state.sample);
      const idToSampleStyle = new Map<string, { fill?: string, stroke?: string }[]>();
      const frames: SVGGElement[] = []

      for (const sample of samples) {
        this.state.sample.set(sample)
        await this.waitFor(() => reacfoam.currentSample === sample, 50);
        await this.waitFor(() => !untracked(reacfoam.relaxing), 50);

        foamtree.drawTo(ctx);
        svg = ctx.getSvg();
        if (untracked(this.isReacfoamLayoutChanging)) {
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          svg.childNodes.forEach(child => g.appendChild(child.cloneNode(true)));
          frames.push(g);
        } else { // Layout not changing ==> Can compress by position
          this.generateIdsAndApply(svg, '', (element, id) => {
            if (element.nodeName === 'path' || element.nodeName === 'text') {
              const samples = idToSampleStyle.get(id) || [];
              samples.push({
                fill: element.getAttribute("fill") || undefined,
                stroke: element.getAttribute("stroke") || undefined,
              })
              idToSampleStyle.set(id, samples);
            }
          })
        }
      }

      // Restore the original options.
      this.state.sample.set(initSample);

      if (untracked(this.isReacfoamLayoutChanging)) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        frames.forEach((frame, i) => {
          css += this.generateRawKeyframes(frame, i);
          svg?.append(frame)
        })
      } else {
        this.compressFrameStyles(idToSampleStyle).forEach((diffs, id) => {
          css += this.generateCompressedKeyframes(id, diffs);
        });
      }

      const timelineHeight = decorationSize * 3 / 2;
      const title =
        options.includeTimeline
          ? this.generateTimeline(samples, {x: 0, y: height, height: timelineHeight, width: width})
          : this.generateTitle(samples, {x: 0, y: height, height: decorationSize, width: width});
      css += title.css;
      const titleGroup = this.addElementToSVG('title-group', title.elements, svg!);

      // Add space for labels
      const bbox = this.measureGroup(titleGroup, width, height, css);
      paddingBottom = bbox.height;
      paddingLeft = Math.max(-bbox.x + this.style.sw, 0);
      paddingRight = Math.max(bbox.width - paddingLeft - width + this.style.sw, 0);
    }


    foamtree.set("groupLabelMinFontSize", groupLabelMinFontSize);
    foamtree.set("groupMinDiameter", groupMinDiameter);

    if (this.analysis.result() && options.includeLegend) {
      const legend = this.generateAnalysisLegend({
        x: width,
        y: 0,
        width: decorationSize,
        height: height
      })
      css += legend.css;
      const legendElement = this.addElementToSVG('legend-group', legend.elements, svg!);
      paddingRight = Math.max(paddingRight, this.measureGroup(legendElement, width, height, css).width + 2 * this.style.sw);
    }


    const animStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    animStyle.setAttribute('data-generated', 'true');
    animStyle.textContent = css; // your generated CSS
    svg!.prepend(animStyle);

    console.table({paddingLeft, paddingRight, paddingTop, paddingBottom, width, height})
    svg!.setAttribute('viewBox', `${-paddingLeft} ${-paddingTop} ${width + paddingLeft + paddingRight} ${height + paddingTop + paddingBottom}`);
    svg!.removeAttribute('width')
    svg!.removeAttribute('height')
    svg!.style.background = this.reacfoam.surfaceColor().hex();

    // // Get the serialized SVG representation of the visualization.
    await this.embedFontInSvg(svg!, 'https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBHMdazQ.woff2');
    const blob = new Blob([new XMLSerializer().serializeToString(svg!)], {type: "image/svg+xml;charset=utf-8"});
    return URL.createObjectURL(blob);
  }

  private waitFor(checker: () => boolean, interval = 50): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (checker()) {
          resolve();
        } else {
          setTimeout(check, interval); // check again in X ms
        }
      };
      check();
    });
  }


  private async embedFontInSvg(svgElement: SVGSVGElement, fontUrl: string) {
    const res = await fetch(fontUrl);
    const buffer = await res.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    const style = `
    @font-face {
      font-family: 'Roboto';
      src: url(data:font/ttf;base64,${base64}) format('truetype');
    }
  `;

    const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleEl.textContent = style;
    svgElement.insertBefore(styleEl, svgElement.firstChild);
    return svgElement;
  }

  private generateIdsAndApply(element: SVGElement, id: string, apply: (element: SVGElement, id: string) => void) {
    element.setAttribute('id', id);
    apply(element, id);
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as SVGElement;
      const path = id.length > 0 ? `${id}-` : '';
      const childId = `${child.nodeName.toLowerCase()}${i}`;
      this.generateIdsAndApply(child, path + childId, apply);
    }
  }

  private compressFrameStyles(idToSampleStyle: Map<string, Partial<Record<string, string>>[]>): Map<string, FrameDiff[]> {
    const compressed = new Map<string, FrameDiff[]>()
    idToSampleStyle.forEach((frameStyles, id) => {
      let currentStyle = frameStyles[0];
      const diffs = [{frame: 0, style: frameStyles[0]}] as FrameDiff[];

      for (let i = 1; i < frameStyles.length; i++) {
        const frameStyle = frameStyles[i];
        const diff = this.getStyleDiff(currentStyle, frameStyle);
        if (Object.keys(diff).length > 0) {
          diffs.push({frame: i, style: diff});

          currentStyle = frameStyle;
        }
      }
      // Don't animate never-changing properties
      if (diffs.length > 1) compressed.set(id, diffs);
    })
    return compressed;
  }

  private getStyleDiff(prev: Partial<Record<string, string>>, curr: Partial<Record<string, string>>) {
    const diff: Partial<Record<string, string>> = {};
    Object.keys(curr).forEach(key => {
      if (prev[key] !== curr[key]) diff[key] = curr[key];
    });
    return diff;
  }

  private sanitizeId(id: string) {
    return id.replace(/[^a-zA-Z0-9_-]/g, '_'); // valid CSS name
  }

  private generateRawKeyframes(frame: SVGGElement, i: number): string {
    const id = `frame-${i}`;
    frame.setAttribute('id', id);
    const appear = this.calcTransitionTime(i)
    const disappear = this.calcTransitionTime(i + 1)
    console.table({appear, disappear})

    const kfName = `kf_frame_${i}`;
    let keyframes = `@keyframes ${kfName} {\n`;
    keyframes += `  ${appear.start}% {opacity:0;}\n`;
    keyframes += `  ${appear.stop}% {opacity:1;}\n`;
    keyframes += `  ${disappear.start}% {opacity:1;}\n`;
    keyframes += `  ${disappear.stop}% {opacity:0;}\n`;
    keyframes += `}\n`;
    keyframes += `#${id} { animation: ${kfName} ${this.options.totalTime}s linear infinite; opacity: 0;}\n\n`;

    return keyframes
  }

  private generateCompressedKeyframes(
    id: string,
    diffs: FrameDiff[]
  ): string {
    const keyframeName = `kf_${this.sanitizeId(id)}`;
    let keyframes = `@keyframes ${keyframeName} {\n`;
    let lastValues: Partial<Record<string, string>> = {...diffs[diffs.length - 1].style}; // start with the last value as it loops

    diffs.forEach((diff, i) => {
      const {start, stop} = this.calcTransitionTime(diff.frame)
      // start of transition: previous value
      keyframes += `  ${start}% {\n`;
      Object.entries(diff.style).forEach(([prop, value]) => {
        if ((lastValues[prop] ?? value) === undefined) return;
        keyframes += `${prop}: ${lastValues[prop] ?? value};\n`;
      });
      keyframes += `}\n`;

      keyframes += `  ${stop}% {`;
      Object.entries(diff.style).forEach(([prop, value]) => {
        if (value === undefined) return;
        keyframes += `${prop}: ${value};\n`;
        lastValues[prop] = value;
      });
      keyframes += `}\n`;
    });

    keyframes += `}\n\n`;
    keyframes += `#${id} { animation: ${keyframeName} ${this.options.totalTime}s linear infinite; }\n\n`;

    return keyframes;
  }

  private generateAnalysisLegend({x, y, height}: SvgDecoration.Dimensions): SvgDecoration.Output {
    const {onSurface, sw, decorationSize} = this.style;
    const gWidth = decorationSize;
    const fontSize = 12;
    const output = {
      //language=css
      css: `.legend-label {
        font-size: ${fontSize}px;
        font-family: Roboto, sans-serif;
        fill: ${onSurface};
        dominant-baseline: middle;
        text-anchor: start;
      }
      `,
      elements: ''
    };


    output.elements += this.analysis.palette().getSvgGradient('analysis-grad', 'top')
    output.elements += `<rect x="${x + sw / 2}" y="${y + sw / 2}" width="${gWidth - sw}" height="${height - sw}" rx="${gWidth / 2}" fill="url(#analysis-grad)"/>`
    const labelX = x + gWidth + sw
    const labels = this.analysis.isGSARegulation() ? [`<tspan dy="${fontSize}" x="${labelX}">Sig. Up</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`, `<tspan dy="${fontSize}" x="${labelX}">Up</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`, `<tspan dy="${fontSize}" x="${labelX}">Not</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`, `<tspan dy="${fontSize}" x="${labelX}">Down</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`, `<tspan dy="${fontSize}" x="${labelX}">Sig. Down</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`]
      : [this.analysis.palette().domainRange[1].toFixed(2), this.analysis.palette().domainRange[0].toFixed(2)]

    const labelSpace = height * (4 / 5) / (labels.length - 1);
    labels.forEach((label, i) => {
      const labelId = `label-${i}`;
      let pos: number;
      if (labels.length === 2) {
        pos = i === 0 ? gWidth / 2 : height - gWidth / 2
      } else {
        pos = y + labelSpace * (i + 0.5) - fontSize;
      }

      output.elements += `<text id="${labelId}" x="${x + gWidth + sw}" y="${pos}" class="legend-label">${label}</text>\n`;
    })

    return output;
  }

  private generateTimeline(titles: string[], {x, y, width, height}: SvgDecoration.Dimensions): SvgDecoration.Output {
    const tlHeight = this.style.decorationSize;
    const {primary, onPrimary, onSurface} = this.style;

    const fontSize = 12;
    const output = {
      //language=css
      css: `.title {
        font-size: ${fontSize}px;
        font-family: Roboto, sans-serif;
        fill: ${onSurface};
        dominant-baseline: middle;
        opacity: 0;
        text-anchor: middle;
      }

      .ignore-event {
        pointer-events: none;
      }  `,
      elements: ''
    };


    const sw = this.style.sw;
    const dotSize = height / 6 + sw / 2;
    const tlStart = x + tlHeight;
    const tlWidth = width - tlStart - 0.5 * tlHeight;
    const dotSpace = tlWidth / titles.length;

    output.elements += `<rect x="${x + sw / 2}" y="${y + sw / 2}" width="${width - sw}" height="${tlHeight - sw}" fill="${primary}" fill-opacity="0.5" rx="${tlHeight / 2}"/>`
    output.elements += `<line id="timeline-bg" x1="${tlStart}" y1="${y + tlHeight / 2}" x2="${width - tlHeight / 2}" y2="${y + tlHeight / 2}" stroke="${onPrimary}" stroke-width="${3 * sw}" stroke-linecap="round"/>`

    titles.forEach((title, i) => {
      const appear = this.calcTransitionTime(i)
      const disappear = this.calcTransitionTime(i + 1)

      const titleId = `title-${i}`;
      output.elements += `<text id="${titleId}" x="${tlStart + dotSpace * (i + 0.5) - dotSize / 2}" y="${y + tlHeight + sw + fontSize / 2}" class="title center">${title}</text>\n`;

      const titleKFName = `kf_title_${i}`;
      let keyframes = `@keyframes ${titleKFName} {\n`;
      keyframes += `  ${appear.mid}% {opacity:0;}\n`;
      keyframes += `  ${appear.stop}% {opacity:1;}\n`;
      keyframes += `  ${disappear.start}% {opacity:1;}\n`;
      keyframes += `  ${disappear.mid}% {opacity:0;}\n`;
      keyframes += `}\n`;
      keyframes += `#${titleId} { animation: ${titleKFName} ${this.options.totalTime}s linear infinite; }\n\n`;

      const dotId = `dot-${i}`;
      output.elements += `<rect id="${dotId}" x="${tlStart + dotSpace * (i + 1) - dotSize * 3 / 4}" y="${(y + tlHeight / 2 - dotSize / 2).toFixed(3)}" width="${dotSize.toFixed(3)}" height="${dotSize.toFixed(3)}" rx="${dotSize.toFixed(3)}" fill="${primary}" stroke="${onPrimary}" stroke-width="${sw}"/>`;

      const dotFKName = `kf_dot_${i}`;
      keyframes += `@keyframes ${dotFKName} {\n`;
      keyframes += `  0% {fill:${onPrimary};}\n`;
      keyframes += `  ${disappear.start}% {fill:${onPrimary};}\n`;
      keyframes += `  ${disappear.mid}% {fill:${primary};}\n`;
      keyframes += `  100% {fill:${primary};}\n`;
      keyframes += `}\n`;
      keyframes += `#${dotId} { animation: ${dotFKName} ${this.options.totalTime}s linear infinite; }\n\n`;

      output.css += keyframes;
    });

    output.elements += `<rect id="pause-button" x="${x + sw / 2}" y="${y + sw / 2}" width="${tlHeight - sw}" height="${tlHeight - sw}" fill="${primary}" stroke="${onPrimary}" stroke-width="${sw}" rx="${tlHeight / 2}"/>`
    output.elements += `<line x1="${x + tlHeight / 2 - 1 / 10 * tlHeight}" x2="${x + tlHeight / 2 - 1 / 10 * tlHeight}" y1="${y + 1 / 3 * tlHeight}" y2="${y + 2 / 3 * tlHeight}" stroke="${onPrimary}" stroke-width="${sw}" class="ignore-event"/>`
    output.elements += `<line x1="${x + tlHeight / 2 + 1 / 10 * tlHeight}" x2="${x + tlHeight / 2 + 1 / 10 * tlHeight}" y1="${y + 1 / 3 * tlHeight}" y2="${y + 2 / 3 * tlHeight}" stroke="${onPrimary}" stroke-width="${sw}" class="ignore-event"/>`

    output.elements += `<line id="timeline" x1="${tlStart}" y1="${y + tlHeight / 2}" x2="${width - tlHeight / 2}" y2="${y + tlHeight / 2}" stroke="${primary}" stroke-width="${sw}" stroke-linecap="round"/>`
    output.css += `@keyframes drawLine { to { stroke-dashoffset: 0; } }\n`;
    output.css += `#timeline { animation: drawLine ${this.options.totalTime}s linear infinite; stroke-dasharray: ${tlWidth}; stroke-dashoffset: ${tlWidth};}\n`;

    //language=css
    output.css += `svg:has(#pause-button:hover) * {
      animation-play-state: paused !important;
    }    `
    return output;
  }

  private generateTitle(titles: string[], {x, y, width, height}: SvgDecoration.Dimensions): SvgDecoration.Output {
    const {sw, onSurface} = this.style;
    const fontSize = height - 2 * sw;
    const output = {
      //language=css
      css: `.title {
        font-size: ${fontSize}px;
        font-family: Roboto, sans-serif;
        fill: ${onSurface};
        dominant-baseline: middle;
        text-anchor: middle;
      }`,
      elements: ''
    };


    titles.forEach((title, i) => {
      const appear = this.calcTransitionTime(i)
      const disappear = this.calcTransitionTime(i + 1)

      const titleId = `title-${i}`;
      output.elements += `<text id="${titleId}" x="${x + width / 2}" y="${y + height / 2}" class="title center">${title}</text>\n`;

      if (titles.length > 1) { // Only add animation if more than one title is available
        const titleKFName = `kf_title_${i}`;
        let keyframes = `@keyframes ${titleKFName} {\n`;
        keyframes += `  ${appear.mid}% {opacity:0;}\n`;
        keyframes += `  ${appear.stop}% {opacity:1;}\n`;
        keyframes += `  ${disappear.start}% {opacity:1;}\n`;
        keyframes += `  ${disappear.mid}% {opacity:0;}\n`;
        keyframes += `}\n`;
        keyframes += `#${titleId} { animation: ${titleKFName} ${this.options.totalTime}s linear infinite; opacity: 0;}\n\n`;

        output.css += keyframes;
      }
    });

    return output;
  }

  private calcTransitionTime(frame: number) {
    const frameTime = frame * this.options.timePerFrame;
    const changePercent = (frameTime / this.options.totalTime) * 100;
    const start = (changePercent - (this.options.halfTransition / this.options.totalTime) * 100 + 100) % 100;
    const stop = (changePercent + (this.options.halfTransition / this.options.totalTime) * 100) % 100;
    return {start: start.toFixed(2), stop: stop.toFixed(2), mid: changePercent.toFixed(2)};
  }

  private addElementToSVG(id: string, elements: string, svg: SVGSVGElement) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-generated', 'true');
    g.setAttribute('id', id);
    g.innerHTML = elements
    svg!.append(g)
    return g;
  }

  private measureGroup(g: SVGGElement, svgWidth: number, svgHeight: number, css: string) {
    g = g.cloneNode(true) as SVGGElement
    // create a hidden svg container
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute("width", svgWidth + 'px');
    svg.setAttribute("height", svgHeight + 'px');
    svg.style.position = "absolute";
    svg.style.left = "-9999px"; // offscreen
    svg.style.top = "-9999px";

    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.setAttribute('data-generated', 'true');
    style.textContent = css; // your generated CSS
    svg!.prepend(style);

    document.body.appendChild(svg);
    svg.appendChild(g);

    const bbox = g.getBBox({stroke: true, clipped: false, fill: true, markers: true});

    // cleanup
    svg.remove();

    return bbox;
  }

}

