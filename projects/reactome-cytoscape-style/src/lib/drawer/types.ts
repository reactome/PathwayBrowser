import BackgroundImage = cytoscape.Css.BackgroundImage;
import PropertyValueNode = cytoscape.Css.PropertyValueNode;
import _ from "lodash";
import {Properties} from "../properties";


type BaseImage = {
  [k in keyof BackgroundImage]: BackgroundImage[k] extends PropertyValueNode<infer X> ? X : never;
}

export type Image = BaseImage & {requireGradient?: boolean, optional?: boolean}


export interface Drawer {
  background?: Image;
  select?: Image;
  hover?: Image;
  flag?: Image;
  decorators?: Image[];
  analysis?: Image;
}

export interface DrawerParameters {
  id: number | string,
  width: number,
  height: number,
  drug?: boolean,
  disease?: boolean,
  crossed?: boolean,
  interactor?: boolean,
  lossOfFunction?: boolean
}

export interface DrawerProvider {
  (properties: Properties, params: DrawerParameters): Drawer
}

export type Memo<T> = T & _.MemoizedFunction;
export type Aggregated<T> = {
  [k in keyof T]-?: T[k][]
}
