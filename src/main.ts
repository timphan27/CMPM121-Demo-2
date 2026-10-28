import { setupHistory } from "./history.ts";

const app = document.querySelector<HTMLElement>("#app")!;
const heading = document.createElement("h1");
heading.textContent = "D2 project";

type Coordinate = { //will hold each xy coordinate
  x: number;
  y: number;
};

type Stroke = { //stores an array of coordinates
  kind: "stroke";
  points: Coordinate[];
  color: string;
  width: number;
  render: (context: CanvasRenderingContext2D) => void;
};

// Data describing each available sticker
type StickerDefinition = {
  id: string;
  label: string;
  content: string;
  size: number;
};

// A placed sticker stores its position and appearance
type Sticker = {
  kind: "sticker";
  x: number;
  y: number;
  content: string;
  size: number;
  render: (context: CanvasRenderingContext2D) => void;
};

// A command can contain either strokes or stickers
type DrawingCommand = Stroke | Sticker;

type DrawingDocument = { // Stores strokes and stickers in the current drawing session
  commands: DrawingCommand[]; // Keep an array of drawing commands
};

const drawingDocument: DrawingDocument = { // Create empty document object to store drawing commands
  commands: [],
};

let currentStroke: Stroke | null = null;

// available marker tools
const markerTools = [
  { label: "Thin Marker", width: 2, color: "black" },
  { label: "Thick Marker", width: 8, color: "black" },
];

// all available stickers will be defined here:
const stickers: StickerDefinition[] = [
  { id: "star", label: "Star ⭐", content: "⭐", size: 36 },
  { id: "heart", label: "Heart ❤️", content: "❤️", size: 36 },
  { id: "flower", label: "Flower 🌸", content: "🌸", size: 36 },
];

// The selected tool determines what happens on the next pointer press
type SelectedTool =
  | { kind: "marker"; width: number; color: string }
  | { kind: "sticker"; sticker: StickerDefinition };

let selectedTool: SelectedTool = {
  kind: "marker",
  width: 2,
  color: "black",
};

const message = document.createElement("p");
message.textContent = "Choose a tool, then draw or click to place a sticker.";

// This button will redraw all drawing comamnds (Stroke OR Sticker)
const redrawButton = document.createElement("button");
redrawButton.textContent = "Redraw";

// undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.disabled = true;
undoButton.title = "Undo the most recent drawing action";

// redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.disabled = true;
redoButton.title = "Redo the most recently undone action";

// create buttons for the marker tools
const markerButtons = markerTools.map((tool) => {
  const button = document.createElement("button");
  button.textContent = tool.label;

  button.addEventListener("click", () => {
    selectedTool = {
      kind: "marker",
      width: tool.width,
      color: tool.color,
    };
  });

  return button;
});

// create buttons for each sticker in the map
const stickerButtons = stickers.map((sticker) => {
  const button = document.createElement("button");
  button.textContent = sticker.label;

  button.addEventListener("click", () => {
    selectedTool = {
      kind: "sticker",
      sticker,
    };
  });

  return button;
});

//canvas configurations
const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 400;

// give the canvas a visible border and background
canvas.style.border = "2px solid black";
canvas.style.backgroundColor = "white";
canvas.style.cursor = "crosshair";
canvas.style.touchAction = "none";

// this container will keep the tools on the right and the canvas on left
const layout = document.createElement("div");
layout.style.display = "flex"; // Stack elements side by side
layout.style.gap = "20px";

// keep the tools in a vertical column
const toolsPanel = document.createElement("div");
toolsPanel.style.display = "flex";
toolsPanel.style.flexDirection = "column"; //set the buttons to be arranged vertically
toolsPanel.style.gap = "10px";

// put the heading, message, and canvas on the left.
const canvasPanel = document.createElement("div");
canvasPanel.style.display = "flex";
canvasPanel.style.flexDirection = "column";
canvasPanel.style.gap = "10px";

canvasPanel.append(heading, message, canvas);

toolsPanel.append(
  ...markerButtons,
  ...stickerButtons,
  redrawButton,
  undoButton,
  redoButton,
);

layout.append(canvasPanel, toolsPanel); // Put the inner containers inside layou
app.append(layout);

// get the canvas's 2D drawing context.
const context = canvas.getContext("2d");

if (!context) {
  throw new Error("Error: Context type is unsupported.");
}

