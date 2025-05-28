// Type definitions for @carrotsearch/foamtree 3.5.2
// Project: https://carrotsearch.com/foamtree/
// Definitions by: EliotRagueneau <https://github.com/EliotRagueneau>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
//
// TypeScript Version: 5.7.3

/// <reference path="./core.d.ts" />
/// <reference path="./events.d.ts" />
/// <reference path="./options.d.ts" />


declare module "@carrotsearch/foamtree" {
  namespace FoamTree {

    /**
     * FoamTree exposes a number of geometry utilities useful when implementing groupContentDecorators.
     *
     * The utilities are grouped into a static object available from CarrotSearchFoamTree.geometry.
     * Please see below for a detailed list of utility methods.
     */
    interface GeometryUtils {
      /**
       * Given an array of points, returns the bounding box of the points.
       *
       * @param points the array of point coordinates. Each element of the array must be an object containing the x and y properties representing the coordinates of the point.
       */
      boundingBox(points: Coordinate[]): Rectangle;

      /**
       * Computes the centroid (center of mass) and area of the provided polygon.
       *
       * @param polygon the input polygon. The polygon must be specified as an array of objects, each object containing the x and y property representing the coordinates of the polygon's vertex.
       * The polygon must be non-self-intersecting, vertex coordinates must be enumerated in clockwise or anti-clockwise order.
       * For performance reasons, this method will not verify if the criteria are met.
       * If the provided polygon does not satisfy the criteria, the result will be unspecified.
       * Note that the polygons returned when getting the geometry option meet both criteria.
       */
      polygonCentroid(polygon: Coordinate[]): {
        /**
         * coordinates of the centroid
         */
        x: number,
        /**
         * coordinates of the centroid
         */
        y: number,
        /**
         * area of the polygon in pixels
         */
        area: number
      }

      /**
       * Given a convex polygon, finds the largest inscribed rectangle of given aspect ratio wTH, centered around the provided center point (cx, cy).
       * Additionally, the resulting rectangle can be scaled by the provided scale factor.
       * Also, the alignment of the center point relative to the rectangle can be defined by the (fx, fy) point.
       *
       * @param polygon the polygon to inscribe the rectangle into. The polygon must be specified as an array of objects, each object containing the x and y property representing the coordinates of the polygon's vertex.
       * The polygon must be convex, vertex coordinates must be enumerated in clockwise or anti-clockwise order. For performance reasons, this method will not verify if the criteria are met. If the provided polygon does not satisfy the criteria, the result will be unspecified. Note that the polygons returned when getting the geometry option meet both criteria.
       * @param cx coordinates of the point inside the polygon around which the rectangle should be centered. For performance reasons, this method will not verify if the point lies inside the polygon. For points outside or on the boundary of the polygon, the result is not specified.
       * @param cy coordinates of the point inside the polygon around which the rectangle should be centered. For performance reasons, this method will not verify if the point lies inside the polygon. For points outside or on the boundary of the polygon, the result is not specified.
       * @param wTH (optional) the aspect ratio of the polygon to inscribe, the ratio is assumed to be the polygons width divided by the polygon's height. If not provided, the ratio of 1.0 will be used, which will produce a square.
       * @param scale (optional) the scale factor to apply to the resulting rectangle. The rectangle will be scaled relative to the alignment point determined by (fx, fy). If not provided, the scale of 1.0 will be used, which will produce the largest possible rectangle that fits inside the polygon and meets the center and alignment criteria.
       * @param fx (optional) defines what the the position of the center point (cx, cy) should be relative to the rectangle. The default value is (0.5, 0.5), which will position the rectangle in such a way that the center point is at the center of the rectangle. For (fx, fy) = (0.0, 0.0), the center point will overlap with the top-left corner of the rectangle. Similarly, when (fx, fy) = (1.0, 1.0), the center point will be at the bottom-right corner of the rectangle. Values larger than 1.0 or lower than 0.0 are also supported, in which case the center point will lie outside of the rectangle.
       * @param fy (optional) defines what the the position of the center point (cx, cy) should be relative to the rectangle. The default value is (0.5, 0.5), which will position the rectangle in such a way that the center point is at the center of the rectangle. For (fx, fy) = (0.0, 0.0), the center point will overlap with the top-left corner of the rectangle. Similarly, when (fx, fy) = (1.0, 1.0), the center point will be at the bottom-right corner of the rectangle. Values larger than 1.0 or lower than 0.0 are also supported, in which case the center point will lie outside of the rectangle.
       * @return {Rectangle} the nested rectangle
       */
      rectangleInPolygon(polygon: Coordinate[], cx: number, cy: number, wTH?: number, scale?: number, fx?: number, fy?: number): Rectangle

