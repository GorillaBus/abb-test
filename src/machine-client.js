'use strict'

/*
	Use the following tokens to simulate a machine connection:

	Machine 1: "080fd43c58fabbb734f7cfccc7047e62"
	Machine 2: "080fd43c58fabbb734f7cfccc7047e63"
	Machine 3: "080fd43c58fabbb734f7cfccc7047e64"


	Once connected, the client will emit a new part with random values every
	2000 ms. You can change this behaviour in function "initSession", where you
	can set the time interval and the max amount of parts to emit.
*/

const token = "080fd43c58fabbb734f7cfccc7047e64";

let profile = {};


/* Handlers */

const handleSocketError = (err) => {
	console.log(`> Error ${err.code}: ${err.message}`);
};

const handleDisconnect = (data) => {
	removeHandlers();
	console.log("> Disconnected from server");
};

const handleAuthSuccess = (machineProfile) => {
	console.log("> Authentifcation successful");
	initSession(machineProfile);
}


/* Connect to server */

console.log(`> Connecting machine to server, token: ${token}`);

const socket = require('socket.io-client')('http://127.0.0.1:3001', {
	transports: ['websocket'],
	extraHeaders: { token }
});


socket.on('error', handleSocketError);

/* Bind event listeners */
socket.on('connect', () => {
	socket.on('disconnect', handleDisconnect);

	console.log("> Connected to remote server...");

	socket.on("auth_succed", handleAuthSuccess);
});



/* Methods */

const initSession = (machineProfile) => {
	profile = machineProfile;

	socket.off('auth_succed');
	socket.on('push', (data) => {
		console.log(data);
	});

	partEmittingSimulation(2000, 0);
}

const removeHandlers = () => {
	socket.off('auth_succed');
	socket.off('connect');
	socket.off('disconnect');
}

/*
**	Configurable part emitting simulation
*/
const partEmittingSimulation = (interval, max) => {
	emmiter(interval, max);
};

/*
**	Emmit "part" events to the sever
*/
const emmiter = (interval, max) => {
	interval = interval || 1000;
	max = max > 0 ? max:0;

	let counter = 0;
	const timer = setInterval(()=> {
		if (max > 0 && counter >= max) {
			clearInterval(timer);
			return true;
		}
		const payload = randomPartPayload();
	 	socket.emit('part', payload);
		counter++;

	console.log("> Emitting part event");
	}, interval);
};


/*
**	Generate a fake "part" payload with random values
*/
const randomPartPayload = () => {
	return profile.map(c => {
		return {
			control_id: c.control_id,
			feature_id: c.feature_id,
			x: Math.random(),
			y: Math.random(),
			z: Math.random(),
			d: Math.floor((Math.random() * 10) + 1)
		}
	});
};
