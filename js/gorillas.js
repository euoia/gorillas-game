// The map generator.
//
// All measurements are in terms of grid-squared and not pixels (except gridSize itself).
function Gorillas(options) {
  // Size of a grid square in pixels.
  this.gridSize = 20;
  this.borderSize = 2;

  this.mapWidth = options.mapWidth;
  this.mapHeight = options.mapHeight;

  // TODO: Dynamically add the canvas element.
  this.screen = document.getElementById(options.screen);
  this.screen.style.width = this.toPixels(this.mapWidth) + 'px';
  this.screen.style.height = this.toPixels(this.mapHeight) + 'px';
  this.canvas = document.getElementById("c");
  this.context = this.canvas.getContext('2d');
  this.canvas.setAttribute('width', this.toPixels(this.mapWidth) + 'px');
  this.canvas.setAttribute('height', this.toPixels(this.mapHeight) + 'px');

  // Easier to see when livereload has kicked off.
  console.log(Date.now());

  this.initScreen();
  this.placeBuildings();
}

Gorillas.prototype.initScreen = function() {
  // x = 10, y = 20, width = 200, height = 100
  this.context.fillStyle = 'blue';
  this.context.fillRect(0, 0, this.toPixels(this.mapWidth), this.toPixels(this.mapHeight));
};

Gorillas.prototype.placeBuildings = function() {
  var xPos = 0;
  var width,
    lastWidth,
    height,
    lastHeight;

  while (xPos < this.mapWidth) {
    while (lastWidth === width || lastHeight === height) {
      width = this.randomIntBetween(4, 7);
      height = this.randomIntBetween(3, 14);
    }

    if (xPos + width > this.mapWidth) {
        width = this.mapWidth - xPos;
    }

    this.placeBuilding(xPos, width, height);
    xPos += width;
    lastWidth = width;
    lastHeight = height;
  }
};

// Converts a size in grid positions to pixels
Gorillas.prototype.toPixels = function(gridRef) {
  return gridRef * this.gridSize;
};

Gorillas.prototype.placeBuilding = function(
  xpos,
  width,
  height
) {
  var colour = this.randomBuildingColour();
  this.context.fillStyle = colour;
  this.context.fillRect(this.toPixels(xpos),
                        this.toPixels(this.mapHeight - height),
                        this.toPixels(width) - this.borderSize,
                        this.toPixels(this.mapHeight));

  this.drawWindows(this.toPixels(xpos),
                   this.toPixels(this.mapHeight - height),
                   this.toPixels(xpos + width) - this.borderSize,
                   this.toPixels(this.mapHeight));

  console.log("Placing building colour=%s xpos=%d width=%d height=%d", colour, xpos, width, height);
};

Gorillas.prototype.drawWindows = function(xpos, ypos, xlim, ylim) {
  var x = xpos + 8,
    y = ypos + 8;

  console.log("drawWindows xpos=%d ypos=%d xlim=%d ylim=%d", xpos, ypos, xlim, ylim);

  while (x < xlim) {
    y = ypos + 8;
    while (y < ylim) {
      if (x + 7 < xlim - 2 &&
          y + 12 < ylim - 2
      ) {
        this.drawWindow(x, y);
      }

      y += 28;
    }

    x += 18;
  }
};

Gorillas.prototype.drawWindow = function(xpos, ypos) {
  var colour = this.randomWindowColour();
  this.context.fillStyle = colour;
  this.context.fillRect(xpos,
                        ypos,
                        7,
                        12);

  console.log("Drawing window at colour=%s xpos=%d ypos=%d", colour, xpos, ypos);
};

Gorillas.prototype.randomIntBetween = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

Gorillas.prototype.randomBuildingColour = function() {
  switch (this.randomIntBetween(0, 2)) {
    case 0:
      // Red.
      return '#a10500';
    case 1:
      // Teal.
      return '#14a0a3';
    case 2:
      // Grey.
      return '#a2a0a2';
  }
};

Gorillas.prototype.randomWindowColour = function() {
  switch (this.randomIntBetween(0, 1)) {
    case 0:
      // Yellow.
      return '#f8f503';
    case 1:
      // Grey.
      return '#3d403d';
  }
};


