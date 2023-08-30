// main.js

function drawRect({context, x, y, width, height, color="white"}) {
	context.fillStyle = color;
	context.fillRect(x, y, width, height);
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function mixColor(oldColor, strength = 1) {
// 	let rgb = oldColor.replace(/[^\d,]/g, '').split(',');
// 	let shift = randInt(-1 * strength, strength);
// 	let part = randInt(0, 2);

// 	rgb[part] = parseInt(rgb[part]) + shift;

// 	if(rgb[part] > 255 || rgb[part] < 0) {
// 		rgb[part] += shift * -2;
// 	}

// 	rgb[part] = rgb[part].toString();

// 	return "rgb(" + rgb[0].toString() + ", "+ rgb[1].toString() + ", " + rgb[2].toString() + ")";
// }

function mixColor(oldColor, strength = 1) {

	if(strength < 1) {
		let percent = Math.ceil(strength * 100);
		// console.log("percent", percent)
		if(randInt(0, 100) > percent) {
			return oldColor
		}
		strength = 1;
	}

	let rgb = oldColor.replace(/[^\d,]/g, '').split(',');
	let shift = randInt(-1 * strength, strength);
	let part = randInt(0, 2);

	rgb[part] = parseInt(rgb[part]) + shift;

	if(rgb[part] > 255 || rgb[part] < 0) {
		rgb[part] += shift * -2;
	}

	rgb[part] = rgb[part].toString();

	return "rgb(" + rgb[0].toString() + ", "+ rgb[1].toString() + ", " + rgb[2].toString() + ")";
}

var randColor = function() {
	let r = randInt(0, 255);
	let g = randInt(0, 255);
	let b = randInt(0, 255);
	return "rgb(" + r.toString() + ", "+ g.toString() + ", " + b.toString() + ")"; 
}

var hexToRGB = function(hex) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? "rgb(" +
		parseInt(result[1], 16) + ", " +
		parseInt(result[2], 16) + ", " +
		parseInt(result[3], 16) + ")"
	 : null;
}

let idCounter = 0;
function getId() {
	return ++idCounter;
}

let gridWidth = 1200;
let gridheight = 800;
const refreshRate = 1;

var colorDefault = null;

var speed = 50;
var seeds = 5;
var colorStrength = 1;

function colorSmoother(num) {
	if(num===0) {
		return 0;
	}

	let out = Math.pow(1.045, num - 47.3197) - 0.125;
	
	if(out >= 1) {
		out = Math.round(out);
	}
	// console.log(out)
	return out;
}

class Node {
	constructor(x, y) {
		this.id = getId();
		this.color = null;
		this.neighbours = [];
		this.visited = false;
		this.x = x;
		this.y = y;
	}
}

class Stack {
	constructor() {
		this.contents = []
	}

	push(item) {
		this.contents.push(item);
	}

	pop() {
		return this.contents.pop();
	}
}

class Scene {
	constructor(canvas) {
		this.width = gridWidth;
		this.height = gridheight;
		this.map;
		this.walkers = [];
		this.canvas = canvas

		this.resize()

		this.reset()
	}

	resize() {
		// resize canvas to window size 
		if(this.canvas.width != window.innerWidth - 16) {
			this.canvas.width = window.innerWidth - 16;
			this.width = this.canvas.width;
		}

		if(this.canvas.height != window.innerHeight - 16) {
			this.canvas.height = window.innerHeight - 16;
			this.height = this.canvas.height;
		}
	}

	populateMap() {
		this.map = [];
		this.walkers = [];
		for(let i = 0; i < this.width; i++) {
			let temp = [];
			for(let j = 0; j < this.height; j++) {
				temp.push(new Node(i, j));
			}
			this.map.push(temp);
		}
		for(let i = 0; i < this.width; i++) {
			for(let j = 0; j < this.height; j++) {
				if(i !== 0) {
					this.map[i][j].neighbours.push(this.map[i - 1][j]);
				}
				if(j !== 0) {
					this.map[i][j].neighbours.push(this.map[i][j - 1]);
				}
				if(i !== this.width - 1) {
					this.map[i][j].neighbours.push(this.map[i + 1][j]);
				}
				if(j !== this.height - 1) {
					this.map[i][j].neighbours.push(this.map[i][j + 1]);
				}
			}
		}
	}

	drawSquare(node) {
		let width = this.canvas.width;
		let height = this.canvas.height;
		let context = this.canvas.getContext("2d");

		let tileWidth = width / this.width;
		let tileHeight = height / this.height;

		drawRect({context: context, x: node.x * tileWidth, y: node.y * tileHeight, 
					width: tileWidth, height: tileHeight, color: node.color});
	}

	addWalker(x = randInt(0, this.width-1), y = randInt(0, this.height-1), color = randColor()) {
		let newWalker = new Walker(this.map[x][y])

		if(color != null) {
			newWalker.color = color;
		}

		if(colorDefault != null) {
			newWalker.color = colorDefault;
		}

		this.walkers.push(newWalker);
		this.map[x][y].visited = true;
		this.map[x][y].color = newWalker.color;

		this.drawSquare(this.map[x][y])

		// this.drawMap()
	}

	iterate() {
		for(let w of this.walkers) {
			w.walk(this);
		}
	}

	reset() {
		let context = this.canvas.getContext("2d");
		drawRect({context: context, x: 0, y: 0, 
					width: this.canvas.width, height: this.canvas.height, color: "rgb(30,30,25)"});
		this.rePaint()
	}

	rePaint() {
		this.resize()
		this.populateMap();
		for(let i = 0; i < seeds; i++) {
			this.addWalker();
		}
	}
}


function unVisited(node) {
	return !node.visited;
}

function printNodes(nodes) {
	let out = "";
	for(let n of nodes) {
		out += n.id + " ";
	}
	return out;
}

class Walker {
	constructor(pos, color = colorDefault) {
		this.pos = pos;
		this.stack = [];

		if(color === null) {
			color = randColor()
		}

		this.color = color;
	}

	walk(scene) {
		let neighbours = this.pos.neighbours;
		let unvisitedNeighbours = neighbours.filter(unVisited);
		let nextNode = null;
		
		// retrace
		if(unvisitedNeighbours.length === 0) {
			do {

				if(this.stack.length <= 0) {
					break;
				}

				nextNode = this.stack.pop();

				if(nextNode.color != null) {
					this.color = nextNode.color
				}
				// console.log(nextNode.id)
			} while(nextNode.visited);
		} else {
			let rand = randInt(0, unvisitedNeighbours.length - 1);
			nextNode = unvisitedNeighbours[rand];
			unvisitedNeighbours.splice(unvisitedNeighbours.indexOf(nextNode), 1);
		}

		// if nomore nodes
		if(nextNode === null) {
			return false;
		}

		nextNode.visited = true;
		nextNode.color = this.color;

		scene.drawSquare(nextNode)

		this.color = mixColor(this.color, colorStrength)
		for(let n of unvisitedNeighbours) {
			this.stack.push(n);
		}

		this.pos = nextNode;
		return true;
	}
}

let canvas = document.getElementById("canvas");
let theScene = new Scene(canvas);

let ptr = setInterval(function() {
	for(let i = 0; i < Math.floor(Math.pow(1.09648, speed)); i++) {
		theScene.iterate();
	}
	
}, refreshRate);

function changeSpeed() {
	clearInterval(ptr)
	ptr = setInterval(function() {
		for(let i = 0; i < Math.floor(Math.pow(1.09648, speed)); i++) {
			theScene.iterate();
		}
	}, refreshRate);
}