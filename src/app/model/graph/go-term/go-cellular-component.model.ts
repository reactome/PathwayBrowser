import {GoTerm} from "./go-term.model";

export interface GoCellularComponent extends GoTerm {
  componentOf: GoCellularComponent[];
  hasPart: GoCellularComponent[];
  instanceOf: GoCellularComponent[];
  surroundedBy: GoCellularComponent[];
}
