
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText, Arrow, Wedge, RegularPolygon, Path, Transformer, Group } from "react-konva";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Target, Save, Download, Upload, Trash2, Undo2, Redo2, X,
  Circle as CircleIcon, Triangle, Square, ArrowRight, Type, Pencil,
  Flag, Goal, Shield, Move, Box, DivideSquare, TrendingUp,
  Disc, Cone, Users2, Minimize2, Maximize2, Grid3x3, FileImage, Keyboard,
} from "lucide-react";
import { 
  GiSoccerBall, 
  GiWhistle, 
  GiGoalKeeper,
  GiTrafficCone,
  GiSoccerField,
} from "react-icons/gi";
import { 
  FaFlagCheckered,
  FaUsers,
} from "react-icons/fa";
import { 
  IoFootball 
} from "react-icons/io5";
import { 
  MdSportsScore,
  MdOutlineGridOn,
} from "react-icons/md";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { stageToSVG, downloadSVG } from "@/lib/svg-export";
import { convertPlayDrillToCanvas, convertCanvasToPlayDrill } from "@/lib/playdrill-parser";
import { snapPointToGrid, DEFAULT_GRID_CONFIG, getGridLines } from "@/lib/grid-snap";

// Types
type PitchType = "full" | "half" | "third" | "quarter" | "mini7" | "mini5" | "training" | "grid" | "penalty" | "corner" | "freekick";

interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation?: number;
}

interface PlayerElement extends BaseElement {
  type: "player";
  team: "red" | "orange" | "yellow" | "black";
  number: string;
  name?: string;
  radius?: number;
}

interface BallElement extends BaseElement {
  type: "ball";
  radius?: number;
}

interface ConeElement extends BaseElement {
  type: "cone";
  color: string;
  size?: number;
}

interface GoalElement extends BaseElement {
  type: "goal";
  size: "large" | "small";
}

interface FlagElement extends BaseElement {
  type: "flag";
  color: string;
  height?: number;
}

interface WallElement extends BaseElement {
  type: "wall";
  width: number;
}

interface LadderElement extends BaseElement {
  type: "ladder";
  length: number;
  rungs: number;
}

interface MarkerElement extends BaseElement {
  type: "marker";
  shape: "circle" | "square" | "triangle" | "x";
  color: string;
  size: number;
}

interface GoalkeeperElement extends BaseElement {
  type: "goalkeeper";
  size?: number;
}

interface ArrowElement extends BaseElement {
  type: "arrow";
  endX: number;
  endY: number;
  color: string;
  thickness: number;
  style: "straight" | "curved" | "dashed";
}

interface LineElement extends BaseElement {
  type: "line";
  points: number[];
  color: string;
  thickness: number;
  style: "solid" | "dashed";
}

interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
}

interface ZoneElement extends BaseElement {
  type: "zone";
  width: number;
  height: number;
  color: string;
  opacity: number;
}

type DrillElement = PlayerElement | BallElement | ConeElement | GoalElement | FlagElement | 
  WallElement | LadderElement | MarkerElement | GoalkeeperElement | ArrowElement | LineElement | TextElement | ZoneElement;

const PITCH_CONFIGS = {
  full: { width: 1200, height: 800, name: "Tam Saha (11v11)" },
  half: { width: 800, height: 600, name: "Yarım Saha" },
  third: { width: 800, height: 450, name: "1/3 Saha" },
  quarter: { width: 800, height: 350, name: "1/4 Saha" },
  mini7: { width: 950, height: 650, name: "Mini Saha (7v7)" },
  mini5: { width: 800, height: 550, name: "Mini Saha (5v5)" },
  training: { width: 750, height: 550, name: "Antrenman Alanı" },
  grid: { width: 650, height: 650, name: "Grid / Rondo" },
  penalty: { width: 600, height: 500, name: "Penaltı Sahası" },
  corner: { width: 500, height: 500, name: "Korner Çalışması" },
  freekick: { width: 600, height: 500, name: "Serbest Vuruş" },
};

// Formation Templates - positions are in percentages of field dimensions
type FormationTemplate = {
  name: string;
  positions: Array<{ x: number; y: number; role?: string }>;
};

