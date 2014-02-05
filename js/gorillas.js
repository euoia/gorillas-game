// The map generator.
//
// All measurements are in terms of grid-squared and not pixels (except gridSize itself).
function Gorillas(options) {
  // Size of a grid square in pixels.
  this.gridSize = 20;

  this.mapWidth = options.mapWidth;
  this.mapHeight = options.mapHeight;

  // The jQuery selector for the screen element.
  this.screen = '#'.concat(options.screen);

  // Easier to see when livereload has kicked off.
  console.log(Date.now());

  this.initScreen();
  this.placeBuildings();
}

Gorillas.prototype.initScreen = function() {
  $(this.screen).addClass('screen');
  $(this.screen).css('width', this.toPixels(this.mapWidth));
  $(this.screen).css('height', this.toPixels(this.mapHeight));
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
  var b = $('<div class="building" />').appendTo(this.screen);
  b.css('left', this.toPixels(xpos));
  b.css('top', this.toPixels(this.mapHeight - height));
  b.css('height', this.toPixels(height));
  b.css('width', this.toPixels(width) - 1);
  b.css('position', 'absolute');

  console.log("Placing building xpos=%d width=%d height=%d", xpos, width, height);
};

Gorillas.prototype.randomIntBetween = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};
