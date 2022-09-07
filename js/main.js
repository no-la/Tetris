//�L�����p�X�̎擾
const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");
const subcvs = document.getElementById("subcvs");
const subctx = subcvs.getContext("2d");

//�u���b�N�P�}�X�̃T�C�Y
const blockSize = 30;
//�}�X�̐�
const boardRow = 20;
const boardCol = 10;

//�L�����p�X�̃T�C�Y���w��
const canvasWidth = blockSize * boardCol;
const canvasHeight = blockSize * boardRow;
const subCanvasWidth = blockSize * 5;
const subCanvasHeight = blockSize * 9;


cvs.width = canvasWidth;
cvs.height = canvasHeight;
subcvs.width = subCanvasWidth;
subcvs.height = subCanvasHeight;

//container�̎擾
const container = document.getElementById("container");
container.style.width = canvasWidth + 'px';

//Line�p��div�̎擾
const lineText = document.getElementById("Line");
const bestText = document.getElementById("Best");

//BGM
const music = new Audio("source/tetrisBGM.wav");
music.loop = true;
music.volume = 1;


let isGameOver = true;
let lines = 0;
let best = 0;

//�����T�C�N��
const interval = 300;

let timerId = NaN;
//�~�m�̔z��
const minoSize = 4;
let mino;
let offsetX = offsetY = 0;
let nextMinos = [];
let minoIndex = NaN;
const minoTypes = [
	[
		[0, 0, 0, 0],
		[0, 1, 0, 0],
		[1, 1, 1, 0],
		[0, 0, 0, 0]
	],
	[
		[0, 0, 0, 0],
		[1, 1, 0, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0]
	],
	[
		[0, 0, 0, 0],
		[0, 1, 1, 0],
		[1, 1, 0, 0],
		[0, 0, 0, 0]
	],
	[
		[0, 0, 0, 0],
		[0, 1, 1, 0],
		[0, 1, 0, 0],
		[0, 1, 0, 0]
	],
	[
		[0, 0, 0, 0],
		[0, 1, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0]
	],
	[
		[0, 0, 0, 0],
		[0, 1, 1, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0]
	],
	[
		[0, 1, 0, 0],
		[0, 1, 0, 0],
		[0, 1, 0, 0],
		[0, 1, 0, 0]
	],
];
const minoColors = [
	'#f78ff0',
	'#f94246',
	'#7ced77',
	'#9693fe',
	'#f2b907',
	'#f6fe85',
	'#07e0e7',
];


//�{�[�h�S�̂̔z��
const board = [];

function setLineText() {
	lineText.innerText = "Line:" + lines;
}
function setBestText() {
	bestText.innerText = "Best:" + best;
}
	
//�`�揈��
function draw() {
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	//�ς�ł���~�m
	for (let y = 0; y < boardRow; y++) {
		for (let x = 0; x < boardCol; x++) {
			if (board[y][x] != -1) {
				drawBlock(x, y, board[y][x]);
			}
		}

		//�����Ă���~�m
		for (let y = 0; y < minoSize; y++) {
			for (let x = 0; x < minoSize; x++) {
				if (mino[y][x] == 1) {
					drawBlock(x + offsetX, y + offsetY, minoIndex);
				}
			}
		}
	}

	if (isGameOver) {
		const text = "GAME OVER";
		ctx.font = "40px MS�S�V�b�N";
		const w = ctx.measureText(text).width;
		const x = (canvasWidth - w) / 2;
		const y = canvasHeight / 2 - 20;
		ctx.fillStyle = "white";
		ctx.fillText(text, x, y);
	}
}

function drawSubCanvas() {
	subctx.fillStyle = "#000";
	subctx.fillRect(0, 0, subCanvasWidth, subCanvasHeight);

	for (let i = 0; i < 2; i++) {
		for (let y = 0; y < minoSize; y++) {
			for (let x = 0; x < minoSize; x++) {
				if (minoTypes[nextMinos[i]][y][x] == 1) {
					drawBlock(x + 1, y + i * minoSize, nextMinos[i], subctx);
				}
			}
		}
	}
}


