import io from 'socket.io-client';
import CCC from './vendor.js';


const API_ENDPOINT = 'https://www.cryptocompare.com/api/data/';
const API_ENDPOINT_CORS = 'https://min-api.cryptocompare.com/data/';
const STREAMING_ENDPOINT = 'wss://streamer.cryptocompare.com';
const QUOTE_TYPE = CCC.STATIC.TYPE.CURRENTAGG;
const COIN_ID_KEY = 'cryptoCompare.coindIds';

let ws,
	coinIds = window.localStorage[COIN_ID_KEY],
	initialized = false,
	subscriptions = {};


function apiInit(callback) {
	//
	// Fetch general info for all coins
	//
	//
	// Fetch general info for all coins
	//
	if(coinIds) {
		coinIds = JSON.parse(coinIds);
		initWebsocket(callback);
	}
	else {
		coinIds = {};

		// Not present in localStorage, fetch
		fetch(API_ENDPOINT_CORS + 'all/coinlist')
			.then(response => response.json())
			.then(json => {
				// Map symbol to CryptoCompare internal ID
				Object.keys(json.Data).forEach(symbol => coinIds[symbol] = json.Data[symbol].Id);
				window.localStorage[COIN_ID_KEY] = JSON.stringify(coinIds);

				initWebsocket(callback);
			})
			.catch(function(err) {
				throw Error('api.js -- failed to load coin infos: ' + err);
			});
	}
}


function apiSubscribe(exchange, symbol, market, callback) {
	
	if(!initialized) {
		throw new Error('api.js -- you must call apiInit before adding subscriptions');
	}

	const coinId = coinIds[symbol];

	if(!coinId) {
		console.error('No coin ID found for symbol: ' + symbol);
		return false;
	}

	//getTokenInfo(symbol);
	/*
	// If we're asking for aggregate data, override the exchange with the special
	// one that the API authors provide for that quote type
	QUOTE_TYPE === CCC.STATIC.TYPE.CURRENTAGG && (exchange = 'CCCAGG');
	QUOTE_TYPE === CCC.STATIC.TYPE.CURRENTAGG && (market = 'USD');

	let subKey = [
		QUOTE_TYPE,
		exchange,
		symbol,
		market
	].join('~');
	*/
	fetch(API_ENDPOINT_CORS + 'subsWatchlist?fsyms=' + symbol + '&tsym=USD')
		.then(res => res.json())
		.then(json => {
			json[symbol].RAW.forEach(sub => {
				const subKey = CCC.CURRENT.getKeyFromStreamerData(sub);
				console.log('Adding coin subscription: ' + subKey);
				// Store reference to subscription-specific callback
				subscriptions[subKey] = callback;

				ws.emit('SubAdd', {
					subs: Object.keys(subscriptions)
				});
			});
		});

	// Indicate success
	return true;
}


function getTokenInfo(symbol) {
	
	const coinId = coinIds[symbol];

	if(!coinId) {
		console.error('No coin ID found for symbol: ' + symbol);
		return;
	}

	fetch(API_ENDPOINT + 'coinsnapshotfullbyid/?id' + coinId)
		.then(response => response.json())
		.then(json => { console.log(json) });
}

function initWebsocket(callback) {
	
	ws = io(STREAMING_ENDPOINT);

	ws.on('connect', function(){
		console.log('Connected!')
	});

	ws.on('event', function(data){
		console.log('Received event:');
		console.dir(data);
	});

	ws.on('disconnect', function(){
		console.log('Disconnected :(');
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

	initialized = true;

	callback && callback();
}

export { apiInit, apiSubscribe, getTokenInfo };