// Assuming p5.js is already included in your HTML before this script

// Define a shape constructor
function Shape(x, y, size, dx, dy, color) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.dx = dx;
  this.dy = dy;
  this.color = color;
}

// Array to store shapes
var shapes = [];
var gridSpacing = 10;
var cols, rows;

// p5.js sketch
var sketch = function(p) {
  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    cols = Math.floor(p.width / gridSpacing);
    rows = Math.floor(p.height / gridSpacing);

    // Reduced alpha values for more translucency
for (var i = 0; i < 50; i++) {
  var color = i % 2 === 0 ? p.color(255, 0, 255, 100) : p.color(0, 255, 255, 100); // Reduced alpha to 100
  shapes.push(new Shape(p.random(p.width), p.random(p.height), p.random(6, 10), p.random(-2, 2), p.random(-2, 2), color));
}

  };

  p.draw = function() {
    p.background(0, 0, 20);

    // Drawing the grid
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        var x = i * gridSpacing;
        var y = j * gridSpacing;
        var distance = p.dist(p.mouseX, p.mouseY, x + gridSpacing / 2, y + gridSpacing / 2);
        var alpha = p.map(distance, 0, 50, 255, 0);
        p.fill(180, 100, 255, alpha);
        p.square(x, y, gridSpacing * 0.5);
      }
    }

    // Drawing shapes
    shapes.forEach(function(shape) {
      p.fill(shape.color);
      shape.x += shape.dx;
      shape.y += shape.dy;

      // Reverse direction if hitting the edge
      if (shape.x <= 0 || shape.x >= p.width) shape.dx *= -1;
      if (shape.y <= 0 || shape.y >= p.height) shape.dy *= -1;

      p.circle(shape.x, shape.y, shape.size);
    });
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    cols = Math.floor(p.width / gridSpacing);
    rows = Math.floor(p.height / gridSpacing);
  };
};

new p5(sketch);
