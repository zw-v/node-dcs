#!/usr/bin/node
'use strict';
const fs = require('fs');
const ex = require('child_process');
const path = require('path');

// sensors stuff
let table = [];      // global table for initialized sensors
let list = [];

// general

let updateSensorsInterval, updateSensorsIntervalClock = 3; //sec


module.exports = function(io) {
	io.sockets.on('connection', function(socket) {
		updateSensorsInterval = setInterval( function(){ updateSensors(); }, updateSensorsIntervalClock*1000 );
		console.log('SENSORS | SOCKET | User connected');
	
		socket.on('disconnect', function () {
			console.log('SENSORS | SOCKET | User disconnected');
		});
	});

	
	// control system
	function initSensors() {
		let fails = 0;
		console.log('SENSORS: Init...')
		let sensors = JSON.parse(fs.readFileSync('config/sensors.json'));
		sensors.forEach((element) => {
			let value = 0;  
			let cmdoutput = 0;   
			
			cmdoutput = ex.execSync( "cat /sys/bus/w1/devices/" + element['id'] + "/w1_slave | grep t= | cut -f2 -d= | awk '{print $1/1000}'");
			value = parseFloat(cmdoutput).toFixed(2);
			if ( value != 'NaN' ) {
				let entry = { "name": element['name'], "val": value, "id": element['id'] }
				table.push(entry);
				list.push(entry.name);
				
			}
			else
				fails++;
		});
		console.log('SENSORS: Initialized - errors: ' + fails);
	}


	function updateSensors() {
		table.forEach((element) => {
			let value = 0;                        
			ex.exec( "cat /sys/bus/w1/devices/" + element['id'] + "/w1_slave | grep t= | cut -f2 -d= | awk '{print $1/1000}'", function( error, stdout, stderr ){
					if ( error != null ){
						console.log( "Error trying to read sensor: " + element['name'] + ": " + error);
					}
					else {
						value = parseFloat(stdout).toFixed(2);
						if ( value != 'NaN' ) {
							element['val'] = value;
						}
						io.emit(element['id'], value);
						//console.log(socket);
						// console.log('SENSORS | SOCKET | emitted ' + element.id + ':' + value);
					}
			});
		});

	}

	function getSensorByName(sensorName) {
		let entry = table.find(item => item.name === sensorName);
		if ( entry != undefined )
			return entry.val;
		else
			return 'NaN';
	}

	initSensors();



};
// module.exports.table = table;
// module.exports.list = list;
// module.exports.get = getSensorByName;