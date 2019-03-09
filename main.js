var cubeRotation = 0.0;

var c;
var c1;
var road;
var road_texture;
var wall_left;
var wall_right;
var wall_texture;
var wall_grass_texture;
var player1;
var player_texture;
var coin_texture;
var wall1;
var wall2;


var c_texture;
var cam_x = 0, cam_y = 20, cam_z = 10;

main();

//
// Start here
//



function main() {


  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  c = new cube(gl, [2, 2, 4]);
  player1 = new player(gl, [0, -3, 0]);
  track1 = new Array()
  coins = new Array()
  var i = 0;
  while (i < 10) {
    c = new coin(gl, [0, 1, 2-5*i]);
    coins.push(c)
    i++;
  }
  var i = 0;
  while (i < 1000) {
    lane1 = new lane(gl, [-3, -4, -i]);
    track1.push(lane1)
    i++;
  }
  track2 = new Array()
  var i = 0;
  while (i < 1000) {
    lane1 = new lane(gl, [4, -4, -i]);
    track2.push(lane1)
    i++;
  }
  track3 = new Array()
  var i = 0;
  while (i < 1000) {
    lane3 = new lane(gl, [0, -4, -i]);
    track3.push(lane3)
    i++;
  }
  wall_left = new Array()
  var i = 0;
  while (i < 1000) {
    wall1 = new wall_brick(gl, [-3.1, -2, -1-i]);
    wall_left.push(wall1)
    i++;
  }
  wall_right = new Array()
  var i = 0;
  while (i < 100) {
    wall2 = new wall(gl, [4.6, -2, -i*8]);
    wall_right.push(wall2)
    i++;
  }


  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Load texture
  c_texture = loadTexture(gl, 'road.jpg');
  player_texture = loadTexture(gl, 'orange.jpg');
  lane_texture = loadTexture(gl, 'road.jpg');
  coin_texture = loadTexture(gl, 'coin.jpeg');
  wall_texture = loadTexture(gl, 'brickwall.jpg');
  wall_grass_texture = loadTexture(gl, 'wall_grass.jpeg');
  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    if (player1.pos[1] > -3) {
      player1.pos[1] -= 0.4;
    }
    player1.pos[2] -= 0.5;
    cam_z -= 0.5;
    console.log(player1.pos[2]);
    drawScene(gl, programInfo, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

document.onkeydown = handleKeyDown;
function handleKeyDown(event) {

  if (event.keyCode == 37) {
    player1.pos[0] = -2.75

  }
  if (event.keyCode == 39) {
    player1.pos[0] = 3.7;
  }
  if (event.keyCode == 32) {
    player1.pos[1] += 1;

  }

}
//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
  gl.clearColor(1, 1, 1, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var cameraMatrix = mat4.create();
  mat4.translate(cameraMatrix, cameraMatrix, [0, 0, cam_z]);
  var cameraPosition = [
    cameraMatrix[12],
    cameraMatrix[13],
    cameraMatrix[14],
  ];
  var up = [0, 1, 0];

  mat4.lookAt(cameraMatrix, cameraPosition, [0, 0, cam_z - 10], up);

  var viewMatrix = cameraMatrix;//mat4.create();

  //mat4.invert(viewMatrix, cameraMatrix);

  var viewProjectionMatrix = mat4.create();

  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  //c.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  player1.drawPlayer(gl, viewProjectionMatrix, programInfo, deltaTime);
  var j = 0;
  while (j < 1000) {
    track1[j].drawLane(gl, viewProjectionMatrix, programInfo, deltaTime);
    track2[j].drawLane(gl, viewProjectionMatrix, programInfo, deltaTime);
    track3[j].drawLane(gl, viewProjectionMatrix, programInfo, deltaTime);
    j++;
  }
  var j = 0;
  while (j < 10) {
    coins[j].drawCoin(gl, viewProjectionMatrix, programInfo, deltaTime);
    j++;
  }
  var j = 0;
  while (j < 100) {
    //wall_left[j].drawWall(gl, viewProjectionMatrix, programInfo, deltaTime);
    wall_right[j].drawWall(gl, viewProjectionMatrix, programInfo, deltaTime);
    j++;
  }
  var j = 0;
  while (j < 1000) {
    wall_left[j].drawWall(gl, viewProjectionMatrix, programInfo, deltaTime);
    //wall_right[j].drawWall(gl, viewProjectionMatrix, programInfo, deltaTime);
    j++;
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    width, height, border, srcFormat, srcType,
    pixel);

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
