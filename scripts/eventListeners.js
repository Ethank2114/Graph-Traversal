variables = ["seeds", "speed", "colorStrength"]

updateGlobal = function(name) {
	let value = document.getElementById(name + "Value");
	let code = name + " = " + value.value + ";";

	if(name === "colorStrength") {
		code = name + " = " + colorSmoother(parseInt(value.value)).toString() + ";";
	}

	eval(code);
}

bindSliderToValue = function(name) {
	let slider = document.getElementById(name + "Slider");
	let value = document.getElementById(name + "Value");
	slider.oninput = function() {
		value.value = slider.value;
		updateGlobal(name);
	}
	value.addEventListener("keypress", function(event) {
		if(event.key === "Enter") {
			slider.value = value.value;
		}
	})
	value.min = slider.min;
	value.max = slider.max;
}

bindColorSelector = function(name) {
	let colorSelector = document.getElementById(name);

	colorSelector.onchange = function() {
		colorDefault = hexToRGB(colorSelector.value);
	}

}

variables.forEach(function(v) {
	bindSliderToValue(v);
});

document.getElementById("hide").onclick = function(event){
	document.getElementById("controlBar").style.display = "None";
};

bindColorSelector("color")