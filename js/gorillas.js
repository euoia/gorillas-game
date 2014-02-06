// The map generator.
//
// All measurements are in terms of grid-squared and not pixels (except gridSize itself).
function Gorillas(options) {
  // Size of a grid square in pixels.
  this.gravity = 40;
  this.gridSize = 10;
  this.borderSize = 2;

  this.mapWidth = options.mapWidth;
  this.mapHeight = options.mapHeight;

  // 2-array of positions for player 0 and player 1 gorillas respectively.
  this.gorillaPositions = [];

  // Object storing the position of the banana.
  this.bananaPosition = {};

  // Store the buildings so we can place the gorillas more intelligently.
  // Array of objects like:
  // {'xpos': buildingXPosition, 'width': buildingWidth, 'height': buildingHeight}
  this.buildings = [];

  // Which player has the first turn this round?
  // 0 => Player 0, 1 => Player 1.
  this.startingPlayer = 0;

  // How many turns have passed?
  this.turnNumber = null;


  // TODO: Dynamically add the canvas element.
  this.screen = document.getElementById(options.screen);
  this.screen.style.width = this.toPixels(this.mapWidth) + 'px';
  this.screen.style.height = this.toPixels(this.mapHeight) + 'px';

  // The background layer, gorillas and buildings.
  this.canvas = document.getElementById("c");
  this.canvas.style.position = 'absolute';
  this.canvas.setAttribute('width', this.toPixels(this.mapWidth) + 'px');
  this.canvas.setAttribute('height', this.toPixels(this.mapHeight) + 'px');
  this.context = this.canvas.getContext('2d');

  // The Banana overlay layer.
  this.banana = document.getElementById("banana");
  this.banana.style.position = 'absolute';
  this.banana.setAttribute('width', this.toPixels(this.mapWidth) + 'px');
  this.banana.setAttribute('height', this.toPixels(this.mapHeight) + 'px');
  this.bananaContext = this.banana.getContext('2d');

  // The UI overlay layer.
  this.ui = document.getElementById("ui");
  this.ui.style.position = 'absolute';
  this.ui.setAttribute('width', this.toPixels(this.mapWidth) + 'px');
  this.ui.setAttribute('height', this.toPixels(this.mapHeight) + 'px');
  this.uiContext = this.ui.getContext('2d');

  // Use an image loader.
  var imageLoader = new ImageLoader();

  // The gorilla.
  this.gorillaImg = imageLoader.load('img/gorilla.png');

  // The bananas.
  this.numBananaImgs = 4;
  this.bananaImgs = [];
  for (var i=0; i < this.numBananaImgs; i += 1) {
    this.bananaImgs[i] = imageLoader.load('img/banana-' + String(i) + '.png');
  }

  // The explosion.
  this.explosionImg = imageLoader.load('img/explosion.png');

  // The sun.
  this.sunImg = imageLoader.load('img/sun.png');

  this.initScreen();
  this.placeBuildings();

  // If we had more images I would write a proper preloader.
  // TODO: Make a preloader so that the banana is definitely loaded.
  imageLoader.done(function () {
    this.placeGorillas();
    this.banana.addEventListener('mousedown', this.canvasClicked.bind(this));
    this.nextTurn();
  }.bind(this));
}

Gorillas.prototype.initScreen = function() {
  this.context.fillStyle = 'blue';
  this.context.fillRect(0, 0, this.toPixels(this.mapWidth), this.toPixels(this.mapHeight));
};

