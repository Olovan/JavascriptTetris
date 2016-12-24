const canvas = document.getElementById("Tetris");
const context = canvas.getContext("2d");

context.scale(20, 20);
context.fillStyle = "#000";
context.fillRect(0, 0, canvas.width, canvas.height);

var dropInterval = 700;
var dropCounter = 0;
var diffCounter = 0;

var score = 0;
const board = buildMatrix( 20, 12 );
const player = {
	matrix: null,
	pos: {x:0, y:0},
}

const colors = [
	null,
	"red",
	"orange",
	"yellow",
	"green",
	"blue",
	"indigo",
	"violet",
]


function buildMatrix( rows, columns )
{
	var matrix = [];
	for(var i = 0; i < rows; i++)
	{
		matrix.push( new Array(columns).fill(0) );
	}
	return matrix;
}

function respawnPlayer()
{
	const pieces = "TOSZLJI";
	const randomPiece = pieces[Math.random() * pieces.length | 0];
	player.pos.x = board[0].length / 2 | 0;
	player.pos.y = 0;
	player.matrix = createPieceMatrix(randomPiece);
	if(isColliding())
	{
		restartGame();
	}
}

function restartGame()
{
	diffCounter = 0;
	board.forEach( (row) => row.fill(0) );
	updateScore( 0 );
	respawnPlayer();
}

function updateScore( newScore )
{
	score = newScore;
	document.getElementById("Score").innerHTML = score;
}

function createPieceMatrix( pieceChar )
{
	switch(pieceChar)
	{
		case 'T':
			return [
				[1, 1, 1],
				[0, 1, 0],
				[0, 0, 0],
			];
		case 'O':
			return [
				[2, 2],
				[2, 2],
			];
		case 'S':
			return [
				[0, 3, 3],
				[3, 3, 0],
				[0, 0, 0],
			];
		case 'Z':
			return [
				[4, 4, 0],
				[0, 4, 4],
				[0, 0, 0],
			];
		case 'L':
			return [
				[0, 5, 0],
				[0, 5, 0],
				[0, 5, 5],
			];
		case 'J':
			return [
				[0, 6, 0],
				[0, 6, 0],
				[6, 6, 0],
			];
		case 'I':
			return [
				[0, 7, 0, 0],
				[0, 7, 0, 0],
				[0, 7, 0, 0],
				[0, 7, 0, 0],
			];
	}
}

let lastFrameTime = 0;
function update( time = 0 )
{
	const deltaTime = time - lastFrameTime;
	lastFrameTime = time;
	dropCounter += deltaTime;
	diffCounter += deltaTime;
	updateDifficulty(diffCounter);
	if(dropCounter >= dropInterval)
	{
		dropPlayer();
		dropCounter = 0;
	}
	renderBoard();
	requestAnimationFrame(update);
}

function updateDifficulty( inputTime )
{
	inputTime /= 1000; //convert to seconds
	switch(Math.floor(inputTime/60)) //Increase difficulty every minute
	{
		case 0:
			dropInterval = 700;
			break;
		case 1:
			dropInterval = 600;
			break;
		case 2:
			dropInterval = 500;
			break;
		case 3:
			dropInterval = 400;
			break;
		case 4:
			dropInterval = 300;
			break;

	}
}

function isColliding()
{
	for(let y = 0; y < player.matrix.length; y++)
	{
		for(let x = 0; x < player.matrix[0].length; x++)
		{
			let element = player.matrix[y][x];
			if(element !== 0 && (
						player.pos.x + x < 0 || 
						player.pos.x + x >= board[0].length || 
						player.pos.y + y >= board.length ||
						board[y + player.pos.y][x + player.pos.x] !== 0
					))
			{
				return true;
			}
		}
	}
	return false;
}

function addPlayerToBoard()
{
	for(let y = 0; y < player.matrix.length; y++)
	{
		for(let x = 0; x < player.matrix[0].length; x++)
		{
			let element = player.matrix[y][x];
			if(element !== 0) 
			{
				board[player.pos.y + y][player.pos.x + x] = element;
			}
		}
	}

}

function updateBoard()
{
	let count = 0;
	for(let y = board.length - 1; y >= 0; y--)
	{
		if(board[y].indexOf(0) == -1)
		{
			count++;
			board.splice(y, 1); //Remove that row
			board.unshift(new Array(board[0].length).fill(0));
			y++;
		}
	}
	let points = 0;
	switch(count)
	{
		case 1:
		      points = 40;
		      break;
		case 2:
		      points = 100;
		      break;
		case 3:
		      points = 300;
		      break;
		case 4:
		      points = 1200;
		      break;
	}
	updateScore(points + score);
}

function dropPlayer()
{
	player.pos.y++;
	if(isColliding())
	{
		player.pos.y--;
		addPlayerToBoard();
		updateBoard();
		respawnPlayer();
	}
}

function rotatePlayer(dir)
{
	rotatePlayerMatrix(dir);
	if(isColliding())
		rotatePlayerMatrix( -1 * dir );
	
}

function rotatePlayerMatrix(dir)
{
	//Reflect Matrix
	for(let y = 0; y < player.matrix.length; y++)
	{
		for(let x = 0; x < y; x++)
		{
			let temp = player.matrix[y][x];
			player.matrix[y][x] = player.matrix[x][y];
			player.matrix[x][y] = temp;
		}
	}
	if(dir < 0)
	{
		player.matrix.reverse();
	}
	else
	{
		player.matrix.forEach( (row) => row.reverse() );
	}
}

function movePlayer( dir )
{
	if (dir < 0)
	{
		player.pos.x--;
		if(isColliding())
			player.pos.x++;
	}
	else
	{
		player.pos.x++;
		if(isColliding())
			player.pos.x--;
	}
}

function drawMatrix(matrix, offset) {
	matrix.forEach( (row, y) => {
		row.forEach( (element, x) => {
			if(element !== 0)
			{
				context.fillStyle = colors[element];
				context.fillRect(x + offset.x, y + offset.y, 1, 1);
			}
		});
	});
}

function renderBoard()
{
	//Clear Window
	context.fillStyle = "#000";
	context.fillRect(0, 0, 12, 20);
	//Draw Board
	drawMatrix(board, {x:0, y:0});
	//Draw Player
	drawMatrix(player.matrix, player.pos);
}

document.addEventListener('keydown', inputHandler);

function inputHandler(event)
{
	switch(event.keyCode)
	{
		case 65:
		case 37:
			movePlayer(-1);
			break;
		case 68:
		case 39:
			movePlayer(1);
			break;
		case 83:
		case 40:
			dropPlayer();
			dropCounter = 0;
			break;
		case 87:
		case 38:
			rotatePlayer(1);
			break;
	}
}

restartGame();
renderBoard();
update();
