/// <reference path="./core.d.ts" />

declare module "@carrotsearch/foamtree" {
  namespace FoamTree {
    type Listeners<D extends DataObject> =
      VisualizationListeners<D>
      & GroupStateListeners<D>
      & InteractionListeners<D>;

    type EventType = keyof Listeners<DataObject>;
    type EventListener<E extends EventType, D extends DataObject> = Listeners<D>[E];
    type EventOptions<D extends DataObject> = {
      [E in EventType]: EventListener<E, D> | EventListener<E, D>[]
    }


    /**
     * This section describes events that relate to the life cycle of the whole visualization.
     */
    interface VisualizationListeners<D extends DataObject> {
      /**
       * Called after the pullback animation of the previous data model has completed, but before the visualization has parsed the new data model provided in the dataObject option and before the new data has been rendered. The listeners will be called with one argument – the new data object the visualization is about to parse and show.
       *
       * You can use this event to modify and enhance the data model.
       * @example add or remove groups and sub-groups at this stage
       * foamtree.set({
       *   onModelChanging: function (data) {
       *     data.groups.forEach(function (group) {
       *       group.label = "Group with " + group.count + " child groups";
       *       group.weight = group.count;
       *
       *       // Generate the child groups
       *       group.groups = [];
       *       for (var i = 0; i < group.count; i++) {
       *         group.groups.push({ label: "Group " + i });
       *       }
       *     });
       *   }
       * });
       *
       * foamtree.set("dataObject", { groups: [
       *   { count: 8  },
       *   { count: 12 },
       *   { count: 5  },
       *   { count: 4  },
       *   { count: 7  }
       * ]});
       */
      onModelChanging: (data: D) => any
      /**
       * Called after the pullback animation of the previous data model has completed and the visualization has parsed the new data model provided in the dataObject option, but before the new data has been rendered. The listeners will be called with one argument – the new data object the visualization is about to show.
       *
       * You can use this event to enhance the data model.
       * For example, if the computation of the group's polygon color is expensive, you may want to perform the computation once in the onModelChanged listener, store it in the data object and then use it in the groupColorDecorator, as shown in the following example.
       * @example
       * foamtree.set({
       *   onModelChanged: function (data) {
       *     data.groups.forEach(function (group) {
       *       group.color = "hsl(" + (-60 * (group.sentiment - 1)) + ", 100%, 50%)";
       *     });
       *   },
       *   groupColorDecorator: function (opts, props, vars) {
       *     vars.groupColor = props.group.color;
       *   }
       * });
       *
       * foamtree.set("dataObject", { groups: [
       *   { label: "Positive", sentiment: 1 },
       *   { label: "Negative", sentiment: -1 },
       *   { label: "Neutral",  sentiment: 0 }
       * ]});
       * @remarks Note: group hierarchy changes, such as adding or removing groups or sub-groups, will not be taken into account in the onModelChanged. You can make such changes in the onModelChanging listener.
       *
       * In the context of each callback, this points to the involved instance of FoamTree.
       */
      onModelChanged: (data: D) => any

      /**
       * Called just before the visualization starts the animated rollout.
       *
       * If the application implements some sort of loading indicator, the indicator should be hidden once this event is fired.
       * @remarks This listener will not be called when an empty (null, undefined) dataObject is set. To get a notification in such cases, register a listener for the onModelChanging or the onModelChanged event.
       */
      onRolloutStart: () => any
      /**
       * Called after the rollout animation has completed.
       * Please note that this listener will not be called when an empty dataObject is set, see onRolloutStart for an alternative for such cases.
       * @see onRolloutStart
       * @remarks This listener will not be called when an empty (null, undefined) dataObject is set. To get a notification in such cases, register a listener for the onModelChanging or the onModelChanged event.
       */
      onRolloutComplete: () => any

      /**
       * Invoked once per layout relaxation step, but only when relaxationVisible is true.
       *
       * You can use this event to create a progress indicator for the relaxation, just as the relaxation progress utility does.
       * @param relaxationProgress - the progress of the relaxation process on the 0..1 scale
       * @param relaxationComplete - When true, this is the last step of relaxation because the requested relaxationQualityThreshold has been achieved.
       * @param relaxationTimeout - When true, this is the last step of relaxation because the relaxationMaxDuration has been exceeded.
       */
      onRelaxationStep: (relaxationProgress: number, relaxationComplete: boolean, relaxationTimeout: boolean) => any

