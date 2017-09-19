import io from 'socket.io-client';
import CCC from './crypto-compare.js';


const debug = true;

let ws,
	initialized = false,
	subscriptions = {};



function apiInit(apiEndpoint) {
	ws = io(apiEndpoint);

	ws.on('connect', function(){
		debug && console.log('Connected!')
	});

	ws.on('event', function(data){
		debug && console.log('Received event:');
		debug && console.dir(data);
	});

	ws.on('disconnect', function(){
		debug && console.log('Disconnected :(');
	});

	initialized = true;
}


function apiSubscribe(exchange, symbol, to, callback) {
	
	if(!initialized) {
		throw 'Error: api.js -- you must call apiInit before adding subscriptions';
	}

	let subKey = [
		CCC.STATIC.TYPE.CURRENT,
		exchange,
		symbol,
		to
	].join('~');

	console.log('Adding coin subscription: ' + subKey);

	// Store reference to subscription-specific callback
	subscriptions[subKey] = callback;
}


function apiFinalize() {

	// Subscribe all coins
	ws.emit('SubAdd', {
		subs: Object.keys(subscriptions)
	});
	
	// Listen for data
	ws.on('m', data => {
		// Decode message using crypto compare's util function
		if (data.substring(0, data.indexOf("~")) === CCC.STATIC.TYPE.CURRENT) {
			// Extract subscription signature from data
			let subKey = CCC.CURRENT.getKeyFromStreamerData(data);
			// Call subscription-specific callback w/ update
			subscriptions[subKey](CCC.CURRENT.unpack(data));
		}
	});
}


export { apiInit, apiSubscribe, apiFinalize };