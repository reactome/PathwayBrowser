import {Position} from "cytoscape";
import {add, array, NDArray, subtract} from "vectorious";

/**
 * Add roundness to a segment edge by adding for each anchor position an additional point just before and just after
 * at a distance of radius from the original anchor point.
 *
 * With Cytoscape Bezier edges, this renders as a segmented edges with smoothed corner.
 * For a schematic explanation, @see https://raw.githubusercontent.com/reactome-pwp/PathwayBrowser/main/doc/smooth-segments.png
 *
 * @param source The position of the source node
 * @param target The position of the target node
 * @param anchors The intermediate segment points
 * @param radius How far away the new points need to be from the anchor points.
 * A bigger radius means smoother corners,
 * but it shouldn't be bigger than the segment
 * @private
 */
export function addRoundness(source: Position, target: Position, anchors: Position[], radius = 60): Position[] {
  const output: NDArray[] = []
  if (anchors.length === 0) return output;

  const points = [source, ...anchors, target];
  for (let i = 1; i < points.length - 1; i++) {
    let previousPoint = toVector(points[i - 1]);
    let currentPoint = toVector(points[i]);
    let nextPoint = toVector(points[i + 1]);

    const previousVector = subtract(previousPoint.copy(), currentPoint);
    const nextVector = subtract(nextPoint.copy(), currentPoint);

    // Scaling to fit to radius
    scaleTo([previousVector, nextVector], radius);

    previousPoint = add(currentPoint.copy(), previousVector);
    nextPoint = add(currentPoint.copy(), nextVector);

    output.push(previousPoint, currentPoint, nextPoint);
  }
  return output.map(toPosition);
}

/**
 * Scale a list of vectors to a desired length.
 *
 * If limit is true, limiting the resulting length to half the minimum norm of all vectors, in order to avoid clashing
 * @param vectors
 * @param length
 * @param limit
 * @private
 */
function scaleTo(vectors: NDArray[], length: number, limit = true): NDArray[] {
  const norms = vectors.map(vector => vector.norm());
  if (limit) {
    const minNorm = Math.min(...norms);
    if (length >= minNorm) length = minNorm / 2.1;
  }
  return vectors.map((vector, i) => vector.scale(length / norms[i]));
}


function toVector(position: Position): NDArray {
  return array([position.x, position.y]);
}

function toPosition(vector: NDArray): Position {
  return {x: vector.x, y: vector.y}
}

