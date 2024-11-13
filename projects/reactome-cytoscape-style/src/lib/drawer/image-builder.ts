import cytoscape from "cytoscape";
import {gene} from "./shape/gene-shape";
import {isArray, isNumber, memoize} from "lodash";
import {molecule} from "./shape/molecule-shape";
import {protein} from "./shape/protein-shape";
import {rna} from "./shape/rna-shape";
import {genomeEncodedEntity} from "./shape/gee-shape";
import {complex} from "./shape/complex-shape";
import {entitySet} from "./shape/entity-sets-shape";
import {cell} from "./shape/cell-shape";
import {interactingPathway} from "./shape/interacting-pathway-shape";
import {diseaseInteractor} from "./shape/disease-interactor-shape";

import {subPathway} from "./shape/sub-pathway-shape";
import {extract} from "../properties-utils";
import {Node} from "../types";
import {Aggregated, DrawerParameters, DrawerProvider, Image, Memo} from "./types";
import {Properties} from "../properties";
import {Style} from "../style";
import chroma from "chroma-js";


export const imageBuilder = (properties: Properties, style: Style) => memoize(
  (node: cytoscape.NodeSingular): Aggregated<Image> => {
    // console.time(`build-image-${node.id()}`)
    let layers: Image[] = [];
    const clazz = node.classes().find(clazz => classToDrawers.has(clazz as Node)) as Node
    if (!clazz) return aggregate(layers, defaultBg);

    const provider = classToDrawers.get(clazz)!;
    const exps = node.data('exp');
    const drawerParams: DrawerParameters = {
      id: node.id(),
      width: node.data("width"),
      height: node.data("height"),
      drug: node.hasClass('drug'),
      disease: node.hasClass('disease'),
      interactor: node.hasClass('Interactor'),
      crossed: node.hasClass('crossed'),
      lossOfFunction: node.hasClass('loss-of-function')
    };


    const drawer = provider(properties, drawerParams);

    if (node.hasClass('flag') && drawer.flag) layers.push(drawer.flag);

    if (drawer.background) layers.push(drawer.background);

    if (exps && drawer.analysis) layers.push(drawer.analysis);

    if (node.selected() && drawer.select) layers.push(drawer.select);

    if (node.hasClass('hover') && drawer.hover) layers.push(drawer.hover);

    if (drawer.decorators) layers.push(...drawer.decorators);

    if (drawerParams.drug) {
      layers.push(RX(properties, drawerParams, clazz));
    }

    if (node.classes().includes('Pathway')) {
      layers.push(Pathway(properties, drawerParams));
    }

    if (drawerParams.crossed) layers.push(CROSS(properties, drawerParams));

    const gradient = expToGradient(node.id(), exps, properties, style.currentPalette)

    // Convert raw HTML to string encoded images
    layers = layers
      .map(l => {
        if (l.requireGradient && gradient) l["background-image"] = addGradient(l["background-image"] as string, gradient);
        return l;
      })
      .map(l => ({
          ...l,
          "background-image": svgStr(l["background-image"] as string,
            isNumber(l["background-width"]) ? l["background-width"] : drawerParams.width,
            isNumber(l["background-height"]) ? l["background-height"] : drawerParams.height
          )
        })
      );

    const aggregated = aggregate(layers, defaultBg);
    aggregated['bounds-expansion'] = [Math.max(...aggregated['bounds-expansion'] as number[], 0)]


    // console.timeEnd(`build-image-${node.id()}`)
    return aggregated;
  }, node => `${node.id()}-${node.classes().toString()}-s:${node.selected()}`
)

const defaultBg: Image = {
  "background-image": "",
  "background-position-x": "0",
  "background-position-y": "0",
  "background-offset-x": "0",
  "background-offset-y": "0",
  "background-width": "100%",
  "background-height": "100%",
  "background-fit": "none",
  "background-clip": "none",
  "background-image-opacity": 1,
  "background-image-containment": "over",
  "background-image-smoothing": "yes",
  "background-height-relative-to": "inner",
  "background-width-relative-to": "inner",
  "background-repeat": "no-repeat",
  "background-image-crossorigin": "anonymous",
  "bounds-expansion": 0
}

