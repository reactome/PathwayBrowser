# Reactome Cytoscape Style

## Usage

To use reactome-cytoscape-style, use the following:

```typescript
import {Reactome} from "reactome-cytoscape-style";

const container: HTMLElement = document.querySelector('#cytoscape-container');
const reactome = new Reactome.Style(container);
const cy = cytoscape({
  ...,
  container: container,
  style: reactome.getStyleSheet()
})

reactome.bindToCytoscape(cy) // Enables style interactivity
```

### Types

In order to use the reactome-cytoscape-style, you need to type your nodes and edges correctly, so that we can style them accordingly.

```typescript
const element: cytoscape.ElementDefinition = {
  data: {
    id: 'ID', // string, unique among all elements
    height: 100, // number, for nodes
    width: 100, // number, for nodes
    displayName: "NODE LABEL", // string, for nodes
    stoichiometry: 1, // number, for edges
    parent: 'COMPARTMENT ID' // string, for nodes | If present, will place the node withing the identified compartment 
  },
  position: {x: 0, y: 0}, // for nodes, if required to be placed manually
  classes: ['Type', 'Family Type'] // Values found in tables bellow
}
```

To do so, whee defining your nodes and edges, apply to them the classes that you will find in the table bellow

#### 1. Nodes

The first thing to notice is that the output network needs to be [bipartite](https://en.wikipedia.org/wiki/Bipartite_graph).  
Indeed, both `reaction` and  `PhysicalEntity` (interacting molecules) are represented by nodes.
In principle, you should always have a `reaction` between every 2 `PhysicalEnity` nodes.

##### 1.a PhysicalEntity

| Type                | Classes                                     | Note                                                                                                                                                                                                 |
|---------------------|---------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Protein             | `['Protein', 'PhysicalEntity']`             |                                                                                                                                                                                                      |
| GenomeEncodedEntity | `['GenomeEncodedEntity', 'PhysicalEntity']` | This corresponds to abstract concepts and/or to any macromolecule that is encoded by DNA, but not fitting to any other categories available                                                          |
| RNA                 | `['RNA', 'PhysicalEntity']`                 |                                                                                                                                                                                                      |
| Gene                | `['Gene', 'PhysicalEntity']`                |                                                                                                                                                                                                      |
| Molecule            | `['Molecule', 'PhysicalEntity']`            | This corresponds to any chemicals, e.g. metabolites                                                                                                                                                  |
|                     |                                             |                                                                                                                                                                                                      |
| Complex             | `['Complex', 'PhysicalEntity']`             | This corresponds to a group of `PhysicalEntity` which chemically bonding together. It is represented as a single node, but represents a group of molecule.                                           |
| EntitySet           | `['EntitySet', 'PhysicalEntity']`           | This corresponds to a group of `PhysicalEntity` which are interchangeable, e.g. a family of proteins targeted by an enzyme . It is represented as a single node, but represents a group of molecule. |

##### 1.b reaction

| Type         | Classes                        | Note                                                                          |
|--------------|--------------------------------|-------------------------------------------------------------------------------|
| association  | `['association', 'reaction']`  | 2 `PhysicalEntity` or more binding together                                   |
| dissociation | `['dissociation', 'reaction']` | 1 `Complex`         separating in its components                              |
| transition   | `['transition', 'reaction']`   | A transition from a compartment to another, or any other non-chemical process |
| uncertain    | `['uncertain', 'reaction']`    | A reaction which have not been resolved clearly yet                           |
| omitted      | `['omitted', 'reaction']`      | A complex process involving many reactions summarized in a single one         |

##### 1.c Compartment

Compartments are a special case of nodes since they are not interacting.

| Type        | Classes           | Note |
|-------------|-------------------|------|
| Compartment | `['Compartment']` |      |

##### 1.c Modifications

Modifications are a special case of nodes since they are associated to an Entity.

| Type         | Classes            | Note                                                                          |
|--------------|--------------------|-------------------------------------------------------------------------------|
| Modification | `['Modification']` | Requires explicit position, width, height and parent `nodeId` within its data |

#### 2. Edges

They are 2 big types of edges: those going from the `PhysicalEntity` to the `reaction`, and those going from `reaction` to the next `PhysicalEntity`

['production', 'catalysis', 'positive-regulation', 'negative-regulation', 'set-to-member']

| Direction                        | Type                | Classes                               | Note                                                                                                                                            |
|----------------------------------|---------------------|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `PhysicalEntity` --> `reaction`  | consumption         | `['consumption', 'incoming']`         | Is used for reaction's **inputs**                                                                                                               |
|                                  | catalysis           | `['catalysis', 'incoming']`           | Is used for reaction's **catalyzers**                                                                                                           |
|                                  | positive-regulation | `['positive-regulation', 'incoming']` | Is used for reaction's **positive regulators**                                                                                                  |
|                                  | negative-regulation | `['negative-regulation', 'incoming']` | Is used for reaction's **negative regulators**                                                                                                  |
|                                  |                     |                                       |                                                                                                                                                 |
| `reaction` --> `PhysicalEntity`  | production          | `['production', 'outgoing']`          | Is used for reactions' **outputs**                                                                                                              |
|                                  |                     |                                       |                                                                                                                                                 |
| `EntitySet` --> `PhysicalEntity` | set-to-member       | `['set-to-member']`                   | Is used to link `EntitySet` to one of its member also visible  in the network. Only time when there is a direct link between 2 `PhysicalEntity` |

### Properties

Reactome Cytoscape Style defines several properties that allow you to customize it and define strong and switchable color themes (e.g. dark-them and light-theme)

Here is a table summarizing how to access and customize all those properties.

| Group               | Key              | Type                 | CSS property            | Default                                                         | Description                                                                                                                                  |
|---------------------|------------------|----------------------|-------------------------|-----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| global              | thickness        | number               | *Not available*         | 4                                                               | Thickness of all the lines in the network                                                                                                    |
|                     | surface          | color                | `--surface`             | `#F6FEFF` ![#F6FEFF](https://placehold.co/65x20/F6FEFF/F6FEFF)  | Background color of neutral elements                                                                                                         |
|                     | onSurface        | color                | `--on-surface`          | `#001F24` ![#001F24](https://placehold.co/65x20/001F24/001F24)  | Stroke color of elements place on surface, as well as all lines                                                                              |
|                     | primary          | color                | `--primary`             | `#006782`  ![#006782](https://placehold.co/65x20/006782/006782) | Main color, used for the outline of Genome Encoded Entities by default                                                                       |
|                     | onPrimary        | color                | `--on-primary`          | `#FFFFFF`  ![#FFFFFF](https://placehold.co/65x20/FFFFFF/FFFFFF) | Color of text placed on top of primary elements                                                                                              |
|                     | positive         | color                | `--positive`            | `#0C9509`  ![#0C9509](https://placehold.co/65x20/0C9509/0C9509) | Color of positive element, like positive regulation                                                                                          |
|                     | negative         | color                | `--negative`            | `#BA1A1A`  ![#BA1A1A](https://placehold.co/65x20/BA1A1A/BA1A1A) | Color of negative elements, like negative regulation                                                                                         |
|                     | selectNode       | color                | `--select-node`         | `#6EB3E4`  ![#6EB3E4](https://placehold.co/65x20/6EB3E4/6EB3E4) | Color of selection on nodes                                                                                                                  |
|                     | selectEdge       | color                | `--select-edge`         | `#0561A6`  ![#0561A6](https://placehold.co/65x20/0561A6/0561A6) | Color of selection on edges                                                                                                                  |
|                     | hoverNode        | color                | `--hover-node`          | `#78E076`  ![#78E076](https://placehold.co/65x20/78E076/78E076) | Color of hover on nodes                                                                                                                      |
|                     | hoverEdge        | color                | `--hover-edge`          | `#04B601`  ![#04B601](https://placehold.co/65x20/04B601/04B601) | Color of hover on edges                                                                                                                      |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| compartment         | fill             | color                | `--compartment`         | `#E5834A`  ![#E5834A](https://placehold.co/65x20/E5834A/E5834A) | Background and stroke color of compartments. The background opacity is modulated by its own property                                         |
|                     | opacity          | number               | *Not available*         | 0.12                                                            | Opacity of the background of compartments                                                                                                    |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| sub-pathway         | opacity          | `[number, number][]` | *Not available*         | [[0.2, 0.4], [0.4, 0]]                                          | Opacity key points for sub-pathways. First value is the zoom level, Second value is the associated opacity                                   |
|                     | labelOpacity     | `[number, number][]` | *Not available*         | [[0.2, 1], [0.4, 0]]                                            | Opacity key points for sub-pathways labels. First value is the zoom level, Second value is the associated opacity                            |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| protein             | fill             | color                | `--primary-contrast-1`  | `#001F29`  ![#001F29](https://placehold.co/65x20/001F29/001F29) | Background color of proteins. The `--primary-contrast-1` corresponds to the shade of primary with the strongest contrast against `--surface` |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| genomeEncodedEntity | fill             | color                | `--primary-contrast-1`  | `#001F29`  ![#001F29](https://placehold.co/65x20/001F29/001F29) | By default, use the same value as the one used by protein                                                                                    |
|                     | stroke           | color                | `--primary`             | `#006782`  ![#006782](https://placehold.co/65x20/006782/006782) | By default, use the `global.primary` color                                                                                                   |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| rna                 | fill             | color                | `--primary-contrast-2`  | `#003545`  ![#003545](https://placehold.co/65x20/003545/003545) | The `--primary-contrast-2` corresponds to the shade of primary with the middle contrast against `--surface`                                  |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| gene                | decorationHeight | number               | *Not available*         | 20                                                              | Height of the top expression arrow decoration. Should leave enough place to fit arrowHeadSize plus a comfortable margin.                     |
|                     | arrowHeadSize    | number               | *Not available*         | 10                                                              | Height of equilateral triangle used as the arrow head of the decoration                                                                      |
|                     | borderRadius     | number               | *Not available*         | 8                                                               | Corner radius of the background                                                                                                              |
|                     | arrowRadius      | number               | *Not available*         | 8                                                               | Radius of turn in the decoration arrow. Should be < `gene.decorationHeight`                                                                  |
|                     | fill             | color                | `--primary-contrast-3`  | `#004D62`  ![#004D62](https://placehold.co/65x20/004D62/004D62) | The `--primary-contrast-3` corresponds to the shade of primary with the weakest contrast against `--surface`                                 |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| molecule            | fill             | color                | `--surface`             | `#F6FEFF`  ![#F6FEFF](https://placehold.co/65x20/F6FEFF/F6FEFF) | By default, use the `global.surface` value                                                                                                   |
|                     | stroke           | color                | `--on-surface`          | `#001F24`  ![#001F24](https://placehold.co/65x20/001F24/001F24) | By default, use the `global.onSurface` value                                                                                                 |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| complex             | cut              | number               | *Not available*         |                                                                 |                                                                                                                                              |
|                     | fill             | color                | `--tertiary-contrast-1` | `#00315C`  ![#00315C](https://placehold.co/65x20/00315C/00315C) | The `--tertiary-contrast-1` corresponds to the shade of tertiary with the strongest contrast against `--surface`                             |
|                     | stroke           | color                | `--on-tertiary`         | `#FFFFFF`  ![#FFFFFF](https://placehold.co/65x20/FFFFFF/FFFFFF) | Font and inner border color. Usually close to `global.surface`                                                                               |
|                     |                  |                      |                         |                                                                 |                                                                                                                                              |
| entitySet           | radius           | number               | *Not available*         | 10                                                              | Radius of the different swirls of the curly braces bordering the node                                                                        |
|                     | fill             | color                | `--tertiary-contrast-2` | `#1660A5`  ![#1660A5](https://placehold.co/65x20/1660A5/1660A5) | The `--tertiary-contrast-2` corresponds to the shade of tertiary with the weakest contrast against `--surface`                               |
|                     | stroke           | color                | `--on-tertiary`         | `#FFFFFF`  ![#FFFFFF](https://placehold.co/65x20/FFFFFF/FFFFFF) |                                                                                                                                              |

[//]: # (`#RGB`  ![#RGB]&#40;https://placehold.co/65x20/RGB/RGB&#41;)

> All of the JavaScript defined properties accept either a direct value or a function that gives that value

#### Update by JS properties

In order to customise your style, you can provide to the `Reactome.Style()` constructor a property object, of type `Reactome.UserProperties`, where you can define the properties that you want to customize. The values can either be a direct value, or a function that provide the required value type

```typescript
import {Reactome} from "reactome-cytoscape-style";

const container: HTMLElement = document.querySelector('#cytoscape-container');
const properties: Reactome.UserProperties = {};
const style = new Reactome.Style(container, properties);

const cy = cytoscape({
  ...,
  container: container,
  style: style.getStyleSheet()
})

function updateJsProperty() {
  // Updating initial properties object will update style values
  properties.group.key = newValue;
  // Needed to apply the changes
  style.update(cy);
}
```

Updating the `Reactome.UserProperties` you used to initialize the `Reactome.Style`, here `style`, will automatically update the inner state of the style.
You simply need to force an update on the style afterwards so that the new values are taken into account

#### Update by CSS properties

Another way to customise the reactome-cytoscape-style is though the usage of css variables.  
We are using the values as they can be found on the cytoscape container you provided to the `Reactome.Style()` constructor.
This means that you can define your variables either directly on the container, or within one of its parent in the DOM.

That is specifically useful when you have defined a light and a dark theme.  
However, as it is the case when updating the style though Js properties, you also need to trigger an update on the style after the properties have changed so that the change can be taken into account.

```typescript
import {Reactome} from "reactome-cytoscape-style";

const container: HTMLElement = document.querySelector('#cytoscape-container');
const style = new Reactome.Style(container);

const cy = cytoscape({
  ...,
  container: container,
  style: style.getStyleSheet()
})

function updateCssProperty(property: string, newValue: string) {
  // Updating Reactome.Style.css is updating the CSS variable on the container element 
  // in order to mimic a css variable change
  Reactome.Style.css.setProperty('--property', newValue);
  // Needed to apply the changes
  style.update(cy);
}
```

## Developers

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.0.

### Code scaffolding

Run `ng generate component component-name --project reactome-cytoscape-style` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project reactome-cytoscape-style`.
> Note: Don't forget to add `--project reactome-cytoscape-style` or else it will be added to the default project in your `angular.json` file.

### Build

Run `ng build reactome-cytoscape-style` to build the project. The build artifacts will be stored in the `dist/` directory.

### Publishing

After building your library with `ng build reactome-cytoscape-style`, go to the dist folder `cd dist/reactome-cytoscape-style` and run `npm publish`.

### Running unit tests

Run `ng test reactome-cytoscape-style` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

//TODO complete documentation with all the new elements
