import config from './config.js';

// API Docs: https://min-api.cryptocompare.com/
const API_ENDPOINT_CORS = 'https://min-api.cryptocompare.com/data/',
	IMAGE_URL_BASE = 'https://cryptocompare.com',
	MESSAGE_TYPE_DATA = '5', // must be a String
	STREAMING_ENDPOINT = 'wss://streamer.cryptocompare.com/v2',
	API_STATUS = {
		CONNECTING: 'Connecting',
		CONNECTED: 'Connected',
		DISCONNECTED: 'Disconnected',
		ERROR: 'Error'
	};

const statusListeners = [],
	subscriptions = new Map(),
	tokenInfo = {};

let	apiStatus = API_STATUS.DISCONNECTED,
	initialized = false,
	ws;

//
// Functions
//


function addApiStatusListener(callback) {
	statusListeners.push(callback);
}


function addSubscription(tokenSymbol) {

	let subKey = buildSubKey(tokenSymbol);

	websocketSend({
		action: 'SubAdd',
		subs: [subKey]
	});
}


function apiConnected() {
	return API_STATUS.CONNECTED == getApiStatus();
}


function apiInit(callback) {
	//
	// Fetch general info for all coins
	//
	fetch(API_ENDPOINT_CORS + 'all/coinlist')
		.then(response => response.json())
		.then(json => {
			// Map symbol to CryptoCompare internal ID
			Object.keys(json.Data).forEach(symbol => {
				const data = json.Data[symbol];

				// Api only returns path to image, we'll be nice and provide fully q'd URL. Yes
				// it means storing lots of copies of the same string but I'm out of time. Maybe
				// instead expose a method getImageUrl(symbol) that calls getTokenInfo to look
				// up the base URL and then return fully q'd.  The issue there is that all API
				// implementations (e.g. for Bitcoin) also need to expose that same method. Not
				// bad, I like it, but I'm out of time
				data.ImageUrl = IMAGE_URL_BASE + data.ImageUrl;

				tokenInfo[symbol] = data;
			});

			console.log(`Loaded ${Object.keys(tokenInfo).length} tokens from CryptoCompare`);

			initWebsocket(callback);
		})
		.catch(function(err) {
			throw Error('api.js -- failed to load coin infos: ' + err);
		});
}


function buildSubKey(symbol) {
	return `${MESSAGE_TYPE_DATA}~CCCAGG~${symbol}~USD`.toUpperCase();
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

	console.log('Adding coin subscription: ' + symbol);

	// Store reference to subscription-specific callback
	const subscribed = subscriptions.has(symbol);
	
	subscribed || subscriptions.set(symbol, []);

	// Even if already subscribed, add the additional callback
	subscriptions.get(symbol).push(callback);

	subscribed || addSubscription(symbol);

	// Indicate success
	return true;
}


function getApiStatus() {
	return apiStatus;
}


function getTokenInfo(symbol, callback) {
	const i = tokenInfo[symbol] || false;
	callback && callback(i);
	return i;
}


function initWebsocket(callback) {
	
	setStatus(API_STATUS.CONNECTING);

	ws = new WebSocket(`${STREAMING_ENDPOINT}?api_key=${config.apiKey}`);
	
	ws.onopen = (event) => {
		
		console.log('API Connected!');
		setStatus(API_STATUS.CONNECTED);

		callback && callback();

		if(0 < subscriptions.size) {
			console.log('Re-subscribing to streams...');
			subscriptions.forEach((callback, symbol) => addSubscription(symbol));
		}
	};

	ws.onclose = (event) => {
		console.log('API Disconnected :(');
		setStatus(API_STATUS.DISCONNECTED);
	};

	ws.onerror = (error) => {
		console.error('API Error:');
		console.dir(error);
		setStatus(API_STATUS.ERROR);
	};

	// Listen for data
	ws.onmessage = (message) => {

		const data = JSON.parse(message.data);

		// There are various handshake-type messages we can just ignore
		if(data.TYPE === MESSAGE_TYPE_DATA) {
			subscriptions.get(data.FROMSYMBOL).forEach(callback => callback(data));
		}
	};

	initialized = true;
}


function setStatus(status) {
	apiStatus = status;
	statusListeners.forEach(callback => callback(status));
}


function websocketSend(obj) {
	if(apiConnected()) {
		ws.send(JSON.stringify(obj));
	}
	else {
		throw `Cannot send websocket message, status is ${getApiStatus()}. Message was: ${JSON.stringify(obj)}`
	}
}


export { addApiStatusListener, apiInit, apiSubscribe, getApiStatus, getTokenInfo };