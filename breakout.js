player = {};
keysDown = {}

ball = {
    x:95,
    y:105,
    width: 3,
    height: 3,
    color: 'white',
    xSpeed: 1,
    ySpeed: -1
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
gameStarted = false;
bricks = [];
rightEdge = 0;
brickBottomEdge = 0;

function Brick(color, x, y) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = game.brickWidth;
    this.height = game.brickHeight;
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

function collides(a, b) {
    if(a.x > b.x + b.width)  return false;
    if(a.x + a.width < b.x)  return false;
    if(a.y > b.y + b.height) return false;
    if(a.y + a.height < b.y) return false;
    return true;
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

    if (collides(ball, player)) {
        ball.ySpeed *= -1;
        // TODO: Handle side collisions
        return;
    }

    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks [i];
        if (collides (ball, brick)) {
            bricks.splice(i, 1);
            ball.ySpeed *= -1;
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

function gameLoop() {
    if (gameStarted) requestAnimationFrame (gameLoop);
    if (keysDown["ArrowLeft"])  player.x -= player.speed;
    if (keysDown["ArrowRight"]) player.x += player.speed;
    if (player.x < 0) player.x = 0;
    if(player.x > rightEdge) player.x = rightEdge;

    collisionChecks();

    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;

    ctx.clearRect(0,0,cnv.width,cnv.height);
    drawObject(player);
    drawObject(ball);
    bricks.forEach(drawObject);
}

function gameOver() {
    clearInterval(interval);
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
}

onkeyup = function(e) {
    keysDown[e.key] = false;
}

function drawScore() {
    score.innerText = "Score: " + game.score;
}

function gameStart() {
    if (gameStarted) return;
    gameStarted = true;
    tail = [];
    snakeLength = 3;
    game.score = 0;
    player = {
        color:"orange",
        x: 90,
        y: 110,
        speed: 2,
        width: 12,
        height: 3
    }
    setRightEdge(game.width - player.width);
    drawScore();
    keepGoing = true;
    setBricks();
    gameLoop();
}

