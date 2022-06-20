var socket = io(); //load socket.io-client and connect to the host that serves the page
var sensors = ['28-01195237b6ff',
				'28-0119523d7aff',
				'28-0119523808ff',
				'28-01195239e9ff',
				'28-0000054d7234',
				'28-01195242eaff',
				'28-0119523b01ff']
var sensorNames = ['cleanroom',
				'out',
				'corridor',
				'r_top',
				'r_pipe',
				'r_desk',
				'workshop']

var logsElement = document.getElementById('logs');
var ul = document.createElement('ul');
logsElement.appendChild(ul);
				


sensors.forEach(function(SensorId) {
	socket.on(SensorId, function (value) {  
		let element = document.getElementById(SensorId);
		element.innerText = value
	});
});

socket.on('fan_intake', function(value) {
	let element = document.getElementById('fan_intake');
	element.checked = value;
});
var blastgate_state;
socket.on('blastgate', function(value) {
	let element = document.getElementById('blastgate');
	element.checked = value;
	this.blastgate_state = value;
});
socket.on('fan_extractor', function(value) {
	let element = document.getElementById('fan_extractor');
	element.checked = value;
});
socket.on('fan_extractor_turbo', function(value) {
	let element = document.getElementById('fan_extractor_turbo');
	element.checked = value;
});
socket.on('fan_circulator', function(value) {
	let element = document.getElementById('fan_circulator');
	element.checked = value;
});
socket.on('logger', function(message) {
	if ( ul.childElementCount > 4  ) {
		ul.removeChild(ul.firstChild);
	}
		var newLi = document.createElement('li');
		newLi.appendChild(document.createTextNode(message));
		ul.appendChild(newLi);
});
	
	




/** function to sense if device is a mobile device ***/
// Reference: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

var isMobile = {
  Android: function() {
	  return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
	  return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
	  return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
	  return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
	  return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
	  return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

var fan_intake = document.getElementById('fan_intake');
var fan_intake_turbo = document.getElementById('fan_intake_turbo');
var fan_extractor = document.getElementById('fan_extractor');
var fan_extractor_turbo = document.getElementById('fan_extractor_turbo');
var blastgate = document.getElementById('blastgate');
var fan_circulator = document.getElementById('fan_circulator');


fan_intake.addEventListener('change', function() {
	socket.emit('fan_intake_c', this.checked);
});
fan_intake_turbo.disabled = true;

// fan_intake_turbo.addEventListener('change', function() {
//     this.checked = false;
// });
fan_extractor.addEventListener('change', function() {
	socket.emit('fan_extractor_c', this.checked);
});
fan_extractor_turbo.addEventListener('change', function() {
	socket.emit('fan_extractor_turbo_c', this.checked);
});
fan_circulator.addEventListener('change', function() {
	socket.emit('fan_circulator_c', this.checked);
});
blastgate.disabled = true;
// blastgate.addEventListener('change', function() {
//     this.checked = blastgate_state;
// });