      /**
       * Called after the internal- or API-triggered redraw of the visualization.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       *
       * Any code in this callback should be minimal and ultra fast to keep the transition animations smooth.
       * @param incremental true if the redraw as an incremental one
       * @example
       * foamtree.set({
       *   onRedraw: function (incremental) {
       *     var group = this.get("dataObject").groups[incremental ? 0 : 1];
       *     group.redraws++;
       *     group.label = group.redraws.toString();
       *   },
       *   groupColorDecorator: function(opts, props, vars) {
       *     switch (props.group.type) {
       *       case "complete":    vars.groupColor = "hsl(0, 65%, 75%)"; break;
       *       case "incremental": vars.groupColor = "hsl(60, 65%, 75%)"; break;
       *       default:            vars.groupColor = "hsl(0, 0%, 85%)";
       *     }
       *   },
       *   rolloutDuration: 1000
       * });
       *
       * foamtree.set("dataObject", { groups: [
       *   { label: "0", redraws: 0, weight: 2, type: "incremental" },
       *   { label: "0", redraws: 0, weight: 2, type: "complete" },
       *   { label: "" }, { label: "" },
       *   { label: "" }, { label: "" },
       *   { label: "" }, { label: "" },
       *   { label: "" }, { label: "" }
       * ]});
       */
      onRedraw: (incremental: boolean) => any

      /**
       * Invoked after the view has been reset by a user interaction.
       * @see FoamTree.reset()
       */
      onViewReset: () => any
    }

    /**
     * This section documents events triggered when the state of one or more groups is changed by the user's interaction.
     */
    interface GroupStateListeners<D extends DataObject> {
      /**
       * Called during group selection changes.
       */
      onGroupSelectionChanging: (info: {
        /**
         * Reference to the data object which is subject to selection state change.
         */
        group: D,
        /**
         * true if the group has just been selected, false otherwise
         */
        selected: boolean
      }) => any

      /**
       * Called once after the selection has changed. The callback receives one parameter: an object containing the groups property with an array of references to the data objects representing the groups that are currently selected.
       *
       * When multiple callbacks are present, the entire set will be invoked, even if one or more callbacks changes the selection via an API call.
       *
       * The listener will not be invoked for API-initiated state changes, only for user interactions. In the context of the callback, this points to the involved instance of FoamTree.
       */
      onGroupSelectionChanged: (info: {
        groups: D[]
      }) => any

      /**
       * Called during group exposure changes.
       */
      onGroupExposureChanging: (info: {
        /**
         * Reference to the data object which is subject to exposure state change.
         */
        group: D,
        /**
         * true if the group has just been exposed, false otherwise
         */
        exposed: boolean,
        /**
         * true if the exposure change is a side effect of some other user interaction, such as view reset.
         */
        indirect: boolean
      }) => any

      /**
       * Called once after the exposure has changed.
       *
       * When multiple callbacks are present, the entire set will be invoked, even if one or more callbacks changes the exposure via an API call.
       *
       * The listener will not be invoked for API-initiated state changes, only for user interactions. In the context of the callback, this points to the involved instance of FoamTree.
       *
       * @example
       * foamtree.set({
       *   onGroupExposureChanged: function(info) {
       *     console.log(info);
       *   }
       * });
       */
      onGroupExposureChanged: (info: {
        /**
         * an array of references to the data objects representing the groups that are currently exposed
         */
        groups: D[],
        /**
         * true if the exposure change is a side effect of some other user interaction, such as view reset.
         */
        indirect: boolean
      }) => any

      /**
       * Called during group opening state changes.
       */
      onGroupOpenOrCloseChanging: (info: {
        /**
         * Reference to the data object which is subject to opening state change.
         */
        group: D,
        /**
         * true if the group has just been opened, false otherwise
         */
        open: boolean,
        /**
         * true if the state change is a side effect of some other user interaction, such as group exposure change or view reset.
         */
        indirect: boolean
      }) => any

