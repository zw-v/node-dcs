#!/usr/bin/node
'use strict';
const fs = require('fs');
const pigpio = require('../node_modules/pigpio-client').pigpio({host: 'localhost'});

var ready = false;
var pins =  [];      // list of pin objects
var names = [];      // list of names
var state = [];

var oldMessages = [];


module.exports = function(io) {
	io.sockets.on('connection', function(socket) {
		oldMessages.forEach( message => {
			io.emit('logger', message);
		})
		var address = socket.handshake.address;
	
		// logger('OUTPUT | SOCKET | User connected from ' + address.address);
		// push old messages
		
		io.emit('fan_intake', state[names.indexOf('fan_intake')]);
		io.emit('blastgate', state[names.indexOf('blastgate')]);
		io.emit('fan_extractor', state[names.indexOf('fan_extractor')]);
		io.emit('fan_extractor_turbo', state[names.indexOf('fan_extractor_turbo')]);
		io.emit('fan_circulator', state[names.indexOf('fan_circulator')]);
	
	
		socket.on('fan_intake_c', function(value) { 
			ventIn(value);
			io.emit('fan_intake', value); // send status to ALL clients 
		});
		socket.on('fan_extractor_c', function(value) { 
			ventOut(value, 'slow');
			io.emit('fan_extractor', value); // send status to ALL clients 
		});
		socket.on('fan_extractor_turbo_c', function(value) { 
			ventOut(value, 'fast');
			io.emit('fan_extractor_turbo', value); // send status to ALL clients 
		});
	
		socket.on('disconnect', function () {
		   // logger('OUTPUT | SOCKET | User disconnected');
		});
	});

	function logger(message) {
		if ( oldMessages.length > 4 ) {
			oldMessages.shift();
		}
		let timestamp = new Date().toLocaleString('pl-PL');
		let fullMessage = timestamp + '      '+ message;
		oldMessages.push(fullMessage);
		io.sockets.emit('logger', fullMessage);
		console.log(fullMessage);
	}
	
	function ventIn( on = true, speed = 'slow' ) {
		
		if ( on ) {
			pins[names.indexOf('fan_intake')].write(1);
			state[names.indexOf('fan_intake')] = 1;
			io.sockets.emit('fan_intake', true);
			logger('Venting inward...');
		}
		else {
			pins[names.indexOf('fan_intake')].write(0);
			state[names.indexOf('fan_intake')] = 0;
			io.emit('fan_intake', false);
			logger('Venting inward stopped.');
		}
	}

	function ventOut( on = true, speed = 'slow' ) {
		if ( on ) {
			pins[names.indexOf('blastgate')].write(1);
			state[names.indexOf('blastgate')] = 1;
			io.emit('blastgate', true);
			
			if ( speed == 'slow' ) {
				pins[names.indexOf('fan_extractor')].write(1);
				state[names.indexOf('fan_extractor')] = 1;
				pins[names.indexOf('fan_extractor_turbo')].write(0);
				state[names.indexOf('fan_extractor_turbo')] = 0;
				io.emit('fan_extractor', true);
				io.emit('fan_extractor_turbo', false);
				logger('Venting outside...');
			}
	
			if ( speed == 'fast' ) {
				pins[names.indexOf('fan_extractor')].write(1);
				state[names.indexOf('fan_extractor')] = 1;
				pins[names.indexOf('fan_extractor_turbo')].write(1);
				state[names.indexOf('fan_extractor_turbo')] = 1;
				io.emit('fan_extractor', true);
				io.emit('fan_extractor_turbo', true);
				logger('Venting outside fast...');
			}
		}
		else { // Not on
			pins[names.indexOf('blastgate')].write(0);
			state[names.indexOf('blastgate')] = 0;
			io.emit('blastgate', false);
			pins[names.indexOf('fan_extractor')].write(0);
			state[names.indexOf('fan_extractor')] = 0;
			io.emit('fan_extractor', false);
			pins[names.indexOf('fan_extractor_turbo')].write(0);
			state[names.indexOf('fan_extractor_turbo')] = 0;
			io.emit('fan_extractor_turbo', false);
			logger('Venting outside stopped.');
		}
	}
	
	function isReady() {
		return ready;
	}
	
	process.on('SIGINT', function () {
		process.exit();
	});
	
	pigpio.once('connected', (info) => {
		// display information on pigpio and connection status
		// console.log(JSON.stringify(info,null,2));
	
		console.log('output module: Reading json...')
		
		let settings = JSON.parse(fs.readFileSync('config/settings.json'));
		var i = 0;
		settings.forEach((element) => {
			let pin = pigpio.gpio(element.pin);
			pin.modeSet('output');
			pin.write(element.default)
			console.log('  OUTPUT - pin ' + element.name + ' set to ' + element.default);
			pins.push(pin);
			names.push(element.name);
			state.push(element.default)
			i++;
		});
		console.log('output module: Initialized ' + i + ' pins.');
		
		console.log('output module: Ready');
		ready = true;
	});
	  
	
	pigpio.on('error', (err)=> {
		console.log('Application received error: ', err.message); // or err.stack
	});
	
	pigpio.on('disconnected', (reason) => {
		console.log('App received disconnected event, reason: ', reason);
		console.log('App reconnecting in 1 sec');
		setTimeout( pigpio.connect, 1000, {host: 'localhost'});
	});
	
	return { ventIn, ventOut, isReady, names, pins, state };
};
//czy mozna skasowac te sredniki?
