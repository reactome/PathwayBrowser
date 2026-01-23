import {Go_Term} from "./go-term.model";


export interface GO_CellularComponent extends Go_Term {
  componentOf: GO_CellularComponent[];
  hasPart: GO_CellularComponent[];
  instanceOf: GO_CellularComponent[];
  surroundedBy: GO_CellularComponent[];
}