//����������
function init() {
	isGameOver = false;
	music.play();
	//board�̏�����
	for (let y = 0; y < boardRow; y++) {
		board[y] = [];
		for (let x = 0; x < boardCol; x++) {
			board[y][x] = -1;
		}
	}
	lines = 0;
	setLineText();
	let text = localStorage.getItem("Best");
	if (text != null) best = +text;
	setBestText();
	resetMino();

	draw();
	timerId = setInterval(update, interval);
}
//�~�m�̓����Ɋւ��鏈��
function drawBlock(x, y, minoId, context = ctx) {
	let px = x * blockSize;
	let py = y * blockSize;
	context.fillStyle = minoColors[minoId];
	context.fillRect(px, py, blockSize, blockSize);
	context.strokeStyle = "black";
	context.strokeRect(px, py, blockSize, blockSize);
}

function canMove(dx, dy, newMino = mino) {
	for (let y = 0; y < minoSize; y++) {
		for (let x = 0; x < minoSize; x++) {
			if (newMino[y][x] == 1) {
				//�ړ���̃{�[�h���W
				let nx = x + offsetX + dx;
				let ny = y + offsetY + dy;
				if (
					ny < 0 || ny >= boardRow ||
					nx < 0 || nx >= boardCol ||
					board[ny][nx] != -1
				) {
					return false;
				}
			}
		}
	}
	return true;
}

function resetMino() {
	offsetX = (boardCol - minoSize) / 2;
	offsetY = 0;

	if (nextMinos.length <= 3) {
		let next = shuffuleArray([0, 1, 2, 3, 4, 5, 6]);
		for (let i = 0; i < 7; i++) {
			nextMinos.push(next[i]);
		}
	}
	minoIndex = nextMinos[0]
	mino = minoTypes[minoIndex];
	nextMinos.shift();

	drawSubCanvas();
}

function createRotateMino() {
	let newMino = [];
	for (let y = 0; y < minoSize; y++) {
		newMino[y] = [];
		for (let x = 0; x < minoSize; x++) {
			newMino[y][x] = mino[minoSize - 1 - x][y];
		}
	}
	return newMino;
}

function fixMino() {
	for (let y = 0; y < minoSize; y++) {
		for (let x = 0; x < minoSize; x++) {
			if (mino[y][x] == 1) {
				board[offsetY + y][offsetX + x] = minoIndex;
			}
		}
	}
}

function clearLine() {
	for (let y = 0; y < boardRow; y++) {
		let isLineOK = true;
		for (let x = 0; x < boardCol; x++) {
			if (board[y][x] == -1) {
				isLineOK = false;
				break;
			}
		}
		if (isLineOK) {
			lines++;
			setLineText();
			for (let ny = y; ny > 0; ny--) {
				board[ny] = board[ny - 1]
			}
		}
	}

}

//�z��̃V���b�t��
function shuffuleArray(array) {
	for (let i = array.length - 1; i >= 0; i--) {
		let index = Math.floor(Math.random() * array.length);
		let tmp = array[i]
		array[i] = array[index];
		array[index] = tmp;
	}
	return array;
}

function gameOver() {
	isGameOver = true;
	clearInterval(timerId);

	if (lines > best) localStorage.setItem("Best", lines);
}

//�C�x���g�̎w��
document.addEventListener("keydown", (event) => {
	if (isGameOver) {
		init();
		return
	}
	switch (event.keyCode) {
		case 37: //left
			if (canMove(-1, 0)) offsetX--;
			break;
		case 38: //up
			while (canMove(0, 1)) offsetY++;
			break;
		case 39: //right
			if (canMove(1, 0)) offsetX++;
			break;
		case 40: //down
			if (canMove(0, 1)) offsetY++;
			break;
		case 32: //space
			let newMino = createRotateMino();
			if (canMove(0, 0, newMino)) mino = newMino;
	}
	draw();
}

);

function update() {
	if (isGameOver) return;
	//�~�m�𗎂Ƃ�
	if (canMove(0, 1)) {
		offsetY++;
	}
	else {
		fixMino();
		clearLine();
		resetMino();
		if (!canMove(0, 0)) {
			gameOver();
		}
	}
	draw();
}
