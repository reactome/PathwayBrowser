import {DatabaseObject} from "../database-object.model";

export interface NegativePrecedingEvent extends DatabaseObject {
  comment: string
  precedingEvent: Event[]
  reason: string
  schemaClass: 'NegativePrecedingEvent'
}
