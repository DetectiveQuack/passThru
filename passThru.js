(function(win) {

    _this = this;

    canvasHeight = 600;
    canvasWidth = 800;
    fps = 60;
    obstacles = [];
    gameSpeed = 2;
    score = 0;
    scoreLock = false;

    class Pencil {
        constructor(ctx) {
            this.ctx = ctx;

            this.y = 300;
            this.x = 100;

            this.draw();
        }

        draw(up, down) {
            const ctx = this.ctx,
                x = this.x,
                moveVal = 20;

            let y = this.y;

            if (up && ((this.y - moveVal) >= 0)) {
                y = this.y -= moveVal;
            } else if (down && ((this.y + moveVal) <= _this.canvasHeight)) {
                y = this.y += moveVal;
            }

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        getXY() {
            return {
                x: this.x,
                y: this.y
            }
        }
    }

    class Obstacles {

        constructor(ctx) {
            const canvasHeight = _this.canvasHeight;

            this.ctx = ctx;
            this.obstacleWidth = 50;
            this.x = _this.canvasWidth;

            this.thruSpace = canvasHeight / 3;

            this.top = Math.floor(Math.random() * (canvasHeight - this.thruSpace)) + 1;

            this.bottom = (canvasHeight - this.thruSpace) - this.top;

            ctx.fillStyle = 'black';
        }

        setPositions(forceUpdate) {
            const ctx = this.ctx;

            if (!forceUpdate) {
                this.x -= _this.gameSpeed;
            }

            ctx.fillRect(this.x, 0, this.obstacleWidth, this.top);

            ctx.fillStyle = 'transparent';
            ctx.fillRect(this.x, this.top, this.obstacleWidth, this.thruSpace);

            ctx.translate(this.x, _this.canvasHeight);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, -this.bottom, this.obstacleWidth, this.bottom);

        }

        isOutOfDisplay() {
            return this.x <= 0;
        }

        getPassThruXY() {
            return {
                xMin: this.x,
                xMax: this.x + this.obstacleWidth,
                yMin: this.top,
                yMax: this.top + this.thruSpace
            }
        }

    }

    const init = () => {
            const ctx = document.getElementById('passThru').getContext('2d');

            win.onkeydown = movePencil;

            ctx.canvas.height = _this.canvasHeight;
            ctx.canvas.width = _this.canvasWidth;

            const pencil = new Pencil(ctx);

            _this.ctx = ctx;
            _this.pencil = pencil;

            setScore(0);

            startGame();
        },

        startGame = () => {
            this.intervalId = setInterval(draw, (1000 / fps));
        },

        draw = () => {
            const ctx = _this.ctx,
                obstacles = _this.obstacles;

            if (obstacles.length < 1) {
                obstacles.push(new Obstacles(ctx));
            } else {
                ctx.canvas.width = _this.canvasWidth;

                _this.pencil.draw();

                obstacles.forEach((o) => {
                    o.setPositions();

                    if (o.isOutOfDisplay()) {
                        obstacles.splice(0, 1);
                    }

                    const xy = o.getPassThruXY(),
                        pencilXY = _this.pencil.getXY();

                    if ((pencilXY.y >= xy.yMin && pencilXY.y <= xy.yMax) && (pencilXY.x >= xy.xMin)) {
                        setScore(1);
                    } else if ((pencilXY.y <= xy.yMin || pencilXY.y >= xy.yMax) && (pencilXY.x >= xy.xMin)) {
                        clearInterval(this.intervalId);
                        win.onkeydown = null;
                        ctx.canvas.width = _this.canvasWidth;

                        ctx.font = '48px serif';
                        ctx.fillText(`Game Over: You scored ${_this.score}`, (canvasWidth / 2 - 250), canvasHeight / 2);
                    } else {
                        scoreLock = false;
                    }
                });

            }
        },

        setScore = (incrementBy) => {
            const span = document.getElementById('score');

            if (scoreLock === false) {
                span.innerHTML = _this.score += incrementBy;
                scoreLock = true;
            }
        },

        movePencil = (evt) => {
            const up = 38,
                down = 40,
                keyCode = evt.keyCode,
                ctx = _this.ctx;

            if (keyCode === up || keyCode === down) {
                ctx.canvas.width = _this.canvasWidth;
                _this.pencil.draw(keyCode === up, keyCode === down);
                _this.obstacles.forEach((o) => { o.setPositions(true) });
            }
        };

    win.onload = init;
})(window);