# D2 Project: Visual Models

Browser Link: https://timphan27.github.io/CMPM121-Demo-2/

# Documentation

This project lets you draw with different marker sizes and place stickers on a canvas.

- Select Thin Marker to draw with a 2-pixel-wide line.

- Select Thick Marker to draw with an 8-pixel-wide line.

- Select a sticker, such as a star, heart, or flower, to place it on the canvas.

- Click and drag your mouse to draw a line.

- Click on the canvas to place a sticker.

- Select Undo to remove your most recent drawing or sticker.

- Select Redo to restore an undone drawing or sticker.

- Select Redraw to redraw the canvas using the saved drawing commands.

# Running the App

- First, install deno. Clone REPO (https://github.com/timphan27/CMPM121-Demo-2.git) and open project folder in your terminal. Run the development server using: deno task dev.
- Open the local URL shown on the browser.
- Note: An internet connection is needed to obtain the repository and install any required dependencies. After setup, the app can be used offline as long as it does not rely on external resources at runtime.

# Developer Documentation

Code Organization:

src/main.ts contains the main application code, including the canvas, tools, drawing commands, pointer events, and rendering.

src/history.ts contains the undo and redo functionality.

# Change Map:

The app uses a SelectedTool type to keep track of the currently selected tool. Add a new tool kind for rectangles and include the information it needs, such as its color and fill in the kind field, describing the tool. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L65

Add the new drawing command:
Find the DrawingCommand type. It currently allows either a Stroke or a Sticker. Add the new command type so the document can store the new tool's output. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L39

Add its rendering behavior:
Find renderDocument(). It loops through drawingDocument.commands and calls each command's render() function. Give the new command its own rendering function so it can appear on the canvas. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L232

Add a selection button:
Find the section where the marker and sticker buttons are created. Add a button that updates selectedTool when clicked. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L90

Update pointer handling:
Find the pointerdown event listener on the canvas. It checks the selected tool's kind to decide what happens when the user interacts with the canvas. Add the behavior needed for the new tool. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L265

Check history behavior:
See setupHistory() in main.ts and setupHistory() in history.ts to understand how undo and redo work. When adding the rectangle tool, follow the existing pattern in the pointer-up handler: add the completed new command to drawingDocument.commands and call clearRedoHistory(). https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L323 |
https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/history.ts#L8

Check undo and redo:
The new command is stored in drawingDocument.commands, which is the same collection used by the history system. This means the existing undo and redo functionality should work without needing separate history logic for the new tool. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/history.ts#L8

Check export behavior:
Find the``````````````````` exportPNG()``` function in main.ts. It loops through drawingDocument.commands and calls each command's render() function on the export canvas. The new command should use the same rendering process, so exportPNG() should work without needing a separate rendering implementation.

Test the new tool.
Check that the tool can be selected and used, that its output appears correctly. Undo 3 times and redo 3 times and check if the canvas stays the same as before you did the first undo.

# Essential Code:

SelectedTool: describes which tool is currently selected. https://github.com/timphan27/CMPM121-Demo-2/blob/57a039ac7f5abd66683179c74ae74ebe6ab79694/src/main.ts#L69

DrawingCommand: describes the types of content that can be stored in the document. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L65

drawingDocument: stores the committed drawing commands. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L41

renderDocument(): redraws the saved commands on the canvas. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L232

pointerdown and pointermove: handle user interaction with the canvas.https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L265 | https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/main.ts#L323

setupHistory() in history.ts: manages undo and redo. https://github.com/timphan27/CMPM121-Demo-2/blob/a199e5463d3eef6abb43a8432416c97fb3725356/src/history.ts#L8

## Credits

Tim Phan, Aayan Abdullah
