declare module "@carrotsearch/foamtree" {

  export type Options<D extends DataObject = DataObject> =
    CoreOptions<D>
    & RelaxationOptions
    & GroupBorderOptions
    & GroupFillOptions
    & GroupStrokeOptions
    & GroupSelectionOptions
    & GroupHoverOptions
    & GroupLabelOptions<D>
    & GroupExposureOptions
    & GroupOpeningClosingOptions
    & GroupHierarchyOptions
    & GroupColorsOptions<D>
    & RolloutOptions
    & PullbackOptions
    & FadingOptions
    & ZoomOptions
    & TitleBarOptions<D>
    & AttributionOptions
    & RenderingOptions<D>
    & InteractionStandardOptions
    & DebuggingOptions;
  export type Option<D extends DataObject = DataObject> = keyof Options<D>;
  export type OptionValue<O extends Option<D>, D extends DataObject = DataObject> = Options<D>[O];

  interface IdEmbedding {
    /**
     * Identifier of the DOM element into which the visualization is to be embedded.
     * @remarks The DOM element must have a non-zero width and height before embedding.
     * The visualization will allocate a canvas of exactly the same size (client size) and will stretch
     * proportionally when the element's size changes.
     * The visualization must be resized manually (see resize method) to update to new element's dimensions.
     */
    id: string
  }

  interface ElementEmbedding {
    /**
     * The DOM element into which the visualization is to be embedded. Please see the id option for additional considerations.
     * @see IdEmbedding.id
     */
    element: HTMLElement
  }

  type Embeddings = IdEmbedding | ElementEmbedding;
  type RequiredOptionsT = Embeddings & RequiredOptions
  export type InitialOptions<D extends DataObject> = RequiredOptionsT & Partial<Options<D>> & Partial<EventOptions<D>>;

  export interface CoreOptions<D extends DataObject> {
    /**
     * Root of hierarchy to visualize
     */
    dataObject: {groups: D[]}
    /**
     * Determines the general type of layout to generate. Depending on this option, FoamTree will produce polygon-based organic-looking visualization or the traditional rectangular tree map.
     *
     * <ul>
     *   <li>
     *     relaxed - produces polygonal organic-looking arrangements based on Voronoi diagrams.
     *     This type of layout tends to visualize groups as near-round polygons leaving plenty of space for the group's
     *     label and content. A potential downside of this layout is that it may not very well preserve the original
     *     order of groups provided in the data object. See the relaxationInitializer option for various possible
     *     representations of the group order in the relaxed layout.
     *   </li>
     *   <li>
     *     ordered - produces the traditional rectangular treemap using the strip algorithm.
     *     The advantage of this layout is that, if layoutByWeightOrder is false, it will arrange groups in the
     *     left-to-right top-to-bottom fashion according to the order they were provided in the data object.
     *     One disadvantage of this algorithm is that certain groups may be visualized as high-aspect-ratio
     *     rectangles, which will leave little useful space for the label and contents of the group.
     *     You can use the `rectangleAspectRatioPreference` option to tune the aspect ratios of the rectangles
     *     to some extent.
     *   </li>
     *   <li>
     *      squarified - produces the traditional treemap using the squarified algorithm.
     *      This layout arranges groups along the diagonal of the container.
     *      Aspect ratios of the rectangles produced by this method tend to be lower than the ones from the
     *      ordered layout. The squarified algorithm, however, does not lay out groups in the left-to-right fashion.
     *   </li>
     * </ul>
     * @defaultValue 'relaxed'
     */
    layout: 'relaxed' | 'ordered' | 'squarified'

    /**
     * When true, FoamTree will lay out the groups in the order of decreasing weight. When false, FoamTree will lay out the groups in the order they were provided in the dataObject.
     *
     * Please see the layout option for information about how the order of groups can translate into their position in the visualization.
     * @defaultValue true
     */
    layoutByWeightOrder: boolean

    /**
     * Determines how FoamTree will display nested groups. The following values are supported:
     *
     * <ul>
     *   <li>
     *     hierarchical - produces a layered view of the hierarchy.
     *     To be able to interact with lower-level groups, the user will need to open the parent group for browsing.
     *     This is the default stacking mode and it is particularly useful for large deeply-nested hierarchies.
     *     See the <a href="https://get.carrotsearch.com/foamtree/latest/demos/large.html">large hierarchy demo</a> for an application of the hierarchical stacking mode.
     *   </li>
     *   <li>
     *     flattened - produces a flattened view of the hierarchy. Groups of all levels are immediately available for interaction. This kind of stacking will work especially well with a rectangular layout.
     *     Labels of parent groups are displayed in the dedicated area (towards the top of the polygon in the screenshot). Please see the descriptionGroup options to customize that area. You may also need to implement a groupLabelLayoutDecorator to customize the label fitting options when fitting parent group descriptions.
     *     See the FT500 explorer, SCADA dashboard or the Unit test coverage demo for an applications of the flattened stacking mode.
     *   </li>
     * </ul>
     * @defaultValue 'hierarchical'
     * @remarks With the flattened stacking mode, the default values of the maxGroupLevelsDrawn,
     * maxGroupLabelLevelsDrawn maxGroupLevelsAttached cause FoamTree to display not more than 4 levels of groups.
     * With hierarchical stacking, as the user opens lower-level groups FoamTree automatically computes the layout of
     * the groups on level 5 and lower. This is however not the case in the flattened stacking mode. For this reason,
     * you may need to increase the values of those properties to reveal the lower-level groups.
     * You may also consider using the deferred layout technique to mitigate the delay related to eager computation
     * of the layout for the whole deeply-nested hierarchy.
     */
    stacking: 'hierarchical' | 'flattened'

    /**
     * Determines when to draw an extra group label area.
     * <ul>
     *   <li>
     *     auto - The extra label area will be drawn only when stacking is set to flattened.
     *   </li>
     *   <li>
     *     always - The extra label area will be drawn for all groups when stacking is set to flattened.
     *     If stacking is set to hierarchical, each group that sets its description property to true will gets
     *     its label drawn both on top of the closed group and inside the group.
     *   </li>
     * </ul>
     * @defaultValue 'auto'
     * @see descriptionGroupType
     */
    descriptionGroup: 'auto' | 'always'

    /**
     * Determines how FoamTree will assign space for the group label area in flattened stacking mode or when extra
     * description space is requested by the descriptionGroup option. Two values are currently supported:
     *
     * <ul>
     *   <li>
     *     stab - Space for the description group is reserved by cutting a horizontal strip off the top or bottom of the group's polygon.
     *   </li>
     *   <li>
     *     floating - Space for the description group is reserved among the child groups, following the current layout.
     *   </li>
     * </ul>
     *
     * @defaultValue 'stab'
     * @see groupLabelLayoutDecorator
     */
    descriptionGroupType: 'floating' | 'stab'

    /**
     * The desired area of the description group, relative to the area of the parent polygon. The value of 1.0 means FoamTree will try to allocate the description group to be half of the area of the polygon.
     *
     * Value in [0,1]
     * @defaultValue 0.125
     * @remarks applicable only when stacking is set to flattened.
     */
    descriptionGroupSize: number

    /**
     * Minimum height of the description group's bounding box, in pixels. Use this option to ensure some minimum height of the description group, so that there's reasonable space to fit the label.
     *
     * Value in [0,infinity]
     * @defaultValue 35
     * @remarks applicable only when stacking is set to flattened and descriptionGroupType is stab
     */
    descriptionGroupMinHeight: number

    /**
     * Maximum height of the description group's bounding box, relative to the height of the paren group's bounding box. Use this option to ensure that the description area does not take up too much of the parent polygon's area.
     *
     * Value in [0,1]
     * @defaultValue 0.5
     * @remarks applicable only when stacking is set to flattened and descriptionGroupType is stab.
     */
    descriptionGroupMaxHeight: number

    /**
     * Determines the position of the description group inside the parent polygon. The allowed values for this option depend on the current descriptionGroupType:
     *
     * <ul>
     *   <li>
     *     stab - Two values are allowed: `top` and `bottom`, which will place the description group at the top or bottom of the parent polygon, respectively.
     *   </li>
     *   <li>
     *     floating - Space for the description group is reserved among the child groups, following the current layout.
     *   </li>
     * </ul>
     *
     * Value in [0,360) | 'topleft' | 'bottomright' | 'random'
     * @defaultValue 225
     * @remarks applicable only when stacking is set to flattened.
     */
    descriptionGroupPosition: Direction

    /**
     * Determines the distance of the description group from the center of the parent polygon. Please see attributionDistanceFromCenter for a description of the allowed values.
     *
     * Value in [0,1]
     * @defaultValue 1
     * @remarks applicable only when stacking is set to flattened and descriptionGroupType is floating.
     */
    descriptionGroupDistanceFromCenter: number

    /**
     * If true, groups whose weight is zero will be visible, with their weight slightly smaller than the smallest non-zero weight of the sibling groups.
     *
     * @defaultValue true
     */
    showZeroWeightGroups: boolean

    /**
     * Minimum estimated diameter child groups must have in order to be drawn. To avoid illegible small labels and to speed up the rendering, FoamTree can be set to skip drawing child groups if their estimated diameter is smaller than groupMinDiameter. Setting the minimum group diameter to 0 will cause FoamTree to draw as many groups as possible groups given the maxGroups limit and the available floating point precision.
     *
     * The following example sets a very large value for the groupMinDiameter option after a short delay. Observe that once the change is applied, the child groups disappear – their diameters were smaller than the threshold.
     *
     * Value in [0, infinity]
     *
     * @example The following example sets a very large value for the groupMinDiameter option after a short delay. Observe that once the change is applied, the child groups disappear – their diameters were smaller than the threshold.
     * var timeout = setTimeout(function() {
     *   foamtree.set({
     *     groupMinDiameter: 500,
     *
     *     // Set the data object again to apply the change
     *     dataObject: foamtree.get("dataObject")
     *   });
     * }, 2000);
     */
    groupMinDiameter: number

    /**
     * The hard limit on the number of groups FoamTree will attempt to include in a single visualization.
     * The limit is there to prevent excessive memory usage when browsing very deep hierarchies.
     * The limit is applied in a breadth-first fashion, which means that if FoamTree needs to skip groups that do not
     * fit within the limit, it will skip the groups at lower levels of the hierarchy.
     *
     * Value in [0, infinity]
     * @defaultValue 50000
     */
    maxGroups: number

    /**
     * Determines the desired aspect ratio of rectangles produced in the ordered and squarified layouts.
     * Value in [-infinity, infinity]
     *
     * <ul>
     *   <li>
     *    value < 0 - FoamTree will try to produce rectangles whose width is larger than the height. Such arrangement will make it slightly easier to fit labels into small rectangular groups.
     *   </li>
     *   <li>
     *     value > 0 - FoamTree will prefer rectangles whose width is smaller than the height.
     *   </li>
     *     <li>
     *     value == 0 - FoamTree will prefer rectangles of equal width and height.
     *   </li>
     * </ul>
     *
     * @remarks applicable only when layout is set to ordered or squarified.
     */
    rectangleAspectRatioPreference: number
  }

  /**
   * Options described in this section determine how FoamTree refines the initial polygon arrangement to arrive at a visually pleasing result.
   * Options in this section are only applicable when layout is set to relaxed.
   */
  export interface RelaxationOptions {
    /**
     * Determines the initial layout of groups' polygons. The following values are supported:
     * <ul>
     *   <li>fisheye - puts large groups in the center of the visualization area and the smaller groups towards the corners</li>
     *   <li>blackhole - puts small groups in the center of the visualization and the larger groups towards the corners</li>
     *   <li>ordered - Since 3.3.0 lays out the groups in a left-to-right lines, in the order the groups were specified in the data object. This initializer creates layouts most similar to the ones generated by FoamTree 2.0.x.</li>
     *   <li>squarified - puts large groups close to the top-left corner of the visualization and the small groups close to the bottom-right corner.</li>
     *   <li>random - puts groups at random positions</li>
     * </ul>
     * @defaultValue 'fisheye'
     * @remarks applicable only when layout is set to relaxed.
     */
    relaxationInitializer: 'fisheye' | 'squarified' | 'blackhole' | 'ordered' | 'random' | 'order' | 'treemap'

