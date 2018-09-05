var ctx;
var frameInfo;
var time;
var bgFillColor;
var triangleCount = 75;

function initAnimation() {
    sizeCanvas();
    //bgFillColor = rgbToHex(32, 32, 32);
    bgFillColor = "#202020"
    //console.log(frameInfo.width);//makes sure dimensions are accessible
    setInterval(drawAnimation, 17);
}

window.onresize = function() {
    sizeCanvas();
}

function sizeCanvas() {
    var canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");//canvas 2d graphics drawing object
    frameInfo = canvas.getBoundingClientRect();//frame dimension info
    canvas.width  = frameInfo.width;
    canvas.height = frameInfo.height;
}

function drawAnimation() {
    time = new Date().getTime()/1000;

    ctx.fillStyle = bgFillColor;
    ctx.fillRect(0, 0, frameInfo.width, frameInfo.height);

    var points = range(0, 1, triangleCount);
    helix(points, time);
}

function helix(points, time) {
    var minX, maxX, minY, maxY, radius;
    minX = frameInfo.width / 3;
    maxX = frameInfo.width - minX;
    minY = frameInfo.height / 3;
    maxY = frameInfo.height - minY;
    radius = Math.min(frameInfo.width, frameInfo.height) / 10;
    points.map(function(i) {
        var theta = i * 4 * Math.PI / 3 + 2 * Math.PI * time / 6;
        var color = colorWheel(theta * 3, 1);
        var x = i * (maxX - minX) + minX;
        var y = maxY - i * (maxY - minY);
        drawPolygon(ctx, "#000000", color, regularPolygon(x, y, radius, theta, 3));
    });
}

function colorWheel(theta, brightness) {
    var red = 255 * (1 + Math.sin(Math.PI*theta/2)) / 2;
    var grn = 255 * (1 + Math.sin(Math.PI*theta/2 + Math.PI*2/3)) / 2;
    var blu = 255 * (1 + Math.sin(Math.PI*theta/2 + Math.PI*4/3)) / 2;

    red = Math.floor(red * brightness);
    grn = Math.floor(grn * brightness);
    blu = Math.floor(blu * brightness);

    return rgbToHex(red, grn, blu);
}

function drawPolygon(canvas, fillC, outlineC, points){
    canvas.strokeStyle = outlineC;
    canvas.fillStyle = fillC;

    canvas.beginPath();

    var initialX, initialY;
    [initialX, initialY] = points[0];
    canvas.moveTo(initialX, initialY);

    points.map(function(point){
        var x, y;
        [x, y] = point;
        canvas.lineTo(x, y);
    });
    canvas.lineTo(initialX, initialY);

    canvas.closePath();

    canvas.fill();
    canvas.stroke();
}

function tracePolygon(canvas, outlineC, points){
    canvas.strokeStyle = outlineC;

    canvas.beginPath();

    var initialX, initialY;
    [initialX, initialY] = points[0];
    canvas.moveTo(initialX, initialY);

    points.map(function(point){
        var x, y;
        [x, y] = point;
        canvas.lineTo(x, y);
    });
    canvas.lineTo(initialX, initialY);

    canvas.closePath();

    canvas.stroke();
}

function regularPolygon(centerX, centerY, radius, rotation, sides){
    var result = new Array(sides);
    for(i = 0; i < sides; i++){
        var theta = rotation + (i/sides)*2*Math.PI;
        var x = centerX + radius*Math.cos(theta);
        var y = centerY + radius*Math.sin(theta);
        result[i] = new Array(x, y);
    }
    return result;
}

function componentToHex(c) {
    var hex = Math.floor(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function range(min, max, nPoints){
    var result = new Array(nPoints);
    for(i = 0; i < nPoints; i++){
        result[i] = (i/nPoints)*(max - min) + min;
    }
    return result;
}

window.onload = initAnimation;
