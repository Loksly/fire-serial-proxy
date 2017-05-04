(function(){
	'use strict';

	const readline = require('readline'),
		firebase = require('firebase'),
		SerialPort = require('serialport'),
		config = require('./config.json');

	const port = new SerialPort(config.serialport, {'baudRate': config.baudRate, 'parser': SerialPort.parsers.readline('\n')});

	const app = firebase.initializeApp(config.firebase);

	const db = firebase.database();
	const ref = db.ref().child('planes').child(config.car).child('plan');
	const metricref = db.ref().child('metrics').child(config.car);
	let prev = '';

	ref.on('value', function(snapshot){
		const value = snapshot.val();
		console.log(value);
		if (typeof value === 'string' && value.trim() !== '' && prev !== ''){
			port.write(value.trim(), function(err) {
				if (err) {
					return console.log('Error on write: ', err.message);
				}
			});
		}
		prev = value;
	});

	port.on('open', function() {
		console.log('Open port');
	});

	port.on('error', function(err) {
		console.error('Error: ', err.message);
	});

	port.on('data', function (data) {
		try{
			const metrics = JSON.parse(data);
			metrics.time = new Date();
			metricref.push().set(metrics);
			console.log('Data: ' + data);
		}catch(e){
			console.error(e);
		}
	});
})();