    /**
     * When set to true, FoamTree will show the intermediate steps of layout relaxation.
     * For large data sets, when layout computation may take a few seconds, you may want to show the relaxation
     * process to the users, so that they don't see the blank screen while waiting for the final visualization
     * to be computed.
     *
     * Layout relaxation and rollout animation can run in parallel.
     * Alternatively, to let the user watch the layout stabilize, you may want to disable the rollout by setting
     * rolloutDuration to 0 and fading in the visualization container by setting fadeDuration to 1000, for example.
     *
     * When relaxation process is visible, the API-triggered exposure changes of a group will be ignored
     * until the polygon corresponding to that group is computed. In particular, when relaxationVisible is true,
     * the initial exposure state provided in the dataObject will be ignored.
     * As a workaround, you can expose the requested sites when the rollout completes as shown
     * in the following example.
     * @example
     * foamtree.set({
     *   dataObject: { groups: randomGroups(20) },
     *   relaxationVisible: true,
     *   fadeDuration: 1000,
     *   onRolloutComplete: function(progress, complete) {
     *     foamtree.expose(foamtree.get("dataObject").groups[0]);
     *   }
     * });
     *
     * @defaultValue false
     * @remarks applicable only when layout is set to relaxed.
     * @remarks When relaxation is visible, you can report the progress of the process to the user using the relaxation progress utility.
     */
    relaxationVisible: boolean

    /**
     * Determines the maximum duration of relaxation, in milliseconds.
     * Depending on the complexity of the data set and the relaxationQualityThreshold, the relaxation may or may not
     * complete before the specified timeout. If FoamTree needs to stop the relaxation because the alloted time has
     * been exceeded, the quality of the layout may be lowered.
     *
     * Value in [0,infinity]
     * @defaultValue 3000
     * @remarks applicable only when layout is set to relaxed.
     */
    relaxationMaxDuration: number

    /**
     * The desired layout quality to achieve during relaxation.
     * High-quality layouts will consist of "round" polygons, lower-quality layouts will tend to contain more elongated,irregular shapes.
     * The lower the value of the threshold, the higher the quality of the layout and the longer
     * the layout computation time. If relaxationVisible is true, the desired quality level may not be achieved
     * if the relaxationMaxDuration timeout is exceeded.
     *
     * Value in [0,infinity]
     *
     * Setting relaxationQualityThreshold to 0 and relaxationMaxDuration to Number.MAX_VALUE will create the
     * highest-quality layout possible, at the cost of long relaxation time.
     *
     * Setting relaxationQualityThreshold, regardless of the relaxation duration timeout will disable the relaxation
     * leading to lower-quality layout, but faster computation.
     * The following examples demonstrate the two opposite situations.
     *
     * @example Low quality (Shortest runtime but worse results)
     * foamtree.set({
     *   dataObject: { groups: randomGroups(80) },
     *   relaxationInitializer: "fisheye",
     *   relaxationVisible: true,
     *   relaxationQualityThreshold: Number.MAX_VALUE
     * });
     *
     * @example High quality (long runtime but best results)
     * foamtree.set({
     *   dataObject: { groups: randomGroups(80) },
     *   relaxationInitializer: "fisheye",
     *   relaxationVisible: true,
     *   relaxationQualityThreshold: Number.MAX_VALUE
     * });
     *
     * @defaultValue 1
     * @remarks applicable only when layout is set to relaxed.
     */
    relaxationQualityThreshold: number

    /**
     * The duration of the animation that grows the group to its final weight, in milliseconds. Applicable only when relaxationVisible is true.
     *
     * Value in [0,infinity]
     * @example
     * foamtree.set({
     *   dataObject: { groups: randomGroups(80) },
     *   relaxationInitializer: "fisheye",
     *   relaxationVisible: true,
     *   groupGrowingDuration: 3000
     * });
     * @defaultValue 0
     * @remarks applicable only when layout is set to relaxed.
     */
    groupGrowingDuration: number

    /**
     * The easing function to use to grow group's weights. Meaningful only when groupGrowingDuration is larger than 0.
     *
     * @defaultValue 'bounce'
     * @remarks applicable only when layout is set to relaxed.
     */
    groupGrowingEasing: Easing

    /**
     * The amount of delay to apply when growing subsequent groups on the same level of hierarchy.
     * The delay will be computed by multiplying groupGrowingDuration by the value of this option.
     * The first child group will start growing immediately, the second one after the computed delay,
     * the third group will start growing after twice the delay and so on.
     *
     * Value in [0,1]
     * @example
     * foamtree.set({
     *   dataObject: { groups: randomGroups(80) },
     *   relaxationInitializer: "fisheye",
     *   relaxationVisible: true,
     *   groupGrowingDuration: 2000,
     *   groupGrowingDrag: 0.2
     * });
     * @defaultValue 0
     * @remarks applicable only when layout is set to relaxed.
     */
    groupGrowingDrag: number

    /**
     * Determines how many times FoamTree should attempt to set the desired size for the groups polygon. Depending on the characteristics of the input data, FoamTree may not be able to set the desired sizes of the polygons right away. Depending on the groupResizingBudget value, FoamTree will make several attempts to set the desired size during the course of relaxation.
     *
     * Setting this option to 0 may cause large-weight groups to be rendered smaller than desired. Setting a large value of this option may lead to "jumpy" and time-consuming relaxation.
     *
     * Value in [0,infinity]
     * @defaultValue 2
     * @remarks applicable only when layout is set to relaxed.
     */
    groupResizingBudget: number
  }

  /**
   * Options in this section determine the spacing between group's polygons.
   */
  interface GroupBorderOptions {
    /**
     * Determines the amount of rounding to apply to polygon corners. Setting group border radius to 0 will produce straight corners, the value of 1.0 will produce near-to-oval shapes.
     * Value in [0,1]
     * @defaultValue 0.15
     */
    groupBorderRadius: number
    /**
     * Determines the width of the empty space between the sibling group polygons, in pixels.
     * value is a number in range [0,infinity)
     * @defaultValue 4
     * @remarks Setting groupBorderWidth to a value smaller than groupStrokeWidth / 2 + 0.5 will prevent FoamTree from using incremental drawing routines and therefore slow down visualization updates during hover, opening and selection changes.
     */
    groupBorderWidth: number
    /**
     * The scaling factor to apply when drawing borders of child groups. Border with of a child group will be groupBorderWidthScaling smaller than the border width of the immediate parent group. Setting groupBorderWidthScaling to 1.0 will draw borders of equal widths on all levels of the group hierarchy.
     * @defaultValue 0.6
     * @remarks
     */
    groupBorderWidthScaling: number
    /**
     * Determines the width of the empty space between the parent group's edge and its child groups' edges, in pixels.
     * value is a number in range [0,infinity)
     * @defaultValue 6
     */
    groupInsetWidth: number
    /**
     * The correction factor that ensures that the rounded parent group polygon covers all child group's polygons. For large groupBorderRadius values, it may sometimes happen that certain child polygons "stick out" of their parent group. In such cases, you can increase the groupBorderRadiusCorrection value to ensure proper rendering.
     * value is a number in range [0,infinity)
     * @defaultValue 1
     */
    groupBorderRadiusCorrection: number

  }

  /**
   * Options documented in this section determine how FoamTree will fill the polygons.
   */
  export interface GroupFillOptions {
    /**
     * Determines the way the group polygons should be filled. The following values are possible:
     * <ul>
     *   <li>none - the polygons will not be filled at all</li>
     *   <li>plain - the polygons will be filled with one color; fast to render</li>
     *   <li>gradient - the polygons will be filled with a two-color radial gradient; slower to render</li>
     * </ul>
     * @defaultValue 'gradient'
     * @remarks On slower devices and/or larger data sets, FoamTree may automatically disable rendering of gradients to improve the rendering performance. To force the rendering of gradients in such cases, increase wireframeDrawMaxDuration, finalCompleteDrawMaxDuration and finalIncrementalDrawMaxDuration.
     */
    groupFillType: 'none' | 'plain' | 'gradient'
    /**
     * Determines the radius of the group-filling gradient.
     * value is a number in range [0,infinity)
     * @defaultValue 1
     */
    groupFillGradientRadius: number

    /**
     * The amount of hue to add or subtract from the base group color hue to create the polygon-center end of the fill gradient.
     * value is a number in range [-180,180]
     * @defaultValue 0
     */
    groupFillGradientCenterHueShift: number
    /**
     * The amount of saturation to add or subtract from the base group color saturation to create the polygon-center end of the fill gradient.
     * value is a number in range [-100,100]
     * @defaultValue 0
     */
    groupFillGradientCenterSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base group color lightness to create the polygon-center end of the fill gradient.
     * value is a number in range [-100,100]
     * @defaultValue 20
     */
    groupFillGradientCenterLightnessShift: number

    /**
     * The amount of hue to add or subtract from the base group color hue to create the polygon-edge end of the fill gradient.
     * value is a number in range [-180,180]
     * @defaultValue 0
     */
    groupFillGradientRimHueShift: number
    /**
     * The amount of saturation to add or subtract from the base group color saturation to create the polygon-edge end of the fill gradient.
     * value is a number in range [-100,100]
     * @defaultValue 0
     */
    groupFillGradientRimSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base group color lightness to create the polygon-edge end of the fill gradient.
     * value is a number in range [-100,100]
     * @defaultValue 20
     */
    groupFillGradientRimLightnessShift: number

  }

  /**
   * Options documented in this section determine how FoamTree will draw the edges of the polygons.
   */
  export interface GroupStrokeOptions {
    /**
     * Determines the way the group polygons edges should be drawn. The following values are possible:
     * <ul>
     *   <li>none - the edges will not be drawn at all; fastest to render</li>
     *   <li>plain - the edges will be drawn using one color; slower to render</li>
     *   <li>gradient - the edges will be drawn using a two-color linear gradient; slowest to render</li>
     * </ul>
     * @defaultValue 'plain'
     * @remarks On slower devices and/or larger data sets, FoamTree may automatically disable rendering of edges to improve the rendering performance. To force the rendering of gradients in such cases, increase wireframeDrawMaxDuration, finalCompleteDrawMaxDuration and finalIncrementalDrawMaxDuration.
     */
    groupStrokeType: 'none' | 'plain' | 'gradient'
    /**
     * Determines the width of the group's edge, in pixels.
     * value is a number in range [0,infinity)
     * @defaultValue 1.5
     * @remarks Setting groupStrokeWidth to a value larger than (groupBorderWidth - 0.5) * 2 will prevent FoamTree from using incremental drawing routines and therefore slow down visualization updates during hover, opening and selection changes.
     */
    groupStrokeWidth: number

    /**
     * The amount of hue to add or subtract from the base group color hue to create the color used for drawing the plain group's edge.
     * value is a number in range [-180,180]
     * @defaultValue 0
     */
    groupStrokePlainHueShift: number
    /**
     * The amount of saturation to add or subtract from the base group color hue to create the color used for drawing the plain group's edge.
     * value is a number in range [-100,100]
     * @defaultValue 0
     */
    groupStrokePlainSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base group color hue to create the color used for drawing the plain group's edge.
     * value is a number in range [-100,100]
     * @defaultValue -10
     */
    groupStrokePlainLightnessShift: number

    /**
     * The size of the linear gradient used to draw the polygon's edges, in relation to the polygon's size.
     * value is a number in range [0,infinity)
     * @defaultValue 1
     */
    groupStrokeGradientRadius: number
    /**
     * The angle of the linear gradient used to draw the polygon's edges.
     * value is a number in range [0,180]
     * @defaultValue 45
     */
    groupStrokeGradientAngle: number

    /**
     * The amount of hue to add or subtract from the base group color hue to create the upper-end color of the polygon edge's gradient.
     * value is a number in range [-180,180]
     * @defaultValue 0
     */
    groupStrokeGradientUpperHueShift: number
    /**
     * The amount of saturation to add or subtract from the base group color hue to create the upper-end color of the polygon edge's gradient.
     * value is a number in range [-100,100]
     * @defaultValue 0
     */
    groupStrokeGradientUpperSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base group color hue to create the upper-end color of the polygon edge's gradient.
     * value is a number in range [-100,100]
     * @defaultValue 20
     */
    groupStrokeGradientUpperLightnessShift: number

    /**
     * The amount of hue to add or subtract from the base group color hue to create the lower-end color of the polygon edge's gradient.
     * value is a number in range [-180,180]
     * @defaultValue 0
     */
    groupStrokeGradientLowerHueShift: number
    /**
     * The amount of saturation to add or subtract from the base group color hue to create the lower-end color of the polygon edge's gradient.
     * value is a number in range [-100,100]
     * @defaultValue 0
     */
    groupStrokeGradientLowerSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base group color hue to create the lower-end color of the polygon edge's gradient.
     * value is a number in range [-100,100]
     * @defaultValue -20
     */
    groupStrokeGradientLowerLightnessShift: number
  }