const ctx: CanvasRenderingContext2D = context;

let isDrawing = false; //this is tracking if the mouse is being held down

// Convert pointer coordinates into canvas coordinates.
function getPosition(event: PointerEvent) {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - bounds.left) * canvas.width / bounds.width,
    y: (event.clientY - bounds.top) * canvas.height / bounds.height,
  };
}

// Draw one stroke using its saved points and appearance
function drawStroke(context: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length === 0) return; //Check if any strokes exist

  context.beginPath();
  context.strokeStyle = stroke.color;
  context.fillStyle = stroke.color;
  context.lineWidth = stroke.width;
  context.lineCap = "round";
  context.lineJoin = "round";

  const firstPoint = stroke.points[0];

  // Edgecase: Draw a dot if the stroke contains only one point (x,y)
  if (stroke.points.length === 1) {
    context.arc(firstPoint.x, firstPoint.y, stroke.width / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }

  // Connect all saved points in order
  context.moveTo(firstPoint.x, firstPoint.y);

  for (let i = 1; i < stroke.points.length; i++) {
    const point = stroke.points[i]; //store next pt
    context.lineTo(point.x, point.y); //create a path between the previous pt and the current pt
  }

  context.stroke(); // Draw complete path on canvas.
}

// Draw a sticker using its saved position and appearance
function drawSticker(context: CanvasRenderingContext2D, sticker: Sticker) {
  context.font = `${sticker.size}px serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(sticker.content, sticker.x, sticker.y);
}

// Clear the canvas and reconstruct the picture from the document
function renderDocument() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //clear current canvas pixels

  // Redraw every saved command in order, including both strokes and stickers
  for (const command of drawingDocument.commands) {
    command.render(ctx);
  }

  // if user is current still drawing, show the current stroke.
  if (currentStroke) {
    currentStroke.render(ctx);
  }
}

// Set up undo and redo history
// History works with any command, including strokes and stickers.
const history = setupHistory({
  strokes: drawingDocument.commands,
  undoButton, // Here we are passing the buttons we created so the functions in history.ts can use them.
  redoButton,
  renderDocument,
});

const clearRedoHistory = history.clearRedoHistory;

// redraw without deleting any saved strokes
redrawButton.addEventListener("click", () => {
  renderDocument();
});

// cancel the current stroke without saving it
function cancelStroke() {
  if (!currentStroke) return;

  currentStroke = null;
  isDrawing = false;

  renderDocument();
}

// Start drawing when the pointer is pressed.
canvas.addEventListener("pointerdown", (event: PointerEvent) => {
  if (event.button !== 0) return;

  const position = getPosition(event);

  // Place a sticker at the pointer position if a sticker tool is selected
  if (selectedTool.kind === "sticker") {
    const sticker = selectedTool.sticker;

    const placedSticker: Sticker = {
      kind: "sticker",
      x: position.x,
      y: position.y,
      content: sticker.content,
      size: sticker.size,
      render(context) {
        drawSticker(context, this);
      },
    };

    drawingDocument.commands.push(placedSticker); // Add command to the document immediately
    clearRedoHistory(); // New drawing actions will clear the redo history
    renderDocument(); // Update Canvas
    return;
  }

  // Else, start drawing a stroke:
  isDrawing = true;
  canvas.setPointerCapture(event.pointerId);

  currentStroke = {
    kind: "stroke",
    points: [{ x: position.x, y: position.y }], //store current position
    color: selectedTool.color,
    width: selectedTool.width,
    render(context) {
      drawStroke(context, this);
    },
  };
  renderDocument(); // Update Canvas
});

// Draw a line as the pointer moves
canvas.addEventListener("pointermove", (event: PointerEvent) => {
  if (!isDrawing || !currentStroke) return; //check if the pointer is being pressed down, else do not draw anything or record any pts

  const position = getPosition(event);

  // add the new point in the current stroke.
  currentStroke.points.push({
    x: position.x,
    y: position.y,
  });

  renderDocument();
});

// Stop drawing when the pointer is released
canvas.addEventListener("pointerup", () => {
  if (currentStroke) {
    // Save the completed command in the document when mouse is released
    drawingDocument.commands.push(currentStroke);

    // new strokes will clear the redo history
    clearRedoHistory();
  }
  currentStroke = null;
  isDrawing = false;

  renderDocument();
});

canvas.addEventListener("pointercancel", cancelStroke);
