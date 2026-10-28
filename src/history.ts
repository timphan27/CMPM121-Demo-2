type HistoryOptions<T> = { //describes what should be passed to setupHistory()
  strokes: T[]; // pass the array of strokes of the document
  undoButton: HTMLButtonElement; // we pass pass the element of the button we created here
  redoButton: HTMLButtonElement; // we pass pass the element of the button we created here
  renderDocument: () => void;
};

export function setupHistory<T>(options: HistoryOptions<T>) {
  const { strokes, undoButton, redoButton, renderDocument } = options; //

  // stores strokes that have been undone and can be restored
  const redoHistory: T[] = [];

  // enable or disable buttons depending on available history
  function updateHistoryButtons() {
    undoButton.disabled = strokes.length === 0;
    redoButton.disabled = redoHistory.length === 0;
  }

  // undo the most recent completed stroke
  undoButton.addEventListener("click", () => {
    if (strokes.length === 0) return;

    const stroke = strokes.pop()!; //remove most recent stroke
    redoHistory.push(stroke); //add stroke to redo history

    renderDocument(); //redraw canvas
    updateHistoryButtons();
  });

  // restore the most recently undone stroke
  redoButton.addEventListener("click", () => {
    if (redoHistory.length === 0) return;

    const stroke = redoHistory.pop()!;
    strokes.push(stroke);

    renderDocument();
    updateHistoryButtons();
  });

  // clear redo history when a new stroke is created
  function clearRedoHistory() {
    redoHistory.length = 0;
    updateHistoryButtons();
  }

  updateHistoryButtons(); // call this to initalize the stroke and redoHistory states

  return { clearRedoHistory, updateHistoryButtons };
}