  /**
   * Options documented in this section determine how FoamTree will draw and decorate the selected groups.
   */
  export interface GroupSelectionOptions {
    /**
     * Color of the outline stroke for the selected groups.
     * value is a CSS color
     * @defaultValue '#222'
     */
    groupSelectionOutlineColor: string
    /**
     * Width of the selection outline to draw around selected groups.
     * value is a number in range [0,infinity)
     * @defaultValue 5
     * @remarks Setting groupSelectionOutlineWidth to a value larger than
     *
     * (groupBorderWidth-groupSelectionOutlineShadowSize - 0.5) * 2
     *
     * will prevent FoamTree from using incremental drawing routines and therefore slow down visualization updates during hover, opening and selection changes when one ore more groups are selected.
     */
    groupSelectionOutlineWidth: number
    /**
     * The size of the drop shadow to apply to the selection outline.
     * value is a number in range [0,infinity)
     * @defaultValue 0
     * @remarks Setting groupSelectionOutlineShadowSize to a value larger than
     *
     * (groupBorderWidth - groupSelectionOutlineWidth - 0.5) * 2
     *
     * will prevent FoamTree from using incremental drawing routines and therefore slow down visualization updates during hover, opening and selection changes when one ore more groups are selected.
     */
    groupSelectionOutlineShadowSize: number
    /**
     * The color of the selection outline shadow
     * @assert (value is not empty) and (value is a CSS color)
     * @since 3.0.0
     * @defaultValue "#fff"
     */
    groupSelectionOutlineShadowColor: string

    /**
     * The amount of hue to add or subtract from the base fill color hue when the group is selected.
     * @assert (value is not empty) and (value is a number in range [-180,180])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupSelectionFillHueShift: number
    /**
     * The amount of saturation to add or subtract from the base fill color saturation when the group is selected.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupSelectionFillSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base fill color lightness when the group is selected.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupSelectionFillLightnessShift: number

    /**
     * The amount of hue to add or subtract from the base stroke color hue when the group is selected.
     * @assert (value is not empty) and (value is a number in range [-180,180])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupSelectionStrokeHueShift: number
    /**
     * The amount of saturation to add or subtract from the base stroke color saturation when the group is selected.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupSelectionStrokeSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base stroke color lightness when the group is selected.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue -10
     */
    groupSelectionStrokeLightnessShift: number
  }

  /**
   * Options documented in this section determine how FoamTree will highlight the hovered-on groups.
   */
  export interface GroupHoverOptions {
    /**
     * The amount of hue to add or subtract from the base fill color hue when the group is hovered on.
     * @assert (value is not empty) and (value is a number in range [-180,180])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupHoverFillHueShift: number
    /**
     * The amount of saturation to add or subtract from the base fill color saturation when the group is hovered on.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupHoverFillSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base fill color lightness when the group is hovered on.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue 20
     */
    groupHoverFillLightnessShift: number

    /**
     * The amount of hue to add or subtract from the base stroke color hue when the group is hovered on.
     * @assert (value is not empty) and (value is a number in range [-180,180])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupHoverStrokeHueShift: number
    /**
     * The amount of saturation to add or subtract from the base stroke color saturation when the group is hovered on.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupHoverStrokeSaturationShift: number
    /**
     * The amount of lightness to add or subtract from the base stroke color lightness when the group is hovered on.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue -10
     */
    groupHoverStrokeLightnessShift: number
  }

  /**
   * Options documented in this section determine how FoamTree will lay out and draw group labels.
   */
  export interface GroupLabelOptions<D extends DataObject> {
    /**
     * Font family to use for drawing group labels. CSS-compliant font family specifications are supported, including webfonts imported using the @font-face syntax.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.0.0
     * @defaultValue "sans-serif"
     */
    groupLabelFontFamily: string | null | undefined
    /**
     * Font style to use for drawing group labels. All CSS-compliant font styles are allowed, such as italic.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.2.2
     * @defaultValue "normal"
     */
    groupLabelFontStyle: string | null | undefined
    /**
     * Font weight to use for drawing group labels. All CSS-compliant font weights are allowed, such as bold.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.2.2
     * @defaultValue "normal"
     */
    groupLabelFontWeight: string | null | undefined
    /**
     * Font variant to use for drawing group labels. All CSS-compliant font variants are allowed, such as small-caps.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.2.2
     * @defaultValue "normal"
     */
    groupLabelFontVariant: string | null | undefined
    /**
     * Minimum font size used for drawing group labels, in pixels.
     *
     * Note that setting minimum font size to a large value may result in many labels being replaced with an ellipsis ("dots"), as in this example:
     * @example
     * foamtree.set({
     *   dataObject: largeDataSet,
     *   groupLabelMinFontSize: 30,
     *   groupLabelMaxFontSize: 40
     * });
     *
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 6
     * @remarks To force FoamTree to draw labels for all groups, set groupLabelMinFontSize to 0. This setting, however, may significantly slow down visualization rendering.
     */
    groupLabelMinFontSize: number
    /**
     * Maximum font size used for drawing group labels. See the groupLabelMinFontSize attribute for details.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 160
     * @see groupLabelMinFontSize
     */
    groupLabelMaxFontSize: number

    /**
     * Allows to customize or completely replace the default text of group labels. When labels are drawn, FoamTree will call the provided function once for each group (parent groups will be processed before children groups). The task of the function is to modify or completely replace the default label text. The custom label text will most likely be based on custom properties passed along with the data model.
     *
     * The signature of the decorator callback should be the following:
     *
     * @param options all current visualization options (keys and values).
     * @param properties an object with properties describing the group being decorated. The object will be a union of objects retrieved from the hierarchy, state and geometry options.
     * @param variables object with label-related variables this function can change.
     * @remarks The limited demo version of FoamTree will not call this decorator for the attribution group. Please contact Carrot Search for licensing of a fully customizable distribution.
     * @example
     * foamtree.set({
     *   groupLabelDecorator: function(opts, props, vars) {
     *     vars.labelText = "«\u00a0" + vars.labelText.toLocaleUpperCase() + "\u00a0»";
     *   }
     * });
     */
    groupLabelDecorator: (options: Options, properties: InternalProperties<D>, variables: { labelText: string }) => void
    /**
     * The line height to use when rendering labels in multiple lines.
     * @assert (value is not empty) and (value is a number in range [1,infinity))
     * @since 3.0.0
     * @defaultValue 1.05
     */
    groupLabelLineHeight: number

    /**
     * The padding to add on the left and right of the label, in current font size unit.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 1
     */
    groupLabelHorizontalPadding: number
    /**
     * The padding to add on the top and bottom of the label, in current font size unit.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 1
     */
    groupLabelVerticalPadding: number
    /**
     * The maximum total height of the label in relation to the height of the group's polygon.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.9
     */
    groupLabelMaxTotalHeight: number
    /**
     * Every time the geometry of the group's polygon changes, FoamTree needs to decide whether to re-layout the label text. The groupLabelUpdateThreshold determines how much must the area of the polygon change for FoamTree to re-layout the label. For example, if the value of the threshold is 0.05, FoamTree will re-layout the label when the area of the polygon is larger or smaller by 5% or more.
     *
     * Setting groupLabelUpdateThreshold to 0 will cause FoamTree to re-layout the label on every group polygon change. Depending on the size of the data set, it may significantly slow down visualization rendering when relaxationVisible is true.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.05
     */
    groupLabelUpdateThreshold: number
    /**
     * Picks the label color automatically depending on the group's color brightness. If the brightness is below this threshold groupLabelLightColor is used, otherwise groupLabelDarkColor is used. Setting the threshold to either 0 or 1 will pick dark or light labels, correspondingly.
     *
     * Automatic choice of label colors is also provided as part of groupColorDecorator's functionality.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.35
     */
    groupLabelColorThreshold: number
    /**
     * The label color to use on bright groups.
     * @assert (value is not empty) and (value is a CSS color)
     * @since 3.0.0
     * @defaultValue "#000"
     * @see groupLabelColorThreshold
     */
    groupLabelDarkColor: string
    /**
     * The label color to use on dark groups
     * @assert (value is not empty) and (value is a CSS color)
     * @since 3.0.0
     * @defaultValue "#fff"
     * @see groupLabelColorThreshold
     */
    groupLabelLightColor: string
  }

  /**
   * Options described in this section determine how FoamTree draws and decorates exposed groups.
   */
  export interface GroupExposureOptions {
    /**
     * The magnification scale at which exposed groups will be drawn. If you set groupExposureScale to 1.0, exposed groups will be drawn at the same scale as the unexposed groups.
     * @assert (value is not empty) and (value is a number in range [1,infinity))
     * @since 3.0.0
     * @defaultValue 1.15
     */
    groupExposureScale: number
    /**
     * The color of drop shadow to apply to exposed groups.
     * @assert (value is not empty) and (value is a CSS color)
     * @since 3.0.0
     * @defaultValue "rgba(0, 0, 0, 0.5)"
     */
    groupExposureShadowColor: string
    /**
     * The size of drop shadow to apply to exposed groups, in pixels.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 50
     */
    groupExposureShadowSize: string
    /**
     * The margin size to apply when zooming to the exposed group, relative to the group polygon's bounding box dimensions. If groupExposureZoomMargin is 0, the exposed group will occupy the full height / width of the view port. For larger values, a zoom margin will be added around the exposed group. The larger the value, the larger margin will be applied.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 0.1
     */
    groupExposureZoomMargin: number


    /**
     * The amount of saturation to add or subtract from groups base color's saturation when the group is unexposed.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue 0
     */
    groupUnexposureSaturationShift: number
    /**
     * The amount of lightness to add or subtract from groups base color's lightness when the group is unexposed.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue -10
     */
    groupUnexposureLightnessShift: number
    /**
     * The labelColorThreshold value to use for unexposed groups. When the colors of unexposed groups are significantly modified using the groupUnexposureLightnessShift and groupUnexposureSaturationShift options, you may want to modify this threshold to, for example, always draw the labels of unexposed groups in the dark color.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.35
     */
    groupUnexposureLabelColorThreshold: number
    /**
     * The duration of the group exposure and unexposure animation.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 700
     */
    exposeDuration: number
    /**
     * The easing function to use during group exposure and unexposure animations. Meaningful only when exposeDuration is larger than 0.
     *
     * @assert (value is not empty) and (value one of [linear, bounce, squareIn, squareOut, squareInOut, cubicIn, cubicOut, cubicInOut, quadIn, quadOut, quadInOut])
     * @since 3.0.0
     * @defaultValue "squareInOut"
     */
    exposeEasing: Easing
  }

  export interface GroupOpeningClosingOptions {
    /**
     * The duration of the group opening or closing animation.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 500
     */
    openCloseDuration: number
  }

  /**
   * Options in this group determine how the stacked polygons representing the hierarchy of groups will be drawn.
   */
  export interface GroupHierarchyOptions {
    /**
     * The opacity to use when filling groups that have child groups. By default, the parent group is drawn semi-transparent to indicate that the group has child groups that can be browsed. If you set parentFillOpacity to 1.0, the parent group will be fully opaque and the child groups will not be visible until the group gets open. If you set parentFillOpacity to 0.0, the parent group's polygon will not be filled at all and the child groups will be fully visible at all times.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.7
     */
    parentFillOpacity: number
    /**
     * The opacity to use when drawing strokes of groups that have child groups.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 1
     */
    parentStrokeOpacity: number
    /**
     * The opacity to use when drawing labels of groups that have child groups.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 1
     */
    parentLabelOpacity: number
    /**
     * When set to true, FoamTree will try to equalize the opacity of groups' polygons, so that the aggregated opacity of, for example, a group with 3 levels of child groups and a group without child groups will be roughly the same. Opacity equalization will usually lead to a more uniform look of the whole visualization area.
     *
     * Opacity balancing will only be applied when the base color of the group is not fully opaque, that is when its alpha component is less than 1.
     * @assert value is a boolean
     * @since 3.0.0
     * @defaultValue true
     */
    parentOpacityBalancing: boolean
  }

