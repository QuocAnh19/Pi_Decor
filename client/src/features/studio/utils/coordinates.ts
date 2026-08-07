/**
 * Utility functions for coordinate conversions between normalized (0.0-1.0) space
 * and SVG pixel space.
 * 
 * Rules (AGENTS.md):
 * - Mọi slot position lưu trong DB phải là { x: 0.0–1.0, y: 0.0–1.0 }
 * - Hàm chuyển đổi duy nhất: normalizedToSVG(x, y, svgWidth, svgHeight)
 */

export interface Point {
  x: number
  y: number
}

/**
 * Converts SVG pixel coordinates to normalized 0.0–1.0 space.
 * Clamps coordinates to [0, 1].
 */
export function svgToNormalized(
  svgX: number,
  svgY: number,
  svgWidth: number,
  svgHeight: number
): Point {
  if (svgWidth <= 0 || svgHeight <= 0) {
    return { x: 0, y: 0 }
  }
  const x = Math.max(0, Math.min(1, svgX / svgWidth))
  const y = Math.max(0, Math.min(1, svgY / svgHeight))
  return { x, y }
}

/**
 * Converts normalized 0.0–1.0 space coordinates to SVG pixel coordinates.
 * Clamps output to [0, svgWidth] and [0, svgHeight].
 */
export function normalizedToSVG(
  normX: number,
  normY: number,
  svgWidth: number,
  svgHeight: number
): Point {
  const clampedX = Math.max(0, Math.min(1, normX))
  const clampedY = Math.max(0, Math.min(1, normY))
  
  const x = clampedX * svgWidth
  const y = clampedY * svgHeight
  return { x, y }
}