      /**
       * Given a convex polygon, finds the largest inscribed circle centered around the provided point.
       * @param polygon the polygon to inscribe the circle into. The polygon must be specified as an array of objects, each object containing the x and y property representing the coordinates of the polygon's vertex.
       * The polygon must be convex, vertex coordinates must be enumerated in clockwise or anti-clockwise order. For performance reasons, this method will not verify if the criteria are met. If the provided polygon does not satisfy the criteria, the result will be unspecified. Note that the polygons returned when getting the geometry option meet both criteria.
       * @param cx coordinates of the point inside the polygon around which the circle should be centered. For performance reasons, this method will not verify if the point lies inside the polygon. For points outside or on the boundary of the polygon, the result is not specified.
       * @param cy coordinates of the point inside the polygon around which the circle should be centered. For performance reasons, this method will not verify if the point lies inside the polygon. For points outside or on the boundary of the polygon, the result is not specified.
       * @return {number} the radius of the inscribed circle in pixels.
       */
      circleInPolygon(polygon: Coordinate[], cx: number, cy: number): number

      /**
       * Splits the given convex polygon into two polygons along the line defined by the provided point and angle.
       *
       * @param polygon the polygon to split. The polygon must be specified as an array of objects, each object containing the x and y property representing the coordinates of the polygon's vertex.
       * The polygon must be convex, vertex coordinates must be enumerated in clockwise or anti-clockwise order. For performance reasons, this method will not verify if the criteria are met. If the provided polygon does not satisfy the criteria, the result will be unspecified. Note that the polygons returned when getting the geometry option meet both criteria.
       * @param cx coordinates of the point that defines the splitting line.
       * @param cy coordinates of the point that defines the splitting line.
       * @param angle the angle defining the splitting line, in radians.
       * @return {[Coordinate[], Coordinate[]]} an array of two polygons being the result of the split or undefined if the provided line does not intersect the provided polygon.
       * An example result is shown in the figure, where one of the resulting polygons (drawn in white dashed line) has 4 vertices and the other (drawn in black dashed line) has 5 vertices.
       * Please note the following properties of the returned polygons:
       * <ul>
       *   <li>Each polygon is represented by an array of objects representing the polygon's vertices; each such object has the x and y properties defining the coordinates of the vertex.</li>
       *   <li>Both returned polygons are convex with vertices enumerated in the clockwise order.</li>
       *   <li>The returned polygons have one edge in common as shown by the black-white dashed in the figure. The two points defining the common edge in both polygons are always at indices 0 and 1 in the corresponding arrays, although not in the same order to preserve the clockwise enumeration order of the vertices.</li>
       *   <li>The order of the two resulting polygons in the returned array is deterministic. For example, if angle = 0, the polygon at index 0 will be the upper one, polygon at index 1 will be the lower one. When the angle becomes 90 degrees, polygon at index 0 will be on the left, polygon at index 1 will be on the right.</li>
       *   <li>If the provided line overlaps with any edge of the provided polygon or contains any vertex of the provided polygon, the returned polygons may be degenerate (e.g. have zero area and duplicated vertices).</li>
       * </ul>
       */
      stabPolygon(polygon: Coordinate[], cx: number, cy: number, angle: number): [Coordinate[], Coordinate[]]
    }
  }

  export class FoamTree<D extends FoamTree.DataObject = FoamTree.DataObject> {

    /**
     * A static property on hFoamTree equal to true if visualization is supported on the current browser environment.
     *
     * @example
     * if (FoamTree.supported) {
     *   // Put embedding code here.
     *   console.log("Visualization supported.");
     * } else {
     *   // Display a warning or skip visualization.
     *   console.log("Visualization not supported.");
     * }
     */
    static readonly supported: boolean
    static readonly geometry: FoamTree.GeometryUtils