  /**
   * This section describes options that determine the base colors assigned for groups.
   */
  export interface GroupColorsOptions<D extends DataObject> {
    /**
     * Start color to use if rainbow color model is used for coloring groups. The rainbow color model will radially or linearly spread the color hue among top-level groups, starting at rainbowStartColor and ending at rainbowEndColor. Sub-groups will be painted with the parent group's hue but with varying degrees of saturation and lightness.
     *
     * For custom coloring of groups, use groupColorDecorator.
     * @assert (value is not empty) and (value is a CSS color)
     * @since 3.0.0
     * @defaultValue "hsla(0, 100%, 55%, 1)"
     */
    rainbowStartColor: string
    /**
     * End color to use if rainbow color model is used for coloring groups. See rainbowStartColor for a description of how the rainbow color model works.
     * @assert (value is not empty) and (value is a CSS color)
     * @since 3.0.0
     * @defaultValue "hsla(359, 100%, 55%, 1)"
     */
    rainbowEndColor: string
    /**
     * Determines how the rainbow colors will be distributed. You can use one of the following values:
     * <ul>
     *   <li>radial - distributes the colors radially around the center of the visualization area</li>
     *   <li>linear - distributes the colors linearly across the whole visualization area</li>
     * </ul>
     * You can use the rainbowColorDistributionAngle option to further tune the color distribution.
     * @assert (value is not empty) and (value one of [radial, linear])
     * @since 3.0.0
     * @defaultValue "radial"
     */
    rainbowColorDistribution: 'linear' | 'radial'
    /**
     * When rainbowColorDistribution is radial, determines the angle at which the rainbow color will start. Change the the values of this option, to rotate the rainbow around the central point of the visualization area.
     *
     * When rainbowColorDistribution is linear, determines the angle of the linear gradient formed by the rainbow color transition.
     * @assert (value is not empty) and (value is a number in range [-180,180])
     * @since 3.0.0
     * @defaultValue -45
     */
    rainbowColorDistributionAngle: number
    /**
     * Determines the angle of the linear gradient formed by the color lightness variations created for lower-level groups.
     * @assert (value is not empty) and (value is a number in range [-180,180])
     * @since 3.0.0
     * @defaultValue 45
     */
    rainbowLightnessDistributionAngle: number
    /**
     * When rainbowColorDistribution is radial, FoamTree can desaturate colors of the polygons lying close to the center of the visualization area to make the color transitions smoother.
     *
     * You can use the rainbowLightnessCorrection option to vary the strength of this correction. The value of 0 will moderately decrease the saturation, the value of -1 will strongly desaturate the center groups. Finally, set the correction to 1 to disable correction decreases completely.
     * @assert (value is not empty) and (value is a number in range [-1,1])
     * @since 3.0.0
     * @defaultValue 0.1
     */
    rainbowSaturationCorrection: number
    /**
     * When rainbowColorDistribution is radial, FoamTree can adjust the lightness of colors of the polygons lying close to the center of the visualization area to make the color transitions smoother.
     *
     * You can use the rainbowLightnessCorrection option to vary the strength of this adjustment. The value of 0 means no adjustment. The value of -1 will strongly decrease the lightness of the center groups. Finally, the value of 1 will strongly increase the lightness of the central groups.
     * @assert (value is not empty) and (value is a number in range [-1,1])
     * @since 3.0.0
     * @defaultValue 0.4
     */
    rainbowLightnessCorrection: number
    /**
     * Determines the strength of the color lightness variations applied to lower-level groups.
     * @assert (value is not empty) and (value is a number in range [-100,100])
     * @since 3.0.0
     * @defaultValue 30
     */
    rainbowLightnessShift: number
    /**
     * Determines the central lightness value around which the lightness variations will be applied for the lower-level groups.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.4
     */
    rainbowLightnessShiftCenter: number
    /**
     * A callback function you can use to customize or completely replace the default rainbow color model for groups. During each redraw, the visualization code will call the provided function once for each group. The task of the function is to modify or completely replace the default color of the group and its label. New colors can be derived from various properties of the group, such as its nesting level, number of siblings, or custom properties passed along with the data model.
     * @param options all current visualization options (keys and values).
     * @param properties an object with properties describing the group being decorated. The object will be a union of objects retrieved from the hierarchy, state and geometry options.
     * @param variables an object with two properties: groupColor, containing the group color computed by the default rainbow color model, and labelColor always equal to auto. The callback function can either change some of the properties of groupColor or replace any of the colors with a new object representing the color to use.
     * @example simple
     * foamtree.set({
     *   dataObject: {
     *     groups: [
     *       { label: "C", color: "#00aeef" },
     *       { label: "M", color: "#ec008c" },
     *       { label: "Y", color: "#fff200" },
     *       { label: "K", color: "#231f20" }
     *     ]
     *   },
     *   groupColorDecorator: function (opts, params, vars) {
     *     vars.groupColor = params.group.color;
     *     vars.labelColor = "auto";
     *   }
     * });
     * @example animated
     * var frame = 0;
     * var running = true;
     * foamtree.set({
     *   groupColorDecorator: function(opts, params, vars) {
     *     // We change the color only for top-level groups. For child groups,
     *     // FoamTree will generate brightness variations of the parent group's color.
     *     if (params.level == 0) {
     *       var delay = 5;
     *       var count = 3;
     *       var frameDiv = Math.floor(frame / delay);
     *       var mod = frameDiv % params.siblingCount;
     *       var diff = (mod - params.index + params.siblingCount)
     *                    % params.siblingCount;
     *       if (diff < count) {
     *         vars.groupColor.g = 255 *
     *           (1 - ((diff * delay + frame % delay) / (delay * count)));
     *       } else {
     *         vars.groupColor.g = 40;
     *       }
     *       vars.groupColor.r = 40;
     *       vars.groupColor.b = 40;
     *       vars.groupColor.model = "rgb";
     *     }
     *   },
     *   dataObject: {
     *     groups: (function() {
     *       var arr = [];
     *       for (var i = 0; i < 50; i++) {
     *         arr.push({
     *           label: "",
     *           weight: Math.pow(Math.random(), 3) * 0.8 + 0.2,
     *           groups: [ { label: "" }, { label: "" }, { label: "" }]
     *         });
     *       }
     *       return arr;
     *     })()
     *   },
     *   groupFillType: "plain",
     *   groupStrokeType: "none"
     * });
     *
     * // Redraw the visualization periodically. Although we use setTimeout()
     * // here, use the requestAnimationFrame() when possible.
     * setTimeout(function redraw() {
     *   if (!running) { // stopped?
     *     return;
     *   }
     *   foamtree.redraw(true);
     *   frame++;
     *   setTimeout(redraw, 16); // next frame
     * }, 16);
     */
    groupColorDecorator: (options: Options, properties: InternalProperties<D>, variables: {
      /**
       * the group color computed by the default rainbow color model
       */
      groupColor: string | ColorObject,
      /**
       * the label color computed by the default rainbow color model
       *
       * can be set to a string value of auto which will recompute the label color again depending on the updated groupColor and visualization options controlling dark/ light label colors: labelColorThreshold, labelLightColor and labelDarkColor.
       * @defaultValue "auto"
       */
      labelColor: 'auto' | string | ColorObject
    }) => void

  }

  /**
   * You can use options described in this section to change the animation FoamTree uses to show a new data set. By changing various rollout properties you can create many different animation styles.
   */
  export interface RolloutOptions {
    /**
     * The point in the visualization container area at which the rollout will start. The following start point values are allowed:
     * <ul>
     *   <li>center - rollout will start from the group lying closest to the center of the visualization container</li>
     *   <li>topleft - rollout will start from the group lying closest to the top-left corner of the visualization container</li>
     *   <li>bottomright - rollout will start from the group lying closest to the bottom-right corner of the visualization container</li>
     *   <li>random - rollout will start from a random group</li>
     * </ul>
     * @assert (value is not empty) and (value one of [center, topleft, bottomright, random])
     * @since 3.0.0
     * @defaultValue "center"
     */
    rolloutStartPoint: 'center' | 'topleft' | 'bottomright' | 'random'
    /**
     * FoamTree will start the rollout animation from the group determined using the rolloutStartPoint option. Then, further polygons will be included in the animation, depending on the value of this option:
     * <ul>
     *   <li>groups - on each animation step, all neighbors of the groups already being animated will be included in the animation, which will create a sort of ripple effect as shown in the following example.</li>
     *   <li>individual - on each animation step only one neighbor of the groups already being animated will be included in the animation. When using this rollout method, you may want to decrease rolloutPolygonDrag to make the animation progress smoother.</li>
     * </ul>
     * @assert (value is not empty) and (value one of [groups, individual])
     * @since 3.0.0
     * @defaultValue "groups"
     * @example groups
     * foamtree.set({
     *   dataObject: { groups: randomGroups(200) },
     *
     *   // Roll out in groups
     *   rolloutMethod: "groups",
     *
     *   // Create a gentle scaling effect
     *   rolloutDuration: 6000,
     *   rolloutEasing: "bounce",
     *   rolloutScalingStrength: -0.4,
     *   rolloutRotationStrength: 0,
     *   rolloutPolygonDrag: 0.08
     * });
     * @example individual
     * foamtree.set({
     *   dataObject: { groups: randomGroups(200) },
     *
     *   // Roll out each group individually
     *   rolloutMethod: "individual",
     *
     *   // Create a gentle scaling effect
     *   rolloutDuration: 4000,
     *   rolloutEasing: "bounce",
     *   rolloutScalingStrength: -0.4,
     *   rolloutRotationStrength: 0,
     *   rolloutPolygonDrag: 0.015
     * });
     */
    rolloutMethod: 'groups' | 'individual'
    /**
     * The duration of the rollout animation at one level of the hierarchy, in milliseconds. The duration of the complete animation is variable and depends on the number of hierarchy levels and the rolloutChildGroupsDrag and rolloutChildGroupsDelay options.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 2000
     */
    rolloutDuration: number
    /**
     * The animation easing function to use during rollout animation.
     * @assert (value is not empty) and (value one of [linear, bounce, squareIn, squareOut, squareInOut, cubicIn, cubicOut, cubicInOut, quadIn, quadOut, quadInOut])
     * @since 3.0.0
     * @defaultValue "squareOut"
     */
    rolloutEasing: Easing
    /**
     * Determines the initial scale to set for each polygon at the start of the rollout. During the rollout animation the initial scale will be transitioned to the neutral value.
     *
     * When rolloutScalingStrength is -1, the initial scale will be minus infinity making the polygon appear at infinite distance in front of the user.
     *
     * When rolloutScalingStrength is 1, the initial scale will be plus infinity making the polygon appear at infinite distance behind the user.
     *
     * All intermediate values are allowed and will set the initial scale to the appropriate proportion between the extremes.
     *
     * When rolloutScalingStrength is 0, the initial scale will be equal to the neutral scale.
     *
     * @assert (value is not empty) and (value is a number in range (-infinity,infinity))
     * @since 3.0.0
     * @defaultValue -0.7
     * @remarks When visualizing hierarchical models, setting a positive rolloutScalingStrength may create unpleasant effects because child groups will be drawn on top of their parents during the animation as shown in the following example. For this reason, you may want to use negative scaling strengths for hierarchical data.
     */
    rolloutScalingStrength: number
    /**
     * Determines the initial horizontal translation to apply to each polygon at the start of the rollout. The rollout animation will transition the initial translation to the neutral value. The unit of the translation is the width of the parent polygon's bounding box. Fox example, the value of -0.5 means the translation to the left by half of the width of the parent box.
     * @assert (value is not empty) and (value is a number in range (-infinity,infinity))
     * @since 3.0.0
     * @defaultValue 0
     */
    rolloutTranslationXStrength: number
    /**
     * Determines the initial vertical translation to apply to each polygon at the start of the rollout. The rollout animation will transition the initial translation to the neutral value. The unit of the translation is the height of the parent polygon's bounding box. Fox example, the value of 0.5 means the translation to the bottom by half of the height of the parent box.
     * @assert (value is not empty) and (value is a number in range (-infinity,infinity))
     * @since 3.0.0
     * @defaultValue 0
     */
    rolloutTranslationYStrength: number
    /**
     * Determines the initial rotation to apply to each polygon at the start of the rollout. The rollout animation will transition the initial rotation to the neutral value. Rotation of 1.0 means 180 degrees clockwise.
     * @assert (value is not empty) and (value is a number in range (-infinity,infinity))
     * @since 3.0.0
     * @defaultValue -0.7
     */
    rolloutRotationStrength: number
    /**
     * Determines the point relative to which the rollout transformations will be taken.
     *
     * The value of 0.0 means the center of the parent group's polygon,
     *
     * 1.0 means the center of the currently animated polygon.
     *
     * Intermediate values set the transformation center at the appropriate linear combination of the above extremes.
     *
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.7
     */
    rolloutTransformationCenter: number
    /**
     * The amount of delay to apply before starting the rollout of subsequent groups on the same level of hierarchy. The delay will be computed by multiplying rolloutDuration by the value of this option.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.1
     */
    rolloutPolygonDrag: number
    /**
     * Determines the duration of the polygon rollout animation, as a fraction of rolloutDuration.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.5
     */
    rolloutPolygonDuration: number
    /**
     * Determines the delay to apply before showing the group's label during rollout, as a fraction of rolloutDuration.
     *
     * Note that when wireframeLabelDrawing is set to never, group labels will not be drawn at all during rollout. When wireframeLabelDrawing is set to auto, labels may or may not be drawn during the rollout, depending on the performance of the device and the size of the data set. To force FoamTree to draw labels during the rollout animation, set wireframeLabelDrawing to always.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.8
     */
    rolloutLabelDelay: number
    /**
     * The amount of delay to apply before revealing the labels of subsequent groups on the same level of hierarchy. The delay will be computed by multiplying rolloutDuration by the value of this option.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.1
     */
    rolloutLabelDrag: number
    /**
     * Determines the duration of the label fading-in animation, as a fraction of rolloutDuration.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.5
     */
    rolloutLabelDuration: number
    /**
     * The amount of delay to apply before starting the rollout of child groups of a parent group, as a fraction of rolloutDuration. If you set rolloutChildGroupsDelay to 0, groups at all levels will start their rollout animations at the same time.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.2
     */
    rolloutChildGroupsDelay: number
    /**
     * The amount of delay to apply before starting the rollout of child groups of subsequent parent groups groups on the same level of hierarchy. The delay will be computed by multiplying rolloutDuration by the value of this option.
     *
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.1
     */
    rolloutChildGroupsDrag: number
  }

