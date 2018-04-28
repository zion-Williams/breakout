var player, ball, ball2;
var keysDown = {};

const cr = Math.PI * 2;

function Ball(obj) {
    if (obj == undefined) obj = {}
    this.x = 'x' in obj ? obj.x : 95;
    this.y = 'y' in obj ? obj.y : 105;
    this.width = 'width' in obj ? obj.width : 3;
    this.height = 'height' in obj ? obj.height : 3;
    this.color = 'white';
    this.speed = 'speed' in obj ? obj.speed : 1.5;
    this.angle = cr / 8;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.rightSide = this.x + this.width;
    this.bottomSide = this.y + this.height;
    this.bricksHit = 0;
    this.flipY();
}

Ball.prototype.angleToPos = function() {
    this.xSpeed = Math.cos(this.angle) * this.speed;
    this.ySpeed = Math.sin(this.angle) * this.speed;
}

Ball.prototype.flipX = function() {
    this.angle = Math.PI - this.angle;
    this.angleToPos();
}

Ball.prototype.flipY = function() {
    this.angle = cr - this.angle;
    this.angleToPos();
}

Ball.prototype.collides = function(o) {
    let newPos = {
        x: this.x + this.xSpeed,
        y: this.y + this.ySpeed,
        rightSide: this.x + this.xSpeed + this.width,
        bottomSide: this.y + this.ySpeed + this.height
    }

    if((newPos.x > o.rightSide)  || (newPos.rightSide < o.x) || 
       (newPos.y > o.bottomSide) || (newPos.bottomSide < o.y)) return false;

    // Collision from the left
    if(this.rightSide <= o.x) {
        this.flipX();
        return true; 
     }
 
     // Collision from the right
     if(this.x >= o.rightSide) {
        this.flipX();
        return true; 
     }
 
     // Collision from the top
     if(this.bottomSide <= o.y) {
        this.flipY();
        return true; 
     }
 
     // Collision from the bottom
     if(this.y >= o.bottomSide) {
        this.flipY();
        return true; 
     }
  }

function Player() {
    this.color ="orange";
    this.x = 90;
    this.y = 110;
    this.speed = 2;
    this.width = 20;
    this.height = 3;
    this.rightSide = this.x + this.width;
    this.bottomSide = this.y + this.height;
    this.halved = false;
}

function Game() {
    this.width = 193;
    this.height = 120;
    this.score = 0;
    this.cellSize = 5;
    this.padding = 2;
    this.brickWidth = 12;
    this.brickHeight = 3;
    this.lives = 2;
}

game = new Game();

gameLoopRunning = false;
gameOver = true;
bricks = [];
rightEdge = 0;
brickBottomEdge = 0;

function Brick(color, x, y) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = game.brickWidth;
    this.height = game.brickHeight;
    this.rightSide = this.x + game.brickWidth;
    this.bottomSide = this.y + game.brickHeight;
}

function setBricks() {
    bricks = [];
    let colors = ['red', 'red', 'orange', 'orange', 'lime', 'lime', 'yellow', 'yellow']
    for(let row = 0; row < 8; row++ ) {
        for(let col = 0; col < 16; col++ ) {
            bricks.push(new Brick(colors[row], col * game.brickWidth + .5, (row + 3) * game.brickHeight));
        }
    }
    brickBottomEdge = bricks.slice(-1)[0].y + game.brickHeight + 5;
}

function collisionChecks(obj){
    if (obj.x + obj.xSpeed < 0 || obj.x + obj.xSpeed > game.width - obj.width) {
        obj.flipX()
    }
    if (obj.y + obj.ySpeed < 0) {
        obj.flipY() *= -1;
        if (!player.halved) {
            player.width /= 2;
            player.halved = true;
        }
    }

    // If obj is in "no man's land" between bricks and player, don't do further collision checks
    if (obj.y > brickBottomEdge && obj.y + obj.height + 5 < player.y ) {
        return
    }

    if (obj.collides(player)) {
        let ballMidpoint = obj.x + obj.width / 2;
        let playerMidpoint = player.x + player.width / 2;
        obj.angle = cr * 3/ 4 + ((ballMidpoint - playerMidpoint + player.speed) * .15);
        obj.angleToPos();
        return;
    }

    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks [i];
        if (obj.collides(brick)) {
            bricks.splice(i, 1);
            game.score += 5;
            obj.bricksHit++;
            checkSpeedup();
            drawScore();
            return;
        }
    }
}

function checkSpeedup() {
/*
Speedup after 4 hits, 12, and first orange & red
Paddle size halves after hitting top of screen
*/
    if (ball.bricksHit == 4 || ball.bricksHit == 12) {
        ball.speed += .5;
        ball.angleToPos();
    }
}

function setRightEdge(val) {
    rightEdge = val;
}

cnv.width = game.width * game.cellSize;
cnv.height = game.height * game.cellSize;
ctx = cnv.getContext('2d');

function pause() {
    gameLoopRunning = false;
}

function move(obj) {
    obj.x += obj.xSpeed;
    obj.y += obj.ySpeed;
    obj.rightSide = obj.x + obj.width;
    obj.bottomSide = obj.y + obj.height;
}

function gameLoop() {
    if (gameLoopRunning) requestAnimationFrame (gameLoop);
    ballAngle.innerText = "angle: " + (ball.angle / cr * 360);
    ballSpeed.innerText = "speed: " + ball.speed;
    ballXSpeed.innerText = "x speed: " + ball.xSpeed;
    ballYSpeed.innerText = "y speed: " + ball.ySpeed;
    if (keysDown["ArrowLeft"]) {
        player.x -= player.speed;
        player.rightSide = player.x + player.width;
    }
    if (keysDown["ArrowRight"]) {
        player.x += player.speed;
        player.rightSide = player.x + player.width;
    }
    if (player.x < 0) player.x = 0;
    if(player.x > rightEdge) player.x = rightEdge;

    collisionChecks(ball);
    collisionChecks(ball2);
    
    move(ball);
    move(ball2);

    ctx.clearRect(0,0,cnv.width,cnv.height);
    drawObject(player);
    drawObject(ball);
    drawObject(ball2);
    bricks.forEach(drawObject);

    if (ball.y > game.height) {
        gameLoopRunning = false;
        if (game.lives > 0) {
            game.lives--;
            ball = new Ball();
        } else {
            gameOver = false;
        }
        drawScore();
    }
}

function drawObject(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(
        obj.x * game.cellSize,
        obj.y * game.cellSize,
        obj.width * game.cellSize - game.padding,
        obj.height * game.cellSize - game.padding
    );
}

onkeydown = function(e) {
    keysDown[e.key] = true;
    if (!gameLoopRunning && !gameOver) {
        gameLoopRunning = true;
        if (game.lives >= 0) gameLoop();
    }
}

onkeyup = function(e) {
    keysDown[e.key] = false;
}

function drawScore() {
    score.innerText = "Score: " + game.score;
    lives.innerText = "Lives: " + game.lives;
}

function gameStart() {
    game = new Game();
    gameOver = false;
    ball = new Ball();
    ball2 = new Ball({x: 80, y : 90, width: 6, height: 6, speed: .75});
    tail = [];
    snakeLength = 3;
    player = new Player();
    setRightEdge(game.width - player.width);
    drawScore();
    keepGoing = true;
    setBricks();
    if (gameLoopRunning) return;

    gameLoopRunning = true;
    gameLoop();
}

