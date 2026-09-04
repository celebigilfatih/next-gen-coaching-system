/**
 * PlayDrill JSON Parser
 * Converts PlayDrill-style JSON to our internal canvas model
 */

export interface PlayDrillObject {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation?: number;
  color?: string;
  strokeWidth?: number;
  points?: number[];
  text?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  radius?: number;
  label?: string;
  svgUrl?: string;
  attachments?: string[]; // IDs of connected objects
  [key: string]: any;
}

export interface PlayDrillLayer {
  id: string;
  name: string;
  visible?: boolean;
  locked?: boolean;
  objects: PlayDrillObject[];
  order?: number;
}

export interface PlayDrillCanvas {
  version: string;
  fieldType?: string;
  width?: number;
  height?: number;
  layers: PlayDrillLayer[];
  colors?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation?: number;
  layerId?: string;
  [key: string]: any;
}

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
  elements: CanvasElement[];
}

export interface CanvasModel {
  version: string;
  pitchType: string;
  width: number;
  height: number;
  layers: CanvasLayer[];
  attachments: Record<string, string[]>; // object ID -> connected IDs
  metadata?: Record<string, any>;
}

const DEFAULT_COLORS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#8b5cf6",
};

/**
 * Convert PlayDrill object to our internal element format
 */
function convertPlayDrillObject(obj: PlayDrillObject, colorPalette: Record<string, string>): CanvasElement {
  const baseElement: CanvasElement = {
    id: obj.id,
    type: obj.type,
    x: obj.x || 0,
    y: obj.y || 0,
    rotation: obj.rotation || 0,
  };

  switch (obj.type) {
    case "player":
      return {
        ...baseElement,
        type: "player",
        team: obj.color && colorPalette[obj.color] ? obj.color : "blue",
        number: obj.label || "1",
        name: obj.text,
        radius: obj.radius || 18,
      };

    case "cone":
      return {
        ...baseElement,
        type: "cone",
        color: obj.color || colorPalette.orange || "#f97316",
        size: obj.radius || obj.width || 12,
      };

    case "ball":
      return {
        ...baseElement,
        type: "ball",
        radius: obj.radius || 12,
      };

    case "arrow":
      return {
        ...baseElement,
        type: "arrow",
        endX: obj.points && obj.points.length >= 4 ? obj.points[2] : obj.x + 60,
        endY: obj.points && obj.points.length >= 4 ? obj.points[3] : obj.y,
        color: obj.color || "#fbbf24",
        thickness: obj.strokeWidth || 3,
        style: obj.dashed ? "dashed" : "straight",
      };

    case "line":
      if (obj.points && obj.points.length >= 4) {
        return {
          ...baseElement,
          type: "line",
          points: obj.points,
          color: obj.color || "#fbbf24",
          thickness: obj.strokeWidth || 2,
          style: obj.dashed ? "dashed" : "solid",
        };
      }
      return {
        ...baseElement,
        type: "line",
        points: [obj.x, obj.y, obj.x + 60, obj.y],
        color: obj.color || "#fbbf24",
        thickness: obj.strokeWidth || 2,
        style: "solid",
      };

    case "circle":
      return {
        ...baseElement,
        type: "marker",
        shape: "circle",
        color: obj.color || "#fbbf24",
        size: obj.radius || 15,
      };

    case "polygon":
      // Convert polygon to marker or zone depending on size
      if (obj.points && obj.points.length >= 6) {
        const xs = obj.points.filter((_, i) => i % 2 === 0);
        const ys = obj.points.filter((_, i) => i % 2 === 1);
        const width = Math.max(...xs) - Math.min(...xs);
        const height = Math.max(...ys) - Math.min(...ys);
        
        if (width > 50 || height > 50) {
          return {
            ...baseElement,
            type: "zone",
            width,
            height,
            color: obj.color || "#3b82f6",
            opacity: obj.opacity || 0.3,
          };
        }
      }
      return {
        ...baseElement,
        type: "marker",
        shape: "triangle",
        color: obj.color || "#fbbf24",
        size: obj.radius || 15,
      };

    case "text":
      return {
        ...baseElement,
        type: "text",
        text: obj.text || "Text",
        fontSize: obj.fontSize || 16,
        color: obj.color || "#000000",
      };

    case "goal":
      return {
        ...baseElement,
        type: "goal",
        size: (obj.width && obj.width > 50) ? "large" : "small",
      };

    case "flag":
      return {
        ...baseElement,
        type: "flag",
        color: obj.color || "#ef4444",
        height: obj.height || 25,
      };

    case "wall":
      return {
        ...baseElement,
        type: "wall",
        width: obj.width || 80,
      };

    case "ladder":
      return {
        ...baseElement,
        type: "ladder",
        length: obj.height || obj.length || 100,
        rungs: obj.rungs || 10,
      };

    default:
      console.warn(`Unknown PlayDrill object type: ${obj.type}. Converting to marker.`);
      return {
        ...baseElement,
        type: "marker",
        shape: "circle",
        color: obj.color || "#fbbf24",
        size: 15,
      };
  }
}