  /**
   * You can use options described in this section to change the animation FoamTree uses to hide the current data set before showing a new one.
   * By changing various rollout properties you can create many different animation styles.
   * Many of the pullback options are similar to their rollout counterparts.
   */
  export interface PullbackOptions {
    /**
     * The point in the visualization container area at which the pullback will start. The following start point values are allowed:
     * <ul>
     *   <li>center - pullback will start from the group lying closest to the center of the visualization container</li>
     *   <li>topleft - pullback will start from the group lying closest to the top-left corner of the visualization container</li>
     *   <li>bottomright - pullback will start from the group lying closest to the bottom-right corner of the visualization container</li>
     *   <li>random - pullback will start from a random group</li>
     * </ul>
     * @assert (value is not empty) and (value one of [center, topleft, bottomright, random])
     * @since 3.0.0
     * @defaultValue "center"
     */
    pullbackStartPoint: 'center' | 'topleft' | 'bottomright' | 'random'
    /**
     * FoamTree will start the pullback animation from the group determined using the pullbackStartPoint option. Then, further polygons will be included in the animation, depending on the value of this option:
     * <ul>
     *   <li>groups - on each animation step, all neighbors of the groups already being animated will be included in the animation, which will create a sort of ripple effect as shown in the following example.</li>
     *   <li>individual - on each animation step only one neighbor of the groups already being animated will be included in the animation. When using this pullback method, you may want to decrease pullbackPolygonDrag to make the animation progress smoother.</li>
     * </ul>
     * @assert (value is not empty) and (value one of [groups, individual])
     * @since 3.0.0
     * @defaultValue "groups"
     * @example groups
     * foamtree.set({
     *   dataObject: { groups: randomGroups(200) },
     *
     *   // Roll out in groups
     *   pullbackMethod: "groups",
     *
     *   // Create a gentle scaling effect
     *   pullbackDuration: 6000,
     *   pullbackEasing: "bounce",
     *   pullbackScalingStrength: -0.4,
     *   pullbackRotationStrength: 0,
     *   pullbackPolygonDrag: 0.08
     * });
     * @example individual
     * foamtree.set({
     *   dataObject: { groups: randomGroups(200) },
     *
     *   // Roll out each group individually
     *   pullbackMethod: "individual",
     *
     *   // Create a gentle scaling effect
     *   pullbackDuration: 4000,
     *   pullbackEasing: "bounce",
     *   pullbackScalingStrength: -0.4,
     *   pullbackRotationStrength: 0,
     *   pullbackPolygonDrag: 0.015
     * });
     */
    pullbackMethod: 'groups' | 'individual'
    /**
     * The duration of the pullback animation at one level of the hierarchy, in milliseconds. The duration of the complete animation is variable and depends on the number of hierarchy levels and the pullbackChildGroupsDrag and pullbackChildGroupsDelay options.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 2000
     */
    pullbackDuration: number
    /**
     * The animation easing function to use during pullback animation.
     * @assert (value is not empty) and (value one of [linear, bounce, squareIn, squareOut, squareInOut, cubicIn, cubicOut, cubicInOut, quadIn, quadOut, quadInOut])
     * @since 3.0.0
     * @defaultValue "squareOut"
     */
    pullbackEasing: Easing
    /**
     * Determines the target scale to set for each polygon at the end of the pullback.
     *
     * When pullbackScalingStrength is -1, the target scale will be minus infinity making the polygon appear at infinite distance in front of the user.
     *
     * When pullbackScalingStrength is 1, the target scale will be plus infinity making the polygon appear at infinite distance behind the user.
     *
     * All intermediate values are allowed and will set the target scale to the appropriate proportion between the extremes.
     *
     * When pullbackScalingStrength is 0, the target scale will be equal to the neutral scale.
     *
     * The following examples demonstrate the pullback animation for negative and positive values of the pullbackScalingStrength option. Both examples set pullbackTransformationCenter to 0 so that the origin of the scaling is the center of the visualization container
     *
     * @assert (value is not empty) and (value is a number in range (-infinity,infinity))
     * @since 3.0.0
     * @defaultValue -0.7
     * @remarks When visualizing hierarchical models, setting a positive pullbackScalingStrength may create unpleasant effects because child groups will be drawn on top of their parents during the animation as shown in the following example. For this reason, you may want to use negative scaling strengths for hierarchical data.
     */
    pullbackScalingStrength: number
    /**
     * Determines the initial horizontal translation to apply to each polygon at the start of the pullback. The pullback animation will transition the initial translation to the neutral value. The unit of the translation is the width of the parent polygon's bounding box. Fox example, the value of -0.5 means the translation to the left by half of the width of the parent box.
     * @assert (value is not empty) and (value is a number in range (-infinity,infinity))
     * @since 3.0.0
     * @defaultValue 0
     */
    pullbackTranslationXStrength: number
    /**
     * Determines the initial vertical translation to apply to each polygon at the start of the pullback. The pullback animation will transition the initial translation to the neutral value. The unit of the translation is the height of the parent polygon's bounding box. Fox example, the value of 0.5 means the translation to the bottom by half of the height of the parent box.
     * @assert (value is not empty) and (value is a number in range (-infinity,infinity))
     * @since 3.0.0
     * @defaultValue 0
     */
    pullbackTranslationYStrength: number
    /**
     * Determines the initial rotation to apply to each polygon at the start of the pullback. The pullback animation will transition the initial rotation to the neutral value. Rotation of 1.0 means 180 degrees clockwise.
     * @assert (value is not empty) and (value is a number in range (-infinity,infinity))
     * @since 3.0.0
     * @defaultValue -0.7
     */
    pullbackRotationStrength: number
    /**
     * Determines the point relative to which the pullback transformations will be taken.
     *
     * The value of 0.0 means the center of the parent group's polygon,
     *
     * 1.0 means the center of the currently animated polygon.
     *
     * Intermediate values set the transformation center at the appropriate linear combination of the above extremes.
     *
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.7
     */
    pullbackTransformationCenter: number
    /**
     * The pullback animation will first start hiding groups labels and after a delay the hiding of the polygons will start. This option determines the delay to apply before hiding of the polygons starts. The delay is specified as a fraction of pullbackDuration.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.3
     */
    pullbackPolygonDelay: number
    /**
     * The amount of delay to apply before starting the pullback of subsequent groups on the same level of hierarchy. The delay will be computed by multiplying pullbackDuration by the value of this option.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.1
     */
    pullbackPolygonDrag: number
    /**
     * Determines the duration of the polygon pullback animation, as a fraction of pullbackDuration.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.8
     */
    pullbackPolygonDuration: number
    /**
     * Determines the delay to apply before showing the group's label during pullback, as a fraction of pullbackDuration.
     *
     * Note that when wireframeLabelDrawing is set to never, group labels will not be drawn at all during pullback. When wireframeLabelDrawing is set to auto, labels may or may not be drawn during the pullback, depending on the performance of the device and the size of the data set. To force FoamTree to draw labels during the pullback animation, set wireframeLabelDrawing to always.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0
     */
    pullbackLabelDelay: number
    /**
     * The amount of delay to apply before revealing the labels of subsequent groups on the same level of hierarchy. The delay will be computed by multiplying pullbackDuration by the value of this option.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.1
     */
    pullbackLabelDrag: number
    /**
     * Determines the duration of the label fading-in animation, as a fraction of pullbackDuration.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.3
     */
    pullbackLabelDuration: number
    /**
     * Determines the duration of the sub-group fading-out animation, as a fraction of pullbackDuration.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.3
     */
    pullbackChildGroupsDuration: number
    /**
     * The amount of delay to apply before starting the pullback of child groups of a parent group, as a fraction of pullbackDuration. If you set pullbackChildGroupsDelay to 0, groups at all levels will start their pullback animations at the same time.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.1
     */
    pullbackChildGroupsDelay: number
    /**
     * The amount of delay to apply before starting the pullback of child groups of subsequent parent groups groups on the same level of hierarchy. The delay will be computed by multiplying pullbackDuration by the value of this option.
     *
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.0.0
     * @defaultValue 0.1
     */
    pullbackChildGroupsDrag: number
  }

  /**
   * When rolloutDuration or pullbackDuration is 0, FoamTree will use a simple fade in/out animation to show and hide the visualization. You can use options described in this section to customize the fading.

   */
  export interface FadingOptions {
    /**
     * The duration of the fade-in/out animation, in milliseconds. The fading in/out is applied only when rolloutDuration / pullbackDuration is 0, otherwise the value of this option is ignored. Set this option to 0 to disable fading.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 700
     */
    fadeDuration: number
    /**
     * The easing function to use when performing the fading animation.
     * @assert (value is not empty) and (value one of [linear, bounce, squareIn, squareOut, squareInOut, cubicIn, cubicOut, cubicInOut, quadIn, quadOut, quadInOut])
     * @since 3.0.0
     * @defaultValue "cubicInOut"
     */
    fadeEasing: Easing
  }

  /**
   * Options in this section customize the way the visualization can be zoomed using the mouse wheel.
   */
  export interface ZoomOptions {
    /**
     * The magnification factor to apply when the user zooms in using the mouse wheel. When zooming out, the factor will be 1 /zoomMouseWheelFactor.
     * @assert (value is not empty) and (value is a number in range [1,infinity))
     * @since 3.0.0
     * @defaultValue 1.5
     */
    zoomMouseWheelFactor: number
    /**
     * The duration of the zoom-in/out animation, in milliseconds.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 500
     */
    zoomMouseWheelDuration: number
    /**
     * The easing function to apply to the zoom animation.
     * @assert (value is not empty) and (value one of [linear, bounce, squareIn, squareOut, squareInOut, cubicIn, cubicOut, cubicInOut, quadIn, quadOut, quadInOut])
     * @since 3.0.0
     * @defaultValue "squareOut"
     */
    zoomMouseWheelEasing: Easing
  }

