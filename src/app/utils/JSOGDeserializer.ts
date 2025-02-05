/**?
 *  JavaScript Object Graph
 *  [
 *  {
 *    "@id": "1",
 *    "name": "Sally",
 *    "secretSanta": {
 *      "@id": "2",
 *      "name": "Bob",
 *      "secretSanta": {
 *        "@id": "3",
 *        "name": "Fred",
 *        "secretSanta": { "@ref": "1" }
 *      }
 *    }
 *  },
 *  { "@ref": "2" },
 *  { "@ref": "3" }
 * ]
 * @id values are arbitrary strings.
 * @id definitions must come before @ref references.
 *
 * This class is to help deserialize JSOG object to Event.
 * Track the @id of every object deserialized. When a @ref is encountered, replace it with the object referenced.
 *
 */

export interface JSOGObject {
  [key: string]: any;

  '@id'?: string;
  '@ref'?: string;
}


export class JSOGDeserializer {
  private objectMap: { [id: string]: JSOGObject } = {};

  public deserialize<T>(jsog: JSOGObject): T {
    // Build @id and object map
    this.buildIdToObjectMap(jsog);
    // Resolve all @ref
    return this.resolveReferences(jsog) as T;
  }

  private buildIdToObjectMap(jsogObject: JSOGObject) {
    if (jsogObject['@id']) {
      this.objectMap[jsogObject['@id']] = jsogObject;
    }

    for (const key in jsogObject) {
      if (typeof jsogObject[key] === 'object' && jsogObject[key] !== null) {
        this.buildIdToObjectMap(jsogObject[key]);
      }
    }
  }

  private resolveReferences(obj: JSOGObject): JSOGObject {
    if (obj['@ref']) {
      return this.objectMap[obj['@ref']];
    }

    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = this.resolveReferences(obj[key]);
      }
    }
    return obj;
  }
}
