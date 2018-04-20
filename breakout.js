var player, ball;
var keysDown = {};

function Ball() {
    this.x = 95;
    this.y = 105;
    this.width = 3;
    this.height = 3;
    this.color = 'white';
    this.xSpeed = 1;
    this.ySpeed = -1;
    this.rightSide = this.x + this.width;
    this.bottomSide = this.y + this.height;
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
        this.xSpeed *= -1;
        return true; 
     }
 
     // Collision from the right
     if(this.x >= o.rightSide) {
        this.xSpeed *= -1;
        return true; 
     }
 
     // Collision from the top
     if(this.bottomSide <= o.y) {
        this.ySpeed *= -1;
        return true; 
     }
 
     // Collision from the bottom
     if(this.y >= o.bottomSide) {
        this.ySpeed *= -1;
        return true; 
     }
  }

function Player() {
    this.color ="orange";
    this.x = 90;
    this.y = 110;
    this.speed = 2;
    this.width = 16;
    this.height = 3;
    this.rightSide = this.x + this.width;
    this.bottomSide = this.y + this.height;
}


game = {
    width: 193,
    height: 120,
    score: 0,
    cellSize: 5,
    padding: 2,
    brickWidth: 12,
    brickHeight: 3
}
gameLoopRunning = false;
gameOver = false;
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

function collisionChecks(){
    if (ball.x + ball.xSpeed < 0 || ball.x + ball.xSpeed > game.width - ball.width) {
        ball.xSpeed *= -1;
    }
    if (ball.y + ball.ySpeed < 0) {
        ball.ySpeed *= -1;
    }

    // If ball is in "no man's land" between bricks and player, don't do further collision checks
    if (ball.y > brickBottomEdge && ball.y + ball.height + 5 < player.y ) {
        return
    }

    if (ball.collides(player)) {
        // TODO: Handle side collisions
        return;
    }

    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks [i];
        if (ball.collides(brick)) {
            bricks.splice(i, 1);
            game.score += 5;
            drawScore();
            return;
        }
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

function gameLoop() {
    if (gameLoopRunning) requestAnimationFrame (gameLoop);
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

    collisionChecks();

    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;
    ball.rightSide = ball.x + ball.width;
    ball.bottomSide = ball.y + ball.height;

    ctx.clearRect(0,0,cnv.width,cnv.height);
    drawObject(player);
    drawObject(ball);
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
    gameOver = false;
    ball = new Ball();
    tail = [];
    snakeLength = 3;
    game.score = 0;
    game.lives = 2;
    player = new Player();
    setRightEdge(game.width - player.width);
    drawScore();
    keepGoing = true;
    setBricks();
    if (gameLoopRunning) return;

    gameLoopRunning = true;
    gameLoop();
}