      /**
       * Called once after some groups have been opened or closed.
       *
       * When multiple callbacks are present, the entire set will be invoked, even if one or more callbacks changes the exposure via an API call.
       *
       * The listener will not be invoked for API-initiated state changes, only for user interactions. In the context of the callback, this points to the involved instance of FoamTree.
       */
      onGroupOpenOrCloseChanged: (info: {
        /**
         * an array of references to the data objects representing the groups that are currently open
         */
        groups: D[],
        /**
         * true if the state change is a side effect of some other user interaction, such as group exposure change or view reset.
         */
        indirect: boolean
      }) => any
    }

    /**
     * This section documents events related to low-level interactions initiated by the user.
     * Listeners registered for the those events will receive the event details object that they may use to prevent the default action associated with the specific event.
     */
    interface InteractionListeners<D extends DataObject> {
      /**
       * Called after a mouse click (or tap gesture) was detected on a group.
       * The callback will be invoked with one parameter – the event details object.
       * You can use that object to get more information about the affected group.
       * You can also use it to prevent the default action.
       *
       * @example
       * foamtree.set({
       *   dataObject: { groups: [
       *     { label: "Selectable" },
       *     { label: "Selectable" },
       *     { label: "Selectable" },
       *     { label: "Unselectable", unselectable: true },
       *     { label: "Unselectable", unselectable: true }
       *   ]},
       *   onGroupClick: function (event) {
       *     if (event.group.unselectable) {
       *       event.preventDefault();
       *     }
       *   },
       *   groupColorDecorator: function (opts, props, vars) {
       *     vars.groupColor = props.group.unselectable ? "#aaa" : "#77ff00";
       *     vars.labelColor = props.group.unselectable ? "#888" : "auto";
       *   }
       * });
       */
      onGroupClick: (event: LowLevelEvent<D>) => any
      /**
       * Called after a double click (or double tap gesture) was detected on a group.
       * The callback will be invoked with one parameter – the event details object.
       * You can use that object to get more information about the affected group.
       * You can also use it to prevent the default action.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       */
      onGroupDoubleClick: (event: LowLevelEvent<D>) => any
      /**
       * Called after a click-and-hold (or tap-and-hold gesture) was detected on a group.
       * The callback will be invoked with one parameter – the event details object.
       * You can use that object to get more information about the affected group.
       * You can also use it to prevent the default action.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       */
      onGroupHold: (event: LowLevelEvent<D>) => any
      /**
       * Called after the mouse pointer enters the area covered by a group or leaves the visualization area completely. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group. You can also use it to prevent the default action, which is highlighting of the hovered-on group.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       */
      onGroupHover: (event: LowLevelEvent<D>) => any
      /**
       * Called when the mouse pointer moves over the area of some group. The provided callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group and screen- and visualization-relative coordinates of the mouse pointer.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       *
       * You can use this event in combination with groupContentDecorator to make the custom-drawn elements of each group interactive. See the Interactive custom content demo for some example implementation.
       * @param event
       */
      onGroupMouseMove: (event: LowLevelEvent<D>) => any
      /**
       * Called after the mouse wheel is rotated over a group. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group. You can also use it to prevent the default action.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onGroupMouseWheel: (event: LowLevelEvent<D>) => any
      /**
       * Called after the mouse pointer is pressed. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onGroupMouseDown: (event: LowLevelEvent<D>) => any
      /**
       * Called after the mouse pointer is released. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onGroupMouseUp: (event: LowLevelEvent<D>) => any
      /**
       * Called after the user starts dragging a group. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group. You can also use it to prevent the default action.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onGroupMouseDragStart: (event: LowLevelEvent<D>) => any
      /**
       * Called when the user is dragging a group. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group. You can also use it to prevent the default action.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onGroupMouseDrag: (event: LowLevelEvent<D>) => any
      /**
       * Called when group dragging is complete. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onGroupMouseDragEnd: (event: LowLevelEvent<D>) => any
      /**
       * Called after the user starts touch-based zooming over a group. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group. You can also use it to prevent the default action.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       */
      onGroupTransformStart: (event: LowLevelEvent<D>) => any
      /**
       * Called when the user is performing touch-based zooming over a group. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group. You can also use it to prevent the default action.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onGroupTransform: (event: LowLevelEvent<D>) => any
      /**
       * Called when the user has completed touch-based zooming over a group. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onGroupTransformEnd: (event: LowLevelEvent<D>) => any
      /**
       * Called when the user pressed a key. The callback will be invoked with one parameter – the event details object. You can use that object to get more information about the affected group. You can also use it to prevent the default action.
       *
       * In the context of the callback, this points to the involved instance of FoamTree.
       * @param event
       */
      onKeyUp: (event: LowLevelEvent<D>) => any
    }