  export interface TitleBarOptions<D extends DataObject> {
    /**
     * Font family for the title bar, if shown. CSS-compliant font family specifications are supported, including webfonts imported using the @font-face syntax. If not specified, the same font as specified for the groupLabelFontFamily will be used.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.0.0
     * @example This example renders the title bar in monospace font.
     * foamtree.set({
     *   dataObject: { groups: [
     *     { label: "ABC123", selected: true },
     *     { label: "DEF456" }]},
     *   titleBar: "inscribed",
     *   titleBarFontFamily: "monospace",
     *   maxLabelSizeForTitleBar: Number.MAX_VALUE,
     *   groupLabelFontFamily: "Arial, sans-serif"
     * });
     */
    titleBarFontFamily: string | null | undefined
    /**
     * Font style for the title bar, if shown. CSS-compliant font style specifications are supported, such as italic. If not specified, groupLabelFontStyle will be used.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.2.2
     * @defaultValue "normal"
     */
    titleBarFontStyle: string | null | undefined
    /**
     * Font weight for the title bar, if shown. CSS-compliant font weight specifications are supported, such as bold. If not specified, groupLabelFontWeight will be used.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.2.2
     * @defaultValue "normal"
     */
    titleBarFontWeight: string | null | undefined
    /**
     * Font variant for the title bar, if shown. CSS-compliant font variant specifications are supported, such as small-caps. If not specified, groupLabelFontVariant will be used.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.2.2
     * @defaultValue "normal"
     */
    titleBarFontVariant: string | null | undefined
    /**
     * Minimum font size to use when drawing the title bar's label, in pixels.
     *
     * @remarks Note that setting minimum font size to a large value may result in an empty title bar.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 10
     */
    titleBarMinFontSize: number
    /**
     * Maximum font size to draw the title bar's label, in pixels.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 40
     */
    titleBarMaxFontSize: number
    /**
     * The background color of the title bar area.
     * @assert (value is not empty) and (value is a CSS color)
     * @since 3.0.0
     * @defaultValue "rgba(0, 0, 0, 0.5)"
     */
    titleBarBackgroundColor: string
    /**
     * The text color for drawing labels in the title bar area.
     * @assert (value is not empty) and (value is a CSS color)
     * @since 3.0.0
     * @defaultValue "rgba(255, 255, 255, 1)"
     */
    titleBarTextColor: string
    /**
     * Left and right (horizontal) padding to leave inside the title bar's area.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 20
     */
    titleBarTextPaddingLeftRight: number
    /**
     * Top and bottom (vertical) padding to leave inside the title bar's area.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 15
     */
    titleBarTextPaddingTopBottom: number
    /**
     * Allows to customize or completely replace the text displayed in the title bar. By default, FoamTree will display the group's label, but you can use this option to display a different text, e.g. some more details related to the group.
     *
     * @param options all current visualization options (keys and values).
     * @param properties an object with properties describing the group the user is hovering over. The object will be a union of objects retrieved from the hierarchy, state and geometry options.
     * Additionally, the following title-bar-specific properties are available:
     * <ul>
     *   <li>titleBarWidth - the width of the title bar area, in pixels</li>
     *   <li>titleBarHeight - the height of the title bar area, in pixels</li>
     *   <li>labelFontSize - the font size used to draw the actual group label or 0 if the label is not drawn</li>
     *   <li>viewportScale - Since 3.1.0 the current viewport scale. Values larger than 1 mean the viewport is zoomed-in, values smaller than 1 mean the viewport is zoomed-out, a value of 1 means the viewport is at its neutral zoom level.</li>
     * </ul>
     * @param variables object with title-bar-related variables this function can change.
     */
    titleBarDecorator: (options: Options, properties: InternalProperties<D> & {
      /**
       * the width of the title bar area, in pixels
       */
      titleBarWidth: number,
      /**
       * the height of the title bar area, in pixels
       */
      titleBarHeight: number,
      /**
       * the font size used to draw the actual group label or 0 if the label is not drawn
       */
      labelFontSize: number,
      /**
       * Since 3.1.0 the current viewport scale. Values larger than 1 mean the viewport is zoomed-in, values smaller than 1 mean the viewport is zoomed-out, a value of 1 means the viewport is at its neutral zoom level.
       */
      viewportScale: number
    }, variables: {
      /**
       * the default text for the title bar, equal to the label of the group. If changed to null or undefined, the title bar will not be shown.
       */
      titleBarText: string | number | undefined
      /**
       * true if the group's label is small enough for the title bar to show, false otherwise. You can change the value of this variable to force showing or hiding of the title bar.
       */
      titleBarShown: boolean
      /**
       * the maximum font size to be used for drawing text in the title bar, by default equal to the titleBarMaxFontSize option. Change this variable to override the the max font size for the currently rendered title bar.
       */
      titleBarMaxFontSize: number
    }) => void
    /**
     * Maximum group label size in pixels whose label to show in the title bar. Small size of a group may cause its label to be drawn in a small font and thus appear illegible. For this reason, when the user hovers the mouse pointer over a group with a small label, the label can be shown in a dedicated title bar.
     *
     * The maxLabelSizeForTitleBar defines the threshold below which group labels will be shown in the title bar. Setting maxLabelSizeForTitleBar to 0 will disable the title bar completely. Setting the option to Number.MAX_VALUE will cause the title bar to appear for all groups.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 8
     */
    maxLabelSizeForTitleBar: number
  }

  /**
   * Allow to control the group for attribution. Requires licensed version
   */
  export interface AttributionOptions {
    /**
     * The label of the attribution group. If attributionText or attributionLogo is not empty, an extra group is added to the visualization with the provided text and logo. If attributionUrl is not empty, clicking the attribution group will open the provided URL in the browser.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.0.0
     * @remarks Requires licensed version
     */
    attributionText: string | null | undefined
    /**
     * The image to display in the attribution group. The image can be specified as a relative or absolute HTTP URL or a data URI. When using HTTP URLs, the image should to be preloaded before visualization is embedded, otherwise it may not be immediately visible. For this reason, the data URIs are recommended. You can use services like dataurl.net to convert your images to data URIs.
     *
     * Since version 3.3.1, this option also accepts the Image instances. With this enhancement, you can render an SVG attribution logo that will look well regardless of the zoom level.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.0.0
     * @remarks Requires licensed version
     */
    attributionLogo: string | HTMLImageElement | null | undefined
    /**
     * Determines the scale at which FoamTree should draw the attribution logo. The scale is relative to the bounding box of the group's polygon. A scale of 1.0 means the logo will take the whole available width or height.
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.4.0
     * @defaultValue 0.5
     * @remarks Requires licensed version
     */
    attributionLogoScale: number
    /**
     * The URL to open when the user clicks the attribution group, can be undefined.
     * @assert (value is a string) or (value is null) or (value is undefined)
     * @since 3.0.0
     * @defaultValue "http://carrotsearch.com/foamtree"
     * @remarks Requires licensed version
     */
    attributionUrl: string | null | undefined
    /**
     * Sets the weight of the attribution group in relation to the total weight of the root-level groups. You can use this option to influence the size of the attribution group.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.3.1
     * @defaultValue 0.025
     * @remarks The limited demo version of FoamTree does not allow to set the attribution weight to a value smaller than 0.0025. Please contact Carrot Search for licensing of a fully customizable distribution.
     */
    attributionWeight: number
    /**
     * Determines the position of the attribution group relative to the visualization container.
     * If number, the angle (in degrees) that determines position on the perimeter of the visualization container, clockwise, starting at the right hand side of the container. For example: 0 is the right-hand side of the container, 45 is the bottom-right corner, 90 is the bottom side of the container etc.
     * @remarks When layout is ordered or squarified, only the topleft and bottomright attribution group placement is supported. All other values will result in the group being placed in the bottom-right corner of the visualization area.
     * @remarks when there is a small number of groups in the visualization, FoamTree may not be able to place the attribution group exactly at the required point.
     * @example The following example places the attribution group in the top-right corner of the visualization.
     * foamtree.set("attributionPosition", 360 - 45);
     * foamtree.set("dataObject", { groups: randomGroups(25, 1) } );
     */
    attributionPosition: Direction
    /**
     * Determines the distance of the attribution group from the center of the visualization area. The distance of 0 puts the attribution group in the center of the visualization, the distance of 1 puts the attribution group near the perimeter of the visualization area.
     *
     * Please note that when there is a small number of groups in the visualization, FoamTree may not be able to place the attribution group exactly at the required point.
     *
     *
     * @assert (value is not empty) and (value is a number in range [0,1])
     * @since 3.2.1
     * @defaultValue 1
     * @remarks applicable only when layout is set to relaxed.
     * @example attempts to place the attribution group near the center of the visualization area.
     * foamtree.set("attributionDistanceFromCenter", 0);
     * foamtree.set("dataObject", { groups: randomGroups(25, 1) } );
     */
    attributionDistanceFromCenter: number
    /**
     * Determines the color of the attribution group. Currently, two values are supported:
     * @assert (value is not empty) and (value one of [light, dark])
     * @since 3.4.0
     * @defaultValue "light"
     */
    attributionTheme: 'light' | 'dark'
  }

  export interface RenderingOptions<D extends DataObject> {
    /**
     * The physical-to-display pixel count ratio to assume when drawing the final visualization. On modern devices with high-density screens (such as the Retina display) one logical pixel can be mapped to more than one physical pixel. You can use this option to increase the resolution at which the visualization is drawn to make the image clearer and labels more legible. You can also decrease this resolution to make rendering faster at the cost of quality.
     *
     * By default, pixelRatio is 1. In such cases, the width and height of the canvas on which the visualization is drawn will be equal to the pixel dimensions of the HTML container element. For pixelRatio values greater/smaller than 1, the pixel dimensions of the canvas will be smaller/larger than the dimensions of the enclosing HTML element and the canvas will be stretched to fit in the container's client area. For example, if you set pixelRatio to 2 and if the size of the enclosing HTML element is 400x400 pixels, the size of the canvas will be 800x800 pixels. Such a configuration will better utilize the extra pixels available on Retina displays, for example.
     *
     * On most modern browsers you can retrieve the device-specific pixel ratio from the window.devicePixelRatio property.
     *
     * If the pixel ratio is changed after FoamTree has initialized, you will need to call redraw for the change to be applied.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 1
     * @remarks To boost the performance on iPads with Retina display set pixelRatio to 2 and the width of the HTML container element to be at least one pixel less than the total screen width. Yes, we know it's weird but it speeds up rendering a lot.
     * @remarks setting pixelRatio to a value larger than 1 on mobile devices, make sure to correctly set the size of the page's viewport. The default viewport may be very large, leading to a very large canvas. Refer to the mobile demo's source code for examples.
     */
    pixelRatio: number
    /**
     * The pixel ratio to use when drawing animations, such as rollout, pullback, expose or zooming. You can change the default to a higher value (e.g. 2 on Retina displays) to have the animation drawn in more detail, but noticeably slower. You can also set this option to a lower value, e.g. 0.5 to have the animation drawn faster, but with less detail. Please see the pixelRatio option for detailed considerations on how the pixel ratio value affects the sizes of the canvases allocated by FoamTree.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 1
     * @see RenderingOptions.pixelRatio
     */
    wireframePixelRatio: number
    /**
     * A callback function you can use to customize or completely replace the way group polygons' content is drawn. The task of the function is to render the contents by invoking the appropriate drawing methods on the provided drawing context that behaves like the standard CanvasRenderingContext2D.
     * @param options all current visualization options (keys and values).
     * @param properties an object with properties describing the group being rendered. The object will be a union of objects retrieved from the hierarchy, state and geometry options.
     * Additionally, a number of shape-decorator-specific properties are available.
     * @param variables object with a number of variables this decorator can change.
     * @example how to use the group shape decorator to draw a two-way pie chart that can express some additional information about the group.
     * foamtree.set({
     *   rolloutDuration: 3000,
     *   dataObject: largeDataSet,
     *
     *   // Our custom drawing depends on the group state,
     *   // therefore we need to use the "onSurfaceDirty" triggering.
     *   groupContentDecoratorTriggering: "onSurfaceDirty",
     *
     *   // Our custom drawing is pretty fast, so we can draw it during animations
     *   wireframeContentDecorationDrawing: "always",
     *
     *   // Our custom drawing callback
     *   groupContentDecorator: function (opts, params, vars) {
     *     var ctx = params.context;
     *     var centerX = params.polygonCenterX;
     *     var centerY = params.polygonCenterY;
     *
     *     // Compute pie chart radius
     *     var radius = FoamTree.geometry.circleInPolygon(
     *       params.polygon, centerX, centerY) * 0.8;
     *
     *     // Increase opacity of the pie chart on hover
     *     var baseAlpha = (params.hovered ? 2 : 1);
     *
     *     // Increase stroke width on selection,
     *     // use thinner lines on lower hierarchy levels
     *     ctx.lineWidth = (params.selected ? 3.0 : 1.5) * Math.pow(0.5, params.level);
     *
     *     // The black part of the pie chart
     *     ctx.beginPath();
     *     ctx.moveTo(centerX, centerY);
     *     ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI * params.group.rank);
     *     ctx.closePath();
     *     ctx.strokeStyle = rgba("0, 0, 0", baseAlpha * 0.2);
     *     ctx.stroke();
     *     ctx.fillStyle = rgba("0, 0, 0", baseAlpha * 0.1);
     *     ctx.fill();
     *
     *     // The white part of the pie chart
     *     ctx.beginPath();
     *     ctx.arc(centerX, centerY, radius, 2 * Math.PI * params.group.rank, 0);
     *     ctx.strokeStyle = rgba("255, 255, 255", baseAlpha * 0.2);
     *     ctx.stroke();
     *     ctx.lineTo(centerX, centerY);
     *     ctx.fillStyle = rgba("255, 255, 255", baseAlpha * 0.2);
     *     ctx.fill();
     *
     *     function rgba(rgb, alpha) {
     *       return "rgba(" + rgb + ", " + alpha + ")";
     *     }
     *   },
     *
     *   // Generates some random data we'll display in the pie chart
     *   onModelChanged: function (data) {
     *     enhance(data);
     *
     *     function enhance(group) {
     *       group.rank = 0.1 + Math.random() * 0.9;
     *       if (group.groups) {
     *         group.groups.forEach(enhance);
     *       }
     *     }
     *   }
     * });
     */
    groupContentDecorator: (
      options: Options,
      properties: InternalProperties<D> & GeometryUtils & {
        /**
         * a drawing context that behaves like the standard CanvasRenderingContext2D. The decorator should call the appropriate drawing methods on this object to render the contents of the polygon.
         *
         * The provided object is not an actual canvas drawing context, but a buffer that records all the invocations so that FoamTree can replay them when needed without invoking the decorator, for example during zooming or panning. The groupContentDecoratorTriggering option determines when this decorator will be triggered and when the last buffered content will be "replayed" without invoking the decorator.
         *
         * The drawing context buffer offers a number of additional methods not available in a standard drawing context, such as drawing rounded rectangles or filling a polygon with text.
         */
        context: DrawingContext,
        /**
         * indicates whether the geometry of the group's polygon has changed since the last invocation of the decorator. If the custom layout is expensive to compute, you may want to cache it and recompute the layout only when the shapeDirty property is true.
         *
         * This property is meaningful only when groupContentDecoratorTriggering is onSurfaceDirty. If the triggering is done onShapeDirty, the shapeDirty property will true on all invocations of the decorator.
         */
        shapeDirty: boolean,
        /**
         * the current viewport scale. Values larger than 1 mean the viewport is zoomed-in, values smaller than 1 mean the viewport is zoomed-out, a value of 1 means the viewport is at its neutral zoom level.
         *
         * Using this property makes sense only when groupContentDecoratorTriggering is onSurfaceDirty, in which case you may want to vary the amount of detail drawn depending on the zoom level.
         */
        viewportScale: number,
        /**
         * Since 3.4.0 a read-only context buffer containing the drawing commands that set the path corresponding to the group's polygon. You can replay() this buffer to the drawing context, so that later you can fill(), stroke() or clip() the polygon's shape. In most cases you'll set the groupPolygonDrawn variable to false to prevent FoamTree from drawing the default polygon.
         *
         * Use cases of this buffer range from drawing custom fill or stroke around the group polygon to filling the polygon with a pattern or an image. In tandem with the labelContext property, you can use it to alter the default order of drawing group elements. See the Photo explorer or the SCADA dashboard demos for real-world applications.
         */
        polygonContext: DrawingContext,
        /**
         * Since 3.4.0 a read-only context buffer containing the commands that draw the default group label. You can replay() this buffer to the drawing context to actually draw the label.
         *
         * Use cases of this buffer range from drawing the label with custom fill or transformation to altering the default order of drawing group elements.
         *
         * The following example uses the labelContext property to draw slightly rotated default labels. Please note that label fitting is still performed in the non-rotated setting, so the rotation may cause some labels to stick outside of their polygons.
         */
        labelContext: DrawingContext,
      },
      variables: {
        /**
         * set to false to skip rendering of the default group's label; true by default
         */
        groupLabelDrawn: boolean
        /**
         * set to false to skip rendering of the polygon corresponding to the group; true by default.
         * @defaultValue true
         */
        groupPolygonDrawn: boolean
      }) => void

