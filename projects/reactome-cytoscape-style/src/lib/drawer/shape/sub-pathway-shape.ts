import {extract} from "../../properties-utils";
import {DrawerProvider} from "../types";

export const subPathway: DrawerProvider = (properties, {width, height, disease}) => {
  const select = extract(properties.global.selectNode);
  const hover = extract(properties.global.hoverNode);
  const flag = extract(properties.global.flag);
  const thick = extract(properties.global.thickness) * 3;
  const stroke = !disease ?
    extract(properties.pathway.stroke) :
    extract(properties.global.negativeContrast);
  const fill = extract(properties.pathway.fill)

  const halfHeight = height / 2;
  const ht = thick / 2;
  const oR = halfHeight;
  const iR = halfHeight - thick;
  const oRx = Math.min(oR, width / 2)
  return {
    hover: {
      "background-image": `
          <path fill="${hover}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 ${oR}
            a ${oRx} ${oR} 0 0 1 ${oRx} -${oR}
            h ${width - 2 * oRx}
            a ${oRx} ${oR} 0 0 1 ${oRx} ${oR}
            a ${oRx} ${iR} 0 0 0 -${oRx} -${iR}
            h -${width - 2 * oRx}
            a ${oRx} ${iR} 0 0 0 -${oRx} ${iR}
            Z"/>
`,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-height": oR,
    },
    select: {
      "background-image": `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oRx} ${oR} 0 0 0 ${oRx} ${oR}
            h ${width - 2 * oRx}
            a ${oRx} ${oR} 0 0 0 ${oRx} -${oR}
            a ${oRx} ${iR} 0 0 1 -${oRx} ${iR}
            h -${width - 2 * oRx}
            a ${oRx} ${iR} 0 0 1 -${oRx} -${iR}
            Z"/>
`,
      "background-position-y": halfHeight,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-height": oR,
    },
    flag: {
      "background-image": `
      <rect width="${width + 2 * thick}" height="${height}" rx="${oR + thick}" ry="${oR}" fill="${flag}"/>
      <rect x="${1.5*thick}" y="${ht}" width="${width -  thick}" height="${height - thick}" rx="${oR}" fill="${fill}" stroke="${stroke}" stroke-width="${thick}"/>
      `,
      "background-position-x": -thick,
      "bounds-expansion": 2 * thick,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-width": width + 2 * thick,
      "background-height": height ,
    },
    analysis: {
      "background-image": `<rect class="gradient" x="${thick}" y="${thick}" width="${width - 2 * thick}" height="${height - 2 * thick}" rx="${(height - 2 * thick) / 2}"/>`,
      requireGradient: true
    }
  }
}


