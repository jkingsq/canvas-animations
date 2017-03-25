//frame variables
var ctx;
var frameInfo;

//number of tiles in the pattern
var cols;
var rows;

//offset function
var offset;

function initAnimation() {
    var canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");//canvas 2d graphics drawing object
    frameInfo = canvas.getBoundingClientRect();//frame dimension info
    //console.log(frameInfo.width);//makes sure dimensions are accessible
    offset = offset1;
    cols = Math.floor(100 * (frameInfo.width / frameInfo.height));
    rows = Math.floor(100 * (frameInfo.height / frameInfo.width));
    setInterval(drawAnimation, 5);
}

function drawAnimation() {
    var w = Math.ceil(frameInfo.width  / cols);
    var h = Math.ceil(frameInfo.height / rows);
    for(i = 0; i < cols; i++) {
        for(j = 0; j < rows; j++) {
            //get color for tile
            var off = offset(i, j);
            ctx.fillStyle = getColor(off);
            //get coordinates of tile
            var x = Math.floor((i / cols) * frameInfo.width);
            var y = Math.floor((j / rows) * frameInfo.height);

            //draw tile
            ctx.fillRect(x, y, w, h);
        }
    }
}

function patternTime() {
    return new Date().getTime()/1000;
}

function getColor(off) {
    var time = patternTime();

    var red = 255 * (1 + Math.sin(Math.PI*time/2               + off)) / 2;
    var grn = 255 * (1 + Math.sin(Math.PI*time/2 + Math.PI*2/3 + off)) / 2;
    var blu = 255 * (1 + Math.sin(Math.PI*time/2 + Math.PI*4/3 + off)) / 2;

    red = Math.floor(red);
    grn = Math.floor(grn);
    blu = Math.floor(blu);

    return rgbToHex(red, grn, blu);
}

function offset1(i, j) {
    return (i / cols) * (j / rows) * 2 * Math.PI;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

window.onload = initAnimation;
