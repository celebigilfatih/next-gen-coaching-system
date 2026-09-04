/**
 * SVG Export Utilities
 * Convert Konva stage to SVG format
 */

export interface SVGExportOptions {
  width?: number;
  height?: number;
  scale?: number;
  includeBackground?: boolean;
  backgroundColor?: string;
}

/**
 * Convert Konva Stage to SVG string
 * Note: This is a simplified implementation. For production, consider using konva-to-svg library
 */
export function stageToSVG(
  stage: any,
  options: SVGExportOptions = {}
): string {
  const {
    width = stage.width(),
    height = stage.height(),
    scale = 1,
    includeBackground = true,
    backgroundColor = "#00a000",
  } = options;

  const svgWidth = width * scale;
  const svgHeight = height * scale;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
`;

  // Add background
  if (includeBackground) {
    svg += `  <rect width="${width}" height="${height}" fill="${backgroundColor}"/>\n`;
  }

  // Get all layers
  const layers = stage.getLayers();
  
  layers.forEach((layer: any) => {
    if (!layer.visible()) return;
    
    svg += `  <g id="${layer.id() || 'layer'}">\n`;
    
    // Get all children (shapes)
    const children = layer.getChildren();
    children.forEach((node: any) => {
      svg += convertNodeToSVG(node, "    ");
    });
    
    svg += `  </g>\n`;
  });

  svg += `</svg>`;
  
  return svg;
}

/**
 * Convert a Konva node to SVG element
 */
function convertNodeToSVG(node: any, indent: string = ""): string {
  const className = node.getClassName();
  
  if (!node.visible()) return "";
  
  const attrs = {
    id: node.id(),
    opacity: node.opacity(),
    transform: getTransform(node),
  };

  switch (className) {
    case "Rect":
      return `${indent}<rect x="${node.x()}" y="${node.y()}" width="${node.width()}" height="${node.height()}" fill="${node.fill() || 'none'}" stroke="${node.stroke() || 'none'}" stroke-width="${node.strokeWidth() || 0}" ${serializeAttrs(attrs)}/>\n`;
    
    case "Circle":
      return `${indent}<circle cx="${node.x()}" cy="${node.y()}" r="${node.radius()}" fill="${node.fill() || 'none'}" stroke="${node.stroke() || 'none'}" stroke-width="${node.strokeWidth() || 0}" ${serializeAttrs(attrs)}/>\n`;
    
    case "Line":
      const points = node.points();
      const pointsStr = [];
      for (let i = 0; i < points.length; i += 2) {
        pointsStr.push(`${points[i]},${points[i + 1]}`);
      }
      return `${indent}<polyline points="${pointsStr.join(' ')}" fill="none" stroke="${node.stroke() || '#000'}" stroke-width="${node.strokeWidth() || 1}" ${serializeAttrs(attrs)}/>\n`;
    
    case "Path":
      return `${indent}<path d="${node.data()}" fill="${node.fill() || 'none'}" stroke="${node.stroke() || 'none'}" stroke-width="${node.strokeWidth() || 0}" ${serializeAttrs(attrs)}/>\n`;
    
    case "Text":
      return `${indent}<text x="${node.x()}" y="${node.y()}" font-size="${node.fontSize()}" font-family="${node.fontFamily() || 'Arial'}" fill="${node.fill() || '#000'}" ${serializeAttrs(attrs)}>${escapeXml(node.text())}</text>\n`;
    
    case "Arrow":
      const arrowPoints = node.points();
      const arrowPointsStr = [];
      for (let i = 0; i < arrowPoints.length; i += 2) {
        arrowPointsStr.push(`${arrowPoints[i]},${arrowPoints[i + 1]}`);
      }
      // Simplified arrow - doesn't include arrowhead geometry
      return `${indent}<polyline points="${arrowPointsStr.join(' ')}" fill="none" stroke="${node.stroke() || '#000'}" stroke-width="${node.strokeWidth() || 1}" marker-end="url(#arrowhead)" ${serializeAttrs(attrs)}/>\n`;
    
    case "Group":
      let groupSvg = `${indent}<g ${serializeAttrs(attrs)}>\n`;
      const children = node.getChildren();
      children.forEach((child: any) => {
        groupSvg += convertNodeToSVG(child, indent + "  ");
      });
      groupSvg += `${indent}</g>\n`;
      return groupSvg;
    
    case "RegularPolygon":
      const sides = node.sides();
      const radius = node.radius();
      const polygonPoints = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const px = node.x() + radius * Math.cos(angle);
        const py = node.y() + radius * Math.sin(angle);
        polygonPoints.push(`${px},${py}`);
      }
      return `${indent}<polygon points="${polygonPoints.join(' ')}" fill="${node.fill() || 'none'}" stroke="${node.stroke() || 'none'}" stroke-width="${node.strokeWidth() || 0}" ${serializeAttrs(attrs)}/>\n`;
    
    default:
      console.warn(`SVG export: Unknown node type ${className}`);
      return "";
  }
}

/**
 * Get transform string for SVG
 */
function getTransform(node: any): string {
  const transforms = [];
  
  const rotation = node.rotation();
  if (rotation) {
    transforms.push(`rotate(${rotation} ${node.x()} ${node.y()})`);
  }
  
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  if (scaleX !== 1 || scaleY !== 1) {
    transforms.push(`scale(${scaleX} ${scaleY})`);
  }
  
  return transforms.join(" ");
}

/**
 * Serialize attributes to string
 */
function serializeAttrs(attrs: Record<string, any>): string {
  return Object.entries(attrs)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Download SVG as file
 */
export function downloadSVG(svg: string, filename: string = "drill.svg") {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