    /**
     * Determines when the groupContentDecorator will be triggered:
     * <ul>
     *   <li>
     *    onShapeDirty - The shape decorator will only be triggered if the shape of the group's polygon changes, for example during the relaxation process or after resizing of the visualization area. During redraws in which the shape of the polygon is not changing, such as when zooming or drawing selection outline, FoamTree will "replay" the custom drawing commands issued by the last invocation of the shape decorator, which will improve the rendering performance.
     *
     *    Use this triggering mode when the custom content of the group does not depend on the state of the group (selected, hovered) and thus the group shape decorator does not need to be called when group state changes.
     *   </li>
     *   <li>
     *    onSurfaceDirty - The shape decorator will be triggered every time the group's polygon needs to be drawn. Use this triggering mode if your custom content drawing depends on the state of the group (selected, hovered). Depending on the complexity of your custom drawing code, using this triggering mode may result in lower rendering performance.
     *   </li>
     * </ul>
     * @assert (value is not empty) and (value one of [onShapeDirty, onSurfaceDirty])
     * @since 3.1.0
     * @defaultValue "onLayoutDirty"
     */
    groupContentDecoratorTriggering: 'onShapeDirty' | 'onSurfaceDirty'
    /**
     * Determines whether FoamTree should draw group labels during animation.
     *
     * The following values are allowed:
     * <ul>
     *   <li>auto - FoamTree will try to automatically enable or disable drawing of labels based on the performance of the browser and the size of the data set to meet the limit set in wireframeDrawMaxDuration.</li>
     *   <li>always - labels will always be drawn during animations, regardless of the wireframeDrawMaxDuration limit.</li>
     *   <li>never - labels will never be drawn during animations, regardless of the wireframeDrawMaxDuration limit.</li>
     * </ul>
     * @assert (value is not empty) and (value one of [auto, always, never])
     * @since 3.0.0
     * @defaultValue "auto"
     */
    wireframeLabelDrawing: 'always' | 'never' | 'auto'
    /**
     * Determines whether FoamTree should draw the group content decorations produced by the groupContentDecorator during animation.
     *
     * The following values are allowed:
     * <ul>
     *   <li>
     *     auto - FoamTree will try to automatically enable or disable drawing of group content decorations based on the performance of the browser and the size of the data set to meet the limit set in wireframeDrawMaxDuration.
     *     For the purposes of this calculation FoamTree will assume that the custom shapes drawn by the groupContentDecorator are as expensive to draw as labels. If the custom drawing does not contain any text and/or is fast to draw, you can set this option to always.
     *   </li>
     *   <li>always - group content decorations will always be drawn during animations, regardless of the wireframeDrawMaxDuration limit.</li>
     *   <li>never - group content decorations will never be drawn during animations, regardless of the wireframeDrawMaxDuration limit.</li>
     * </ul>
     * @assert (value is not empty) and (value one of [auto, always, never])
     * @since 3.1.0
     * @defaultValue "auto"
     */
    wireframeContentDecorationDrawing: 'always' | 'never' | 'auto'
    /**
     * A callback function you can use to customize how the label of a specific group is laid out, including the font, size and paddings.
     * @param options all current visualization options (keys and values).
     * @param properties an object with properties describing the group being rendered. The object will be a union of objects retrieved from the hierarchy, state and geometry options.
     * @param variables object with a number of variables this decorator can change.
     */
    groupLabelLayoutDecorator: (options: Options, properties: InternalProperties<D>, variables: {
      /**
       * the font family to assume when filling the polygon with text, sans-serif by default.
       */
      fontFamily: string | null | undefined
      /**
       * Since 3.2.2 the font style (e.g. italic) to assume when filling the polygon with text, normal by default.
       */
      fontStyle: string | null | undefined
      /**
       * Since 3.2.2 the font variant (e.g. small-caps) to assume when filling the polygon with text, normal by default.
       */
      fontVariant: string | null | undefined
      /**
       * Since 3.2.2 the font weight (e.g. bold) to assume when filling the polygon with text, normal by default.
       */
      fontWeight: number,
      /**
       * the line height to assume when splitting the text into mulitple lines, 1.05 by default. Line heights smaller than 1.0 are currently not supported.
       */
      lineHeight: number,
      /**
       * the horizontal padding to apply to each line of text. The unit of this option is the font size used to render the text. Default value: 1.0.
       */
      horizontalPadding: number,
      /**
       * the vertical padding to apply to the whole block of text. The unit of this option is the font size used to render the text. Default value: 0.5
       */
      verticalPadding: number,
      /**
       * The maximum total height of the text block as a fraction of the polygon's bounding box height, 0.95 by default.
       */
      maxTotalTextHeight: number
      /**
       * the maximum font size in pixels to use for filling the text, 72 by default.
       */
      maxFontSize: number
    }) => void

    /**
     * When true, the polygon corresponding to the description group will be drawn. By default, the polygon is not drawn to make an impression that the description group is linked to the parent polygon.
     * @assert value is a boolean
     * @since 3.4.0
     * @defaultValue false
     * @remarks applicable only when stacking is set to flattened.
     */
    descriptionGroupPolygonDrawn: boolean
    /**
     * The maximum number of levels of closed groups FoamTree will draw. For hierarchies with more than maxGroupLevelsDrawn levels, the lower-level groups will not be drawn until the appropriate number of their parent groups get open. If your data set contains many levels of groups with many children on each level, you may want to lower the value of this option to speed up layout computation and rendering at the cost of lower amount of visible detail.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.2.0
     * @defaultValue 4
     */
    maxGroupLevelsDrawn: number
    /**
     * The maximum number of levels of group labels FoamTree will draw. For hierarchies with more than maxGroupLabelLevelsDrawn levels, only the top specified number of open groups will have their labels drawn. You can lower the default value of this option for faster rendering of the visualization at the cost of lower amount of visible detail.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.2.0
     * @defaultValue 3
     */
    maxGroupLabelLevelsDrawn: number
    /**
     * The maximum number of group levels for which to compute layout when new dataObject is set. Combined with the attach method, this option can be used to improve the responsiveness of FoamTree when visualizing deeply-nested hierarchies with large numbers of groups on the top level.
     *
     * For more details and examples, see the attach method and the Deferred layout of child groups demo.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.4.5
     * @defaultValue 4
     */
    maxGroupLevelsAttached: number
    /**
     * Determines how FoamTree decides whether to apply incremental visualization redraws.
     *
     * The following values are supported:
     * <ul>
     *   <li>
     *     fast - FoamTree will try to redraw as few groups as possible when an incremental update is possible. With typical settings, this procedure will result in quick updates and no visual artifacts.
     *
     *     In case of non-typical settings, such as when groupSelectionOutlineWidth is larger than half the groupBorderWidth, you may occasionally see visual artifacts when using fast incremental updates. If this is the case, consider setting incrementalDraw to accurate.
     *   </li>
     *   <li>accurate - FoamTree will apply a more conservative procedure when deciding whether an incremental draw can be performed. In particular, if groupSelectionOutlineWidth is larger than half the groupBorderWidth, FoamTree will always redraw all groups.</li>
     *   <li>none - FoamTree will always redraw all groups, even if the settings permit incremental redraws.</li>
     * </ul>
     *
     * @assert (value is not empty) and (value one of [none, accurate, fast])
     * @since 3.4.0
     * @defaultValue "fast"
     */
    incrementalDraw: 'fast' | 'accurate' | 'none'
    /**
     * Once animation of the visualization completes, FoamTree will redraw the final image using more detail. This option determines the amount of time that should pass after the last animation frame before the high-quality image is shown.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 300
     */
    wireframeToFinalFadeDelay: number
    /**
     * The duration of the fading animation used to switch between the wireframe and the high-quality visualization image.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 500
     */
    wireframeToFinalFadeDuration: number
    /**
     * The duration of the fading animation used to switch between the high-quality and the wireframe visualization image.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 200
     */
    finalToWireframeFadeDuration: number
    /**
     * The desired maximum duration of drawing one frame of animation. Decreasing the value, possibly to 0, will make the animation more smooth at the cost of lower number of details. Increasing the value will increase the number of details, but may slow down the animation.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 15
     */
    wireframeDrawMaxDuration: number
    /**
     * The desired maximum duration of a complete high-quality redraw of the visualization. Please see the Visualization rendering performance section for a detailed discussion.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 80
     */
    finalCompleteDrawMaxDuration: number
    /**
     * The desired maximum duration of an incremental high-quality redraw of the visualization. Please see the Visualization rendering performance section for a detailed discussion.
     * @assert (value is not empty) and (value is a number in range [0,infinity))
     * @since 3.0.0
     * @defaultValue 100
     */
    finalIncrementalDrawMaxDuration: number
    /**
     * There is a bug in Android stock browsers, that affects the incremental updates of the visualization as well as cross-fading between the wireframe and final visualization images. Setting this option to true will enable a workaround for the bug. As a side effect, cross fading between the wireframe and final images will be disabled, regardless of the wireframeToFinalFadeDuration amd finalToWireframeFadeDuration options.
     *
     * The default value of this option is true on all Android browsers and false on all other browsers.
     */
    androidStockBrowserWorkaround: boolean
  }

