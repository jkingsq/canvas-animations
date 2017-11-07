var ctx;
var frameInfo;
var time;
var bgFillColor;

//perspective stuff
var horizontalFOV = Math.PI / 4; //hardcoded 45 degree horizontal FOV
var distCoeffX = Math.tan(horizontalFOV/2);
var distCoeffY;

function initAnimation() {
    time = new Date().getTime();
    sizeCanvas();
    //bgFillColor = rgbToHex(32, 32, 32);
    bgFillColor = "#000000"
    //console.log(frameInfo.width);//makes sure dimensions are accessible
    setInterval(update, 17);
    //1-pixel stars look great on my screen
    star.size = Math.max(frameInfo.width * frameInfo.height / (1366*768), 1);
    star.offset = star.size / 2;
    //roughly one star per second per 100x100 area of pixels
    star.spawnRate = frameInfo.width * frameInfo.height / (star.size * 10000);
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

    //adjust perspective
    //TODO Dynamic FOV based on canvas aspect ratio
    //distCoeffX = something fancy
    distCoeffY = distCoeffX * (frameInfo.height / frameInfo.width);
}

function update() {
    dt = new Date().getTime() - time;
    time = time + dt;
    star.mainLoop(dt);
    star.drawStars();
}

function every(interval, off, t, dt) {
    //base case to prevent infinite loops
    if(interval <= 0){
        return 1;
    }

    //how far left the regular intervals are shifted on the timeline
    var invOff = off > 0 ?
        -1 * (Math.abs(off) % interval) : interval - (off % interval);

    //time of most recent interval to occur
    var nearest = Math.floor((time + invOff) / interval) * interval - invOff;
    var since = time - nearest;

    if(dt < since) {
        return 0;
    } else {
        return Math.max(1, Math.floor((dt - since) / interval));
    }
}

//given a z coordinate, calculates the maximum viewable 3d x and y at that
//distance
function frameEdge(dist) {
    return {x:dist*distCoeffX, y:dist*distCoeffY};
}

//star singleton object
var star = {
    stars : [],
    newStar : function(x, y, z) {
        return {x:x,y:y,z:z,prevX:null,prevY:null};
    },
    maxViewDistance : 2000,
    fullBrightnessDistance : 1500,
    //amount by which z will decrease per second when speedModifier==1
    globalSpeed : 50,
    speedModifier : 1,
    //TODO
    globalRotation : 0,
    //10 per second, but gets overwritten when screen size is determined
    spawnRate : 10
}

star.getSpawnRate = function() {
    return spawnRate * speedModifier;
}

star.getSpeed = function() {
    return this.globalSpeed * this.speedModifier;
}

star.update = function(s, dt) {
    s.z = s.z - this.getSpeed() * dt / 1000;
    //TODO rotation
}

star.draw = function(s) {
    //3d point -> 2d on-screen point function from a love2d project
    //...because I did it once and forgot how it works.
    //Or I'm too lazy to do the math again.  I like the sound of that one
    //better.
    //result.x = point.x / (point.z * distCoeffX) * screenWidth / 2
    //result.y = point.y / (point.z * distCoeffY) * screenHeight / 2
    //result.x = result.x + screenWidth / 2
    //result.y = result.y + screenHeight / 2

    //coordinates of the middle of the viewport
    var midX = frameInfo.width / 2;
    var midY = frameInfo.height / 2;

    //on-screen coordinates of where the star will show up
    var screenX = midX + s.x / (s.z * distCoeffX) * midX;
    var screenY = midY - s.y / (s.z * distCoeffY) * midY;

    //choose the appropriate drawing color
    //stars are black at z=maxViewDistance
    //stars fade to white over the interval:
    //(maxViewDistance, fullBrightnessDistance)
    var z = s.z;
    //calculate brightness
    var b = Math.min(
        (this.maxViewDistance - z)
            /(this.maxViewDistance - this.fullBrightnessDistance),
        1) * 255;
    ctx.strokeStyle = rgbToHex(b, b, b);
    ctx.fillStyle = rgbToHex(b, b, b);

    //draw the point on the screen
    if(s.prevX != null && s.prevY != null) {
        ctx.lineWidth = star.size;
        ctx.beginPath();
        ctx.moveTo(s.prevX, s.prevY);
        ctx.lineTo(screenX, screenY);
        ctx.stroke();
    }
    ctx.fillRect(screenX-star.offset, screenY-star.offset, star.size, star.size);

    s.prevX = screenX;
    s.prevY = screenY
}

star.mainLoop = function(dt) {
    //keyboard input
    if(pressed[40]) {
        this.speedModifier =
            this.speedModifier - (this.speedModifier - 1) * dt / 2000;
    } else if(pressed[38]) {
        this.speedModifier = this.speedModifier + dt / 1000;
    }
    //number of stars to add during this frame
    var newStarCount = every(
        1000/(star.spawnRate * star.speedModifier),
        0,
        time,
        dt);
    for(i = 0; i < newStarCount; i++){
        this.addStar();
    }
    //move stars
    for(i = 0; i < this.stars.length; i++){
        star.update(this.stars[i], dt);
    }
    //delete offscreen stars
    this.collectStars();
}

star.drawStars = function() {
    ctx.globalAlpha = 0.01 + 0.99 / Math.max(this.speedModifier-4, 1);
    //clear screen to black
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, frameInfo.width, frameInfo.height);
    ctx.globalAlpha = 1;
    //call draw on every star
    for(i = 0; i < this.stars.length; i++){
        this.draw(this.stars[i]);
    }
}

star.collectStars = function() {
    // remove stars that have passed depth = 0
    // there was something in here about the "inherently sorted" order of the
    // stars array that justified just dropping stars from the front of the
    // beginning of the array, but that's no longer valid because of the random
    // offsets added to a star's starting z coordinate
    this.stars = this.stars.filter(function(s) {
        return s.z > 0;
    });
}

star.addStar = function() {
    var edges = frameEdge(this.maxViewDistance);
    var x = (2 * Math.random() - 1) * edges.x;
    var y = (2 * Math.random() - 1) * edges.y;

    //max viewing distance plus some variation that scales with elapsed time
    //between frames so that lower framerates will not result in lower
    //granularity in the variety of star depths
    var z = this.maxViewDistance + Math.random() * this.getSpeed() * dt / 1000;
    this.stars.push(this.newStar(x, y, z));
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
