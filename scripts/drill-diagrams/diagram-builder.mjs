// Authoring coordinates are percentages of the existing750×550 training field.
// Zone coordinates are CENTERS; line endpoints and arrow endpoints are absolute.
export const AGE_CONTEXTS = {
  U12: { key: "U12", label: "U12", level: 0, teamSize: 3, pressure: "önce pasif, sonra kontrollü aktif" },
  U14: { key: "U14", label: "U14", level: 1, teamSize: 4, pressure: "kontrollü aktif" },
  U16: { key: "U16", label: "U16", level: 2, teamSize: 4, pressure: "aktif" },
  U18: { key: "U18", label: "U18", level: 3, teamSize: 5, pressure: "aktif ve geçiş odaklı" },
  SENIOR: { key: "SENIOR", label: "A Takım", level: 4, teamSize: 5, pressure: "aktif, rol ve rakip senaryosu odaklı" },
};

export function diagram(prefix, area) {
  if (!area.every((value) => Number.isFinite(value) && value > 0)) throw new Error("Invalid working area");
  const elements = [];
  const px = (v) => Math.round(v * 7.5);
  const py = (v) => Math.round(v * 5.5);
  const add = (type, x, y, attrs = {}) => {
    if (![x, y].every((v) => Number.isFinite(v) && v >= 0 && v <= 100))
      throw new Error(`${prefix}: coordinate outside field`);
    const element = { id: `${prefix}-${elements.length + 1}`, type, x: px(x), y: py(y), ...attrs };
    elements.push(element);
    return element;
  };
  const api = {
    player: (x, y, number, team = "home", name) =>
      add("player", x, y, { team, number: String(number), radius: 16, ...(name ? { name } : {}) }),
    keeper: (x, y, number = "1", team = "home") => add("goalkeeper", x, y, { team, number: String(number), size: 25 }),
    ball: (x, y) => add("ball", x, y, { radius: 9 }),
    cone: (x, y, color = "#f59e0b") => add("cone", x, y, { color, size: 12 }),
    marker: (x, y, color = "#facc15") => add("marker", x, y, { color, size: 12, shape: "circle" }),
    goal: (x, y, rotation = 0, size = "small") => add("goal", x, y, { size, rotation }),
    text: (x, y, text, fontSize = 14, color = "#ffffff") => add("text", x, y, { text, fontSize, color }),
    zone: (x, y, width, height, color = "#38bdf8") =>
      add("zone", x, y, { width: px(width), height: py(height), color, opacity: 0.16 }),
    line: (x1, y1, x2, y2, color = "#ffffff", style = "dashed") =>
      add("line", x1, y1, { points: [0, 0, px(x2 - x1), py(y2 - y1)], color, thickness: 2, style }),
    pass: (x1, y1, x2, y2) =>
      add("arrow", x1, y1, { endX: px(x2), endY: py(y2), color: "#60a5fa", thickness: 3, style: "straight" }),
    run: (x1, y1, x2, y2) =>
      add("arrow", x1, y1, { endX: px(x2), endY: py(y2), color: "#fb923c", thickness: 3, style: "dashed" }),
    dribble: (x1, y1, x2, y2) =>
      add("arrow", x1, y1, { endX: px(x2), endY: py(y2), color: "#c4b5fd", thickness: 3, style: "curved" }),
    ladder: (x, y, length = 10, rotation = 0) => add("ladder", x, y, { length: px(length), rungs: 6, rotation }),
    document: {
      schemaVersion: 1,
      kind: "tactical-board",
      pitch: { type: "training", width: 750, height: 550 },
      elements,
    },
  };
  api.text(4, 4, "Örnek çalışma grubu · ölçüler seçilen yaş uyarlamasında", 13);
  return api;
}

export function finish(diagram, guide) {
  diagram.text(4, 94, "Mavi düz: pas", 12);
  diagram.text(31, 94, "Turuncu kesik: topsuz hareket", 12);
  diagram.text(67, 94, "Mor kavis: top sürme", 12);
  return { ...guide, boardDocument: diagram.document };
}
