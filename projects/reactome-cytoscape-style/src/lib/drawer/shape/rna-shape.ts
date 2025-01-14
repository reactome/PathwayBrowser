import {extract} from "../../properties-utils";
import {DrawerProvider} from "../types";


export const rna: DrawerProvider = (properties, {width, height}) => {
  const thick = extract(properties.global.thickness);
  const select = extract(properties.global.selectNode);
  const hover = extract(properties.global.hoverNode);
  const flag = extract(properties.global.flag);
  const fill = extract(properties.rna.fill);

  const r = extract(properties.rna.radius);
  const oR = r + thick;
  const iR = r - thick;
  return {
    background: {
      "background-image": `
       <path fill="${fill}" d="
       M 0 0
       H ${width}
       V ${height - r }
       a ${r} ${r} 0 0 1 -${r} ${r}
       H ${r}
       a ${r} ${r} 0 0 1 -${r} -${r}
       Z"/>`,
      optional: true
    },
    hover: {
      "background-image": `<rect x="0" y="0" width="${width}" height="${2 * thick}" fill="${hover}"/>`,
      "background-position-y": -thick,
      "bounds-expansion": thick,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-height": 2 * thick,
    },
    select: {
      "background-image": `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oR} ${oR} 0 0 0 ${oR} ${oR}
            h ${width - 2 * oR}
            a ${oR} ${oR} 0 0 0 ${oR} -${oR}
            a ${oR} ${iR} 0 0 1 -${oR} ${iR}
            h -${width - 2 * oR}
            a ${oR} ${iR} 0 0 1 -${oR} -${iR}
            Z"/>
`,
      "background-position-y": height - r,
      "bounds-expansion": thick,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-height": oR,
    },
    flag: {
      "background-image": `
       <path fill="${flag}" d="
       M 0 0
       H ${width + 4 * thick}
       V ${height - r + thick}
       a ${oR + thick} ${oR} 0 0 1 -${oR + thick} ${oR}
       H ${oR + thick}
       a ${oR + thick} ${oR} 0 0 1 -${oR + thick} -${oR}
       Z
       "/>
       <path fill="${fill}" d="
       M ${2 * thick} ${thick}
       H ${width + 2 * thick}
       V ${height - r + thick}
       a ${r} ${r} 0 0 1 -${r} ${r}
       H ${r + 2 * thick}
       a ${r} ${r} 0 0 1 -${r} -${r}
       Z"/>
`,
      "background-position-x": -2 * thick,
      "background-position-y": -thick,
      "bounds-expansion": 2 * thick,
      "background-clip": "none",
      "background-image-containment": "over",
      "background-width": width + 4 * thick,
      "background-height": height + 2 * thick,
    },
    analysis: {
      "background-image": `
       <path class="gradient" d="
       M 0 0
       H ${width}
       V ${height - r }
       a ${r} ${r} 0 0 1 -${r} ${r}
       H ${r}
       a ${r} ${r} 0 0 1 -${r} -${r}
       Z"/>`,
      requireGradient: true
    }
  }
}