    constructor(options: FoamTree.InitialOptions<D>)

    /**
     * Returns an object containing current values of all options. Properties of the returned object correspond to option names, values are option values.
     * @example
     * console.log(foamtree.get());
     */
    get(): FoamTree.Options<D>
    /**
     * Returns the current value of the requested option. If the provided string does not correspond to any option name, the result is undefined.
     * @param option The requested option
     * @example
     * console.log(foamtree.get("dataObject"));
     */
    get<O extends FoamTree.Option<D>>(option: O): FoamTree.OptionValue<O, D>
    /**
     * Returns the current value of the requested option. If the provided string does not correspond to any option name, the result is undefined.
     * @param option The requested option
     * @example
     * console.log(foamtree.get("selection"));
     */
    get<O extends FoamTree.InteractionOption>(option: O): FoamTree.InteractionOptionGetterValue<O, D>
    /**
     * Returns the current value of the requested read-only option, parameterized by the provided args.
     *
     * The example below retrieves information about the geometry of the group with id 1. The second argument causes FoamTree to return full geometry data, including coordinates of the polygon's vertices.
     * @param option The requested option
     * @param args The parameters for the option, e.g. the concerned group id, or some additional parameters
     * @example
     * console.log(foamtree.get("geometry", "1", true));
     */
    get<O extends FoamTree.ReadOnlyOption>(option: O, ...args: FoamTree.ReadOnlyOptionParameters<O, D>): FoamTree.ReadOnlyOptionValue<O, D>

    /**
     * Sets the provided option to the desired value. If the provided option string does not correspond to any option, the call is ignored.
     *
     * @remarks
     * For the changes of visual options to take effect, you will need to explicitly call the redraw method:
     * @see redraw
     *
     * @param option The option to set
     * @param value The value to set the option to
     * @example
     * foamtree.set("exposure", "1");
     */
    set<O extends FoamTree.Option<D>>(option: O, value: FoamTree.OptionValue<O, D>): void
    /**
     * Sets the provided option to the desired value. If the provided option string does not correspond to any option, the call is ignored.
     *
     * @remarks
     * For the changes of visual options to take effect, you will need to explicitly call the redraw method:
     * @see redraw
     *
     * @param option The option to set
     * @param value The value to set the option to
     * @example
     * foamtree.set("exposure", "1");
     */
    set<O extends FoamTree.InteractionOption>(option: O, value: FoamTree.InteractionOptionSetterValue<O, D>): void
    /**
     * Sets new values for all options included in the provided options object. Properties of the object should correspond to attribute names,
     * values of the object will be treated as values to set. Any properties of the options object that do not correspond to any attributes of the visualization will be ignored.
     *
     * @remarks
     * For the changes of visual options to take effect, you will need to explicitly call the redraw method:
     * @see redraw
     *
     * @param options The set of options to be set
     * @example
     * foamtree.set({
     *   exposure: "1",
     *   selection: "1",
     *   groupSelectionOutlineColor: "red"
     * });
     */
    set(options: Partial<FoamTree.Options<D>> & Partial<FoamTree.InteractionSetterOptions<D>> & Partial<FoamTree.EventOptions<D>>): void
    /**
     * Replace listener for the provided event by the provided callback or array of callback .
     *
     * @param event The event to set listeners for.
     * @param listeners Listener or array of listeners to set.
     */
    set<E extends FoamTree.EventType>(event: E, listeners: FoamTree.EventListener<E, D> | FoamTree.EventListener<E, D>[]): void

