(() => {

    const SCREEN_SIZE = 1000,
        SIDE_CELLS = 70,
        CELL_SPACING = 1,
        CELL_SIZE = SCREEN_SIZE / SIDE_CELLS,
        FPS = 10;

    let canvas,
        context,
        generation,
        field = new Array(SIDE_CELLS * SIDE_CELLS),
        tempField = field.slice(),
        cells,
        btnStart,
        btnRandom,
        btnReset,
        btnNext,
        timer,
        running = false;

    window.onload = () => {
        let info = document.getElementById('info-area');
        let scaleRate = Math.min(window.innerWidth / SCREEN_SIZE, (window.innerHeight - 80)  / SCREEN_SIZE);

        canvas = document.getElementById('world');
        context = canvas.getContext('2d');
        canvas.width = canvas.height = SCREEN_SIZE;
        canvas.style.width = canvas.style.height = Math.floor(SCREEN_SIZE * scaleRate) + 'px';

        generation = document.getElementById('generation');
        cells = document.getElementById('cells');
        btnStart = document.getElementById('buttonStart');
        btnRandom = document.getElementById('buttonRandom');
        btnReset = document.getElementById('buttonReset');
        btnNext = document.getElementById('buttonNext');

        btnStart.addEventListener('click', onStart, false);
        btnRandom.addEventListener('click', function(){
            initCells(true);
        }, false);
        btnReset.addEventListener('click', function(){
            initCells();
        }, false);
        btnNext.addEventListener('click', nextGeneration, false);
        canvas.addEventListener('click', canvasClick, false);

        initCells();
    }

    const clearCells = () => {
        context.fillStyle = 'rgb(60, 60, 60)';
        context.fillRect(0, 0, SCREEN_SIZE, SCREEN_SIZE);
    }

    const initCells = (rand = false) => {
        clearCells();
        resetTimer();
        if (rand) {
            for (let i = 0; i < field.length; i++) field[i] = Math.floor(Math.random() * 2);
        } else {
            for (let i = 0; i < field.length; i++) field[i] = 0;
        }
        generation.textContent = generationCounter.resetCount();
        draw();
    }

    const draw = () => {
        clearCells();
        let livingCells = 0;
        for(let i = 0; i < field.length; i++) {
            let x = (i % SIDE_CELLS) * CELL_SIZE + CELL_SPACING;
            let y = Math.floor(i / SIDE_CELLS) * CELL_SIZE + CELL_SPACING;
            if (field[i]) {
                context.fillStyle = 'rgb(0, 217, 0)';
                livingCells++;
            } else {
                context.fillStyle = 'rgb(0, 0, 0)';
            }
            context.fillRect(x, y, CELL_SIZE - CELL_SPACING * 2, CELL_SIZE - CELL_SPACING * 2);
        }
        cells.textContent = livingCells;
    }

    const nextGeneration = () => {
        tempField = field.slice();
        for (let i = 0; i < tempField.length; i++) {
            let livingCellsAround = 0;
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    if (j == 0 && k == 0) continue;
                    let checkingCell = i + j * SIDE_CELLS + k;
                    if (checkingCell >= 0 && checkingCell < tempField.length) {
                        if (i < checkingCell && checkingCell % SIDE_CELLS != 0 || i > checkingCell && checkingCell % SIDE_CELLS != SIDE_CELLS - 1 ){
                            if (tempField[checkingCell]) livingCellsAround++;
                        }
                    }
                }
            }
            if (tempField[i] && (livingCellsAround == 2 || livingCellsAround == 3)) {
                field[i] = 1;
            } else if (!tempField[i] && livingCellsAround == 3) {
                field[i] = 1;
            } else {
                field[i] = 0;
            }
        }
        generation.textContent = generationCounter.incrementCount();
        draw();
    }

    const onStart = () => {
        if (running) {
            resetTimer();
        } else {
            nextGeneration();
            timer = setInterval(nextGeneration, 1000 / FPS);
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
        let array_num = Math.floor(x / size) % SIDE_CELLS + Math.floor(y / size) * SIDE_CELLS;
        if(field[array_num]) {
            field[array_num] = 0;
        } else {
            field[array_num] = 1;
        }
        draw();
    }

    const generationCounter = (() => {
        let i = 0;
        return {
            resetCount:() => {
                i = 0;
                return i;
            },
            incrementCount:() => {
                i++;
                return i;
            },
            decrementCount:() => {
                i--;
                return i;
            }
        }
    })();
})();
