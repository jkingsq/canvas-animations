var ctx;
var frameInfo;
var time;

function initAnimation() {
    var canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");//canvas 2d graphics drawing object
    frameInfo = canvas.getBoundingClientRect();//frame dimension info
    //console.log(frameInfo.width);//makes sure dimensions are accessible
    setInterval(drawAnimation, 5);
}

function drawAnimation() {
    time = new Date().getTime()/1000;

    var red = 255 * (1 + Math.sin(Math.PI*time/2)) / 2;
    var grn = 255 * (1 + Math.sin(Math.PI*time/2 + Math.PI*2/3)) / 2;
    var blu = 255 * (1 + Math.sin(Math.PI*time/2 + Math.PI*4/3)) / 2;

    red = Math.floor(red);
    grn = Math.floor(grn);
    blu = Math.floor(blu);

    ctx.fillStyle = rgbToHex(red, grn, blu);
    ctx.fillRect(0, 0, frameInfo.width, frameInfo.height);
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
window.onload = initAnimation;
