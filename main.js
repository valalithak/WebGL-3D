var cubeRotation = 0.0;

main();

//
// Start here
//

var c;
var player1;
var lane1;
var lane2;
var lane3;
var lane4;

function main() {


  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  c = new cube(gl, [0, 0, 0]);
  
  lane1 = new lane(gl, [10, 0, 1.5]);
  lane2 = new lane(gl, [10, 0, 1]);
  lane3 = new lane(gl, [10, 0, -1]);
  lane4 = new lane(gl, [10, 0, -1.5]);
  player1 = new player(gl, [0, 2, 0]);
  //player1.pos[1] = lane3.pos[1] + 1;
  //player1.pos[2] = lane3.pos[2] + 1 
  

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
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
    // this moves the player front
    //player1.pos[0] -= 0.02;
    // cameraMatrix[12] += 0.02;
    if(player1.pos[1] > 2)
    {
      player1.pos[1] -= 0.1;
    }
    drawScene(gl, programInfo, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Draw the scene.
//


document.onkeydown = handleKeyDown;
function handleKeyDown(event) {

    if(event.keyCode == 39){
   
      console.log("lane1");
      console.log(lane1.pos);
      console.log("lane2");
      console.log(lane2.pos);
      console.log("lane3");
      console.log(lane3.pos);
      console.log("lane4");
      console.log(lane4.pos);
      console.log("player");
      console.log(player1.pos);
      //player1.pos[1] = lane3.pos[1]-0.6;
      player1.pos[2] = (lane3.pos[2] + lane4.pos[2])/2;
      console.log("player");
      console.log(player1.pos);
      player1.left = "false";
      player1.right = "true";
    
  }
    if(event.keyCode==37){
    
      console.log("lane1");
      console.log(lane1.pos);
      console.log("lane2");
      console.log(lane2.pos);
      console.log("lane3");
      console.log(lane3.pos);
      console.log("lane4");
      console.log(lane4.pos);
      console.log("player");
      console.log(player1.pos);
      //player1.pos[1] = lane1.pos[1] - 0.2;
      player1.pos[2] = (lane1.pos[2] - lane2.pos[2]) +0.1;
      console.log("player");
      console.log(player1.pos);
      player1.left = "true";
      player1.right = "false";
  }
  if(event.keyCode==32){
    player1.pos[1] += 1;   
}
if(event.keyCode==40){
    
    
  player1.pos[1] -= 1
  
}
  

}

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

  const fieldOfView = 90 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 1000.0;
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
  mat4.translate(cameraMatrix, cameraMatrix, [2, 5, 0]);
  var cameraPosition = [
    cameraMatrix[12],
    cameraMatrix[13],
    cameraMatrix[14],
  ];

  var up = [0, 1, 0];

  mat4.lookAt(cameraMatrix, cameraPosition, c.pos, up);

  var viewMatrix = cameraMatrix;//mat4.create();

  //mat4.invert(viewMatrix, cameraMatrix);

  var viewProjectionMatrix = mat4.create();

  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  //c.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
 
  lane1.drawLane(gl, viewProjectionMatrix, programInfo, deltaTime);
  lane2.drawLane(gl, viewProjectionMatrix, programInfo, deltaTime);
  lane3.drawLane(gl, viewProjectionMatrix, programInfo, deltaTime);
  lane4.drawLane(gl, viewProjectionMatrix, programInfo, deltaTime);
  player1.drawPlayer(gl, viewProjectionMatrix, programInfo, deltaTime);
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
