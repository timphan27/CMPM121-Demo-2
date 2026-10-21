const app = document.querySelector<HTMLElement>("#app")!;
const heading = document.createElement("h1");
heading.textContent = "D2 project";

type Coordinate = { //will hold each xy coordinate
  x: number;
  y: number;
};

type Stroke = { //stores an array of coordinates
  points: Coordinate[];
  color: string;
  width: number;
};

type DrawingDocument = { //stores strokes
  strokes: Stroke[]; //keep an array of strokes
};

const drawingDocument: DrawingDocument = { //create empty document object to store strokes
  strokes: [],
};

let currentStroke: Stroke | null = null;

const message = document.createElement("p");
message.textContent = "Draw by clicking and dragging your mouse.";

//canvas configurations
const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 400;

// give the canvas a visible border and background
canvas.style.border = "2px solid black";
canvas.style.backgroundColor = "white";
canvas.style.cursor = "crosshair";
canvas.style.touchAction = "none";

app.append(heading, message, canvas);

// get the canvas's 2D drawing context.
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Error: Context type is unsupported.");
}

let isDrawing = false; //this is tracking if the mouse is being held down
let lastX = 0;
let lastY = 0;

// Convert pointer coordinates into canvas coordinates.
function getPosition(event: PointerEvent) {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - bounds.left) * canvas.width / bounds.width,
    y: (event.clientY - bounds.top) * canvas.height / bounds.height,
  };
}

// Start drawing when the pointer is pressed.
canvas.addEventListener("pointerdown", (event: PointerEvent) => {
  if (event.button !== 0) return;

  isDrawing = true;
  canvas.setPointerCapture(event.pointerId);

  const position = getPosition(event);
  lastX = position.x; ///update current position of mouse here to track starting point
  lastY = position.y;

  // start a new stroke and save its first point.
  currentStroke = {
    points: [{ x: position.x, y: position.y }], //store current position
    color: "black",
    width: 3,
  };
});

//do: track when mouse is held and released
// Draw a line as the pointer moves
canvas.addEventListener("pointermove", (event: PointerEvent) => {
  if (!isDrawing || !currentStroke) return; //check if the pointer is being pressed down, else do not draw anything or record any pts

  const position = getPosition(event);

  // add the new point in the current stroke.
  currentStroke.points.push({
    x: position.x,
    y: position.y,
  });

  ctx.beginPath();
  ctx.moveTo(lastX, lastY); //set starting position
  ctx.lineTo(position.x, position.y); //here, we create a line from the start to end position

  //line modifications
  ctx.strokeStyle = currentStroke.color;
  ctx.lineWidth = currentStroke.width;
  ctx.lineCap = "round";
  ctx.stroke();

  lastX = position.x; //update current positions
  lastY = position.y;
});

// Stop drawing when the pointer is released.
canvas.addEventListener("pointerup", () => {
  if (currentStroke) {
    // save the completed stroke in the document. Document will now have a reference to this stroke.
    drawingDocument.strokes.push(currentStroke);
  }
  currentStroke = null;
  isDrawing = false;
});
