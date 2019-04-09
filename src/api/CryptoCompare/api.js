import io from 'socket.io-client';
import CCC from './vendor.js';

// API Docs: https://min-api.cryptocompare.com/
const API_ENDPOINT_CORS = 'https://min-api.cryptocompare.com/data/';
const STREAMING_ENDPOINT = 'wss://streamer.cryptocompare.com';
const QUOTE_TYPE = CCC.STATIC.TYPE.CURRENTAGG;
const TOKEN_DATA_KEY = 'cryptoCompare.tokenData';
const API_STATUS = {
	CONNECTING: 'Connecting',
	CONNECTED: 'Connected',
	DISCONNECTED: 'Disconnected'
};

let ws,
	apiStatus = API_STATUS.DISCONNECTED,
	tokenInfo = window.localStorage[TOKEN_DATA_KEY],
	initialized = false,
	statusListeners = [],
	subscriptions = new Map();


function addApiStatusListener(callback) {
	statusListeners.push(callback);
}


function apiInit(callback) {
	//
	// Fetch general info for all coins
	//
	if(tokenInfo) {
		tokenInfo = JSON.parse(tokenInfo);
		initWebsocket(callback);
	}
	else {
		tokenInfo = {};

		// Not present in localStorage, fetch
		fetch(API_ENDPOINT_CORS + 'all/coinlist')
			.then(response => response.json())
			.then(json => {
				// Map symbol to CryptoCompare internal ID
				Object.keys(json.Data).forEach(symbol => tokenInfo[symbol] = json.Data[symbol]);
				window.localStorage[TOKEN_DATA_KEY] = JSON.stringify(tokenInfo);

				initWebsocket(callback);
			})
			.catch(function(err) {
				throw Error('api.js -- failed to load coin infos: ' + err);
			});
	}
}


function apiSubscribe(symbol, callback) {
	
	if(!initialized) {
		throw new Error('api.js -- you must call apiInit before calling apiSubscribe');
	}

	const tokenInfo = getTokenInfo(symbol);

	if(!tokenInfo) {
		console.error('No coin ID found for symbol: ' + symbol);
		return false;
	}

	//getTokenInfo(symbol);
	
	fetch(API_ENDPOINT_CORS + 'subsWatchlist?fsyms=' + symbol + '&tsym=USD')
		.then(res => res.json())
		.then(json => {

			if(true === json['HasWarning']) {
				// Using alert here because I want to pause, and because I want to be certain this is seen
				window.alert(`CryptoCompare API Error: ${json.Warning}`);
			}
			else {
				json[symbol].RAW.forEach(sub => {
					const subKey = CCC.CURRENT.getKeyFromStreamerData(sub);
					console.log('Adding coin subscription: ' + subKey);

					// Store reference to subscription-specific callback
					const subscribed = subscriptions.has(subKey);
					subscribed || (subscriptions.set(subKey, []));
					subscriptions.get(subKey).push(callback);

					subscribed || ws.emit('SubAdd', {
						subs: [subKey]
					});
				});
			}
		});

	// Indicate success
	return true;
}


function getApiStatus() {
	return apiStatus;
}


function getTokenInfo(symbol) {
	return tokenInfo[symbol]
		? tokenInfo[symbol]
		: false;
}

function initWebsocket(callback) {
	
	setStatus(API_STATUS.CONNECTING);

	ws = io(STREAMING_ENDPOINT);
	
	ws.on('connect', function(){
		
		console.log('Connected!');
		setStatus(API_STATUS.CONNECTED);

		if(0 < subscriptions.size) {
			console.log('Re-subscribing to streams...');
			subscriptions.forEach((callback, subKey) => ws.emit('SubAdd', { subs: [subKey] }));
		}
	});

	ws.on('event', function(data){
		console.log('Received event:');
		console.dir(data);
	});

	ws.on('disconnect', function(){
		console.log('Disconnected :(');
		setStatus(API_STATUS.DISCONNECTED);
	});

	// Listen for data
	ws.on('m', data => {
		// Decode message using crypto compare's util function
		if (data.substring(0, data.indexOf("~")) === QUOTE_TYPE) {
			// Extract subscription signature from data
			let subKey = CCC.CURRENT.getKeyFromStreamerData(data);
			// Call subscription-specific callback w/ update
			subscriptions.get(subKey).forEach(callback => callback(CCC.CURRENT.unpack(data)));
		}
	});

	initialized = true;

	callback && callback();	
}

function setStatus(status) {
	apiStatus = status;
	statusListeners.forEach(callback => callback(status));
}

export { addApiStatusListener, apiInit, apiSubscribe, getApiStatus, getTokenInfo };