  export interface InteractionStandardOptions {
    /**
     * The default value of this option is builtin on desktop browsers and hammerjs on touch-enabled devices.
     * Determines which use interaction capture mechanism FoamTree should be using:
     * <ul>
     *   <li>builtin - the built-in mechanism, suitable mostly for desktop devices</li>
     *   <li>hammerjs - use Hammer.js to capture the interactions, see the Touch devices section for details.</li>
     *   <li>external - all interaction events will be triggered externally, please see the Externally triggered interaction section for details.</li>
     * </ul>
     *
     * @assert (value is not empty) and (value one of [hammerjs, builtin])
     * @since 3.0.0
     * @defaultValue "builtin"
     */
    interactionHandler: 'hammerjs' | 'builtin' | 'external'
  }

  export interface DebuggingOptions {
    /**
     * Enables logging of some debug information to console.
     * @assert value is a boolean
     * @since 3.0.0
     * @defaultValue false
     */
    logging: boolean
  }

  export interface RequiredOptions {

  }

// ------ Read-only options objects ------

  export type InternalProperties<D extends DataObject> = HierarchyObject<D> & GeometryObject<D> & StateObject;

  /**
   * Returns hierarchy-related information about a group. The returned object contains the following properties:
   */
  export interface HierarchyObject<D extends DataObject> {
    /**
     * a reference to the data object representing the related group
     */
    group: D
    /**
     * a reference to the data object representing the immediate parent of the group or null
     */
    parent: D | null
    /**
     * the nesting level of the group. Level numbers start at 0.
     */
    level: number
    /**
     * the position of the group relative to its siblings in the input data object. Position indices start at 0.
     */
    index: number
    /**
     * the number of immediate siblings of the group
     */
    siblingCount: number
    /**
     * true if the group has any child groups
     */
    hasChildren: boolean
    /**
     * the weight of the group normalized to the 0..1 range in relation the group's siblings. The raw weight of the group can be retrieved from the original data model if it was present there.
     */
    weightNormalized: number
    /**
     * @since 3.0.2
     * the position of the group relative to its siblings in the decreasing weight order, 0 index corresponds to the highest-weight group.
     */
    indexByWeight: number
    /**
     * @since 3.4.0
     * true if the group represents the extra polygon holding group label in flattened stacking mode.
     */
    description: boolean
    /**
     * @since 3.3.1
     * true if the group is the attribution group.
     */
    attribution: boolean
  }

  /**
   * Returns information about the geometry of the polygon representing a group or null if the group's polygon is not drawn. The returned object contains the following properties:
   */
  export interface GeometryObject<D extends DataObject> {
    /**
     * the X coordinate of the group's polygon. The coordinate is absolute, it does not take into account the transformations resulting from zooming, panning and exposure.
     */
    polygonCenterX: number
    /**
     * the Y coordinate of the group's polygon, absolute
     */
    polygonCenterY: number
    /**
     * the area of the group's polygon, absolute
     */
    polygonArea: number

    /**
     * the X coordinate of the top-left corner of the group polygon's bounding box, absolute
     */
    boxLeft: number
    /**
     * the Y coordinate of the top-left corner of the group polygon's bounding box, absolute
     */
    boxTop: number
    /**
     * width of the group polygon's bounding box, absolute
     */
    boxWidth: number
    /**
     * height of the group polygon's bounding box, absolute
     */
    boxHeight: number

    /**
     * size of the font used to draw the group's label
     */
    labelFontSize: number
    /**
     * the X coordinate of the top-left corner of the group label's bounding box, absolute
     */
    labelBoxLeft: number
    /**
     * the Y coordinate of the top-left corner of the group label's bounding box, absolute
     */
    labelBoxTop: number
    /**
     * width of the group label's bounding box, absolute
     */
    labelBoxWidth: number
    /**
     * height of the group label's bounding box, absolute
     */
    labelBoxHeight: number

    /**
     * an array of objects containing the X and Y coordinates of the groups polygon, in the clockwise order.
     * All polygons produced by FoamTree are convex.
     * @remarks The array is only returned if true is passed as the third parameter of the `get` method.
     */
    polygon: Coordinate[]

    /**
     * @since 3.4.0
     * an array of references to the group objects corresponding to the neighbors of this group.
     * The array is aligned with the polygon array: at an index corresponding to a polygon vertex,
     * it contains the neighbor that shares the edge starting at the vertex and going clockwise.
     * Please note that that some slots in the neighbor array may be null, which means the corresponding edge is the
     * boundary of the visualization area.
     * For a potential use case of this property, see the Background demo.
     *
     * @remarks The neighbors array is available only when the layout option is set to relaxed.
     * The array is only returned if true is passed as the third parameter of the get method.
     */
    neighbors: (D | null)[]
  }

  /**
   * Returns information about the state of the group. The returned object contains the following properties:
   */
  export interface StateObject {
    /**
     * true if the group is currently selected
     */
    selected: boolean
    /**
     * true if the group is currently hovered over
     */
    hovered: boolean
    /**
     * true if the group is currently open
     */
    open: boolean
    /**
     * the progress of the opening/closing animation on the 0..1 scale
     */
    openness: number
    /**
     * true if the group is currently exposed
     */
    exposed: boolean
    /**
     * the progress of the expose animation on the 0..1 scale
     */
    exposure: number
    /**
     * the progress of the rollout/pullback animation on the 0..1 scale
     */
    transitionProgress: number
    /**
     * true if the group is being drawn on the screen, also when the group is currently invisible due to zooming/panning; false when the group is not being drawn on the screen, due to, for example, too small size or because the relaxation process has not yet revealed it.
     */
    revealed: boolean
    /**
     * Since 3.2.0 This property can assume three states:
     * <ul>
     *   <li>true - FoamTree has computed the layout for the direct children of this group and the group can be opened for browsing. </li>
     *   <li>
     *     false - FoamTree has attempted to compute the layout for the direct children of this group, but the layout could not be computed for any of the following reasons: a. the diameter of the child groups would not exceed groupMinDiameter, b. the total limit of maxGroups would have been exceeded if the layouts got computed, c. JavaScript standard floating point precision is not enough to compute the layout, which can happen for very deeply nested groups.
     *
     *     When the group is not browseable, you may want to allow the user to reload the visualization passing the non-browseable group as the dataObject, and possibly allow the user to get back to the original top-level data.</li>
     *   <li>undefined - FoamTree has not yet attempted to compute the layout for the direct children of this group. FoamTree will attempt to compute the layout when at most maxGroupLevelsDrawn above this groups are open.</li>
     * </ul>
     */
    browseable: boolean | undefined
    /**
     * true if the group is visible in the current viewport
     */
    visible: boolean
    /**
     * true if the group's label is being drawn; false if the label is not being drawn due to, for example, to small area of the polygon.
     */
    labelDrawn: boolean
  }

  export interface ImageFormat {
    format: 'image/png' | 'image/jpeg'
    /**
     * if format is image/jpeg, specifies the desired quality of JPEG compression in the 0..1 range, where 1 means the highest quality and largest image data. Note that JPEG images are always opaque, even if the background color is specified as transparent. Use PNG images to handle background transparency.
     */
    quality?: number
    /**
     * the pixel ratio to use when producing the export image. Use a value larger than 1, such as 2 to create a higher-resolution image.
     */
    pixelRatio?: number
    /**
     * if specified, the background of the exported image will be filled in with the provided color. This option is especially useful when exporting images in the JPEG format.
     */
    backgroundColor?: string
  }


  export interface ReadOnlyOptions<D extends DataObject> {
    /**
     * Returns hierarchy-related information about a group. The returned object contains the following properties:
     */
    hierarchy: ParametrizedOption<[IndividualGroupSelector], HierarchyObject<D>>

    /**
     * To retrieve the full geometry information, including coordinates of the polygon's vertices, pass true as the third parameter of the get method:
     */
    geometry: ParametrizedOption<[IndividualGroupSelector, boolean], GeometryObject<D>>

    /**
     * Returns information about the state of the group. The returned object contains the following properties:
     */
    state: ParametrizedOption<[IndividualGroupSelector], StateObject>

    /**
     * Converts the the provided visualization-area-relative point coordinates to the coordinates relative to the
     * HTML container in which FoamTree is embedded.
     * You can use this method to position additional HTML elements over specific shapes drawn inside some
     * FoamTree group and ensure that the position will be correct regardless of zooming, panning and group exposure.
     *
     * Two arguments are required to retrieve the container-relative coordinates:
     * <ul>
     *   <li>
     *     Individual group selector, passed as the second argument to the get method, identifying the FoamTree group
     *     in which the input point lies. FoamTree group is required because transformations, such as exposure, are
     *     applied on per-group basis, so the inverse coordinate transform needs to take into account the scale and
     *     offset of the specific transformed group.
     *   </li>
     *   <li>
     *     Visualization-area-relative coordinates of the point of interest, as an object with x and y properties,
     *     passed as the third argument to the get method. The coordinate space you will use here is the same as the
     *     on in which custom group content is drawn in groupContentDecorator.
     *   </li>
     * </ul>
     * @example retrieves the container-relative coordinates of the center of some group.
     * var geometry = foamtree.get("geometry", "1");
     * console.log(foamtree.get("containerCoordinates", "1",
     *   { x: geometry.polygonCenterX, y: geometry.polygonCenterY }));
     */
    containerCoordinates: ParametrizedOption<[IndividualGroupSelector, Coordinate], Coordinate>
    /**
     * Returns the current state of the visualization as an image in the data URL format.
     */
    imageData: ParametrizedOption<[ImageFormat], string>
    viewport: ParametrizedOption<[], {
      /**
       * The horizontal offset of the viewport.
       */
      x: number,
      /**
       * The vertical offset of the viewport.
       */
      y: number,
      /**
       * The scale of the viewport. Values larger than 1.0 mean the viewport is magnified. A value of 1.0 means the viewport is in its neutral state. Values lower than 1.0 mean the viewport is demagnified, which may happen when some groups are exposed.
       */
      scale: number
    }>
    /**
     * Execution times and statistics. The details of the returned object are not guaranteed to work between versions but it may turn useful for debugging performance problems.
     */
    times: ParametrizedOption<[], {
      fps?: number,
      frames?: number
      lastFrameTime?: number
      lastInterFrameTime?: number
      totalTime?: number
    }>
  }


  /**
   * Used to specify the ...args and the return values of readOnlyOptions
   * @see ReadOnlyOptions
   * @example
   * {
   *   containerCoordinates: ParametrizedOption<[IndividualGroupSelector, Coordinate], Coordinate>
   * }
   */
  type ParametrizedOption<Parameters extends any[], Return> = {
    parameters: Parameters
    return: Return
  }

  export type ReadOnlyOption = keyof ReadOnlyOptions<DataObject>;
  export type ReadOnlyOptionValue<O extends ReadOnlyOption, D extends DataObject> = ReadOnlyOptions<D>[O]['return'];
  export type ReadOnlyOptionParameters<O extends ReadOnlyOption, D extends DataObject> = ReadOnlyOptions<D>[O]['parameters'];

  export interface InteractionOptions<D extends DataObject> {
    /**
     * You can use this option to obtain or alter the current selection.
     */
    selection: ReadWriteOption<GroupSelector, { groups: D[] }>
    /**
     * You can use this option to obtain or alter the set of open groups.
     */
    open: ReadWriteOption<GroupSelector, { groups: D[] }>
    /**
     * You can use this option to obtain or alter the set of exposed groups.
     */
    exposure: ReadWriteOption<GroupSelector, { groups: D[] }>
  }

  type ReadWriteOption<Input, Output> = {
    input: Input
    output: Output
  }

  export type InteractionOption = keyof InteractionOptions<DataObject>;
  export type InteractionOptionSetterValue<O extends InteractionOption, D extends DataObject> = InteractionOptions<D>[O]['input'];
  export type InteractionOptionGetterValue<O extends InteractionOption, D extends DataObject> = InteractionOptions<D>[O]['output'];

  export type InteractionGetterOptions<D extends DataObject> = {
    [O in keyof InteractionOptions<D>]: InteractionOptions<D>[O]['output']
  }

  export type InteractionSetterOptions<D extends DataObject> = {
    [O in keyof InteractionOptions<D>]: InteractionOptions<D>[O]['input']
  }
}
