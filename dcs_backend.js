#!/usr/bin/node
'use strict';
const ex = require('child_process');
const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http').createServer(handler);
var io = require('socket.io', 'net')(http);
// custom
const sensors = require('./modules/sensors')(io);
const output = require('./modules/output')(io);          // pass io to output module
const colors = require('colors');

// webserver stuff
const WebPort = 8000;

// webserver functions
http.listen(WebPort, function() {
	let msg = 'SERVER running on port: '+WebPort
	console.log(msg.green);
	}
);

function handler (req, res) {
	var q = url.parse(req.url, true);
	var filename = "." + q.pathname;
	// console.log('filename='+filename);
	var extname = path.extname(filename);
	if (filename=='./') {
	//   console.log('retrieving default index.html file');
	  filename= './index.html';
	}
	// Initial content type
	var contentType = 'text/html';
	// Check ext and set content type
	switch(extname) {
	case '.js':
		contentType = 'text/javascript';
		break;
	case '.css':
		contentType = 'text/css';
		break;
	case '.json':
		contentType = 'application/json';
		break;
	case '.png':
		contentType = 'image/png';
		break;
	case '.jpg':
		contentType = 'image/jpg';
		break;
	case '.ico':
		contentType = 'image/png';
		break;
	}

	fs.readFile(__dirname + '/public/' + filename, function(err, content) {
	if(err) {
			let msg = 'File not found. Filename='+filename
			console.log(msg.green);
			fs.readFile(__dirname + '/public/404.html', function(err, content) {
			res.writeHead(200, {'Content-Type': 'text/html'}); 
			return res.end(content,'utf8'); //display 404 on error
		});
	}
	else {
		// Success
		res.writeHead(200, {'Content-Type': contentType}); 
		return res.end(content,'utf8');
	}
	});
}

// general

var date = new Date();

let mainInterval, mainIntervalClock = 3; //sec/10
let welcomeInterval, welcomeIntervalClock = 3; //sec/10


function welcome() {
	if ( output.isReady ) {
		console.log( 'Started dcs backend'.yellow);
		console.log( '-----------------'.yellow);
		let msg = 'current hour is ' + date.getHours()
		console.log( msg.yellow);
		console.log( 'full date:'.yellow );
		msg = date.getUTCDate()
		console.log(msg.yellow);


		if ( date.getHours() > 18 || date.getHours() < 6) {
			console.log('enabling vent thru for cooling');

			output.ventIn(1);
			output.ventOut(1, 'fast')
			// io.sockets.emit('blastgate', true);
			// io.sockets.emit('fan_extractor', true);
			// io.sockets.emit('fan_extractor_trubo', true);
		}

		clearInterval(welcomeInterval);
	}
}



welcomeInterval = setInterval( function(){ welcome(); }, welcomeIntervalClock*100 );

