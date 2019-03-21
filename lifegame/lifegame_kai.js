(() => {
    'use strict';

    const SCREEN_SIZE = 1200,
        SIDE_CELLS = 100,
        CELL_SPACING = 1,
        CELL_SIZE = SCREEN_SIZE / SIDE_CELLS,
        FPS = 10;

    let canvas,
        context,
        field,
        generationLabel,
        cellsLabel,
        btnStart,
        btnRandom,
        btnReset,
        btnNext,
        timer,
        running = false;

    function Field() {
        this.matrix = (() => {
            let result = new Array(SIDE_CELLS);
            for (let i = 0; i < SIDE_CELLS; i++) {
                result[i] = new Array(SIDE_CELLS);
                for (let j = 0; j < SIDE_CELLS; j++) {
                    result[i][j] = new Cell();
                }
            }
            return result;
        })();
        this.generation = 0;
    }

    Field.prototype.applyAllElem = function(func) {
        let len = this.matrix.length;
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len; j++) {
                func({x:i, y:j, len:len});
            }
        }
    }

    Field.prototype.draw = function() {
        Cell.livingCells = 0;
        context.fillStyle = 'rgb(60, 60, 60)';
        context.fillRect(0, 0, SCREEN_SIZE, SCREEN_SIZE);
        this.applyAllElem((grid) => {
            let x = grid.x * CELL_SIZE + CELL_SPACING;
            let y = grid.y * CELL_SIZE + CELL_SPACING;
            if (this.matrix[grid.x][grid.y]['state']) {
                context.fillStyle = 'rgb(0, 217, 0)';
                Cell.livingCells++;
            } else {
                context.fillStyle = 'rgb(0, 0, 0)';
            }
            context.fillRect(x, y, CELL_SIZE - CELL_SPACING * 2, CELL_SIZE - CELL_SPACING * 2);
        });
        cellsLabel.textContent = Cell.livingCells;
        generationLabel.textContent = this.generation;
    }

    Field.prototype.init = function(rand = false) {
        resetTimer();
        if(rand) {
            this.applyAllElem((grid) => {
                this.matrix[grid.x][grid.y]['state'] = Math.floor(Math.random() * 2);
            });
        }else {
            this.applyAllElem((grid) => {
                this.matrix[grid.x][grid.y]['state'] = 0;
            });
        }
        this.generation = 0;
        this.draw();
    }

    Field.prototype.nextGen = function() {
        this.applyAllElem((grid) => {
            let targetCell,
                aroundCell,
                livingCells;
            if (!this.matrix[grid.x][grid.y]['state']) return;
            for (let i = -1; i <= 1; i++){
                for (let j = -1; j <= 1; j++){
                    livingCells = 0;
                    let targetX = grid.x + i,
                        targetY = grid.y + j;
                    if (targetX < 0) {
                        targetX = targetX + grid.len;
                    } else if (targetX >= grid.len) {
                        targetX = targetX - grid.len;
                    }
                    if (targetY < 0) {
                        targetY = targetY + grid.len;
                    } else if (targetY >= grid.len) {
                        targetY = targetY - grid.len;
                    }
                    targetCell = this.matrix[targetX][targetY];
                    if (targetCell.checked) {
                        continue;
                    }
                    for (let k = -1; k <= 1; k++){
                        for (let l = -1; l <= 1; l++){
                            if (k === 0 && l === 0) continue;
                            let aroundX = targetX + k,
                                aroundY = targetY + l;
                            if (aroundX < 0) {
                                aroundX = aroundX + grid.len;
                            } else if (aroundX >= grid.len) {
                                aroundX = aroundX - grid.len;
                            }
                            if (aroundY < 0) {
                                aroundY = aroundY + grid.len;
                            } else if (aroundY >= grid.len) {
                                aroundY = aroundY - grid.len;
                            }
                            aroundCell = this.matrix[aroundX][aroundY];
                            if (aroundCell.state) {
                                livingCells++;
                            }
                        }
                    }
                    if (targetCell.state && (livingCells === 2 || livingCells === 3)) {
                        targetCell.nextState = 1;
                    } else if (!targetCell.state && livingCells === 3) {
                        targetCell.nextState = 1;
                    } else {
                        targetCell.nextState = 0;
                    }
                    targetCell.checked = true;
                }
            }
        });

        this.applyAllElem((grid) => {
            let targetCell = this.matrix[grid.x][grid.y];
            targetCell.state = targetCell.nextState;
            targetCell.nextState = 0;
            targetCell.checked = false;
        });

        this.generation++;
        this.draw();
    }

    function Cell() {
        this.state = 0;
        this.nextState = 0;
        this.checked = false;
    }

    Cell.prototype.livingCells = 0;

    field = new Field();

    window.onload = () => {
        let info = document.getElementById('info-area');
        let scaleRate = Math.min(window.innerWidth / SCREEN_SIZE, (window.innerHeight - 80)  / SCREEN_SIZE);

        canvas = document.getElementById('world');
        context = canvas.getContext('2d');
        canvas.width = canvas.height = SCREEN_SIZE;
        canvas.style.width = canvas.style.height = Math.floor(SCREEN_SIZE * scaleRate) + 'px';

        generationLabel = document.getElementById('generation');
        cellsLabel = document.getElementById('cells');
        btnStart = document.getElementById('buttonStart');
        btnRandom = document.getElementById('buttonRandom');
        btnReset = document.getElementById('buttonReset');
        btnNext = document.getElementById('buttonNext');

        btnStart.addEventListener('click', onStart, false);
        btnRandom.addEventListener('click', function(){
            field.init(true);
        }, false);
        btnReset.addEventListener('click', function(){
            field.init();
        }, false);
        btnNext.addEventListener('click', function(){
            field.nextGen();
        }, false);
        canvas.addEventListener('click', canvasClick, false);
        field.init();
    }

    const onStart = () => {
        if (running) {
            resetTimer();
        } else {
            field.nextGen();
            timer = setInterval(function(){
                field.nextGen();
            }, 1000 / FPS);
            btnStart.value = 'Stop';
            running = true;
        }
    }

    const resetTimer = () => {
        clearInterval(timer);
        btnStart.value = 'Start';
        running = false;
    }

    const canvasClick = (e) => {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.x;
        let y = e.clientY - rect.y;
        let size = rect.width / SIDE_CELLS;
        let arrayX = Math.floor(x / size);
        let arrayY = Math.floor(y / size);
        let clickCell = field.matrix[arrayX][arrayY];
        clickCell.state = clickCell.state ? 0 : 1;
        field.draw();
    }

})();