Gorillas.prototype.placeBuildings = function() {
  var xPos = 0;
  var width,
    lastWidth,
    height,
    lastHeight;

  this.buildings = [];

  while (xPos < this.mapWidth) {
    // Ensure no adjacent buildings have the same width or height.
    while (lastWidth === width || lastHeight === height) {
      width = this.randomIntBetween(6, 10);
      height = this.randomIntBetween(6, 28);
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
  // Choose the start locations for the gorillas.
  var player0Building = this.randomIntBetween(1, 3);
  var player1Building = this.randomIntBetween(this.buildings.length - 4, this.buildings.length - 2);


  this.gorillaPositions[0] = this.findGorillaLocation(player0Building);
  this.gorillaPositions[1] = this.findGorillaLocation(player1Building);

  this.placeGorilla(this.gorillaPositions[0]);
  this.placeGorilla(this.gorillaPositions[1]);
};

// Given a building index, find where to place the gorilla on the map.
Gorillas.prototype.findGorillaLocation = function(buildingIdx) {
  var xpos = this.getBuildingMidpoint(buildingIdx) - (this.gorillaImg.width / 2);
  var ypos = (
    this.toPixels(this.mapHeight) -
    this.buildings[buildingIdx].height -
    this.gorillaImg.height);

  return {'x': xpos, 'y': ypos};
};

Gorillas.prototype.placeGorilla = function(point) {
  //console.log("Placing gorilla at x=%d y=%d", point.x, point.y);
  this.context.drawImage(this.gorillaImg, point.x, point.y);
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

  this.buildings.push({'x': this.toPixels(xpos), 'width': this.toPixels(width), 'height': this.toPixels(height)});

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
    return true;
  }

  return false;
};

Gorillas.prototype.canvasClicked = function(e) {
  console.log("e", e);
  this.bananaContext.fillStyle = 'pink';

  var point = {'x': e.layerX, 'y': e.layerY};

  // Check if the current player's gorilla was clicked.
  var pointIsInsideBox = this.pointIsInsideBox(
    point,
    this.gorillaPositions[this.currentPlayer()].x,
    this.gorillaPositions[this.currentPlayer()].y,
    this.gorillaImg.width,
    this.gorillaImg.height
  );

  if (pointIsInsideBox === true) {
    var moveListener = function(e) {
        return this.mouseMoved(0, point, e);
      }.bind(this);

    this.banana.addEventListener('mousemove', moveListener);

    // Unfortunately I think we need to store one listener on the gorillas
    // object.
    this.mouseUpListener = function(e) {
        this.banana.removeEventListener('mousemove', moveListener);
        return this.mouseUp(0, point, e);
    }.bind(this);

    this.banana.addEventListener('mouseup', this.mouseUpListener);
  }
};

// Shows where the banana will be thrown.
Gorillas.prototype.mouseMoved = function(
  player,
  startPoint,
  e
) {
  // Clear the UI layer.
  this.bananaContext.clearRect(0, 0, this.toPixels(this.mapWidth), this.toPixels(this.mapHeight));

  this.bananaContext.beginPath();
  this.bananaContext.moveTo(startPoint.x, startPoint.y);
  this.bananaContext.lineTo(e.layerX, e.layerY);
  this.bananaContext.stroke();
};

// Throws the banana.
Gorillas.prototype.mouseUp = function(
  player,
  startPoint,
  e
) {
  // Remove the mouseUp listener.
   this.banana.removeEventListener('mouseup', this.mouseUpListener);

  // Clear the UI layer.
  console.log("mouse up!");
  this.bananaContext.clearRect(0, 0, this.toPixels(this.mapWidth), this.toPixels(this.mapHeight));

  // Calculate the velocity from the mouse distance moved.
  var xVel = (e.layerX - startPoint.x) * 1.5;
  var yVel = (e.layerY - startPoint.y) * 1.5;

  // But launch the banana from same same point relative to the gorilla each time.
  var launchPoint = {
    'x': this.gorillaPositions[this.currentPlayer()].x,
    'y': this.gorillaPositions[this.currentPlayer()].y - 50
  };

  // TODO: If the exit point is inside the gorilla's box, don't throw.
  var currTime = window.performance.now();
  window.requestAnimationFrame(this.animateBanana.bind(this, currTime, launchPoint, xVel, yVel));
};

Gorillas.prototype.animateBanana = function(startTime, startPoint, xVel, yVel, time) {

  var deltaTime = (time - startTime) / 300;

  var xpos = startPoint.x + (xVel * deltaTime);
  var ypos = startPoint.y + (yVel * deltaTime) + (this.gravity * deltaTime * deltaTime);

  // Clear the previous banana.
  if (this.bananaPosition.x !== undefined) {
    this.bananaContext.clearRect(
      this.bananaPosition.x,
      this.bananaPosition.y,
      this.bananaImgs[0].width,
      this.bananaImgs[0].height);
  }

  // Out of bounds to the left or right.
  if (xpos > this.toPixels(this.mapWidth) || xpos < 0) {
    console.log("out of bounds");
    this.nextTurn();
    return;
  }

  this.bananaPosition = {'x': xpos, 'y': ypos};

  // Check for bounds collision.
  var hasEdgeCollision = false;

  // Only check if the banana isn't outside the top of the map.
  if (ypos > 0) {
    hasEdgeCollision = this.hasEdgeCollision(
      xpos + 5,
      ypos + 5,
      this.bananaImgs[0].width - 5,
      this.bananaImgs[0].height - 5);
  }

  if (hasEdgeCollision) {
    console.log("Collision!");

    var hasGorillaCollision = this.hasGorillaCollision(
      xpos - 2,
      ypos - 2,
      this.bananaImgs[0].width + 2,
      this.bananaImgs[0].height + 2,
      this.gorillaPositions[1]);

    if (hasGorillaCollision) {
      console.log("Gorilla collision!");
      console.log("Player %d wins this round!", this.currentPlayer());
      this.nextRound();
      return;
    }

    this.nextTurn();

    this.context.drawImage(this.explosionImg, xpos, ypos);
    return;
  }

  // Draw the rotated banana.
  var bananaSeq = parseInt(deltaTime, 10) % this.numBananaImgs;
  var bananaImg = this.bananaImgs[bananaSeq];
  this.bananaContext.drawImage(bananaImg, xpos, ypos);

  // Timeout after 5 seconds.
  if (time - startTime < 5000) {
    window.requestAnimationFrame(this.animateBanana.bind(this, startTime, startPoint, xVel, yVel));
  } else {
    console.log("timeout");
    this.nextTurn();
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

// Just check the corners.
Gorillas.prototype.hasEdgeCollision = function(x, y, width, height) {
    var collision = (
      this.isBackgroundColour(this.context.getImageData(x,y,1,1).data) === false ||
      this.isBackgroundColour(this.context.getImageData(x+width,y,1,1).data) === false ||
      this.isBackgroundColour(this.context.getImageData(x,y+height,1,1).data) === false ||
      this.isBackgroundColour(this.context.getImageData(x+width,y+height,1,1).data) === false
    );

    return collision;
};

Gorillas.prototype.hasGorillaCollision = function(x, y, width, height, gorillaPosition) {
    var checkPoint = function (pointX, pointY) {
      return this.pointIsInsideBox (
        {'x': pointX, 'y': pointY},
        gorillaPosition.x,
        gorillaPosition.y,
        this.gorillaImg.width,
        this.gorillaImg.height);
    }.bind(this);

    var collision = (
      checkPoint(x, y) ||
      checkPoint(x + width, y) ||
      checkPoint(x, y + height) ||
      checkPoint(x + width, y + height)
    );

    return collision;
};

Gorillas.prototype.nextTurn = function() {
  if (this.turnNumber === null) {
    this.turnNumber = 1;
  }

  this.turnNumber += 1;
  this.redrawUILayer();
};

Gorillas.prototype.currentPlayer = function() {
  return (this.turnNumber + this.startingPlayer) % 2;
};

Gorillas.prototype.nextRound = function() {
  this.startingPlayer = this.randomIntBetween(0, 1);
  this.turnNumber = null;

  this.initScreen();
  this.placeBuildings();
  this.placeGorillas();
  this.nextTurn();

  console.log("It is player %d's turn", this.currentPlayer());
};



Gorillas.prototype.redrawUILayer = function() {
  this.uiContext.clearRect(0, 0, this.toPixels(this.mapWidth), this.toPixels(this.mapHeight));

  // Draw the sun.
  this.uiContext.drawImage(this.sunImg, this.toPixels(this.mapWidth) / 2 - (this.sunImg.width / 2), 10);

  // Draw the text.
  this.uiContext.fillStyle = "white";
  this.uiContext.font = "16px monospace";

  this.uiContext.textAlign = "left";
  this.uiContext.fillText("Player 1", 10, 20);

  this.uiContext.textAlign = "right";
  this.uiContext.fillText("Player 2", this.toPixels(this.mapWidth) - 10, 20);

  if (this.currentPlayer() === 0) {
    this.uiContext.textAlign = "left";
    this.uiContext.fillText("Your turn", 10, 40);
    this.uiContext.fillText("Player 1", 10, 20);
  } else {
    this.uiContext.textAlign = "right";
    this.uiContext.fillText("Your turn", this.toPixels(this.mapWidth) - 10, 40);
  }
};

Gorillas.prototype.getBuildingMidpoint = function(buildingIdx) {
  return this.buildings[buildingIdx].x + (this.buildings[buildingIdx].width / 2);
};
