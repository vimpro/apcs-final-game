const CTX = document.getElementById("canvas").getContext("2d");
const WIDTH = 500;
const HEIGHT = 500;

class GameObject {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
}

class Player extends GameObject {
    constructor() {
        super(WIDTH / 2 - 15, HEIGHT - 40, 30, 30, 5);
    }

    draw() {
        CTX.fillStyle = "purple";
        CTX.fillRect(this.x, this.y, this.width, this.height);
        CTX.fillRect(this.x + 10, this.y - 10, 10, 10); // Gun
    }

    move(keys) {
        if (keys["ArrowLeft"] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys["ArrowRight"] && this.x < WIDTH - this.width) {
            this.x += this.speed;
        }
    }

    shoot(bullets) {
        bullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y - 10, 5, 10, 7));
    }
}

class Bullet extends GameObject {
    draw() {
        CTX.fillStyle = "lightgreen";
        CTX.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }

    outOfBounds() {
        return this.y < 0;
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y, 30, 30, 1);
    }

    draw() {
        CTX.fillStyle = "white";
        
        // Body
        CTX.fillRect(this.x + 10, this.y, 10, 10);
        CTX.fillRect(this.x, this.y + 10, 30, 10);
        CTX.fillRect(this.x + 5, this.y + 20, 20, 10);
        // Legs
        CTX.fillRect(this.x + 5, this.y + 30, 5, 5);
        CTX.fillRect(this.x + 20, this.y + 30, 5, 5);
    }

    update() {
        this.y += this.speed;
    }

    outOfBounds() {
        return this.y > HEIGHT;
    }
}

class Game {
    constructor() {
        this.player = new Player();
        this.bullets = [];
        this.enemies = [];
        this.keys = {};
        this.kills = 0;
        this.isGameOver = false;
        this.spawnEnemy();
        this.bindEvents();
        this.spawnEnemyInterval();
    }

    reset() {
        this.player = new Player();
        this.bullets = [];
        this.enemies = [];
        this.kills = 0;
        this.isGameOver = false;
        this.spawnEnemy();
    }

    spawnEnemy() {
        const x = Math.random() * (WIDTH - 30);
        this.enemies.push(new Enemy(x, 0));
    }

    spawnEnemyInterval() {
        setInterval(() => {
            if (!this.isGameOver) {
                this.spawnEnemy();
            }
        }, 1000);
    }

    bindEvents() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
            if (e.key === " " && this.bullets.length < 3) {
                this.player.shoot(this.bullets);
            }
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });
    }

    update() {
        this.player.move(this.keys);
        this.bullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(bullet => !bullet.outOfBounds());
        this.enemies.forEach(enemy => enemy.update());
        this.checkCollisions();
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.outOfBounds()) {
                this.endGame();
                return false;
            }
            return true;
        });
        if (this.enemies.some(enemy => enemy.y >= this.player.y)) {
            this.endGame();
        }
    }

    draw() {
        CTX.clearRect(0, 0, WIDTH, HEIGHT);
        this.player.draw();
        this.bullets.forEach(bullet => bullet.draw());
        this.enemies.forEach(enemy => enemy.draw());
        this.drawScore();
    }

    drawScore() {
        CTX.fillStyle = "white";
        CTX.font = "20px 'Press Start 2P'";
        CTX.fillText(`Kills: ${this.kills}`, 10, 30);
    }

    checkCollisions() {
        this.bullets.forEach((bullet, bIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    this.bullets.splice(bIndex, 1);
                    this.enemies.splice(eIndex, 1);
                    this.kills++;
                }
            });
        });
    }

    endGame() {
        this.isGameOver = true;
        alert(`Game Over! You scored ${this.kills} kills. Play again?`);
        this.reset();
    }

    frame() {
        if (!this.isGameOver) {
            this.update();
            this.draw();
        }
        requestAnimationFrame(() => this.frame());
    }
}

const game = new Game();
game.frame();