    /**
     * Registers a listener for a FoamTree event. As opposed to using the `set` method, the `on` method preserves the previously registered listeners.
     * @param type A string that specifies which event to listen to. To get type string to use with this method, take the event option name,
     * remove the leading "on" and lower-case the first letter.
     * For example, the type string corresponding to the `onGroupSelectionChanged` event is `groupSelectionChanged`
     * @param listener The event listener function to invoke when the event is triggered.
     * @see FoamTree.Events
     */
    on<E extends FoamTree.EventType>(type: E, listener: FoamTree.EventListener<E, D>): void
    /**
     * Registers a listener for a FoamTree low level event. As opposed to using the `set` method, the `on` method preserves the previously registered listeners.
     * @param type A string that specifies which event to listen to. To get type string to use with this method, take the event option name,
     * remove the leading "on" and lower-case the first letter.
     * For example, the type string corresponding to the `onGroupSelectionChanged` event is `groupSelectionChanged`
     * @param listener The event listener function to invoke when the event is triggered.
     * @see FoamTree.Events
     */
    on<E extends FoamTree.LowLevelEventType>(type: E, listener: FoamTree.LowLevelEventListener<E, D>): void

    /**
     * Removes the requested listener from the list of listeners of the specified type. As opposed to using the `set` method, this method will preserve the other listeners registered for the event.
     * @param type A string that specifies which event to remove the listener from. To get type string to use with this method,
     * take the event option name, remove the leading "on" and lower-case the first letter.
     * For example, the type string corresponding to the `onGroupSelectionChanged` event is `groupSelectionChanged`.
     * @param listener The event listener function to remove.
     */
    off<E extends FoamTree.EventType>(type: E, listener: FoamTree.EventListener<E, D>): void
    /**
     * Removes the requested listener from the list of listeners of the specified type. As opposed to using the `set` method, this method will preserve the other listeners registered for the event.
     * @param type A string that specifies which event to remove the listener from. To get type string to use with this method,
     * take the event option name, remove the leading "on" and lower-case the first letter.
     * For example, the type string corresponding to the `onGroupSelectionChanged` event is `groupSelectionChanged`.
     * @param listener The event listener function to remove.
     */
    off<E extends FoamTree.LowLevelEventType>(type: E, listener: FoamTree.LowLevelEventListener<E, D>): void

    /**
     * Triggers a complete redraw of the visualization. If one or more visual options of the visualization have been
     * changed using the set method, the changes will not be visible until the visualization is redrawn, either explicitly
     * using this method or in response to user actions.
     *
     * @param [animated=false] (optional) if true, FoamTree will assume that this redraw is part of an animation and may be followed by further redraws.
     * In such cases, depending on the size of the data, FoamTree may switch to the wireframe rendering mode.
     * @param [groups=undefined] (optional) a suggestion which groups need redrawing.
     * If defined, instead of redrawing all groups, FoamTree may redraw only the groups indicated by the provided individual
     * or multiple groups selector. Please note that in certain cases, such as when the layout of the groups changes,
     * FoamTree may still redraw all groups and not just the ones provided in this parameters.
     * Default value of this parameter is `undefined`, which means FoamTree will always redraw all groups.
     * @see Foamtree.GroupSelector
     */
    redraw(animated?: boolean, groups?: FoamTree.GroupSelector): void

    /**
     * If the size of the HTML container element has changed, resizes and redraws the visualization to accommodate to the new size. See the Resizing section for code snippets related to this function.
     *
     * If the relaxationVisible option is set to true, calling this method will trigger a complete relaxation of the layout to accommodate it to the new container dimensions.
     * As with the initial relaxation, the resize-triggered relaxation follows the settings provided by the relaxationMaxDuration and relaxationQualityThreshold options.
     *
     * The following example makes the relaxation visible, try resizing the browser window to see how relaxation is started again after the container dimensions change.
     * @example
     * foamtree.set({
     *   fadeDuration: 1500,
     *   dataObject: {
     *     groups: (function() {
     *       var arr = [];
     *       for (var i = 0; i < 100; i++) {
     *         arr.push({
     *           label: "",
     *           weight: 0.1 + Math.random() +
     *                   (Math.random() < 0.2 ? Math.random() * 3 : 0)
     *         });
     *       }
     *       return arr;
     *     })()
     *   },
     *
     *   relaxationInitializer: "random",
     *   relaxationVisible: true,
     *   relaxationQualityThreshold: 0,
     *   relaxationMaxDuration: 8000
     * });
     */
    resize(): void

