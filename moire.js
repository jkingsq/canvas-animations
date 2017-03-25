var ctx;
var frameInfo;
var time;

function initAnimation() {
    time = new Date().getTime();
    sizeCanvas();
    //console.log(frameInfo.width);//makes sure dimensions are accessible
    setInterval(update, 1000/60);
}

window.onresize = function() {
    sizeCanvas();
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
    initStar();
    initGrid();
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
    star.rays = 8;
    star.color = rgbToHex(255, 255, 255);
    //rotations per second
    star.rps = 1/8;

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
    //size of each cell in the grid
    grid.boxWidth = 25;
    grid.boxHeight = 25;

    //pixel offset of the grid so that the screen's center aligns with that of
    //a cell
    grid.xOff =
        (frameInfo.width/2 -  Math.ceil(grid.boxWidth/2))  % grid.boxWidth;
    grid.yOff =
        (frameInfo.height/2 - Math.ceil(grid.boxHeight/2)) % grid.boxHeight;

    //number of cells in the grid, horizontally and vertically
    grid.gridWidth =
        Math.ceil((frameInfo.width+grid.xOff) /grid.boxWidth) *grid.boxWidth;
    grid.gridHeight =
        Math.ceil((frameInfo.height+grid.yOff)/grid.boxHeight)*grid.boxHeight;
}

function drawGrid() {
}

var pressed={};
onkeydown=function(e){
    e = e || window.event;
    pressed[e.keyCode] = true;
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
