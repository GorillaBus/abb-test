const md5 = require("md5");
const uuidv1 = require('uuid/v1');

const deviceID = '9fdfdbc0-3bbc-11ea-8e66-33e9f80ea27e'; //uuidv1();
const token = md5(deviceID);

console.log("Using token: ", token)

var socket = require('socket.io-client')('http://localhost:3000', {
	extraHeaders: { token }
});


socket.on('connect', () => {
	console.log('Connected');
});

socket.on('info', data => {
	console.log(`${data.type}: ${data.message}`);
});

socket.on('disconnect', data => {
	console.log(data)
	console.log(`Disconnected`);
});


const t = setTimeout(() => {

	const controls = [{
		x: Math.random(),
		y: Math.random(),
		z: Math.random(),
		diameter: Math.floor((Math.random() * 10) + 1)
	},{
		x: Math.random(),
		y: Math.random(),
		z: Math.random(),
		diameter: Math.floor((Math.random() * 10) + 1)
	},{
		x: Math.random(),
		y: Math.random(),
		z: Math.random(),
		diameter: Math.floor((Math.random() * 10) + 1)
	}]

	socket.emit("part", controls);
}, 500);