function addGradient(svgText: string, gradient: string, single: boolean = false): string {
  // if (single) {
  //   const s = `<style>.gradient{fill: ${gradient}!important;}</style>${svgText}`;
  //   console.log(s)
  //   return s;
  // }
  // else
  // return gradient + svgText.replaceAll('class="gradient"', 'fill="url(#gradient)"');
  return `<style>.gradient{fill: url(#gradient)};</style>${gradient}${svgText}`;
}

function _expToGradient(id: string, exps: (number | [number, number] | undefined)[], properties: Properties, palette: chroma.Scale): string | undefined {
  if (!exps) return;
  // console.time('exp-to-gradient')
  const stops: { start: number, stop: number, color: string, exp: number | undefined, width: number }[] = [];
  const size = exps.reduce((l: number, e) => e !== undefined && isArray(e) ? l + e[1] : l + 1, 0);
  const delta = 1 / size;
  exps.forEach((exp, i) => {
    const p = stops.length - 1;
    const realExp = isArray(exp) ? exp[0]! : exp;
    if (stops.length !== 0 && stops[p].exp === realExp) {
      stops[p].stop += delta;
      stops[p].width += delta;
    } else {
      if (isArray(exp)) {
        stops.push({
          start: stops[p]?.stop || 0,
          stop: (stops[p]?.stop || 0) + delta * exp[1],
          width: delta * exp[1],
          color: palette(realExp).hex(),
          exp: realExp
        })
        // console.log(stops, exps)

      } else {
        stops.push({
          start: stops[p]?.stop || 0,
          stop: (stops[p]?.stop || 0) + delta,
          color: palette(realExp).hex(),
          width: delta,
          exp: realExp
        })
      }
    }
  })
  // if (stops.length === 1) {
  //   console.log(stops)
  //   return stops[0].color;
  // }

  const pattern = '<defs><pattern id="gradient" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 1 1" preserveAspectRatio="none">' +
    stops
      .map((stop, i) => `<rect fill="${stop.color}" x="${stop.start}" height="1" width="${stop.width + 0.01}"/>`)
      .join('') +
    '</pattern></defs>';

  // const gradient = '<defs><linearGradient id="gradient">' +
  //     stops
  //         .map(stop => `<stop stop-color="${stop.color}" offset="${stop.start}"/><stop stop-color="${stop.color}" offset="${stop.stop}"/>`)
  //         .join('') +
  //     '</linearGradient></defs>'
  // console.timeEnd('exp-to-gradient')

  // console.log(exps)
  return pattern
}

const expToGradient = memoize(_expToGradient, (id) => id)

export const resetGradients = () => expToGradient.cache.clear!()