/**
 * Parse PlayDrill JSON and convert to our canvas model
 */
export function convertPlayDrillToCanvas(playdrillData: PlayDrillCanvas): CanvasModel {
  const colorPalette = { ...DEFAULT_COLORS, ...(playdrillData.colors || {}) };
  
  // Map field type
  const pitchType = playdrillData.fieldType?.toLowerCase() || "full";
  
  // Process layers
  const layers: CanvasLayer[] = playdrillData.layers.map((layer, index) => {
    const elements = layer.objects.map(obj => convertPlayDrillObject(obj, colorPalette));
    
    return {
      id: layer.id || `layer-${index}`,
      name: layer.name || `Layer ${index + 1}`,
      visible: layer.visible !== false,
      locked: layer.locked || false,
      order: layer.order ?? index,
      elements,
    };
  });

  // Build attachment map
  const attachments: Record<string, string[]> = {};
  playdrillData.layers.forEach(layer => {
    layer.objects.forEach(obj => {
      if (obj.attachments && obj.attachments.length > 0) {
        attachments[obj.id] = obj.attachments;
      }
    });
  });

  return {
    version: playdrillData.version || "2.0",
    pitchType,
    width: playdrillData.width || 1050,
    height: playdrillData.height || 680,
    layers,
    attachments,
    metadata: playdrillData.metadata,
  };
}

/**
 * Convert our canvas model back to PlayDrill format
 */
export function convertCanvasToPlayDrill(canvas: CanvasModel): PlayDrillCanvas {
  const layers: PlayDrillLayer[] = canvas.layers.map(layer => {
    const objects: PlayDrillObject[] = layer.elements.map(el => {
      const base: PlayDrillObject = {
        id: el.id,
        type: el.type,
        x: el.x,
        y: el.y,
        rotation: el.rotation || 0,
      };

      // Add attachments if they exist
      if (canvas.attachments[el.id]) {
        base.attachments = canvas.attachments[el.id];
      }

      switch (el.type) {
        case "player":
          return {
            ...base,
            color: (el as any).team,
            label: (el as any).number,
            text: (el as any).name,
            radius: (el as any).radius || 18,
          };

        case "cone":
          return {
            ...base,
            color: (el as any).color,
            radius: (el as any).size || 12,
          };

        case "ball":
          return {
            ...base,
            radius: (el as any).radius || 12,
          };

        case "arrow":
          return {
            ...base,
            points: [el.x, el.y, (el as any).endX, (el as any).endY],
            color: (el as any).color,
            strokeWidth: (el as any).thickness,
            dashed: (el as any).style === "dashed",
          };

        case "line":
          return {
            ...base,
            points: (el as any).points,
            color: (el as any).color,
            strokeWidth: (el as any).thickness,
            dashed: (el as any).style === "dashed",
          };

        case "marker":
          return {
            ...base,
            type: "circle",
            color: (el as any).color,
            radius: (el as any).size,
          };

        case "text":
          return {
            ...base,
            text: (el as any).text,
            fontSize: (el as any).fontSize,
            color: (el as any).color,
          };

        case "zone":
          return {
            ...base,
            type: "polygon",
            width: (el as any).width,
            height: (el as any).height,
            color: (el as any).color,
            opacity: (el as any).opacity,
          };

        case "goal":
          return {
            ...base,
            width: (el as any).size === "large" ? 60 : 40,
          };

        case "flag":
          return {
            ...base,
            color: (el as any).color,
            height: (el as any).height,
          };

        case "wall":
          return {
            ...base,
            width: (el as any).width,
          };

        case "ladder":
          return {
            ...base,
            height: (el as any).length,
            rungs: (el as any).rungs,
          };

        default:
          return base;
      }
    });

    return {
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      locked: layer.locked,
      objects,
      order: layer.order,
    };
  });

  return {
    version: canvas.version,
    fieldType: canvas.pitchType,
    width: canvas.width,
    height: canvas.height,
    layers,
    metadata: canvas.metadata,
  };
}
