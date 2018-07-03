var ctx;
var frameInfo;
var startTime;
var time;

function initAnimation() {
    time = new Date().getTime();
    startTime = time;
    sizeCanvas();
    //console.log(frameInfo.width);//makes sure dimensions are accessible
    setInterval(update, 1000/60);
    initStar();
    initGrid();
}

window.onresize = function() {
    sizeCanvas();
    setStarDimensions();
    setGridDimensions(grid.boxWidth, grid.boxHeight, grid.padX, grid.padY);
}

function sizeCanvas() {
    //adjust page elements
    var canvas = document.getElementById("myCanvas");
    canvas.onkeyup = onkeyup;
    canvas.onkeydown = onkeydown;
    ctx = canvas.getContext("2d");//canvas 2d graphics drawing object
    frameInfo = canvas.getBoundingClientRect();//frame dimension info
    canvas.width  = frameInfo.width;
    canvas.height = frameInfo.height;
    frameInfo.diagonalSize = Math.sqrt(
        Math.pow(frameInfo.width, 2) +
        Math.pow(frameInfo.height, 2)
    );
}

function update() {
    dt = new Date().getTime() - time;
    time = time + dt;
    draw();
}

function draw() {
    ctx.globalAlpha = 1;

    //clear screen to grey
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, frameInfo.width, frameInfo.height);

    drawStar();
    drawGrid();
}

star = {}

function initStar() {
    star.rays = 16;
    star.color = rgbToHex(255, 255, 255);
    //rotations per second
    star.rps = 1/16;

    setStarDimensions();
}

function setStarDimensions() {
    //represents the length of each line eminating from the center of the screen
    //diagonal screen size / 2
    star.rayLength = Math.sqrt(
        Math.pow(frameInfo.width, 2) +
        Math.pow(frameInfo.height, 2)
    )/2;
}

function drawStar() {
    var t = time / 1000;
    var theta = 2 * t * Math.PI * star.rps;
    ctx.strokeStyle = star.color;
    ctx.globalAlpha = 1;
    for(i = 0; i < star.rays; i++) {
        var rayTheta = theta + i * Math.PI / star.rays;

        //x and y components of the direction the ray eminates
        var xComp = star.rayLength * Math.cos(rayTheta);
        var yComp = star.rayLength * Math.sin(rayTheta);

        ctx.beginPath();

        ctx.moveTo(frameInfo.width/2 + xComp, frameInfo.height/2 + yComp);
        ctx.lineTo(frameInfo.width/2 - xComp, frameInfo.height/2 - yComp);

        ctx.closePath();
        ctx.stroke();
    }
}

grid = {}

function initGrid() {
    grid.visible = false;
    //time in seconds it takes for a cell in the grid to fade in or out
    grid.fadeTime = 600;
    grid.transitionTime = 2000;
    grid.fadeStart = 0;
    //used to check whether the fade animation is finished when a key is pressed
    grid.fading = false;

    setGridDimensions(50, 50, 5, 5);
}

function setGridDimensions(boxW, boxH, padW, padH) {

    //size of each cell in the grid
    grid.boxWidth = boxW;
    grid.boxHeight = boxH;

    //negative space between boxes
    grid.padX = padW;
    grid.padY = padH;

    //pixel offset of the grid so that the screen's center aligns with that of
    //a cell
    var halfwayX =
        Math.ceil((frameInfo.width/2)/grid.boxWidth)*grid.boxWidth;
    var xOff =
        (halfwayX - frameInfo.width/2) - Math.ceil(grid.boxWidth)/2;
    if(xOff < 0)
        xOff += grid.boxWidth;
    grid.xOff = Math.ceil(xOff) - Math.floor(grid.padX / 2);

    var halfwayY =
        Math.ceil((frameInfo.height/2)/grid.boxHeight)*grid.boxHeight;
    var yOff =
        (halfwayY - frameInfo.height/2) - Math.ceil(grid.boxHeight)/2;
    if(yOff < 0)
        yOff += grid.boxHeight;
    grid.yOff = Math.ceil(yOff) - Math.floor(grid.padY / 2);

    //number of cells in the grid, horizontally and vertically
    grid.gridWidth =
        Math.ceil((frameInfo.width +grid.xOff)/grid.boxWidth);
    grid.gridHeight =
        Math.ceil((frameInfo.height+grid.yOff)/grid.boxHeight);
}

function keypressed(k) {
    toggleGrid();
}

function frameClicked() {
    toggleGrid();
}

function toggleGrid() {
    if(!grid.fading) {
        grid.visible = !grid.visible;
        grid.fadeStart = time;
    }
}

function drawGrid() {
    ctx.fillStyle = "#000000";
    grid.fading = false;
    if(onSecondsElapsed(1.5) && !grid.visible)
        toggleGrid();
    for (i = 0; i < grid.gridHeight; i++) {
        for(j = 0; j < grid.gridWidth; j++) {
            //delay fade for cells further from the top left corner
            var t = time -
                grid.transitionTime*(i+j)/(grid.gridWidth+grid.gridHeight);

            //completeness of the fade for this cell at this point in time
            //on [0,1]
            var fade = (t - grid.fadeStart) / grid.fadeTime;
            fade = Math.max(0, fade);
            fade = Math.min(fade, 0.5) * 2;
            if(fade > 0 && fade < 1) {
                grid.fading = true;
            }
            if(grid.visible) {
                ctx.globalAlpha = fade;
            } else {
                ctx.globalAlpha = 1 - fade;
            }

            ctx.fillStyle = "#000000";
            //I'm Garrus Vakarian and this is my rectangle
            var x = Math.floor(j * grid.boxWidth) - grid.xOff;
            var y = Math.floor(i * grid.boxHeight)- grid.yOff;
            ctx.fillRect(
                Math.max(0, x),//x start
                Math.max(0, y),//y start
                grid.boxWidth - grid.padX + Math.min(x, 0),//width
                grid.boxHeight- grid.padY + Math.min(y, 0) //height
            );
        }
    }
}

function onSecondsElapsed(s) {
    var elapsed = time - startTime;
    var t = s * 1000;
    return elapsed > t && elapsed - dt < t;
}

var pressed={};
onkeydown=function(e){
    e = e || window.event;
    pressed[e.keyCode] = true;
    keypressed(e.keyCode);
}

onkeyup=function(e){
    e = e || window.event;
    delete pressed[e.keyCode];
}

function componentToHex(c) {
    var hex = Math.floor(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

window.onload = initAnimation;