    type LowLevelEventType = keyof LowLevelEvents;
    type LowLevelEventValue<E extends LowLevelEventType, D extends DataObject> = LowLevelEvents<D>[E];
    type LowLevelEventListener<E extends LowLevelEventType, D extends DataObject> = (value: LowLevelEventValue<E, D>) => any;

    interface LowLevelEvent<D extends DataObject> {
      /**
       * the type of the event, such as click or dragstart
       */
      type: keyof LowLevelEvents<D>;
      /**
       * a reference to the data object corresponding to the group over which the event was triggered
       */
      group: D
      /**
       * an alias to the group property
       */
      topmostClosedGroup: D
      /**
       * a reference to the data object corresponding to the closest open parent of the group over which the event was triggered
       */
      bottommostOpenGroup: D

      /**
       * coordinates of the point over which the event was triggered.
       * The coordinates are relative to the visualization container element.
       * Use those coordinates to, for example, show a popup dialog near the mouse pointer.
       */
      x: number
      /**
       * coordinates of the point over which the event was triggered.
       * The coordinates are relative to the visualization container element.
       * Use those coordinates to, for example, show a popup dialog near the mouse pointer.
       */
      y: number

      /**
       * Since 3.4.4 coordinates of the point over which the event was triggered, relative to the visualization area.
       * These coordinates are in the same space as the one used to draw content in the groupContentDecorator and are
       * independent of zoom, pan and expose transformations.
       * You can use these coordinates to make custom content interactive.
       */
      xAbsolute: number
      /**
       * Since 3.4.4 coordinates of the point over which the event was triggered, relative to the visualization area.
       * These coordinates are in the same space as the one used to draw content in the groupContentDecorator and are
       * independent of zoom, pan and expose transformations.
       * You can use these coordinates to make custom content interactive.
       */
      yAbsolute: number

      /**
       * true if the event was triggered by the right mouse button or a two-finger gesture on touch devices.
       */
      secondary: boolean

      /**
       * the number of touches involved in the gesture.
       * On non-touch devices, always equal to 1.
       */
      touches: number
      /**
       * the scale factor associated with the event. Meaningful only for the onGroupTransform and onGroupTransformEnd events, for other events the scale is 1.
       */
      scale: number
      /**
       * The direction in which the mouse wheel was rotated. Positive values mean the upwards rotation, negative values mean downwards rotation. Meaningful only for the onGroupMouseWheel event, equal to 0 for other events.
       */
      delta: number

      /**
       * true if the Ctrl key was pressed during the event
       */
      ctrlKey: boolean
      /**
       * true if the Alt key was pressed during the event
       */
      altKey: boolean
      /**
       * true if the Meta key was pressed during the event
       */
      metaKey: boolean
      /**
       * true if the Shift key was pressed during the event
       */
      shiftKey: boolean

      /**
       * a function that can be called to prevent the default FoamTree action, such as group selection on mouse click, associated with the event.
       */
      preventDefault: () => any
      /**
       * a function that can be called to prevent the default browser's action, such as page scrolling on mouse wheel, associated with the original event.
       */
      preventOriginalEventDefault: () => any

      /**
       * a function that can be called to allow the default browser's action associated with the original event.
       * The default behaviour of FoamTree is to prevent browser's actions for the mouse wheel and touch events to make
       * it possible to use them for visualization interactions.
       * You can restore the default browser's actions by calling this method as shown in the scrollable content example.
       */
      allowOriginalEventDefault: () => any
    }

    interface LowLevelEvents<D extends DataObject = DataObject> {
      click: LowLevelEvent<D>
      doubleclick: LowLevelEvent<D>
      hold: LowLevelEvent<D>
      mousedown: LowLevelEvent<D>
      mousewheel: LowLevelEvent<D>
      hover: LowLevelEvent<D>
      dragstart: LowLevelEvent<D>
      drag: LowLevelEvent<D>
      dragend: LowLevelEvent<D>
      transformstart: LowLevelEvent<D>
      transform: LowLevelEvent<D>
      transformend: LowLevelEvent<D>
    }
  }
}
