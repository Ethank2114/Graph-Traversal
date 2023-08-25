// main.js

function drawRect({context, x, y, width, height, color="white"}) {
	context.fillStyle = color;
	context.fillRect(x, y, width, height);
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mixColor(oldColor, strength = 1) {
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

let idCounter = 0;
function getId() {
	return ++idCounter;
}

let gridWidth = 1200;
let gridheight = 800;
const defWalkerColor = "rgb(50, 150, 200)";
const speed = 100;
const refreshRate = 1;
const walkerCount = 4;



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
		// this.backgroundColor = backgroundColor;
		this.walkers = [];
		this.canvas = canvas

		// resize canvas to window size 
		if(this.canvas.width != window.innerWidth - 16) {
			this.canvas.width = window.innerWidth - 16;
			this.width = this.canvas.width;
		}

		if(this.canvas.height != window.innerHeight - 16) {
			this.canvas.height = window.innerHeight - 16;
			this.height = this.canvas.height;
		}

		this.populateMap();
	}

	populateMap() {
		this.map = [];
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

	addWalker(x = 0, y = 0, color = null) {
		let newWalker = new Walker(this.map[x][y])

		if(color != null) {
			newWalker.color = color;
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

		// this.drawMap()

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
	constructor(pos, color = defWalkerColor) {
	// constructor(pos, color = "rgb(90, 15, 242)") {
		this.pos = pos;
		this.stack = [];
		this.color = color;
	}

	/*

	look for unvistited nodes

	if none, pull from memory until 1 found

	if none -> end

	else:

	mark node as visited
	add unvisited to memory

	move to new node

	*/

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

		this.color = mixColor(this.color, 1)
		for(let n of unvisitedNeighbours) {
			this.stack.push(n);
		}

		// console.log("nextNode:", nextNode)
		// console.log("stack:", printNodes(this.stack))

		this.pos = nextNode;
		return true;


	}
}

let canvas = document.getElementById("canvas");
let theScene = new Scene(canvas);

for(let i = 0; i < walkerCount; i++) {
	theScene.addWalker(randInt(0, theScene.width - 1), randInt(0, theScene.height - 1), randColor());
}

let ptr = setInterval(function() {
	for(let i = 0; i < speed; i++) {
		theScene.iterate();
	}
	
}, refreshRate);