    /**
     * Updates the visualization to reflect changes in group weights. If you change the values of the weight property of
     * some group, you need to call this method to see the updated visualization.
     * @param groups (optional) if an individual or multiple group selector is provided, only the weights of the groups contained in the specified groups will be updated.
     *
     * @remarks While updating the visualization, FoamTree will respect the relaxation and weight growing options.
     * For example, to see the process of visualization update, you can set relaxationVisible to true.
     * Additionally, you ma want to set groupGrowingDuration to a non-zero value to animate the weight transition.
     *
     * @remarks Note: currently, only updating weights of existing groups is supported.
     * Hierarchy changes, such as adding or removing groups, cannot be performed using this method.
     * The only way to visualize an updated hierarchy is to set a new value for the dataObject option.
     */
    update(groups?: FoamTree.GroupSelector): void

    /**
     * Changes the group selection. The groups parameter must be a multiple group selector designating the groups to select or deselect:
     * @param groups
     * If the selector is an individual selector or an array of individual selectors, the designated groups will be selected, the selection of other groups will remain unaffected.
     * If the selector is an object, two additional properties are supported, apart from the common groups and all properties:
     *
     * <ul>
     *  <li>selected - If true or not provided, the designated groups will get selected. If false, the designated groups will be deselected.</li>
     *  <li>keepPrevious - If true or not provided, only the selection of the designated groups will be altered. If false, the selection of the designated groups will be altered, the other groups will get unselected.</li>
     * <ul>
     * @remarks when selection is changed using this method, the event listeners will not be called.
     * @example Clear selection
     * foamtree.select({ groups: [], keepPrevious: false }); // Clear selection
     * foamtree.select({ all: true, selected: false }); // Clear selection
     */
    select(groups: FoamTree.IndividualGroupSelector | FoamTree.IndividualGroupSelector[] | (FoamTree.SelectorObject & {
      /**
       * If true or not provided, the designated groups will get selected. If false, the designated groups will be deselected.
       */
      keepPrevious?: boolean,
      /**
       * If true or not provided, only the selection of the designated groups will be altered. If false, the selection of the designated groups will be altered, the other groups will get unselected.
       */
      selected?: boolean
    })): void

    /**
     * Changes the set of exposed groups. The groups parameter must be a multiple group selector designating the groups to expose or unexpose
     *
     * @param groups
     * If the selector is an individual selector or an array of individual selectors, the designated groups will be exposed, all other groups will get unexposed.
     *
     * If the selector is an object, two additional properties are supported, apart from the common `groups` and `all` properties:
     * <ul>
     *  <li>exposed -If true or not provided, the designated groups will get exposed. If false, the designated groups will be unexposed.</li>
     *  <li>keepPrevious - If true or not provided, only the selection of the designated groups will be altered. If false, the selection of the designated groups will be altered, the other groups will get unselected.</li>
     * <ul>
     *
     * @example Unexpose all groups
     * foamtree.expose([]); // unexpose all groups
     * @example Chaining after exposure animation
     * foamtree.expose("1").then(() => console.log("Animation finished"))
     *
     * @remarks when exposure is changed using this method, the event listeners will not be called.
     * @remarks there are some limitations when relaxation is visible.
     */
    expose(groups: FoamTree.IndividualGroupSelector | FoamTree.IndividualGroupSelector[] | (FoamTree.SelectorObject & {
      /**
       * If true or not provided, the designated groups will get selected. If false, the designated groups will be deselected.
       */
      keepPrevious?: boolean,
      /**
       * If true or not provided, the designated groups will get exposed. If false, the designated groups will be unexposed.
       */
      exposed?: boolean
    })): Promise<void>

    /**
     * Changes the set of open groups
     * @param groups
     * @return Promise<void>
     * @remarks when open state is changed using this method, the event listeners will not be called.
     * @example Chaining after exposure animation
     * foamtree.open("1").then(() => console.log("Animation finished"))
     */
    open(groups: FoamTree.IndividualGroupSelector | FoamTree.IndividualGroupSelector[] | (FoamTree.SelectorObject & {
      /**
       * If true or not provided, the designated groups will get selected. If false, the designated groups will be deselected.
       */
      keepPrevious?: boolean,
      /**
       * If true or not provided, the designated groups will get open. If false, the designated groups will be closed.
       */
      open?: boolean
    })): Promise<void>

