/**
 * Grid and Snap Utilities
 * Provides grid rendering and snap-to-grid functionality
 */

export interface GridConfig {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
}

export interface SnapConfig {
  enabled: boolean;
  threshold: number; // Distance in pixels to trigger snap
}

/**
 * Snap a coordinate to the nearest grid point
 */
export function snapToGrid(value: number, gridSize: number, enabled: boolean = true): number {
  if (!enabled || gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap a point (x, y) to the nearest grid intersection
 */
export function snapPointToGrid(
  x: number,
  y: number,
  gridSize: number,
  enabled: boolean = true
): { x: number; y: number } {
  return {
    x: snapToGrid(x, gridSize, enabled),
    y: snapToGrid(y, gridSize, enabled),
  };
}

/**
 * Check if a value is close enough to snap
 */
export function shouldSnap(value: number, target: number, threshold: number): boolean {
  return Math.abs(value - target) <= threshold;
}

/**
 * Find the nearest snap point from a list of targets
 */
export function findNearestSnapPoint(
  value: number,
  targets: number[],
  threshold: number
): number | null {
  let nearest: number | null = null;
  let minDistance = Infinity;

  for (const target of targets) {
    const distance = Math.abs(value - target);
    if (distance <= threshold && distance < minDistance) {
      nearest = target;
      minDistance = distance;
    }
  }

  return nearest;
}

/**
 * Get all grid line positions for a given dimension
 */
export function getGridLines(
  dimension: number,
  gridSize: number,
  start: number = 0
): number[] {
  const lines: number[] = [];
  for (let i = start; i <= dimension; i += gridSize) {
    lines.push(i);
  }
  return lines;
}

/**
 * Generate grid snap points from object positions
 */
export interface SnapPoint {
  x: number;
  y: number;
  type: "center" | "edge" | "corner";
  objectId: string;
}

export function generateObjectSnapPoints(
  objects: Array<{
    id: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  }>
): SnapPoint[] {
  const points: SnapPoint[] = [];

  objects.forEach(obj => {
    // Center point
    points.push({
      x: obj.x,
      y: obj.y,
      type: "center",
      objectId: obj.id,
    });

    // If object has dimensions, add edge and corner points
    if (obj.width && obj.height) {
      const halfW = obj.width / 2;
      const halfH = obj.height / 2;

      // Corners
      points.push(
        { x: obj.x - halfW, y: obj.y - halfH, type: "corner", objectId: obj.id },
        { x: obj.x + halfW, y: obj.y - halfH, type: "corner", objectId: obj.id },
        { x: obj.x - halfW, y: obj.y + halfH, type: "corner", objectId: obj.id },
        { x: obj.x + halfW, y: obj.y + halfH, type: "corner", objectId: obj.id }
      );

      // Edges
      points.push(
        { x: obj.x, y: obj.y - halfH, type: "edge", objectId: obj.id },
        { x: obj.x, y: obj.y + halfH, type: "edge", objectId: obj.id },
        { x: obj.x - halfW, y: obj.y, type: "edge", objectId: obj.id },
        { x: obj.x + halfW, y: obj.y, type: "edge", objectId: obj.id }
      );
    }
  });

  return points;
}

/**
 * Snap to nearest object anchor point
 */
export function snapToObjects(
  x: number,
  y: number,
  snapPoints: SnapPoint[],
  threshold: number,
  excludeObjectId?: string
): { x: number; y: number; snapped: boolean } {
  const filteredPoints = excludeObjectId
    ? snapPoints.filter(p => p.objectId !== excludeObjectId)
    : snapPoints;

  const nearestX = findNearestSnapPoint(
    x,
    filteredPoints.map(p => p.x),
    threshold
  );
  const nearestY = findNearestSnapPoint(
    y,
    filteredPoints.map(p => p.y),
    threshold
  );

  return {
    x: nearestX !== null ? nearestX : x,
    y: nearestY !== null ? nearestY : y,
    snapped: nearestX !== null || nearestY !== null,
  };
}

/**
 * Default grid configuration
 */
export const DEFAULT_GRID_CONFIG: GridConfig = {
  enabled: false,
  size: 20,
  color: "#ffffff",
  opacity: 0.2,
};

export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: false,
  threshold: 10,
};
