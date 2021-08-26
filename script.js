const BRUSH_TIME = 1500;
const activeToolEl = document.getElementById('active-tool');
const brushColorBtn = document.getElementById('brush-color');
const brushIcon = document.getElementById('brush');
const brushSize = document.getElementById('brush-size');
const brushSlider = document.getElementById('brush-slider');
const bucketColorBtn = document.getElementById('bucket-color');
const eraser = document.getElementById('eraser');
const clearCanvasBtn = document.getElementById('clear-canvas');
const saveStorageBtn = document.getElementById('save-storage');
const loadStorageBtn = document.getElementById('load-storage');
const clearStorageBtn = document.getElementById('clear-storage');
const downloadBtn = document.getElementById('download');
const { body } = document;

// Global Variables
const canvas = document.createElement('canvas');
canvas.id = 'canvas';
const context = canvas.getContext('2d');
let currentSize = 10;
let bucketColor = '#FFFFFF';
let currentColor = '#A51DAB';
let isEraser = false;
let isMouseDown = false;
let drawnArray = [];

// Formatting Brush Size to show the text value next to slider
function displayBrushSize() {
  if (brushSlider.value < 10) {
    brushSize.textContent = `0${brushSlider.value}`;
  } else {
    brushSize.textContent = brushSlider.value;
  }
}

// Setting Brush Size
brushSlider.addEventListener('change', () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

// Setting Brush Color
brushColorBtn.addEventListener('change', () => {
  isEraser = false;
  currentColor = `#${brushColorBtn.value}`;
});

// Setting Background Color
bucketColorBtn.addEventListener('change', () => {
  bucketColor = `#${bucketColorBtn.value}`;
  createCanvas();
  restoreCanvas(); // if there is a drawing then it will show again with us having changed the canvas colour whilst drawing.
});

// // Eraser
eraser.addEventListener('click', () => {
  isEraser = true;
  brushIcon.style.color = 'white';
  eraser.style.color = 'black';
  activeToolEl.textContent = 'Eraser';
  currentColor = bucketColor;
  currentSize = 50;
});


// Switch back to Brush
function switchToBrush() {
  isEraser = false;
  activeToolEl.textContent = 'Brush';
  brushIcon.style.color = 'black';
  eraser.style.color = 'white';
  currentColor = `#${brushColorBtn.value}`;
  currentSize = 10;
  brushSlider.value = 10;
  displayBrushSize();
}

// timer function to show bruch icon after a set time assigned by a const BRUSH_TIME i.e. line 99
function brushTimeSetTimeout(time) {
  setTimeout(switchToBrush, time);
}

// Create Canvas
function createCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50; // this will be the innerHeight of the window minus 50 
  context.fillStyle = bucketColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  body.appendChild(canvas);
  switchToBrush(); // so that on start the brush icon is dark and text content for brush says Brush.
}

// Clear Canvas
clearCanvasBtn.addEventListener('click', () => {
  createCanvas();
  drawnArray = [];
  // Active Tool
  activeToolEl.textContent = 'Canvas Cleared';
  brushTimeSetTimeout(BRUSH_TIME);
});

// Draw what is stored in DrawnArray
function restoreCanvas() {
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = 'round';
    if (drawnArray[i].eraser) {
      context.strokeStyle = bucketColor;
    } else {
      context.strokeStyle = drawnArray[i].color;
    }
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

// Store Drawn Lines in DrawnArray
function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };
  console.log(line);
  drawnArray.push(line);
}

// Get Mouse Position
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

// Mouse Down
canvas.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);
  // console.log('mouse is clicked', currentPosition);
  context.moveTo(currentPosition.x, currentPosition.y); //Moves the pen to the coordinates specified by x and y
  context.beginPath(); // Creates a new path. Once created, future drawing commands are directed into the path and used to build the path up
  context.lineWidth = currentSize;
  context.lineCap = 'round';
  context.strokeStyle = currentColor;
});

// Mouse Move
canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);
    // console.log('mouse is moving', currentPosition);
    context.lineTo(currentPosition.x, currentPosition.y); // Draws a line from the current drawing position to the position specified by x and y.
    context.stroke(); // Draws the shape by stroking its outline
    storeDrawn( 
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser,
    );
  } else {
    storeDrawn(undefined);
  }
});

// Mouse Up
canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
  console.log('mouse is unclicked');
});

// Save to Local Storage
saveStorageBtn.addEventListener('click', () => {
  localStorage.setItem('savedCanvas', JSON.stringify(drawnArray));
  // Active Tool
  activeToolEl.textContent = 'Canvas Saved';
  brushTimeSetTimeout(BRUSH_TIME);
}); 

// Load from Local Storage
loadStorageBtn.addEventListener('click', () => {
  if (localStorage.getItem('savedCanvas')) {
    drawnArray = JSON.parse(localStorage.savedCanvas);
    restoreCanvas();
  // Active Tool
    activeToolEl.textContent = 'Canvas Loaded';
    brushTimeSetTimeout(BRUSH_TIME);
  } else {
    activeToolEl.textContent = 'No Canvas Found';
    brushTimeSetTimeout(BRUSH_TIME);
  }

});

// Clear Local Storage
clearStorageBtn.addEventListener('click', () => {
  localStorage.removeItem('savedCanvas');
  // Active Tool
  activeToolEl.textContent = 'Local Storage Cleared';
  brushTimeSetTimeout(BRUSH_TIME);
});

// Download Image
downloadBtn.addEventListener('click', () => {
  downloadBtn.href = canvas.toDataURL('image/jpeg', 1.0);
  downloadBtn.download = 'paint-image.jpeg'
  // Active Tool
  activeToolEl.textContent = 'Image File Saved';
  brushTimeSetTimeout(BRUSH_TIME);
});

// Event Listener
brushIcon.addEventListener('click', switchToBrush);

// On Load
createCanvas();