    /**
     * Zooms the visualization to show the specified group.
     * The speed and easing of the zoom transition are controlled by the zoomMouseWheelDuration and zoomMouseWheelEasing options.
     * The zoom method returns a promise that gets resolved when the zooming animation completes.
     *
     * @param groups must be an individual group selector designating the group to zoom to. You can also zoom to the dataObject group, in which case the whole visualization area will be shown.
     * @return Promise<void>
     */
    zoom(groups: FoamTree.IndividualGroupSelector): Promise<void>

    /**
     * Resets the visualization view back to the initial state, which includes:
     * unexposing and closing all groups,
     * resetting the zoom factor to make the whole visualization area visible.
     * The selection state is not affected by this method.
     *
     * @example
     * foamtree.select([ "1", "2" ]);
     * foamtree.expose([ "3", "4" ]);
     * foamtree.open([ "2", "3" ]);
     * var timeout = window.setTimeout(function() {
     *   foamtree.reset();
     * }, 3000);
     */
    reset(): void

    /**
     * Triggers the FoamTree action associated with the event of the provided type.
     * The most common use case for this method is replacing FoamTree's built-in touch event detection infrastructure with the code of your own.
     * @param type string identifier of the event to trigger. Below is a list of supported events along with the FoamTree actions they trigger:
     * <ul>
     *   <li>`click` - a single mouse click event, selects or deselects a group</li>
     *   <li>`doubleclick` - a double mouse click event, exposes or unexposes a group</li>
     *   <li>`hold` - click-and-hold event, opens or closes a group</li>
     *   <li>`mousedown` - stops zoomed visualization panning</li>
     *   <li>`mousewheel` - turning of the mouse wheel up or down, zooms in or out the visualization</li>
     *   <li>`hover` - hovering with the mouse pointer over the group, highlights the group</li>
     *   <li>`dragstart` - starts panning the zoomed visualization</li>
     *   <li>`drag` - pans the zoomed visualization</li>
     *   <li>`dragend` - depending on the speed of panning: continues panning of the visualization or stops panning and corrects the view port in such a way that the edge of the visualization touches the edge of the viewport.</li>
     *   <li>`transformstart` - starts the touch-based zooming of the visualization</li>
     *   <li>`transform` - touch-based zooming of the visualization</li>
     *   <li>`transformend` - completes the touch-based zooming of the visualization, corrects the view port in such a way that the edge of the visualization touches the edge of the viewport. If the last transformation scale was lower than 0.8 and the zooming was performed with three or more fingers, triggers reset of the visualization view.</li>
     * </ul>
     * @param event the details of the event to trigger. The object must contain all the properties of the low-level event, apart from the preventDefault() method.
     *
     * @remarks Heads up!
     * Initiating events using the trigger method will notify all the involved event listeners. For example, triggering the `click` event will invoke the `onGroupClick` listeners and, if the default action is not prevented by that listener, the `onGroupSelectionChanging` and the `onGroupSelectionChanged` events.
     *
     * For this reason, calling the trigger method in event listeners may lead to the visualization falling in an endless loop.
     */
    trigger<E extends FoamTree.LowLevelEventType>(type: E, event: Omit<FoamTree.LowLevelEventValue<E, D>, 'preventDefault' | 'allowOriginalEventDefault' | 'preventOriginalEventDefault'>): void

    /**
     * Initializes internal data structures for the provided groups. Full example on <a href="https://get.carrotsearch.com/foamtree/latest/demos/deferred-layout.html"> this demo</a>
     *
     * @param groups  must be a multiple group selector
     * @param maxLevels indicates how many group levels to attach, assuming that the group being attached is on level 0.
     * @return the number of child groups for which layout has been computed
     */
    attach(groups: FoamTree.MultipleGroupSelector, maxLevels: number): number

    /**
     * Stops all running animations and removes all HTML event listeners registered by FoamTree.
     * If you are repeatedly instantiating and disposing of FoamTree instances on the same page, make sure you call the
     * dispose method when appropriate.
     * Otherwise, dangling event listeners will prevent large chunks of memory from being garbage-collected.
     */
    dispose(): void
  }


}
