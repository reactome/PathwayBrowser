import {extract} from "../../properties-utils";
import {DrawerProvider} from "../types";

export const molecule: DrawerProvider = (properties, {width, height, drug, interactor}) => {
  const select = extract(properties.global.selectNode);
  const hover = extract(properties.global.hoverNode);
  const flag = extract(properties.global.flag);
  const t = extract(properties.global.thickness);
  const stroke = !interactor ? (
    !drug ?
      extract(properties.molecule.stroke) :
      extract(properties.molecule.drug)
  ) : extract(properties.interactor.fill);
  const fill = extract(properties.molecule.fill);

  const ht = t / 2;
  const halfHeight = height / 2;
  const oR = halfHeight + t;
  const iR = halfHeight - t;
  const oRx = Math.min(oR, width / 2)
  return {
    background: {
      "background-image": `<rect fill="${fill}" width="${width}" height="${height }" rx="${halfHeight}" stroke-width="${t}" stroke="${stroke}"/>`,
      "background-width": width + t,
      "background-height": height + t,
      optional: true
    },
    hover: {
      "background-image": `
          <path fill="${hover}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 ${oR}
            a ${oRx} ${oR} 0 0 1 ${oRx} -${oR}
            h ${width - 2 * oRx + t}
            a ${oRx} ${oR} 0 0 1 ${oRx} ${oR}
            a ${oRx} ${iR} 0 0 0 -${oRx} -${iR}
            h -${width - 2 * oRx + t}
            a ${oRx} ${iR} 0 0 0 -${oRx} ${iR}
            Z"/>
`,
      "background-position-y": -t,
      "background-position-x": -t / 2,
      "bounds-expansion": t,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-height": oR,
      "background-width": width + t,
    },
    select: {
      "background-image": `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oRx} ${oR} 0 0 0 ${oRx} ${oR}
            h ${width - 2 * oRx + t}
            a ${oRx} ${oR} 0 0 0 ${oRx} -${oR}
            a ${oRx} ${iR} 0 0 1 -${oRx} ${iR}
            h -${width - 2 * oRx + t}
            a ${oRx} ${iR} 0 0 1 -${oRx} -${iR}
            Z"/>
`,
      "background-position-y": halfHeight,
      "background-position-x": -t / 2,
      "bounds-expansion": t,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-height": oR,
      "background-width": width + t,
    },
    flag: {
      "background-image": `
<rect width="${width + 4 * t}" height="${height + 2 * t}" rx="${oR + 2 * t}" ry="${oR}" fill="${flag}"/>
<rect x="${2 * t}" y="${t}" width="${width}" height="${height}" rx="${oR}" fill="${fill}" stroke="${stroke}" stroke-width="${t}"/>
`,
      "background-position-x": -2 * t,
      "background-position-y": -t,
      "bounds-expansion": 2 * t,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-width": width + 4 * t,
      "background-height": height + 2 * t,
    },
    analysis: {
      "background-image": `<rect fill="url(#gradient)" width="${width}" height="${height}" rx="${halfHeight}" stroke-width="${t}" stroke="${stroke}"/>`,
      requireGradient: true
    }
  }
}


