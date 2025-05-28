declare module '@carrotsearch/foamtree' {
  namespace FoamTree {
    /**
     * The data to visualize.
     * The provided value must be an object or null / undefined.
     * The object will be assumed to represent the root group and must contain a non-empty groups property pointing to
     * an array of objects representing individual first-level groups.
     *
     * A null or undefined object clears the visualization.
     * @remarks The data object (and groups) can contain custom properties, not required or interpreted by the visualization.
     * These properties may be used for color model tuning, for example.
     *
     * @example a data object with various values of the above properties
     * foamtree.set({
     *   dataObject: {
     *     groups: [
     *       { label: "Bad news", open: true, groups: [
     *         { label: "Last penny lost", sentiment: -0.5 },
     *         { label: "Bazinga doomed",  sentiment: -1 }
     *         ]},
     *       { label: "Good news", exposed: true, selected: true, groups: [
     *         { label: "iPads under $100",      sentiment: 0.5, selected: true },
     *         { label: "Martians are friendly", sentiment: 1 }
     *         ]},
     *       { label: "Other news", groups: [
     *         { label: "Vampires on the loose",     sentiment: -2 },
     *         { label: "Van Helsing to the rescue", sentiment: -3 }
     *         ]}
     *     ]
     *   }
     * });
     */
    export interface DataObject {
      /**
       * Unique identifier of the group. Group identifiers are required only for programmatic changes of certain group attributes such as selection, exposure or open state.
       */
      id?: string
      /**
       * Textual description of the group. For best results, use short labels.
       * @remarks
       * FoamTree will handle the following special unicode characters in the label text:
       *
       * <ul>
       *   <li>Unbreakable space (\u00a0) - line breaks will not be made on the unbreakable space character</li>
       *
       *   <li>Soft hyphen (\u00ad) - when label needs to be broken into multiple lines, soft hyphen will allow a line break,
       *   generating the hyphen character at the end of the line.
       *   A soft hyphen will not add any spacing between the characters that surround it.
       *   <br>
       *   If you'd like to have your labels hyphenated, you can use an external hyphenation utility, such as
       *   Hyphenator.js to insert soft hyphens into your labels</li>
       *
       *   <li>Zero-width space (\u200b) - when label needs to be broken into multiple lines, zero-width space will
       *   allow a line break. A zero-width space will not add any spacing between the characters that surround it.</li>
       *
       *   <li>New line (\n) - Since 3.4.0 forces a line break</li>
       * <ul>
       */
      label: string

      /**
       * (optional, Number >= 0) weight of the group relative to other groups. The larger the weight, the more space the group's polygon will occupy on the screen. Good values for the weight property could be e.g. the number of documents in a cluster or the score of the cluster.
       *
       * Group weights must be non-negative. Zero-weight groups can receive special treatment, see the showZeroWeightGroups option. If a group's weight is not specified, FoamTree will assume the weight is 1.0.
       */
      weight?: number
      /**
       * (optional, Array) an array of subgroups of the group.
       */
      groups?: DataObject[]
      /**
       * (optional, boolean) if `true`, the group will get open right after the new data is set.
       */
      open?: boolean
      /**
       * (optional, boolean) if `true`, the group will get exposed right after the new data is set.
       * This can be useful to visually highlight a certain group (or groups) as the data is loaded.
       * Please note the limitations when relaxation is visible.
       */
      exposed?: boolean

      /**
       * (optional, boolean) if `true`, the group will get selected right after the new data is set.
       */
      selected?: boolean

      /**
       * Since 3.4.9 (optional, boolean) If `true`, descriptionGroup option is set to always and stacking is
       * hierarchical, allocates extra space inside this group to show the group's label
       * together with the group's child groups.
       */
      description?: boolean
      /**
       * Since 3.4.10 (optional, object) Determines the initial position of this group.
       */
      initialPosition?: Position
    }

    export type Coordinate = { x: number, y: number };

    type Rectangle = {
      /**
       * Top-left corner x
       */
      x: number,
      /**
       * Top-left corner y
       */
      y: number,
      /**
       * width
       */
      w: number,
      /**
       * height
       */
      h: number
    };

    /**
     * number should be in range [0,360)
     */
    export type Direction =
      number
      | 'left'
      | 'right'
      | 'top'
      | 'bottom'
      | 'random'
      | 'topleft'
      | 'topright'
      | 'bottomleft'
      | 'bottomright'

    export type Easing =
      'linear'
      | 'bounce'
      | 'squareIn'
      | 'squareOut'
      | 'squareInOut'
      | 'cubicIn'
      | 'cubicOut'
      | 'cubicInOut'
      | 'quadIn'
      | 'quadOut'
      | 'quadInOut'

    export interface RGBAColor {
      model: 'rgba',
      /**
       * @assert value in 0..255
       */
      r: number,
      /**
       * @assert value in 0..255
       */
      g: number,
      /**
       * @assert value in 0..255
       */
      b: number,
      /**
       * @assert value in 0..255
       */
      a: number
    }

    export interface HSLAColor {
      model: 'hsla'
      /**
       * hue angle
       * @assert value in 0..359
       */
      h: number,
      /**
       * saturation percentage
       * @assert value in 0..100
       */
      s: number,
      /**
       * lightness percentage
       * @assert value in 0..100
       */
      l: number,
      /**
       * opacity
       * @assert value in 0..1
       */
      a: number
    }

    export type ColorObject = RGBAColor | HSLAColor;

    /**
     * Position in polar coordinates
     */
    export interface Position {
      /**
       * Angle
       */
      position: Direction
      /**
       * Distance: [0-1]
       */
      distanceFromCenter: number
    }

    export type IndividualGroupSelector = string | DataObject | null | undefined;

    type SelectorObject = { groups: GroupSelector } | { all: boolean };
    export type MultipleGroupSelector = IndividualGroupSelector[] | SelectorObject;

    export type GroupSelector = IndividualGroupSelector | MultipleGroupSelector;

    /**
     * The groupContentDecorator exposes a drawing context buffer that must be used do draw the custom content of the polygon.
     * While the provided context behaves like the standard CanvasRenderingContext2D,
     * it also exposes a number of useful non-standard methods.
     */
    export interface DrawingContext extends CanvasRenderingContext2D {
      /**
       * Prepares a path of a rectangle with rounded corners. The path can then be filled and/or stroked depending on the needs.
       * @param x coordinates of the top-left corner of the rectangle.
       * @param y coordinates of the top-left corner of the rectangle.
       * @param w width and height of the rectangle, in pixels.
       * @param h width and height of the rectangle, in pixels.
       * @param r radius of the corners, in pixels.
       *
       * @example
       * foamtree.set({
       *   dataObject: { groups: randomGroups(30) },
       *
       *   groupContentDecorator: function (opts, params, vars) {
       *     var box = CarrotSearchFoamTree.geometry.rectangleInPolygon(
       *       params.polygon, params.polygonCenterX, params.polygonCenterY,
       *       4, 0.8);
       *
       *     var ctx = params.context;
       *     ctx.roundRect(box.x, box.y, box.w, box.h, box.h * 0.1);
       *     ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
       *     ctx.fill();
       *     ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
       *     ctx.stroke();
       *   }
       * });
       */
      roundRect(x: number, y: number, w: number, h: number, r: number): void

      /**
       * Fills the provided polygon with text. If needed, this method will split the text into multiple lines and then record the appropriate fillText() calls to the context on which the method was called.
       *
       * Please note that it may happen that the method is unable to fill the polygon with text given the provided set of options. Therefore, the callers must check the information object returned by this method to ensure the text was actually fit in the polygon.
       *
       * @param polygon
       * @param cx
       * @param cy
       * @param text
       * @param options Additional options for this method
       * @return an object summarizing the text filling process
       */
      fillPolygonWithText(polygon: Coordinate[], cx: number, cy: number, text: string, options: Partial<{
        /**
         * the font family to assume when filling the polygon with text, sans-serif by default.
         */
        fontFamily: string | null,
        /**
         * Since 3.2.2 the font weight (e.g. bold) to assume when filling the polygon with text, normal by default.
         */
        fontWeight: string | null,
        /**
         *
         * Since 3.2.2 the font style (e.g. italic) to assume when filling the polygon with text, normal by default.
         */
        fontStyle: string | null,
        /**
         * Since 3.2.2 the font variant (e.g. small-caps) to assume when filling the polygon with text, normal by default.
         */
        fontVariant: string | null,
        /**
         * the minimum font size in pixels to use for filling the text, 0 by default.
         */
        minFontSize: number,
        /**
         * the maximum font size in pixels to use for filling the text, 72 by default.
         */
        maxFontSize: number,
        /**
         * the line height to assume when splitting the text into mulitple lines, 1.05 by default. Line heights smaller than 1.0 are currently not supported.
         */
        lineHeight: number,
        /**
         * the vertical align of the text relative to the center point (cx, cy), center by default.
         * @remarks Please note that currently the horizontal align option is not available, the text will always be centered horizontally.
         */
        verticalAlign: 'top' | 'center' | 'bottom',
        /**
         * the horizontal padding to apply to each line of text. The unit of this option is the font size used to render the text. Default value: 1.0.
         */
        horizontalPadding: number,
        /**
         * the vertical padding to apply to the whole block of text. The unit of this option is the font size used to render the text. Default value: 0.5.
         */
        verticalPadding: number,
        /**
         * The maximum total height of the text block as a fraction of the polygon's bounding box height, 0.95 by default.
         */
        maxTotalTextHeight: number,
        /**
         * if true and the complete text does not fit in the polygon, fill as much text as possible and append the ellipsis to replace the non-fitting part of the text, false by default.
         */
        allowEllipsis: boolean,
        /**
         * if true the text can be split at arbitrary points, such as inside words, during the filling process, false by default.
         */
        allowForcedSplit: boolean,
        /**
         * if a non-null object is provided, this method will use it to cache some geometry information to speed up the text filling process. When another text filling request is made and the same cache object is presented, this method will try to reuse the cached information to speed up the layout process. If, however, the geometry of the polygon changes a lot, the cache will not be used and a complete filling process will be performed.
         *
         * For caching to work properly, dedicated cache objects need to be provided for each logical polygon. For example, each group polygon will require a separate cache object. Moreover, to perform caching, the area option must also be provided.
         *
         * Default value: undefined, meaning no caching will be performed.
         */
        cache: any | undefined,
        /**
         * the current area of the polygon for which the filling is performed. The area must only be provided if layout caching is desired.
         */
        area: Coordinate[], //TODO check if correct type
        /**
         * determines how much the area of the polygon must change in order to discard the cached layout and invoke the complete text fitting process, 0.05 by default.
         */
        cacheInvalidationThreshold: number,
        /**
         * if true, the cache will be invalidated and full text filling process will be performed, regardless of whether the geometry of the polygon changed or not. If the label text or font has changed, you must set the invalidate option to true to ensure the text fitting is correctly performed.
         */
        invalidate: boolean
      }>): {
        /**
         * true when the text fit in the polygon. If this property is false, then no text drawing commands were issued and the returned summary object does not have any other properties.
         */
        fit: boolean,
        /**
         * the number of lines into which the text was split.
         */
        lineCount: number,
        /**
         * the font size, in pixels, in which the text was drawn.
         */
        fountSize: number,
        /**
         * the bounding box of the complete text block, an object with the x, y, w and h properties representing the top-left corner coordinates, width and height, respectively.
         */
        box: Rectangle,
        /**
         * true if the ellipsis was applied at the end of the text.
         */
        ellipsis: boolean
      }

      /**
       * Creates and returns a temporary drawing context buffer. Combined with the replay() method, the temporary contexts can be useful in the following scenarios:
       * <ol>
       *   <li>Drawing a rectangle beneath the text that was fitted in a polygon. The fillPolygonWithText() method issues the drawing commands immediately, but in order to draw a rectangle beneath the text, we need to know the bounding box of the text in advance. The solution is to invoke the text filling on the temporary context, draw the rectangle based on the text filling info returned by fillPolygonWithText() and finally replay the temporary text buffer buffer to draw the text on top of the rectangle.</li>
       *   <li>Caching expensive layout computations. When groupContentDecoratorTriggering is onSurfaceDirty, the content decorator will be invoked each time the visualization needs to be redrawn. During most of those calls, the geometry of the groups' polygons will remain the same, so there may be no need recompute the layout of the custom content. One way to cache the layout in such cases would be to create one or more drawing context buffers per group, fill the buffers only when the shapeDirty property of the decorator is true and when shapeDirty is false, replay the previously buffered drawing commands. Please see the GitHub search example for this pattern applied in practice.</li>
       * </ol>
       * @example Option 1
       * foamtree.set({
       *     dataObject: { groups: randomGroups(20) },
       *
       *     groupContentDecorator: function (opts, params, vars) {
       *       var ctx = params.context;
       *       var group = params.group;
       *
       *       var scratch = ctx.scratch();
       *       var fillTextInfo = ctx.fillPolygonWithText(
       *         params.polygon,
       *         params.polygonCenterX, params.polygonCenterY,
       *         "Group\u00a0" + (params.index + 1));
       *
       *       if (fillTextInfo.fit) {
       *         // Draw the rectangle first
       *         var box = fillTextInfo.box;
       *         var padding = box.h * 0.15;
       *         ctx.lineWidth = 2;
       *         ctx.roundRect(box.x - padding, box.y - padding,
       *           box.w + 2 * padding, box.h + 2 * padding, padding);
       *         ctx.globalAlpha = 0.2;
       *         ctx.fill();
       *         ctx.globalAlpha = 0.6;
       *         ctx.stroke();
       *         scratch.replay(ctx);
       *       }
       *     }
       *   });
       */
      scratch(): DrawingContext

      /**
       * Replays the content of the drawing context buffer to the targetContext.
       * The target context can either be another context buffer of the actual native drawing context. For usage scenarios and examples, please see the scratch() method.
       * @see scratch
       * @param targetContext
       */
      replay(targetContext: CanvasRenderingContext2D | DrawingContext): void
    }
  }
}

