import io from 'socket.io-client';
import CCC from './vendor.js';


const DEBUG = true;
const API_ENDPOINT = 'https://www.cryptocompare.com/api/data/';
const STREAMING_ENDPOINT = 'wss://streamer.cryptocompare.com';
const QUOTE_TYPE = CCC.STATIC.TYPE.CURRENT;

let ws,
	coinInfos,
	initialized = false,
	subscriptions = {};



function apiInit() {
	//
	// Fetch general info for all coins
	//
	fetch(API_ENDPOINT + 'coinlist/', {'mode': 'no-cors'})
		.then(function(response) {
			coinInfos = response;
			console.dir(coinInfos);
		})
		.catch(function(err) {
			throw Error('api.js -- failed to load coin infos: ' + err);
		});

	//
	// Init websocket
	//
	ws = io(STREAMING_ENDPOINT);

	ws.on('connect', function(){
		DEBUG && console.log('Connected!')
	});

	ws.on('event', function(data){
		DEBUG && console.log('Received event:');
		DEBUG && console.dir(data);
	});

	ws.on('disconnect', function(){
		DEBUG && console.log('Disconnected :(');
	});

	initialized = true;
}


function apiSubscribe(exchange, symbol, to, callback) {
	
	if(!initialized) {
		throw new Error('api.js -- you must call apiInit before adding subscriptions');
	}

	// If we're asking for aggregate data, override the exchange with the special
	// one that the API authors provide for that quote type
	QUOTE_TYPE === CCC.STATIC.TYPE.CURRENTAGG && (exchange = 'CCCAGG');
	QUOTE_TYPE === CCC.STATIC.TYPE.CURRENTAGG && (to = 'USD');

	let subKey = [
		QUOTE_TYPE,
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
		if (data.substring(0, data.indexOf("~")) === QUOTE_TYPE) {
			// Extract subscription signature from data
			let subKey = CCC.CURRENT.getKeyFromStreamerData(data);
			// Call subscription-specific callback w/ update
			subscriptions[subKey](CCC.CURRENT.unpack(data));
		}
	});
}


function getCoinInfo(symbol) {

}


export { apiInit, apiSubscribe, apiFinalize };