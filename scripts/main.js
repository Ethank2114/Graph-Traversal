// main.js

function drawRect({context, x, y, width, height, color="white"}) {
	context.fillStyle = color;
	context.fillRect(x, y, width, height);
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

let idCounter = 0;
function getId() {
	return ++idCounter;
}

class Node {
	constructor() {
		this.id = getId();
		this.data = null;
		this.neighbours = [];
		this.visited = false;
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
	constructor() {
		this.width = 5;
		this.height = 5;
		this.map = null;
		this.backgroundColor = "rgb(30, 30, 25)";
		this.populateMap();
		this.walkers = [];
	}

	populateMap() {
		this.map = [];
		for(let i = 0; i < this.width; i++) {
			let temp = [];
			for(let j = 0; j < this.height; j++) {
				temp.push(new Node());
			}
			this.map.push(temp);
		}
		for(let i = 0; i < this.width; i++) {
			for(let j = 0; j < this.height; j++) {
				if(i != 0) {
					this.map[i][j].neighbours.push(this.map[i - 1][j]);
				}
				if(j != 0) {
					this.map[i][j].neighbours.push(this.map[i][j - 1]);
				}
				if(i != this.width - 1) {
					this.map[i][j].neighbours.push(this.map[i + 1][j]);
				}
				if(j != this.height - 1) {
					this.map[i][j].neighbours.push(this.map[i][j + 1]);
				}
			}
		}
	}

	drawMap(canvas) {	
		let width = canvas.width;
		let height = canvas.height;
		let context = canvas.getContext("2d");

		let tileWidth = width / this.width;
		let tileHeight = height / this.height;

		// clear
		drawRect({
			context:context, 
			x:0, 
			y:0, 
			width:width, 
			height:height, 
			color:this.backgroundColor})

		for(let i = 0; i < this.width; i++) {
			for(let j = 0; j < this.height; j++) {
				drawRect({	context: context, 
							x: i * tileWidth, 
							y: j * tileHeight, 
							width: tileWidth, 
							height: tileHeight})/*, 
							color: this.backgroundColor})*/
			}
		}

	}
}

class Walker {
	constructor(pos) {
		this.pos = pos;
		this.stack = [];
	}

	/*

	look for unvistited nodes

	if none, pull from memory untill 1 found

	if none -> end

	else:

	mark node as visited
	add unvisited to memory

	move to new node

	*/

	walk() {
		let neighbours = this.pos.neighbours;
		let unvisitedNeighbours = [];
		let nextNode = null;
		console.log(this.pos.id)
		// search neighbours
		for(let n of neighbours) {
			if(!n.visited) {
				unvisitedNeighbours.push(n);
			}
		}

		// retrace
		if(unvisitedNeighbours.length == 0) {
			do {
				nextNode = this.stack.pop();
			} while(!nextNode.visited);
		} else {
			let rand = randInt(0, unvisitedNeighbours.length - 1);
			nextNode = unvisitedNeighbours[rand];
			unvisitedNeighbours.splice(unvisitedNeighbours.indexOf(nextNode));
		}

		// if nomore nodes
		if(nextNode == null) {
			return false;
		}

		nextNode.visited = true;
		for(let n of unvisitedNeighbours) {
			this.stack.push(n);
		}

		this.pos = nextNode;

	}
}

let canvas = document.getElementById("canvas");

let theScene = new Scene();
console.log(theScene.map);

theScene.drawMap(canvas);

let walker = new Walker(theScene.map[0][0]);

for(let i = 0; i < 10; i++) {
	walker.walk();
}