const FORMATIONS: Record<string, FormationTemplate> = {
  "4-4-2": {
    name: "4-4-2",
    positions: [
      { x: 0.15, y: 0.5, role: "GK" },     // Goalkeeper
      { x: 0.25, y: 0.2, role: "LB" },     // Left Back
      { x: 0.25, y: 0.4, role: "LCB" },    // Left Center Back
      { x: 0.25, y: 0.6, role: "RCB" },    // Right Center Back
      { x: 0.25, y: 0.8, role: "RB" },     // Right Back
      { x: 0.5, y: 0.2, role: "LM" },      // Left Midfielder
      { x: 0.5, y: 0.4, role: "LCM" },     // Left Center Mid
      { x: 0.5, y: 0.6, role: "RCM" },     // Right Center Mid
      { x: 0.5, y: 0.8, role: "RM" },      // Right Midfielder
      { x: 0.75, y: 0.35, role: "ST" },    // Striker 1
      { x: 0.75, y: 0.65, role: "ST" },    // Striker 2
    ],
  },
  "4-3-3": {
    name: "4-3-3",
    positions: [
      { x: 0.15, y: 0.5, role: "GK" },
      { x: 0.25, y: 0.2, role: "LB" },
      { x: 0.25, y: 0.4, role: "LCB" },
      { x: 0.25, y: 0.6, role: "RCB" },
      { x: 0.25, y: 0.8, role: "RB" },
      { x: 0.5, y: 0.3, role: "LCM" },
      { x: 0.5, y: 0.5, role: "CDM" },
      { x: 0.5, y: 0.7, role: "RCM" },
      { x: 0.75, y: 0.2, role: "LW" },
      { x: 0.75, y: 0.5, role: "ST" },
      { x: 0.75, y: 0.8, role: "RW" },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    positions: [
      { x: 0.15, y: 0.5, role: "GK" },
      { x: 0.25, y: 0.2, role: "LB" },
      { x: 0.25, y: 0.4, role: "LCB" },
      { x: 0.25, y: 0.6, role: "RCB" },
      { x: 0.25, y: 0.8, role: "RB" },
      { x: 0.45, y: 0.4, role: "LDM" },
      { x: 0.45, y: 0.6, role: "RDM" },
      { x: 0.6, y: 0.2, role: "LW" },
      { x: 0.6, y: 0.5, role: "CAM" },
      { x: 0.6, y: 0.8, role: "RW" },
      { x: 0.8, y: 0.5, role: "ST" },
    ],
  },
  "3-5-2": {
    name: "3-5-2",
    positions: [
      { x: 0.15, y: 0.5, role: "GK" },
      { x: 0.25, y: 0.3, role: "LCB" },
      { x: 0.25, y: 0.5, role: "CB" },
      { x: 0.25, y: 0.7, role: "RCB" },
      { x: 0.5, y: 0.15, role: "LWB" },
      { x: 0.5, y: 0.35, role: "LCM" },
      { x: 0.5, y: 0.5, role: "CM" },
      { x: 0.5, y: 0.65, role: "RCM" },
      { x: 0.5, y: 0.85, role: "RWB" },
      { x: 0.75, y: 0.35, role: "ST" },
      { x: 0.75, y: 0.65, role: "ST" },
    ],
  },
  "3-4-3": {
    name: "3-4-3",
    positions: [
      { x: 0.15, y: 0.5, role: "GK" },
      { x: 0.25, y: 0.3, role: "LCB" },
      { x: 0.25, y: 0.5, role: "CB" },
      { x: 0.25, y: 0.7, role: "RCB" },
      { x: 0.5, y: 0.2, role: "LM" },
      { x: 0.5, y: 0.4, role: "LCM" },
      { x: 0.5, y: 0.6, role: "RCM" },
      { x: 0.5, y: 0.8, role: "RM" },
      { x: 0.75, y: 0.2, role: "LW" },
      { x: 0.75, y: 0.5, role: "ST" },
      { x: 0.75, y: 0.8, role: "RW" },
    ],
  },
  "5-3-2": {
    name: "5-3-2",
    positions: [
      { x: 0.15, y: 0.5, role: "GK" },
      { x: 0.25, y: 0.15, role: "LWB" },
      { x: 0.25, y: 0.35, role: "LCB" },
      { x: 0.25, y: 0.5, role: "CB" },
      { x: 0.25, y: 0.65, role: "RCB" },
      { x: 0.25, y: 0.85, role: "RWB" },
      { x: 0.55, y: 0.3, role: "LCM" },
      { x: 0.55, y: 0.5, role: "CM" },
      { x: 0.55, y: 0.7, role: "RCM" },
      { x: 0.8, y: 0.35, role: "ST" },
      { x: 0.8, y: 0.65, role: "ST" },
    ],
  },
};

// Render pitch lines
const renderPitchLines = (type: PitchType, config: any) => {
  const w = config.width;
  const h = config.height;
  const lines = [];

  // Helper function to add corner arcs to all field types
  const addCornerArcs = (radius: number = 10) => {
    // Top-left
    lines.push(
      <Path 
        key="corner-tl" 
        data={`M 5 ${5 + radius} A ${radius} ${radius} 0 0 1 ${5 + radius} 5`}
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    // Top-right
    lines.push(
      <Path 
        key="corner-tr" 
        data={`M ${w - 5 - radius} 5 A ${radius} ${radius} 0 0 1 ${w - 5} ${5 + radius}`}
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    // Bottom-left
    lines.push(
      <Path 
        key="corner-bl" 
        data={`M 5 ${h - 5 - radius} A ${radius} ${radius} 0 0 0 ${5 + radius} ${h - 5}`}
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    // Bottom-right
    lines.push(
      <Path 
        key="corner-br" 
        data={`M ${w - 5 - radius} ${h - 5} A ${radius} ${radius} 0 0 0 ${w - 5} ${h - 5 - radius}`}
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
  };

  // Border - stroke only, no fill
  lines.push(
    <Rect key="border" x={5} y={5} width={w - 10} height={h - 10} stroke="#ffffff" strokeWidth={3} />
  );

  if (type === "full") {
    // Standard football pitch: 105m x 68m scaled to 1050x680 (10px = 1m)
    // Field is horizontal (landscape) - width is 105m, height is 68m
    const centerX = w / 2;
    const centerY = h / 2;
    
    // Center line (vertical down the middle)
    lines.push(<Line key="center-line" points={[centerX, 5, centerX, h - 5]} stroke="#ffffff" strokeWidth={2} />);
    
    // Center circle (radius 9.15m = 91.5px)
    lines.push(<Circle key="center-circle" x={centerX} y={centerY} radius={91.5} stroke="#ffffff" strokeWidth={2} />);
    lines.push(<Circle key="center-dot" x={centerX} y={centerY} radius={7.5} fill="#ffffff" stroke="none" />);
    
    // Penalty areas: 16.5m deep x 40.32m wide
    const penaltyDepth = 165;  // 16.5m from goal line
    const penaltyWidth = 403.2; // 40.32m wide
    const goalAreaDepth = 55;   // 5.5m from goal line
    const goalAreaWidth = 183.2; // 18.32m wide
    
    // Left penalty area
    lines.push(
      <Rect 
        key="penalty-left" 
        x={5} 
        y={centerY - penaltyWidth / 2} 
        width={penaltyDepth} 
        height={penaltyWidth} 
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Left goal area
    lines.push(
      <Rect 
        key="goal-area-left" 
        x={5} 
        y={centerY - goalAreaWidth / 2} 
        width={goalAreaDepth} 
        height={goalAreaWidth} 
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Left penalty spot (11m from goal line = 110px)
    const penaltySpotDistance = 110;
    lines.push(<Circle key="penalty-spot-left" x={5 + penaltySpotDistance} y={centerY} radius={7.5} fill="#ffffff" stroke="none" />);
    
    // Left penalty arc
    const arcRadius = 91.5;
    const arcCenterX = 5 + penaltySpotDistance;
    const penaltyLineX = 5 + penaltyDepth;
    const arcStartAngle = Math.acos((penaltyLineX - arcCenterX) / arcRadius);
    const arcStartY = centerY - arcRadius * Math.sin(arcStartAngle);
    const arcEndY = centerY + arcRadius * Math.sin(arcStartAngle);
    
    lines.push(
      <Path 
        key="penalty-arc-left" 
        data={`M ${penaltyLineX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 1 ${penaltyLineX} ${arcEndY}`}
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Right penalty area
    lines.push(
      <Rect 
        key="penalty-right" 
        x={w - 5 - penaltyDepth} 
        y={centerY - penaltyWidth / 2} 
        width={penaltyDepth} 
        height={penaltyWidth} 
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Right goal area
    lines.push(
      <Rect 
        key="goal-area-right" 
        x={w - 5 - goalAreaDepth} 
        y={centerY - goalAreaWidth / 2} 
        width={goalAreaDepth} 
        height={goalAreaWidth} 
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Right penalty spot
    lines.push(<Circle key="penalty-spot-right" x={w - 5 - penaltySpotDistance} y={centerY} radius={7.5} fill="#ffffff" stroke="none" />);
    
    // Right penalty arc
    const arcCenterXRight = w - 5 - penaltySpotDistance;
    const penaltyLineXRight = w - 5 - penaltyDepth;
    const arcStartAngleRight = Math.acos((arcCenterXRight - penaltyLineXRight) / arcRadius);
    const arcStartYRight = centerY - arcRadius * Math.sin(arcStartAngleRight);
    const arcEndYRight = centerY + arcRadius * Math.sin(arcStartAngleRight);
    
    lines.push(
      <Path 
        key="penalty-arc-right" 
        data={`M ${penaltyLineXRight} ${arcStartYRight} A ${arcRadius} ${arcRadius} 0 0 0 ${penaltyLineXRight} ${arcEndYRight}`}
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Corner arcs
    addCornerArcs(10);
  }

  if (type === "half") {
    const centerX = w / 2;
    const penaltyWidth = 403.2;
    const penaltyDepth = 165;
    const goalAreaWidth = 183;
    const goalAreaDepth = 55;
    const centerCircleRadius = 91.5;
    
    // Half of center circle at bottom
    lines.push(<Path 
        key="center-circle-half" 
        data={`M ${centerX - centerCircleRadius} ${h - 5} A ${centerCircleRadius} ${centerCircleRadius} 0 0 1 ${centerX + centerCircleRadius} ${h - 5}`}
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    lines.push(<Circle key="center-dot" x={centerX} y={h - 5} radius={3} fill="#ffffff" />);
    
    // Penalty area
    lines.push(
      <Rect 
        key="penalty" 
        x={centerX - penaltyWidth / 2} 
        y={5} 
        width={penaltyWidth} 
        height={penaltyDepth} 
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Goal area
    lines.push(
      <Rect 
        key="goal-area" 
        x={centerX - goalAreaWidth / 2} 
        y={5} 
        width={goalAreaWidth} 
        height={goalAreaDepth} 
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Penalty spot
    lines.push(<Circle key="penalty-spot" x={centerX} y={115} radius={2} fill="white" />);
    
    // Penalty arc
    const arcRadius = 91.5;
    const arcCenterY = 115;
    const penaltyLineY = 5 + penaltyDepth;
    const arcStartAngle = Math.acos((penaltyLineY - arcCenterY) / arcRadius);
    const arcStartX = centerX - arcRadius * Math.sin(arcStartAngle);
    const arcEndX = centerX + arcRadius * Math.sin(arcStartAngle);
    
    lines.push(
      <Path 
        key="penalty-arc" 
        data={`M ${arcStartX} ${penaltyLineY} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndX} ${penaltyLineY}`}
        stroke="#ffffff" 
        strokeWidth={2}
      />
    );
    
    // Corner arcs
    addCornerArcs(10);
  }

  if (type === "third") {
    lines.push(
      <Rect key="penalty" x={w / 2 - 200} y={5} width={400} height={150} stroke="#ffffff" strokeWidth={2} />
    );
    lines.push(
      <Rect key="goal-box" x={w / 2 - 100} y={5} width={200} height={50} stroke="#ffffff" strokeWidth={2} />
    );
    lines.push(<Circle key="penalty-dot" x={w / 2} y={105} radius={3} fill="white" />);
    
    // Corner arcs
    addCornerArcs(8);
  }

  if (type === "mini7") {
    lines.push(<Line key="center" points={[w / 2, 5, w / 2, h - 5]} stroke="#ffffff" strokeWidth={2} />);
    lines.push(<Circle key="center-circle" x={w / 2} y={h / 2} radius={60} stroke="#ffffff" strokeWidth={2} />);
    lines.push(
      <Rect key="penalty-top" x={w / 2 - 150} y={5} width={300} height={120} stroke="#ffffff" strokeWidth={2} />
    );
    lines.push(
      <Rect key="penalty-bottom" x={w / 2 - 150} y={h - 125} width={300} height={120} stroke="#ffffff" strokeWidth={2} />
    );
    
    // Corner arcs
    addCornerArcs(8);
  }

  if (type === "mini5") {
    lines.push(<Line key="center" points={[w / 2, 5, w / 2, h - 5]} stroke="#ffffff" strokeWidth={2} />);
    lines.push(<Circle key="center-circle" x={w / 2} y={h / 2} radius={50} stroke="#ffffff" strokeWidth={2} />);
    lines.push(
      <Rect key="penalty-top" x={w / 2 - 100} y={5} width={200} height={70} stroke="#ffffff" strokeWidth={2} />
    );
    lines.push(
      <Rect key="penalty-bottom" x={w / 2 - 100} y={h - 75} width={200} height={70} stroke="#ffffff" strokeWidth={2} />
    );
    
    // Corner arcs
    addCornerArcs(8);
  }

  if (type === "penalty") {
    // Sadece penaltı sahası
    lines.push(
      <Rect key="penalty" x={w / 2 - 200} y={5} width={400} height={150} stroke="#ffffff" strokeWidth={2} />
    );
    lines.push(
      <Rect key="goal-box" x={w / 2 - 100} y={5} width={200} height={50} stroke="#ffffff" strokeWidth={2} />
    );
    lines.push(<Circle key="penalty-dot" x={w / 2} y={105} radius={3} fill="white" />);
    lines.push(<Circle key="penalty-arc" x={w / 2} y={105} radius={70} stroke="#ffffff" strokeWidth={2} />);
    
    // Corner arcs
    addCornerArcs(8);
  }

  if (type === "corner") {
    // Korner bölgesi
    lines.push(<Path key="corner-arc" data="M 5 70 Q 5 5 70 5" stroke="#ffffff" strokeWidth={2} />);
    lines.push(<Rect key="corner-box" x={5} y={5} width={60} height={60} stroke="#ffffff" strokeWidth={2} dash={[5, 5]} />);
  }

  if (type === "freekick") {
    // Serbest vuruş sahası - penaltı çizgisi önü
    lines.push(
      <Rect key="penalty" x={w / 2 - 200} y={h - 155} width={400} height={150} stroke="#ffffff" strokeWidth={2} />
    );
    lines.push(<Circle key="ball-spot" x={w / 2} y={h - 250} radius={5} fill="#ffffff" />);
    lines.push(<Circle key="wall-distance" x={w / 2} y={h - 250} radius={70} stroke="#ffffff" strokeWidth={2} dash={[5, 5]} />);
    
    // Corner arcs
    addCornerArcs(8);
  }

  if (type === "grid") {
    // 4x4 grid
    lines.push(<Rect key="grid-border" x={5} y={5} width={w-10} height={h-10} stroke="#ffffff" strokeWidth={2} />);
    const cellW = (w - 10) / 4;
    const cellH = (h - 10) / 4;
    for (let i = 1; i < 4; i++) {
      lines.push(<Line key={`v${i}`} points={[5 + cellW * i, 5, 5 + cellW * i, h - 5]} stroke="#ffffff" strokeWidth={1} opacity={0.5} />);
      lines.push(<Line key={`h${i}`} points={[5, 5 + cellH * i, w - 5, 5 + cellH * i]} stroke="#ffffff" strokeWidth={1} opacity={0.5} />);
    }
    // No corner arcs for grid
  }

  if (type === "training") {
    // Simple training area with center circle
    lines.push(<Circle key="center-circle" x={w / 2} y={h / 2} radius={50} stroke="#ffffff" strokeWidth={2} />);
    lines.push(<Circle key="center-dot" x={w / 2} y={h / 2} radius={3} fill="#ffffff" />);
    
    // Corner arcs
    addCornerArcs(8);
  }

  return lines;
};

export default function TacticalBoardPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pitchType, setPitchType] = useState<PitchType>("full");
  const [elements, setElements] = useState<DrillElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<string | null>(null);
  const [history, setHistory] = useState<DrillElement[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [gridConfig, setGridConfig] = useState(DEFAULT_GRID_CONFIG);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<string>("");
  const [selectedAwayFormation, setSelectedAwayFormation] = useState<string>("");
  const [homeTeamColor, setHomeTeamColor] = useState<"red" | "orange" | "yellow" | "black">("orange");
  const [awayTeamColor, setAwayTeamColor] = useState<"red" | "orange" | "yellow" | "black">("red");
  const [firstFormationTeam, setFirstFormationTeam] = useState<string | null>(null);
  
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const pitchConfig = PITCH_CONFIGS[pitchType];
  const selectedElement = elements.find((el) => el.id === selectedId);

  // Force re-render when pitch type changes
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.batchDraw();
    }
  }, [pitchType]);

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const stage = stageRef.current;
      if (!stage) return;
      
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const addToHistory = (newElements: DrillElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(newElements);
  };

  const addElement = (element: DrillElement) => {
    addToHistory([...elements, element]);
    // Tool artık kapanmıyor - sabit kalıyor
  };

  const updateElement = (id: string, updates: any) => {
    addToHistory(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id: string) => {
    addToHistory(elements.filter((el) => el.id !== id));
    setSelectedId(null);
  };

  const applyFormation = (formationKey: string, team: "red" | "orange" | "yellow" | "black" = "orange") => {
    const formation = FORMATIONS[formationKey];
    if (!formation) return;

    const width = pitchConfig.width;
    const height = pitchConfig.height;
    
    console.log('Before removal:', {
      totalElements: elements.length,
      players: elements.filter(el => el.type === "player").length,
      thisTeamPlayers: elements.filter(el => el.type === "player" && el.team === team).length
    });
    
    // Remove ALL existing players of the selected team first
    const elementsWithoutThisTeam = elements.filter(el => {
      // Keep if it's not a player
      if (el.type !== "player") return true;
      // Remove if it's this team's player
      if (el.team === team) return false;
      // Keep if it's another team's player
      return true;
    });
    
    console.log('After removal:', {
      totalElements: elementsWithoutThisTeam.length,
      players: elementsWithoutThisTeam.filter(el => el.type === "player").length
    });
    
    // Check if any OTHER team already has players (not this team)
    const otherTeamHasPlayers = elementsWithoutThisTeam.some(el => el.type === "player");
    
    // First team = no other teams have players yet
    const isFirstTeam = !otherTeamHasPlayers;
    
    // Create new players based on formation
    // Field is landscape (1050x680), split teams horizontally: left half (0-0.5) and right half (0.5-1.0)
    const newPlayers: PlayerElement[] = formation.positions.map((pos, idx) => {
      let x, y;
      
      if (isFirstTeam) {
        // First team: left half of the field (scale X to 0-0.5 range)
        x = (pos.x * 0.5) * width;  // Compress to left half
        y = pos.y * height;
      } else {
        // Second team: right half of the field (scale X to 0.5-1.0 range, mirrored)
        x = (0.5 + (1 - pos.x) * 0.5) * width;  // Compress to right half, mirrored
        y = pos.y * height;
      }
      
      return {
        id: `player-${team}-${Date.now()}-${idx}`,
        type: "player" as const,
        x,
        y,
        team,
        number: String(idx + 1),
        radius: 20,
      };
    });
    
    console.log('New players to add:', newPlayers.length);

    addToHistory([...elementsWithoutThisTeam, ...newPlayers]);
    
    // Update the appropriate formation state
    if (isFirstTeam) {
      setSelectedFormation(formationKey);
      setFirstFormationTeam(team);
    } else {
      setSelectedAwayFormation(formationKey);
    }
  };

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage() || e.target.getClassName() === "Rect") {
      setSelectedId(null);
      
      if (tool) {
        const pos = e.target.getStage().getPointerPosition();
        const id = `${tool}-${Date.now()}`;

        const toolActions: Record<string, () => void> = {
          "player-red": () => addElement({ id, type: "player", x: pos.x, y: pos.y, team: "red", number: "1" }),
          "player-orange": () => addElement({ id, type: "player", x: pos.x, y: pos.y, team: "orange", number: "1" }),
          "player-yellow": () => addElement({ id, type: "player", x: pos.x, y: pos.y, team: "yellow", number: "1" }),
          "player-black": () => addElement({ id, type: "player", x: pos.x, y: pos.y, team: "black", number: "1" }),
          "ball": () => addElement({ id, type: "ball", x: pos.x, y: pos.y }),
          "cone": () => addElement({ id, type: "cone", x: pos.x, y: pos.y, color: "#f97316" }),
          "goal-large": () => addElement({ id, type: "goal", x: pos.x, y: pos.y, size: "large" }),
          "goal-small": () => addElement({ id, type: "goal", x: pos.x, y: pos.y, size: "small" }),
          "flag": () => addElement({ id, type: "flag", x: pos.x, y: pos.y, color: "#ef4444" }),
          "wall": () => addElement({ id, type: "wall", x: pos.x, y: pos.y, width: 80 }),
          "ladder": () => addElement({ id, type: "ladder", x: pos.x, y: pos.y, length: 100, rungs: 10 }),
          "goalkeeper": () => addElement({ id, type: "goalkeeper", x: pos.x, y: pos.y }),
          "marker-circle": () => addElement({ id, type: "marker", x: pos.x, y: pos.y, shape: "circle", color: "#fbbf24", size: 15 }),
          "marker-square": () => addElement({ id, type: "marker", x: pos.x, y: pos.y, shape: "square", color: "#fbbf24", size: 15 }),
          "marker-triangle": () => addElement({ id, type: "marker", x: pos.x, y: pos.y, shape: "triangle", color: "#fbbf24", size: 15 }),
          "marker-x": () => addElement({ id, type: "marker", x: pos.x, y: pos.y, shape: "x", color: "#fbbf24", size: 15 }),
          "zone": () => addElement({ id, type: "zone", x: pos.x, y: pos.y, width: 100, height: 100, color: "#f97316", opacity: 0.3 }),
          "text": () => addElement({ id, type: "text", x: pos.x, y: pos.y, text: "Metin", fontSize: 16, color: "#000000" }),
          "line": () => setTool("line"),
          "arrow-straight": () => addElement({ id, type: "arrow", x: pos.x, y: pos.y, endX: pos.x + 60, endY: pos.y, color: "#fbbf24", thickness: 3, style: "straight" }),
          "arrow-curved": () => addElement({ id, type: "arrow", x: pos.x, y: pos.y, endX: pos.x + 60, endY: pos.y, color: "#fbbf24", thickness: 3, style: "curved" }),
          "arrow-dashed": () => addElement({ id, type: "arrow", x: pos.x, y: pos.y, endX: pos.x + 60, endY: pos.y, color: "#fbbf24", thickness: 2, style: "dashed" }),
        };

        toolActions[tool]?.();
      }
    }
  };

  const handleMouseDown = (e: any) => {
    if (tool === "draw" || tool === "line") {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      setCurrentLine([pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || (tool !== "draw" && tool !== "line")) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentLine([...currentLine, pos.x, pos.y]);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentLine.length > 2) {
      addElement({
        id: `line-${Date.now()}`,
        type: "line",
        x: 0,
        y: 0,
        points: currentLine,
        color: "#fbbf24",
        thickness: 3,
        style: tool === "line" ? "solid" : "solid",
      });
      setCurrentLine([]);
    }
    setIsDrawing(false);
  };

  const saveDrill = async () => {
    const token = (session as any)?.accessToken;
    if (!token) return alert("⚠️ Lütfen giriş yapın");
    
    const title = prompt("Antrenman adı:");
    if (!title) return;

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/drills", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title, category: "TACTICAL", ageGroup: "U12", durationMin: 30, difficulty: "MEDIUM",
        jsonData: { pitchType, elements, version: "2.0" },
      }),
    });
    alert(res.ok ? "✅ Kaydedildi" : "❌ Hata");
  };

  const exportPNG = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = `tactic-${Date.now()}.png`;
    link.href = uri;
    link.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ pitchType, elements }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `tactic-${Date.now()}.json`;
    link.href = url;
    link.click();
  };

  const importJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Check if it's PlayDrill format
          if (data.layers && Array.isArray(data.layers)) {
            const canvasModel = convertPlayDrillToCanvas(data);
            setPitchType(canvasModel.pitchType as PitchType);
            // Flatten all layers and convert each element properly
            const allElements: DrillElement[] = [];
            canvasModel.layers.forEach(layer => {
              layer.elements.forEach((el: any) => {
                allElements.push(el as DrillElement);
              });
            });
            addToHistory(allElements);
            alert("✅ PlayDrill JSON yüklendi");
          } else if (data.pitchType && data.elements) {
            // Our internal format
            setPitchType(data.pitchType);
            addToHistory(data.elements);
            alert("✅ Yüklendi");
          } else {
            alert("❌ Bilinmeyen format");
          }
        } catch (err) { 
          console.error(err);
          alert("❌ Geçersiz dosya"); 
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const exportSVG = () => {
    if (!stageRef.current) return;
    const svg = stageToSVG(stageRef.current, {
      includeBackground: true,
      backgroundColor: "#00a000",
    });
    downloadSVG(svg, `drill-${Date.now()}.svg`);
  };

  const exportPlayDrill = () => {
    const canvasModel = {
      version: "2.0",
      pitchType,
      width: pitchConfig.width,
      height: pitchConfig.height,
      layers: [
        {
          id: "layer-1",
          name: "Main Layer",
          visible: true,
          locked: false,
          order: 0,
          elements,
        },
      ],
      attachments: {},
      metadata: { createdAt: new Date().toISOString() },
    };
    
    const playdrillData = convertCanvasToPlayDrill(canvasModel);
    const blob = new Blob([JSON.stringify(playdrillData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `playdrill-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const nudgeSelectedElement = (dx: number, dy: number) => {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    updateElement(selectedId, { x: el.x + dx, y: el.y + dy });
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    const newEl = { ...el, id: `${el.type}-${Date.now()}`, x: el.x + 20, y: el.y + 20 };
    addElement(newEl);
    setSelectedId(newEl.id);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: () => {
      if (historyStep > 0) {
        setHistoryStep(historyStep - 1);
        setElements(history[historyStep - 1]);
      }
    },
    onRedo: () => {
      if (historyStep < history.length - 1) {
        setHistoryStep(historyStep + 1);
        setElements(history[historyStep + 1]);
      }
    },
    onDelete: () => selectedId && deleteElement(selectedId),
    onDuplicate: duplicateSelected,
    onNudgeUp: () => nudgeSelectedElement(0, -1),
    onNudgeDown: () => nudgeSelectedElement(0, 1),
    onNudgeLeft: () => nudgeSelectedElement(-1, 0),
    onNudgeRight: () => nudgeSelectedElement(1, 0),
    onSave: saveDrill,
    onExport: exportPNG,
    enabled: true,
  });

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Tools moved below top bar in horizontal layout */}
          <div className="fixed top-[57px] left-0 right-0 lg:left-64 border-b bg-background p-2 overflow-x-auto z-30">
            <div className="flex gap-4 min-w-max">
              {/* Players Group */}
              <div className="flex flex-col gap-1 border-r pr-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Oyuncular</span>
                <div className="flex space-x-1">
                  {["player-red", "player-orange", "player-yellow", "player-black"].map((key, idx) => {
                    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-gray-900"];
                    const labels = ["🔴", "🟠", "🟡", "⚫"];
                    return (
                      <Button
                        key={key}
                        variant={tool === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTool(key)}
                        className={`p-2 ${tool === key ? 'ring-2 ring-primary' : ''}`}
                        title={labels[idx]}
                      >
                        <div className={`w-4 h-4 rounded-full ${colors[idx]} ${tool === key ? 'ring-2 ring-white' : ''}`} />
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              {/* Objects Group */}
              <div className="flex flex-col gap-1 border-r pr-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Nesneler</span>
                <div className="flex space-x-1">
                  <Button variant={tool === "ball" ? "default" : "outline"} size="sm" onClick={() => setTool("ball")} className="p-2" title="Top">
                    <GiSoccerBall className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "cone" ? "default" : "outline"} size="sm" onClick={() => setTool("cone")} className="p-2" title="Koni">
                    <GiTrafficCone className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "goal-large" ? "default" : "outline"} size="sm" onClick={() => setTool("goal-large")} className="p-2" title="Büyük Kale">
                    <GiGoalKeeper className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "goal-small" ? "default" : "outline"} size="sm" onClick={() => setTool("goal-small")} className="p-2" title="Küçük Kale">
                    <MdSportsScore className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "flag" ? "default" : "outline"} size="sm" onClick={() => setTool("flag")} className="p-2" title="Bayrak">
                    <FaFlagCheckered className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "wall" ? "default" : "outline"} size="sm" onClick={() => setTool("wall")} className="p-2" title="Duvar">
                    <FaUsers className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "ladder" ? "default" : "outline"} size="sm" onClick={() => setTool("ladder")} className="p-2" title="Merdiven">
                    <MdOutlineGridOn className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "goalkeeper" ? "default" : "outline"} size="sm" onClick={() => setTool("goalkeeper")} className="p-2" title="Kaleci">
                    <GiGoalKeeper className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Markers Group */}
              <div className="flex flex-col gap-1 border-r pr-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">İşaretler</span>
                <div className="flex space-x-1">
                  <Button variant={tool === "marker-circle" ? "default" : "outline"} size="sm" onClick={() => setTool("marker-circle")} className="p-2" title="Daire">
                    <CircleIcon className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "marker-square" ? "default" : "outline"} size="sm" onClick={() => setTool("marker-square")} className="p-2" title="Kare">
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "marker-triangle" ? "default" : "outline"} size="sm" onClick={() => setTool("marker-triangle")} className="p-2" title="Üçgen">
                    <Triangle className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "marker-x" ? "default" : "outline"} size="sm" onClick={() => setTool("marker-x")} className="p-2" title="X">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Arrows & Lines Group */}
              <div className="flex flex-col gap-1 border-r pr-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Oklar & Çizgiler</span>
                <div className="flex space-x-1">
                  <Button variant={tool === "arrow-straight" ? "default" : "outline"} size="sm" onClick={() => setTool("arrow-straight")} className="p-2" title="Düz Ok">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "arrow-curved" ? "default" : "outline"} size="sm" onClick={() => setTool("arrow-curved")} className="p-2" title="Eğri Ok">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "arrow-dashed" ? "default" : "outline"} size="sm" onClick={() => setTool("arrow-dashed")} className="p-2" title="Kesik Çizgi">
                    <Move className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "draw" ? "default" : "outline"} size="sm" onClick={() => setTool("draw")} className="p-2" title="Çizim">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "line" ? "default" : "outline"} size="sm" onClick={() => setTool("line")} className="p-2" title="Çizgi">
                    <Move className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Other Group */}
              <div className="flex flex-col gap-1 border-r pr-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Diğer</span>
                <div className="flex space-x-1">
                  <Button variant={tool === "zone" ? "default" : "outline"} size="sm" onClick={() => setTool("zone")} className="p-2" title="Bölge">
                    <DivideSquare className="h-4 w-4" />
                  </Button>
                  <Button variant={tool === "text" ? "default" : "outline"} size="sm" onClick={() => setTool("text")} className="p-2" title="Metin">
                    <Type className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Actions Group */}
              <div className="flex flex-col gap-1 border-r pr-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">İşlemler</span>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={() => historyStep > 0 && (setHistoryStep(historyStep - 1), setElements(history[historyStep - 1]))} disabled={historyStep === 0} className="p-2" title="Geri Al">
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => historyStep < history.length - 1 && (setHistoryStep(historyStep + 1), setElements(history[historyStep + 1]))} disabled={historyStep === history.length - 1} className="p-2" title="İleri Al">
                    <Redo2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => confirm("Tümünü sil?") && (addToHistory([]), setSelectedId(null), setFirstFormationTeam(null))} className="p-2 text-red-600" title="Sil">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Save/Export Group */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Kaydet</span>
                <div className="flex space-x-1">
                  <Button size="sm" onClick={saveDrill} className="p-2" title="Kaydet">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportPNG} className="p-2" title="PNG İndir">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={importJSON} className="p-2" title="JSON Yükle">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Active Tool Indicator */}
              {tool && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 flex items-center">
                  <span className="text-xs font-semibold text-primary uppercase mr-2">Aktif Araç:</span>
                  <span className="text-sm capitalize">{tool.replace('-', ' ')}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setTool(null)}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Team Formations Section */}
          <div className="fixed top-[118px] left-0 right-0 lg:left-64 border-b bg-background p-3 z-30 min-h-fit">
            <div className="flex gap-6">
              {/* Home Team Formation */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Ev Sahibi Takımı</span>
                <div className="flex gap-2 items-end">
                  <Select value={selectedFormation} onValueChange={setSelectedFormation}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Seç..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(FORMATIONS).map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={homeTeamColor} onValueChange={(value) => setHomeTeamColor(value as any)}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">🔴 Kırmızı</SelectItem>
                      <SelectItem value="blue">🔵 Mavi</SelectItem>
                      <SelectItem value="yellow">🟡 Sarı</SelectItem>
                      <SelectItem value="black">⚫ Siyah</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={() => selectedFormation && applyFormation(selectedFormation, homeTeamColor)}
                    disabled={!selectedFormation}
                  >
                    Ekle
                  </Button>
                </div>
              </div>
              
              {/* Away Team Formation */}
              <div className="flex flex-col gap-2 border-l pl-6">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Rakip Takım</span>
                <div className="flex gap-2 items-end">
                  <Select value={selectedAwayFormation} onValueChange={setSelectedAwayFormation}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Seç..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(FORMATIONS).map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={awayTeamColor} onValueChange={(value) => setAwayTeamColor(value as any)}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">🔴 Kırmızı</SelectItem>
                      <SelectItem value="blue">🔵 Mavi</SelectItem>
                      <SelectItem value="yellow">🟡 Sarı</SelectItem>
                      <SelectItem value="black">⚫ Siyah</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={() => selectedAwayFormation && applyFormation(selectedAwayFormation, awayTeamColor)}
                    disabled={!selectedAwayFormation}
                  >
                    Ekle
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <main className="flex-1 mt-[158px] flex flex-col">
            <div className="flex flex-1 overflow-hidden">
              {/* Center Canvas */}
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-4 overflow-auto">
                <div className="flex items-center justify-center h-full">
                  <div className="rounded-lg shadow-2xl p-2" style={{ backgroundColor: '#00a000' }}>
                    <div style={{ display: 'inline-block', background: '#00a000' }}>
                      <Stage
                        width={pitchConfig.width}
                        height={pitchConfig.height}
                        ref={stageRef}
                        onClick={handleStageClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                      >
                      <Layer>
                        {/* Pitch Background - MUST BE FIRST */}
                        <Rect 
                          key="pitch-bg" 
                          x={0} 
                          y={0} 
                          width={pitchConfig.width} 
                          height={pitchConfig.height} 
                          fill="#00a000"
                          listening={false}
                        />
                        
                        {/* Pitch Lines */}
                        {renderPitchLines(pitchType, pitchConfig)}

                        {/* Elements */}
                        {elements.map((el) => {
                          if (el.type === "player") {
                            const emojis = { red: "🔴", orange: "🟠", yellow: "🟡", black: "⚫" };
                            const rotation = el.rotation || 0;
                            const radius = el.radius || 20;
                            const displayText = el.name ? `${el.number || ''} ${el.name}`.trim() : (el.number || '');
                            
                            return (
                              <React.Fragment key={el.id}>
                                {/* Player Emoji */}
                                <KonvaText
                                  id={el.id}
                                  x={el.x - radius}
                                  y={el.y - radius}
                                  text={emojis[el.team]}
                                  fontSize={radius * 2}
                                  rotation={rotation}
                                  draggable
                                  onClick={() => setSelectedId(el.id)}
                                  onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + radius, y: e.target.y() + radius })}
                                  onTransformEnd={(e) => {
                                    const node = e.target;
                                    const scaleX = node.scaleX();
                                    const rotation = node.rotation();
                                    const newRadius = Math.max(10, Math.min(30, radius * scaleX));
                                    node.scaleX(1);
                                    node.scaleY(1);
                                    updateElement(el.id, { radius: newRadius, rotation });
                                  }}
                                />
                                {/* Player Name/Number Label */}
                                {displayText && (
                                  <>
                                    {/* Shadow */}
                                    <Rect
                                      x={el.x - 20}
                                      y={el.y + radius + 4}
                                      width={40}
                                      height={14}
                                      fill="#000000"
                                      cornerRadius={3}
                                      opacity={0.2}
                                      listening={false}
                                    />
                                    {/* Background with gradient effect */}
                                    <Rect
                                      x={el.x - 20}
                                      y={el.y + radius + 3}
                                      width={40}
                                      height={14}
                                      fill="#ffffff"
                                      cornerRadius={3}
                                      opacity={0.95}
                                      shadowColor="#000000"
                                      shadowBlur={3}
                                      shadowOpacity={0.3}
                                      shadowOffsetY={1}
                                      listening={false}
                                    />
                                    {/* Border */}
                                    <Rect
                                      x={el.x - 20}
                                      y={el.y + radius + 3}
                                      width={40}
                                      height={14}
                                      stroke="#e5e7eb"
                                      strokeWidth={0.5}
                                      cornerRadius={3}
                                      listening={false}
                                    />
                                    {/* Text */}
                                    <KonvaText
                                      x={el.x - 20}
                                      y={el.y + radius + 5}
                                      text={displayText}
                                      fontSize={10}
                                      fontStyle="bold"
                                      fill="#1f2937"
                                      width={40}
                                      align="center"
                                      listening={false}
                                    />
                                  </>
                                )}
                              </React.Fragment>
                            );
                          }

                          if (el.type === "ball") {
                            const ballRadius = el.radius || 12;
                            const rotation = el.rotation || 0;
                            return (
                              <React.Fragment key={el.id}>
                                {/* Soccer ball emoji as text */}
                                <KonvaText
                                  id={el.id}
                                  x={el.x - ballRadius}
                                  y={el.y - ballRadius}
                                  text="⚽"
                                  fontSize={ballRadius * 2}
                                  rotation={rotation}
                                  draggable
                                  onClick={() => setSelectedId(el.id)}
                                  onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + ballRadius, y: e.target.y() + ballRadius })}
                                  onTransformEnd={(e) => {
                                    const node = e.target;
                                    const scaleX = node.scaleX();
                                    const rotation = node.rotation();
                                    const newRadius = Math.max(8, Math.min(20, ballRadius * scaleX));
                                    node.scaleX(1);
                                    node.scaleY(1);
                                    updateElement(el.id, { radius: newRadius, rotation });
                                  }}
                                />
                              </React.Fragment>
                            );
                          }

                          if (el.type === "cone") {
                            const coneSize = el.size || 12;
                            const rotation = el.rotation || 0;
                            return (
                              <React.Fragment key={el.id}>
                                {/* Traffic cone emoji with shadow */}
                                <KonvaText
                                  id={el.id}
                                  x={el.x - coneSize}
                                  y={el.y - coneSize}
                                  text="🚧"
                                  fontSize={coneSize * 2}
                                  rotation={rotation}
                                  shadowColor="#000000"
                                  shadowBlur={4}
                                  shadowOpacity={0.3}
                                  shadowOffsetY={2}
                                  draggable
                                  onClick={() => setSelectedId(el.id)}
                                  onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + coneSize, y: e.target.y() + coneSize })}
                                  onTransformEnd={(e) => {
                                    const node = e.target;
                                    const scaleX = node.scaleX();
                                    const rotation = node.rotation();
                                    const newSize = Math.max(8, Math.min(20, coneSize * scaleX));
                                    node.scaleX(1);
                                    node.scaleY(1);
                                    updateElement(el.id, { size: newSize, rotation });
                                  }}
                                />
                              </React.Fragment>
                            );
                          }

                          if (el.type === "goalkeeper") {
                            const gkSize = el.size || 20;
                            const rotation = el.rotation || 0;
                            return (
                              <React.Fragment key={el.id}>
                                {/* Goalkeeper gloves emoji with shadow */}
                                <KonvaText
                                  id={el.id}
                                  x={el.x - gkSize}
                                  y={el.y - gkSize}
                                  text="🧤"
                                  fontSize={gkSize * 2}
                                  rotation={rotation}
                                  shadowColor="#000000"
                                  shadowBlur={4}
                                  shadowOpacity={0.3}
                                  shadowOffsetY={2}
                                  draggable
                                  onClick={() => setSelectedId(el.id)}
                                  onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + gkSize, y: e.target.y() + gkSize })}
                                  onTransformEnd={(e) => {
                                    const node = e.target;
                                    const scaleX = node.scaleX();
                                    const rotation = node.rotation();
                                    const newSize = Math.max(10, Math.min(30, gkSize * scaleX));
                                    node.scaleX(1);
                                    node.scaleY(1);
                                    updateElement(el.id, { size: newSize, rotation });
                                  }}
                                />
                              </React.Fragment>
                            );
                          }

                          if (el.type === "goal") {
                            const size = el.size === "large" ? 60 : 40;
                            return (
                              <React.Fragment key={el.id}>
                                {/* Shadow for depth */}
                                <Rect 
                                  x={el.x - size / 2 + 2} 
                                  y={el.y - 3} 
                                  width={size} 
                                  height={10} 
                                  fill="#000000" 
                                  opacity={0.2}
                                  cornerRadius={1}
                                  listening={false}
                                />
                                {/* Base - horizontal bar */}
                                <Rect 
                                  x={el.x - size / 2} 
                                  y={el.y - 5} 
                                  width={size} 
                                  height={10} 
                                  fill="#f8f9fa" 
                                  stroke="#1f2937" 
                                  strokeWidth={2.5} 
                                  cornerRadius={1}
                                  shadowColor="#000000"
                                  shadowBlur={4}
                                  shadowOpacity={0.3}
                                  draggable 
                                  onClick={() => setSelectedId(el.id)} 
                                  onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + size / 2, y: e.target.y() + 5 })} 
                                />
                                {/* Left post - with gradient effect */}
                                <Line 
                                  points={[el.x - size / 2, el.y - 5, el.x - size / 2, el.y - 25]} 
                                  stroke="#1f2937" 
                                  strokeWidth={3} 
                                  lineCap="round"
                                  shadowColor="#000000"
                                  shadowBlur={3}
                                  shadowOpacity={0.3}
                                  listening={false} 
                                />
                                {/* Right post */}
                                <Line 
                                  points={[el.x + size / 2, el.y - 5, el.x + size / 2, el.y - 25]} 
                                  stroke="#1f2937" 
                                  strokeWidth={3} 
                                  lineCap="round"
                                  shadowColor="#000000"
                                  shadowBlur={3}
                                  shadowOpacity={0.3}
                                  listening={false} 
                                />
                                {/* Top bar - crossbar */}
                                <Line 
                                  points={[el.x - size / 2, el.y - 25, el.x + size / 2, el.y - 25]} 
                                  stroke="#1f2937" 
                                  strokeWidth={3} 
                                  lineCap="round"
                                  shadowColor="#000000"
                                  shadowBlur={3}
                                  shadowOpacity={0.3}
                                  listening={false} 
                                />
                                {/* Net effect - multiple lines */}
                                <Line 
                                  points={[
                                    el.x - size / 2, el.y - 5,
                                    el.x, el.y + 10,
                                    el.x + size / 2, el.y - 5
                                  ]} 
                                  stroke="#6b7280" 
                                  strokeWidth={1.5} 
                                  opacity={0.6}
                                  listening={false} 
                                />
                                {/* Additional net details */}
                                <Line 
                                  points={[
                                    el.x - size / 4, el.y - 5,
                                    el.x - size / 4, el.y + 5
                                  ]} 
                                  stroke="#6b7280" 
                                  strokeWidth={1} 
                                  opacity={0.4}
                                  listening={false} 
                                />
                                <Line 
                                  points={[
                                    el.x + size / 4, el.y - 5,
                                    el.x + size / 4, el.y + 5
                                  ]} 
                                  stroke="#6b7280" 
                                  strokeWidth={1} 
                                  opacity={0.4}
                                  listening={false} 
                                />
                              </React.Fragment>
                            );
                          }

                          if (el.type === "flag") {
                            const flagHeight = el.height || 25;
                            const rotation = el.rotation || 0;
                            return (
                              <React.Fragment key={el.id}>
                                {/* Flag emoji with shadow and enhanced visual */}
                                <KonvaText
                                  id={el.id}
                                  x={el.x - 10}
                                  y={el.y - flagHeight}
                                  text="🚩"
                                  fontSize={flagHeight}
                                  rotation={rotation}
                                  shadowColor="#000000"
                                  shadowBlur={5}
                                  shadowOpacity={0.35}
                                  shadowOffsetY={2}
                                  draggable
                                  onClick={() => setSelectedId(el.id)}
                                  onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + 10, y: e.target.y() + flagHeight })}
                                />
                              </React.Fragment>
                            );
                          }

                          if (el.type === "wall") {
                            const playerCount = Math.ceil(el.width / 20);
                            return (
                              <React.Fragment key={el.id}>
                                {/* Player silhouettes in defensive wall */}
                                {[...Array(playerCount)].map((_, i) => (
                                  <React.Fragment key={i}>
                                    {/* Player body */}
                                    <Circle 
                                      x={el.x + i * (el.width / playerCount)} 
                                      y={el.y} 
                                      radius={9} 
                                      fill="#1e40af" 
                                      stroke="#ffffff" 
                                      strokeWidth={2}
                                      shadowColor="#000000"
                                      shadowBlur={3}
                                      shadowOpacity={0.4}
                                    />
                                    {/* Player head */}
                                    <Circle 
                                      x={el.x + i * (el.width / playerCount)} 
                                      y={el.y - 12} 
                                      radius={5} 
                                      fill="#fbbf24" 
                                      stroke="#ffffff" 
                                      strokeWidth={1}
                                    />
                                  </React.Fragment>
                                ))}
                                {/* Invisible draggable area */}
                                <Rect 
                                  x={el.x - 5} 
                                  y={el.y - 18} 
                                  width={el.width + 10} 
                                  height={36} 
                                  fill="transparent" 
                                  draggable 
                                  onClick={() => setSelectedId(el.id)} 
                                  onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + 5, y: e.target.y() + 18 })} 
                                />
                              </React.Fragment>
                            );
                          }

                          if (el.type === "ladder") {
                            const rungSpacing = el.length / (el.rungs + 1);
                            return (
                              <React.Fragment key={el.id}>
                                {/* Ladder - Agility training equipment with enhanced visuals */}
                                {/* Shadow for left rail */}
                                <Line
                                  points={[el.x + 1, el.y + 1, el.x + 1, el.y + el.length + 1]}
                                  stroke="#000000"
                                  strokeWidth={4}
                                  opacity={0.2}
                                  listening={false}
                                />
                                {/* Shadow for right rail */}
                                <Line
                                  points={[el.x + 31, el.y + 1, el.x + 31, el.y + el.length + 1]}
                                  stroke="#000000"
                                  strokeWidth={4}
                                  opacity={0.2}
                                  listening={false}
                                />
                                {/* Left rail with gradient effect */}
                                <Line
                                  points={[el.x, el.y, el.x, el.y + el.length]}
                                  stroke="#f59e0b"
                                  strokeWidth={5}
                                  lineCap="round"
                                  listening={false}
                                  shadowColor="#000000"
                                  shadowBlur={4}
                                  shadowOpacity={0.4}
                                />
                                {/* Highlight on left rail */}
                                <Line
                                  points={[el.x - 1, el.y, el.x - 1, el.y + el.length]}
                                  stroke="#fbbf24"
                                  strokeWidth={2}
                                  opacity={0.7}
                                  listening={false}
                                />
                                {/* Right rail with gradient effect */}
                                <Line
                                  points={[el.x + 30, el.y, el.x + 30, el.y + el.length]}
                                  stroke="#f59e0b"
                                  strokeWidth={5}
                                  lineCap="round"
                                  listening={false}
                                  shadowColor="#000000"
                                  shadowBlur={4}
                                  shadowOpacity={0.4}
                                />
                                {/* Highlight on right rail */}
                                <Line
                                  points={[el.x + 29, el.y, el.x + 29, el.y + el.length]}
                                  stroke="#fbbf24"
                                  strokeWidth={2}
                                  opacity={0.7}
                                  listening={false}
                                />
                                {/* Rungs with shadows */}
                                {[...Array(el.rungs)].map((_, i) => (
                                  <React.Fragment key={i}>
                                    {/* Rung shadow */}
                                    <Line
                                      points={[
                                        el.x, 
                                        el.y + rungSpacing * (i + 1) + 1, 
                                        el.x + 30, 
                                        el.y + rungSpacing * (i + 1) + 1
                                      ]}
                                      stroke="#000000"
                                      strokeWidth={3}
                                      opacity={0.2}
                                      listening={false}
                                    />
                                    {/* Main rung */}
                                    <Line
                                      points={[
                                        el.x, 
                                        el.y + rungSpacing * (i + 1), 
                                        el.x + 30, 
                                        el.y + rungSpacing * (i + 1)
                                      ]}
                                      stroke="#f59e0b"
                                      strokeWidth={4}
                                      lineCap="round"
                                      shadowColor="#000000"
                                      shadowBlur={2}
                                      shadowOpacity={0.3}
                                      listening={false}
                                    />
                                    {/* Rung highlight */}
                                    <Line
                                      points={[
                                        el.x, 
                                        el.y + rungSpacing * (i + 1) - 1, 
                                        el.x + 30, 
                                        el.y + rungSpacing * (i + 1) - 1
                                      ]}
                                      stroke="#fbbf24"
                                      strokeWidth={1.5}
                                      opacity={0.6}
                                      listening={false}
                                    />
                                  </React.Fragment>
                                ))}
                                {/* Invisible draggable area */}
                                <Rect
                                  x={el.x - 5}
                                  y={el.y - 5}
                                  width={40}
                                  height={el.length + 10}
                                  fill="transparent"
                                  draggable
                                  onClick={() => setSelectedId(el.id)}
                                  onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + 5, y: e.target.y() + 5 })}
                                />
                              </React.Fragment>
                            );
                          }

                          if (el.type === "marker") {
                            const rotation = el.rotation || 0;
                            if (el.shape === "circle") {
                              return (
                                <React.Fragment key={el.id}>
                                  {/* Shadow */}
                                  <Circle 
                                    x={el.x + 1} 
                                    y={el.y + 1} 
                                    radius={el.size} 
                                    fill="#000000" 
                                    opacity={0.25}
                                    listening={false}
                                  />
                                  {/* Main circle */}
                                  <Circle 
                                    id={el.id}
                                    x={el.x} 
                                    y={el.y} 
                                    radius={el.size} 
                                    fill={el.color} 
                                    stroke="#1f2937"
                                    strokeWidth={2.5}
                                    shadowColor="#000000"
                                    shadowBlur={4}
                                    shadowOpacity={0.4}
                                    rotation={rotation}
                                    draggable 
                                    onClick={() => setSelectedId(el.id)} 
                                    onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })} 
                                    onTransformEnd={(e) => {
                                      const node = e.target;
                                      const scaleX = node.scaleX();
                                      const rotation = node.rotation();
                                      const newSize = Math.max(5, Math.min(40, el.size * scaleX));
                                      node.scaleX(1);
                                      node.scaleY(1);
                                      updateElement(el.id, { size: newSize, rotation });
                                    }}
                                  />
                                  {/* Highlight */}
                                  <Circle 
                                    x={el.x - el.size * 0.25} 
                                    y={el.y - el.size * 0.25} 
                                    radius={el.size * 0.35} 
                                    fill="#ffffff" 
                                    opacity={0.4}
                                    listening={false}
                                  />
                                </React.Fragment>
                              );
                            }
                            if (el.shape === "square") {
                              return (
                                <React.Fragment key={el.id}>
                                  {/* Shadow */}
                                  <Rect 
                                    x={el.x - el.size + 1} 
                                    y={el.y - el.size + 1} 
                                    width={el.size * 2} 
                                    height={el.size * 2} 
                                    fill="#000000" 
                                    opacity={0.25}
                                    rotation={rotation}
                                    listening={false}
                                  />
                                  {/* Main square */}
                                  <Rect 
                                    id={el.id}
                                    x={el.x - el.size} 
                                    y={el.y - el.size} 
                                    width={el.size * 2} 
                                    height={el.size * 2} 
                                    fill={el.color} 
                                    stroke="#1f2937"
                                    strokeWidth={2.5}
                                    shadowColor="#000000"
                                    shadowBlur={4}
                                    shadowOpacity={0.4}
                                    rotation={rotation}
                                    draggable 
                                    onClick={() => setSelectedId(el.id)} 
                                    onDragEnd={(e) => updateElement(el.id, { x: e.target.x() + el.size, y: e.target.y() + el.size })} 
                                    onTransformEnd={(e) => {
                                      const node = e.target;
                                      const scaleX = node.scaleX();
                                      const rotation = node.rotation();
                                      const newSize = Math.max(5, Math.min(40, el.size * scaleX));
                                      node.scaleX(1);
                                      node.scaleY(1);
                                      updateElement(el.id, { size: newSize, rotation });
                                    }}
                                  />
                                  {/* Highlight */}
                                  <Rect 
                                    x={el.x - el.size * 0.6} 
                                    y={el.y - el.size * 0.6} 
                                    width={el.size * 0.8} 
                                    height={el.size * 0.8} 
                                    fill="#ffffff" 
                                    opacity={0.35}
                                    rotation={rotation}
                                    listening={false}
                                  />
                                </React.Fragment>
                              );
                            }
                            if (el.shape === "triangle") {
                              return (
                                <React.Fragment key={el.id}>
                                  {/* Shadow */}
                                  <RegularPolygon 
                                    x={el.x + 1} 
                                    y={el.y + 1} 
                                    sides={3} 
                                    radius={el.size} 
                                    fill="#000000" 
                                    opacity={0.25}
                                    rotation={rotation}
                                    listening={false}
                                  />
                                  {/* Main triangle */}
                                  <RegularPolygon 
                                    id={el.id}
                                    x={el.x} 
                                    y={el.y} 
                                    sides={3} 
                                    radius={el.size} 
                                    fill={el.color} 
                                    stroke="#1f2937"
                                    strokeWidth={2.5}
                                    shadowColor="#000000"
                                    shadowBlur={4}
                                    shadowOpacity={0.4}
                                    rotation={rotation}
                                    draggable 
                                    onClick={() => setSelectedId(el.id)} 
                                    onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })} 
                                    onTransformEnd={(e) => {
                                      const node = e.target;
                                      const scaleX = node.scaleX();
                                      const rotation = node.rotation();
                                      const newSize = Math.max(5, Math.min(40, el.size * scaleX));
                                      node.scaleX(1);
                                      node.scaleY(1);
                                      updateElement(el.id, { size: newSize, rotation });
                                    }}
                                  />
                                  {/* Highlight */}
                                  <RegularPolygon 
                                    x={el.x - el.size * 0.15} 
                                    y={el.y - el.size * 0.2} 
                                    sides={3} 
                                    radius={el.size * 0.4} 
                                    fill="#ffffff" 
                                    opacity={0.4}
                                    rotation={rotation}
                                    listening={false}
                                  />
                                </React.Fragment>
                              );
                            }
                            if (el.shape === "x") {
                              return (
                                <React.Fragment key={el.id}>
                                  {/* Shadow lines */}
                                  <Line
                                    points={[el.x - el.size + 1, el.y - el.size + 1, el.x + el.size + 1, el.y + el.size + 1]} 
                                    stroke="#000000" 
                                    strokeWidth={5}
                                    opacity={0.2}
                                    listening={false}
                                  />
                                  <Line 
                                    points={[el.x + el.size + 1, el.y - el.size + 1, el.x - el.size + 1, el.y + el.size + 1]} 
                                    stroke="#000000" 
                                    strokeWidth={5}
                                    opacity={0.2}
                                    listening={false} 
                                  />
                                  {/* Main X */}
                                  <Line
                                    id={el.id}
                                    points={[el.x - el.size, el.y - el.size, el.x + el.size, el.y + el.size]} 
                                    stroke={el.color} 
                                    strokeWidth={5}
                                    lineCap="round"
                                    shadowColor="#000000"
                                    shadowBlur={3}
                                    shadowOpacity={0.4}
                                    rotation={rotation}
                                    draggable 
                                    onClick={() => setSelectedId(el.id)} 
                                    onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })} 
                                    onTransformEnd={(e) => {
                                      const node = e.target;
                                      const scaleX = node.scaleX();
                                      const rotation = node.rotation();
                                      const newSize = Math.max(5, Math.min(40, el.size * scaleX));
                                      node.scaleX(1);
                                      node.scaleY(1);
                                      updateElement(el.id, { size: newSize, rotation });
                                    }}
                                  />
                                  <Line 
                                    points={[el.x + el.size, el.y - el.size, el.x - el.size, el.y + el.size]} 
                                    stroke={el.color} 
                                    strokeWidth={5}
                                    lineCap="round"
                                    listening={false} 
                                  />
                                </React.Fragment>
                              );
                            }
                          }

                          if (el.type === "arrow") {
                            const rotation = el.rotation || 0;
                            const dx = el.endX - el.x;
                            const dy = el.endY - el.y;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                            
                            if (el.style === "dashed") {
                              return (
                                <Group
                                  key={el.id}
                                  id={el.id}
                                  x={el.x}
                                  y={el.y}
                                  rotation={rotation + angle}
                                  draggable
                                  onClick={() => setSelectedId(el.id)}
                                  onDragEnd={(e) => {
                                    updateElement(el.id, { x: e.target.x(), y: e.target.y() });
                                  }}
                                  onTransformEnd={(e) => {
                                    const node = e.target;
                                    const scaleX = node.scaleX();
                                    const rotation = node.rotation();
                                    const newLength = length * scaleX;
                                    
                                    // Calculate new end position
                                    const rad = (rotation * Math.PI) / 180;
                                    const newEndX = el.x + newLength * Math.cos(rad);
                                    const newEndY = el.y + newLength * Math.sin(rad);
                                    
                                    node.scaleX(1);
                                    node.scaleY(1);
                                    updateElement(el.id, { endX: newEndX, endY: newEndY, rotation: 0 });
                                  }}
                                >
                                  <Line
                                    points={[0, 0, length, 0]}
                                    stroke={el.color}
                                    strokeWidth={el.thickness}
                                    dash={[10, 5]}
                                  />
                                </Group>
                              );
                            }
                            return (
                              <Group
                                key={el.id}
                                id={el.id}
                                x={el.x}
                                y={el.y}
                                rotation={rotation + angle}
                                draggable
                                onClick={() => setSelectedId(el.id)}
                                onDragEnd={(e) => {
                                  updateElement(el.id, { x: e.target.x(), y: e.target.y() });
                                }}
                                onTransformEnd={(e) => {
                                  const node = e.target;
                                  const scaleX = node.scaleX();
                                  const rotation = node.rotation();
                                  const newLength = length * scaleX;
                                  
                                  // Calculate new end position
                                  const rad = (rotation * Math.PI) / 180;
                                  const newEndX = el.x + newLength * Math.cos(rad);
                                  const newEndY = el.y + newLength * Math.sin(rad);
                                  
                                  node.scaleX(1);
                                  node.scaleY(1);
                                  updateElement(el.id, { endX: newEndX, endY: newEndY, rotation: 0 });
                                }}
                              >
                                <Arrow
                                  points={[0, 0, length, 0]}
                                  stroke={el.color}
                                  strokeWidth={el.thickness}
                                  fill={el.color}
                                  pointerLength={12}
                                  pointerWidth={12}
                                />
                              </Group>
                            );
                          }

                          if (el.type === "line") {
                            const rotation = el.rotation || 0;
                            // Calculate bounding box for the line
                            const xs = el.points.filter((_, i) => i % 2 === 0);
                            const ys = el.points.filter((_, i) => i % 2 === 1);
                            const minX = Math.min(...xs);
                            const minY = Math.min(...ys);
                            const maxX = Math.max(...xs);
                            const maxY = Math.max(...ys);
                            const width = maxX - minX;
                            const height = maxY - minY;
                            
                            // Normalize points relative to top-left corner
                            const normalizedPoints = el.points.map((p, i) => 
                              i % 2 === 0 ? p - minX : p - minY
                            );
                            
                            return (
                              <Group
                                key={el.id}
                                id={el.id}
                                x={el.x + minX}
                                y={el.y + minY}
                                rotation={rotation}
                                draggable
                                onClick={() => setSelectedId(el.id)}
                                onDragEnd={(e) => {
                                  updateElement(el.id, { x: e.target.x() - minX, y: e.target.y() - minY });
                                }}
                                onTransformEnd={(e) => {
                                  const node = e.target;
                                  const scaleX = node.scaleX();
                                  const scaleY = node.scaleY();
                                  const rotation = node.rotation();
                                  
                                  // Scale the normalized points
                                  const newPoints = normalizedPoints.map((p, i) => 
                                    i % 2 === 0 ? p * scaleX : p * scaleY
                                  );
                                  
                                  node.scaleX(1);
                                  node.scaleY(1);
                                  updateElement(el.id, { points: newPoints, rotation, x: node.x() - minX * scaleX, y: node.y() - minY * scaleY });
                                }}
                              >
                                <Line
                                  points={normalizedPoints}
                                  stroke={el.color}
                                  strokeWidth={el.thickness}
                                  tension={0.5}
                                  lineCap="round"
                                  dash={el.style === "dashed" ? [10, 5] : undefined}
                                />
                              </Group>
                            );
                          }

                          if (el.type === "text") {
                            const rotation = el.rotation || 0;
                            return (
                              <KonvaText
                                key={el.id}
                                id={el.id}
                                x={el.x}
                                y={el.y}
                                text={el.text}
                                fontSize={el.fontSize}
                                fill={el.color}
                                fontStyle="bold"
                                rotation={rotation}
                                draggable
                                onClick={() => setSelectedId(el.id)}
                                onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                                onTransformEnd={(e) => {
                                  const node = e.target;
                                  const scaleX = node.scaleX();
                                  const rotation = node.rotation();
                                  const newFontSize = Math.max(10, Math.min(48, el.fontSize * scaleX));
                                  node.scaleX(1);
                                  node.scaleY(1);
                                  updateElement(el.id, { fontSize: newFontSize, rotation });
                                }}
                              />
                            );
                          }

                          if (el.type === "zone") {
                            const rotation = el.rotation || 0;
                            return (
                              <Rect
                                key={el.id}
                                id={el.id}
                                x={el.x}
                                y={el.y}
                                width={el.width}
                                height={el.height}
                                fill={el.color}
                                opacity={el.opacity}
                                stroke={el.color}
                                strokeWidth={2}
                                rotation={rotation}
                                draggable
                                onClick={() => setSelectedId(el.id)}
                                onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                                onTransformEnd={(e) => {
                                  const node = e.target;
                                  const scaleX = node.scaleX();
                                  const scaleY = node.scaleY();
                                  const rotation = node.rotation();
                                  
                                  node.scaleX(1);
                                  node.scaleY(1);
                                  updateElement(el.id, { 
                                    width: Math.max(5, el.width * scaleX),
                                    height: Math.max(5, el.height * scaleY),
                                    rotation 
                                  });
                                }}
                              />
                            );
                          }
                        })}

                        {/* Current drawing */}
                        {isDrawing && currentLine.length > 2 && (
                          <Line points={currentLine} stroke="#fbbf24" strokeWidth={3} tension={0.5} lineCap="round" />
                        )}
                        
                        {/* Transformer for resize/rotate */}
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            // Limit resize
                            if (newBox.width < 5 || newBox.height < 5) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      </Layer>
                    </Stage>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </main>
          
          {/* Selected Items Section - Right Sidebar */}
          {selectedElement && (
            <div className="fixed right-0 top-[200px] bottom-0 w-[350px] border-l bg-background overflow-y-auto z-40">
              <div className="flex flex-col">
                {/* Properties Section */}
                <div className="border-b p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Özellikler</h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {/* Properties form content - keeping existing implementation */}
                    {selectedElement.type === "player" && (
                      <>
                        <div>
                          <Label>Numara</Label>
                          <Input value={selectedElement.number} onChange={(e) => updateElement(selectedElement.id, { number: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                          <Label>İsim</Label>
                          <Input value={selectedElement.name || ""} onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                          <Label>Boyut (Yarıçap)</Label>
                          <Input 
                            type="number" 
                            min="10" 
                            max="30" 
                            step="2"
                            value={selectedElement.radius || 20} 
                            onChange={(e) => updateElement(selectedElement.id, { radius: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                      </>
                    )}
                    
                    {selectedElement.type === "text" && (
                      <>
                        <div>
                          <Label>Metin</Label>
                          <Input value={selectedElement.text} onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                          <Label>Boyut</Label>
                          <Input type="number" min="10" max="48" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} className="mt-2" />
                        </div>
                      </>
                    )}
                    
                    {selectedElement.type === "ball" && (
                      <div>
                        <Label>Boyut (Yarıçap)</Label>
                        <Input 
                          type="number" 
                          min="8" 
                          max="20" 
                          step="2"
                          value={selectedElement.radius || 12} 
                          onChange={(e) => updateElement(selectedElement.id, { radius: parseInt(e.target.value) })} 
                          className="mt-2" 
                        />
                      </div>
                    )}
                    
                    {selectedElement.type === "cone" && (
                      <div>
                        <Label>Boyut (Yarıçap)</Label>
                        <Input 
                          type="number" 
                          min="8" 
                          max="20" 
                          step="2"
                          value={selectedElement.size || 12} 
                          onChange={(e) => updateElement(selectedElement.id, { size: parseInt(e.target.value) })} 
                          className="mt-2" 
                        />
                      </div>
                    )}
                    
                    {selectedElement.type === "flag" && (
                      <div>
                        <Label>Yükseklik</Label>
                        <Input 
                          type="number" 
                          min="15" 
                          max="40" 
                          step="5"
                          value={selectedElement.height || 25} 
                          onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} 
                          className="mt-2" 
                        />
                      </div>
                    )}
                    
                    {selectedElement.type === "goal" && (
                      <div>
                        <Label>Kale Boyutu</Label>
                        <Select value={selectedElement.size} onValueChange={(v: "large" | "small") => updateElement(selectedElement.id, { size: v })}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="large">Büyük Kale</SelectItem>
                            <SelectItem value="small">Mini Kale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {selectedElement.type === "wall" && (
                      <div>
                        <Label>Genişlik (px)</Label>
                        <Input 
                          type="number" 
                          min="40" 
                          max="200" 
                          step="20"
                          value={selectedElement.width} 
                          onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} 
                          className="mt-2" 
                        />
                      </div>
                    )}
                    
                    {selectedElement.type === "ladder" && (
                      <>
                        <div>
                          <Label>Uzunluk (px)</Label>
                          <Input 
                            type="number" 
                            min="60" 
                            max="200" 
                            step="10"
                            value={selectedElement.length} 
                            onChange={(e) => updateElement(selectedElement.id, { length: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label>Basamak Sayısı</Label>
                          <Input 
                            type="number" 
                            min="4" 
                            max="20" 
                            step="1"
                            value={selectedElement.rungs} 
                            onChange={(e) => updateElement(selectedElement.id, { rungs: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                      </>
                    )}
                    
                    {selectedElement.type === "zone" && (
                      <>
                        <div>
                          <Label>Genişlik (px)</Label>
                          <Input 
                            type="number" 
                            min="50" 
                            max="300" 
                            step="10"
                            value={selectedElement.width} 
                            onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label>Yükseklik (px)</Label>
                          <Input 
                            type="number" 
                            min="50" 
                            max="300" 
                            step="10"
                            value={selectedElement.height} 
                            onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label>Rotasyon (derece)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="360" 
                            step="15"
                            value={Math.round(selectedElement.rotation || 0)} 
                            onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label>Opaklık</Label>
                          <Input 
                            type="number" 
                            min="0.1" 
                            max="1" 
                            step="0.1"
                            value={selectedElement.opacity} 
                            onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                      </>
                    )}
                    
                    {selectedElement.type === "marker" && (
                      <div>
                        <Label>Boyut (px)</Label>
                        <Input 
                          type="number" 
                          min="5" 
                          max="40" 
                          step="5"
                          value={selectedElement.size} 
                          onChange={(e) => updateElement(selectedElement.id, { size: parseInt(e.target.value) })} 
                          className="mt-2" 
                        />
                      </div>
                    )}
                    
                    {selectedElement.type === "arrow" && (
                      <>
                        <div>
                          <Label>Kalınlık (px)</Label>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            value={selectedElement.thickness} 
                            onChange={(e) => updateElement(selectedElement.id, { thickness: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label>Rotasyon (derece)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="360" 
                            step="15"
                            value={Math.round(selectedElement.rotation || 0)} 
                            onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label>Renk</Label>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {["#fbbf24", "#ef4444", "#3b82f6", "#22c55e"].map((color) => (
                              <button
                                key={color}
                                className="w-8 h-8 rounded border-2"
                                style={{ backgroundColor: color, borderColor: selectedElement.color === color ? "#000" : "#ccc" }}
                                onClick={() => updateElement(selectedElement.id, { color })}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedElement.type === "line" && (
                      <>
                        <div>
                          <Label>Kalınlık (px)</Label>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            value={selectedElement.thickness} 
                            onChange={(e) => updateElement(selectedElement.id, { thickness: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label>Rotasyon (derece)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="360" 
                            step="15"
                            value={Math.round(selectedElement.rotation || 0)} 
                            onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} 
                            className="mt-2" 
                          />
                        </div>
                        <div>
                          <Label>Renk</Label>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {["#fbbf24", "#ef4444", "#3b82f6", "#22c55e"].map((color) => (
                              <button
                                key={color}
                                className="w-8 h-8 rounded border-2"
                                style={{ backgroundColor: color, borderColor: selectedElement.color === color ? "#000" : "#ccc" }}
                                onClick={() => updateElement(selectedElement.id, { color })}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {(selectedElement.type === "cone" || selectedElement.type === "flag" || selectedElement.type === "marker") && (
                      <div>
                        <Label>Renk</Label>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {["#f97316", "#eab308", "#22c55e", "#3b82f6", "#ef4444", "#8b5cf6"].map((color) => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded border-2"
                              style={{ backgroundColor: color, borderColor: ("color" in selectedElement && selectedElement.color === color) ? "#000" : "#ccc" }}
                              onClick={() => updateElement(selectedElement.id, { color })}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedElement.type === "zone" && (
                      <div>
                        <Label>Renk</Label>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#8b5cf6"].map((color) => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded border-2"
                              style={{ backgroundColor: color, borderColor: selectedElement.color === color ? "#000" : "#ccc" }}
                              onClick={() => updateElement(selectedElement.id, { color })}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button variant="destructive" size="sm" onClick={() => deleteElement(selectedElement.id)} className="w-full mt-3">
                      <Trash2 className="h-4 w-4 mr-2" /> Sil
                    </Button>
                  </div>
                </div>
                
                {/* Elements List Section */}
                <div className="border-t p-4">
                  <h3 className="text-sm font-semibold mb-3">Öğeler ({elements.length})</h3>
                    {elements.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Henüz öğe yok</p>
                    ) : (
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {elements.map((el) => {
                          const typeNames: { [key: string]: string } = {
                            'player': 'Oyuncu',
                            'ball': 'Top',
                            'cone': 'Koni',
                            'flag': 'Bayrak',
                            'goal': 'Kale',
                            'wall': 'Duvar',
                            'ladder': 'Merdiven',
                            'goalkeeper': 'Kaleci',
                            'zone': 'Bölge',
                            'text': 'Metin',
                            'marker-circle': 'Daire',
                            'marker-square': 'Kare',
                            'marker-triangle': 'Üçgen',
                            'marker-x': 'X',
                            'arrow-straight': 'Düz Ok',
                            'arrow-curved': 'Eğri Ok',
                            'arrow-dashed': 'Kesik Çizgi',
                            'draw': 'Çizim',
                            'line': 'Çizgi'
                          };
                          return (
                            <div
                              key={el.id}
                              className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer hover:bg-accent ${selectedId === el.id ? "bg-accent" : ""}`}
                              onClick={() => setSelectedId(el.id)}
                            >
                              <span className="capitalize font-medium">{typeNames[el.type] || el.type}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
