# Layout file

This file gives polar coordinates of each top-level pathway that are being used by FoamTree as initial position before they are relaxed.
The aim is :
- To have semantic sense 
  - Related pathways should be close together (e.g. Neuronal system and muscle contraction)
  - Determine broad families of TLPs according to which they will be colored
  - Give more space to the biggest TLPs


# How to maintain the file
The file is created "manually" from a reference [GeoGebra file](https://www.geogebra.org/calculator/cxped9a7) which should be maintained as it is the source of truth for the layout.
In case of additions and or modifications, a video on how to edit it is available on the [drive](https://drive.google.com/file/d/1DBy-sC1_V2YynIkaySrtSdIcbHYziGpH/view?usp=sharing).
Upon any modification on the GeoGebra file, the changes in angle and position should be reflected on the layout file (CLick on the node name on the left to access their coordinates in polar)

# Exception for manually curated non-human species
Some species contains top-level pathway which are not projected from the human equivalent but have their own special identifiers. 
In such cases, they should be placed at a logical place on the overall layout with special the proper stId. 
If a TLP is not given a family and is not covered by projection, it will appear as blue and be placed randomly. That's how you can spot them!
