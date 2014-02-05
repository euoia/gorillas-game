// The map generator.
//
// All measurements are in terms of grid-squared and not pixels (except gridSize itself).
function Gorillas(options) {
  // Size of a grid square in pixels.
  this.gravity = 40;
  this.gridSize = 20;
  this.borderSize = 2;

  this.mapWidth = options.mapWidth;
  this.mapHeight = options.mapHeight;

  // TODO: Dynamically add the canvas element.
  this.screen = document.getElementById(options.screen);
  this.screen.style.width = this.toPixels(this.mapWidth) + 'px';
  this.screen.style.height = this.toPixels(this.mapHeight) + 'px';

  this.canvas = document.getElementById("c");
  this.canvas.style.position = 'absolute';
  this.canvas.setAttribute('width', this.toPixels(this.mapWidth) + 'px');
  this.canvas.setAttribute('height', this.toPixels(this.mapHeight) + 'px');
  this.context = this.canvas.getContext('2d');

  // The UI overlay layer.
  this.ui = document.getElementById("ui");
  this.ui.style.position = 'absolute';
  this.ui.setAttribute('width', this.toPixels(this.mapWidth) + 'px');
  this.ui.setAttribute('height', this.toPixels(this.mapHeight) + 'px');
  this.uiContext = this.ui.getContext('2d');

  this.gorillaImg = new Image();
  this.gorillaImg.src = "img/gorilla.png";

  this.bananaImg = new Image();
  this.bananaImg.src = "img/banana.png";

  this.initScreen();
  this.placeBuildings();

  // 2-array of positions for player 1 and player 2 gorillas respectively.
  this.gorillaPositions = [];

  // If we had more images I would write a proper preloader.
  // TODO: Make a preloader so that the banana is definitely loaded.
  this.gorillaImg.onload = function () {
    this.placeGorillas();
    this.ui.addEventListener('mousedown', this.canvasClicked.bind(this));
  }.bind(this);
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

Gorillas.prototype.placeGorillas = function() {
  var player1GorillaX = this.randomIntBetween(2, 10);
  var player2GorillaX = this.randomIntBetween(this.mapWidth - 10, this.mapWidth - 2);

  this.placeGorilla(this.findGorillaLocation(this.toPixels(player1GorillaX)));
  this.placeGorilla(this.findGorillaLocation(this.toPixels(player2GorillaX)));
};

// TODO: Do not intersect a building when placing the gorillas.
// Place a single gorilla - search down from the top.
Gorillas.prototype.findGorillaLocation = function(xpos) {
  // Search for the first non-blue pixel (represents a building).

  var imgData;
  var x = xpos, y = 0;

  while (y < this.toPixels(this.mapHeight)) {
    imgData = this.context.getImageData(x,y,1,1);

    if (this.isBackgroundColour(imgData.data) === 0) {
      //console.log("Found non-background colour at x=%d y=%d", x, y);
      return {
        'x': x,
        'y': y - this.gorillaImg.height
      };
    }

    y += 1;
  }

  return {'x': x, 'y': y};
  //throw new error('Unable to place gorilla!');

};

Gorillas.prototype.placeGorilla = function(point) {
  //console.log("Placing gorilla at x=%d y=%d", point.x, point.y);
  this.context.drawImage(this.gorillaImg, point.x, point.y);
  this.gorillaPositions.push(point);
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

  //console.log("Placing building colour=%s xpos=%d width=%d height=%d", colour, xpos, width, height);
};

Gorillas.prototype.drawWindows = function(xpos, ypos, xlim, ylim) {
  var x = xpos + 8,
    y = ypos + 8;

  //console.log("drawWindows xpos=%d ypos=%d xlim=%d ylim=%d", xpos, ypos, xlim, ylim);

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

  //console.log("Drawing window at colour=%s xpos=%d ypos=%d", colour, xpos, ypos);
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

// Check if an imgData array (as returned by getImageData().data) is the
// background colour.
Gorillas.prototype.isBackgroundColour = function(imgData) {
  if (imgData[0] === 0 && imgData[1] === 0 && imgData[2] == 255) {
    return 1;
  }

  return 0;
};

Gorillas.prototype.canvasClicked = function(e) {
  console.log("e", e);
  this.uiContext.fillStyle = 'pink';

  var point = {'x': e.layerX, 'y': e.layerY};

  // Check if player 1 gorilla was clicked.
  var pointIsInsideBox = this.pointIsInsideBox(
    point,
    this.gorillaPositions[0].x,
    this.gorillaPositions[0].y,
    this.gorillaImg.width,
    this.gorillaImg.height
  );


  if (pointIsInsideBox === true) {
    var moveListener = function(e) {
        return this.mouseMoved(0, point, e);
      }.bind(this);

    this.ui.addEventListener('mousemove', moveListener);

    // Unfortunately I think we need to store one listener on the gorillas
    // object.
    this.mouseUpListener = function(e) {
        this.ui.removeEventListener('mousemove', moveListener);
        return this.mouseUp(0, point, e);
    }.bind(this);

    this.ui.addEventListener('mouseup', this.mouseUpListener);
  }
};

// Shows where the banana will be thrown.
Gorillas.prototype.mouseMoved = function(
  player,
  startPoint,
  e
) {
  // Clear the UI layer.
  this.uiContext.clearRect(0, 0, this.toPixels(this.mapWidth), this.toPixels(this.mapHeight));

  this.uiContext.beginPath();
  this.uiContext.moveTo(startPoint.x, startPoint.y);
  this.uiContext.lineTo(e.layerX, e.layerY);
  this.uiContext.stroke();
};

// Throws the banana.
Gorillas.prototype.mouseUp = function(
  player,
  startPoint,
  e
) {
  // Remove the mouseUp listener.
   this.ui.removeEventListener('mouseup', this.mouseUpListener);

  // Clear the UI layer.
  console.log("mouse up!");
  this.uiContext.clearRect(0, 0, this.toPixels(this.mapWidth), this.toPixels(this.mapHeight));

  // Metres per second? Pixels per second?
  var xVel = e.layerX - startPoint.x;
  var yVel = e.layerY - startPoint.y;

  // TODO: If the exit point is inside the gorilla's box, don't throw.
  var currTime = window.performance.now();
  window.requestAnimationFrame(this.animateBanana.bind(this, currTime, startPoint, xVel, yVel));
};

Gorillas.prototype.animateBanana = function(startTime, startPoint, xVel, yVel, time) {

  var deltaTime = (time - startTime) / 300;
  var xpos = startPoint.x + (xVel * deltaTime);
  var ypos = startPoint.y + (yVel * deltaTime) + (this.gravity * deltaTime * deltaTime);

  this.uiContext.clearRect(0, 0, this.toPixels(this.mapWidth), this.toPixels(this.mapHeight));
  this.uiContext.drawImage(this.bananaImg, xpos, ypos);

  // Out of bounds.
  if (xpos > this.toPixels(this.mapWidth) + 100 ||
     ypos > this.toPixels(this.mapHeight) + 100
  ) {
    return;
  }


  // TODO: y position and collision with context layer.

  // Timeout after 5 seconds.
  if (time - startTime < 5000) {
    window.requestAnimationFrame(this.animateBanana.bind(this, startTime, startPoint, xVel, yVel));
  }


};

// Returns true if the point (with properties x and y) is inside the box.
Gorillas.prototype.pointIsInsideBox = function(point, boxX, boxY, boxWidth, boxHeight) {
  if (point.x >= boxX &&
      point.x <= boxX + boxWidth &&
      point.y >= boxY &&
      point.y <= boxY + boxHeight
  ) {
    return true;
  }

  return false;
};