function svg(svgStr: string, width = 100, height = 100) {
  // const cleanedStr = svgStr.replaceAll(/  {2,}|\n/g, " "); // TODO examine performance impact
  const s = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg><svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='${width}' height='${height}'>${svgStr}</svg>`;
  // console.log(s)
  return s;
}

function svgStr(svgText: string, viewPortWidth: number, viewPortHeight: number) {
  // return svg(svgText, viewPortWidth, viewPortHeight);
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg(svgText, viewPortWidth, viewPortHeight));
}


const dim = (properties: Properties, {id}: DrawerParameters) => id;
const classToDrawers = new Map<Node, Memo<DrawerProvider>>([
  ["Protein", memoize(protein, dim)],
  ["GenomeEncodedEntity", memoize(genomeEncodedEntity, dim)],
  ["RNA", memoize(rna, dim)],
  ["Gene", memoize(gene, dim)],
  ["Molecule", memoize(molecule, dim)],
  ["Complex", memoize(complex, dim)],
  ["EntitySet", memoize(entitySet, dim)],
  ["Cell", memoize(cell, dim)],
  ["Interacting", memoize(interactingPathway, dim)],
  ["SUB", memoize(subPathway, dim)],
  ["Interactor", memoize(diseaseInteractor, dim)]
]);

export function clearDrawersCache() {
  for (let value of classToDrawers.values()) {
    value.cache.clear!()
  }
  OMMITED_ICON.cache.clear!();
}

function aggregate<T extends Object, K extends keyof T>(toAggregate: T[], defaultValue: T): Aggregated<T> {
  const aggregate: Aggregated<T> = {} as Aggregated<T>;
  //@ts-ignore
  const keys = new Set<K>(Object.keys(defaultValue));
  keys.forEach(key => aggregate[key] = toAggregate.map(t => t[key] || defaultValue[key]));
  return aggregate;
}

const RX = (properties: Properties, {height}: DrawerParameters, clazz: Node): Image => {
  const t = extract(properties.global.thickness);
  const color = clazz !== 'Molecule' ?
    extract(properties.global.onPrimary) :
    extract(properties.molecule.drug);
  const x = (clazz !== 'EntitySet' ? 0 : extract(properties.entitySet.radius)) + 3 * t;

  return {
    "background-image": `
      <path style="transform: scale(2)" fill="${color}" stroke-width="0.4" stroke="${color}" d="M3.2 4C3.3 4 3.4 4 3.6 4L6.75 8.81L5.7 10.15C5.7 10.15 5.53985 10.3884 5.31824 10.6092C5.00434 10.922 4.6582 11.3 4.28711 11.3C4.19141 11.3 4.2 11.3 4.1 11.3V11.5H6.4V11.3C6.2 11.3 6 11.3 5.9 11.2C5.8 11.1 5.8 11 5.8 10.9C5.8 10.6301 5.9 10.5547 6.16055 10.226L7 9.2L7.65291 10.226C7.82889 10.5025 8 10.7344 8 10.9C8 11.0656 7.90095 11.3 7.65291 11.3C7.55291 11.3 7.6 11.3 7.4 11.3V11.5H10.2V11.3C9.9 11.3 9.7 11.2 9.5 11C9.24121 10.7412 9 10.5 8.6 10L7.6 8.5L8.48711 7.35309C8.55228 7.28792 8.61656 7.21558 8.68081 7.13924C9.09787 6.6437 9.64859 6 10.2 6.01309V5.81309H7.8V6.01309C8 6.01309 8.2 6.01309 8.3 6.01309C8.45586 6.01309 8.6 6.20329 8.6 6.31309C8.6 6.62136 8.43963 6.81922 8.2462 7.03337L7.3 8.1L4.5 3.9C5.1 3.8 5.4 3.61 5.7 3.31C6 3.01 6.2 2.6 6.2 2.2C6.2 1.8 6.08711 1.47 5.78711 1.17C5.52798 0.910875 5.3 0.8 5 0.7C4.6 0.6 4.1 0.5 3.4 0.5H1V0.7H1.2C1.82201 0.7 2 1.14292 2 1.7V6C2 6.59634 2 6.9 1.2 6.9H1V7.1H3.8V6.9H3.6C2.9041 6.9 2.9 6.61047 2.9 6V4H3H3.2ZM3 3.7C3 3.7 3 3.7 2.9 3.7L2.88711 1C3.18711 0.9 3.4 0.9 3.6 0.9C4.47782 0.9 5 1.42405 5 2.3C5 3.40743 4.15401 3.7 3.2 3.7H3Z"/>
    `,
    "background-position-x": x,
    "background-position-y": (height / 2 - 11) + 'px',
    "background-width": 22,
    "background-height": 24,
  };

}

const Pathway = (properties: Properties, {height, disease}: DrawerParameters): Image => {
  const t = extract(properties.global.thickness);
  const color = !disease ?
    extract(properties.global.onPrimary) :
    extract(properties.global.negativeContrast);

  let x = 5 * t;

  return {
    "background-image": `
      <path style="transform: scale(1.5)" fill="${color}" stroke-width="0.4" stroke="${color}" d="M19.6864 21.0381C19.0364 21.0381 18.4531 20.8508 17.9364 20.4761C17.4197 20.1008 17.0614 19.6214 16.8614 19.0381H11.6864C10.5864 19.0381 9.64473 18.6464 8.8614 17.8631C8.07807 17.0798 7.6864 16.1381 7.6864 15.0381C7.6864 13.9381 8.07807 12.9964 8.8614 12.2131C9.64473 11.4298 10.5864 11.0381 11.6864 11.0381H13.6864C14.2364 11.0381 14.7074 10.8421 15.0994 10.4501C15.4907 10.0588 15.6864 9.58809 15.6864 9.03809C15.6864 8.48809 15.4907 8.01709 15.0994 7.62509C14.7074 7.23375 14.2364 7.03809 13.6864 7.03809H8.5114C8.29473 7.62142 7.9324 8.10075 7.4244 8.47609C6.91573 8.85075 6.3364 9.03809 5.6864 9.03809C4.85307 9.03809 4.14473 8.74642 3.5614 8.16309C2.97807 7.57975 2.6864 6.87142 2.6864 6.03809C2.6864 5.20475 2.97807 4.49642 3.5614 3.91309C4.14473 3.32975 4.85307 3.03809 5.6864 3.03809C6.3364 3.03809 6.91573 3.22542 7.4244 3.60009C7.9324 3.97542 8.29473 4.45475 8.5114 5.03809H13.6864C14.7864 5.03809 15.7281 5.42975 16.5114 6.21309C17.2947 6.99642 17.6864 7.93809 17.6864 9.03809C17.6864 10.1381 17.2947 11.0798 16.5114 11.8631C15.7281 12.6464 14.7864 13.0381 13.6864 13.0381H11.6864C11.1364 13.0381 10.6657 13.2338 10.2744 13.6251C9.8824 14.0171 9.6864 14.4881 9.6864 15.0381C9.6864 15.5881 9.8824 16.0591 10.2744 16.4511C10.6657 16.8424 11.1364 17.0381 11.6864 17.0381H16.8614C17.0781 16.4548 17.4407 15.9754 17.9494 15.6001C18.4574 15.2254 19.0364 15.0381 19.6864 15.0381C20.5197 15.0381 21.2281 15.3298 21.8114 15.9131C22.3947 16.4964 22.6864 17.2048 22.6864 18.0381C22.6864 18.8714 22.3947 19.5798 21.8114 20.1631C21.2281 20.7464 20.5197 21.0381 19.6864 21.0381ZM5.6864 7.03809C5.96973 7.03809 6.2074 6.94242 6.3994 6.75109C6.59073 6.55909 6.6864 6.32142 6.6864 6.03809C6.6864 5.75475 6.59073 5.51709 6.3994 5.32509C6.2074 5.13375 5.96973 5.03809 5.6864 5.03809C5.40307 5.03809 5.1654 5.13375 4.9734 5.32509C4.78207 5.51709 4.6864 5.75475 4.6864 6.03809C4.6864 6.32142 4.78207 6.55909 4.9734 6.75109C5.1654 6.94242 5.40307 7.03809 5.6864 7.03809Z" />
    `,
    "background-position-x": x,
    "background-position-y": (height / 2 - 18) + 'px',
    "background-width": 36,
    "background-height": 36,
  };

}

export const CROSS = memoize((properties: Properties, {width, height}: DrawerParameters): Image => {
  const s = extract(properties.global.negative);
  const t = extract(properties.global.thickness);
  return {
    "background-image": `<line x1="${t}" y1="${t}" x2="${width - t}" y2="${height - t}" stroke-width="${2 * t}" stroke-linecap="round" stroke="${s}"/><line x1="${t}" y1="${height - t}" x2="${width - t}" y2="${t}" stroke-width="${2 * t}" stroke-linecap="round" stroke="${s}"/>`,
    "background-image-opacity": 1
  };
}, (p, {width, height}) => `${width}x${height}`)

export const OMMITED_ICON = memoize((properties: Properties) => {
  const s = extract(properties.global.onSurface);
  return svgStr(`<line x1="2.5" y1="3" x2="4.5" y2="7" stroke-width="1.5" stroke-linecap="round" stroke="${s}"/><line x1="5.5" y1="3" x2="7.5" y2="7" stroke-width="1.5" stroke-linecap="round" stroke="${s}"/>`, 10, 10)
}, (p) => '')

