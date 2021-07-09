import config from './config.js';
import { utils as coinscout } from 'util/Utils.js';

// API Docs: https://min-api.cryptocompare.com/
const API_ENDPOINT_CORS = 'https://min-api.cryptocompare.com/data/',
	IMAGE_URL_BASE = 'https://cryptocompare.com',
	HEARTBEAT_INTERVAL_MILLIS = 30000,
	HEARTBEATS_MISSED_THRESHOLD = 2,
	MESSAGE_TYPE_DATA = '5', // must be a String
	MESSAGE_TYPE_ERROR = '500',
	MESSAGE_TYPE_HEARTBEAT = '999',
	RECONNECT_INTERVAL_MILLIS = 10000,
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

const signMessage = (str) => `CryptoCompare API - ${str}`;

let	apiStatus = API_STATUS.DISCONNECTED,
	heartbeatLast = null,
	initialized = false,
	ws;

//
// Functions
//

function addApiStatusListener(callback) {
	statusListeners.push(callback);
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

			log(`Loaded ${Object.keys(tokenInfo).length} tokens from CryptoCompare`);

			initWebsocket(() => {
				// Regularly check to ensure API is connected, and attempt reconnect if not
				monitorApiConnection();
				// Finally, notify listener
				callback();
			});
			
		})
		.catch(function(err) {
			throw Error('api.js -- failed to load coin infos: ' + err);
		});
}


function apiSubscribe(symbol, callbackData, callbackError) {
	
	if(!initialized) {
		throw new Error(signMessage('You must call apiInit before calling apiSubscribe'));
	}

	getTokenInfo(symbol).then(tokenInfo => {

		if(!tokenInfo) {
			// Need to passback symbol with error per our ApiProxy's requirements
			callbackError(symbol, signMessage('No coin ID found for symbol: ' + symbol));
			return;
		}

		subscriptionAdd(symbol, callbackData, callbackError);
	});

}


function buildSubKey(symbol) {
	return `${MESSAGE_TYPE_DATA}~CCCAGG~${symbol}~USD`.toUpperCase();
}


function getApiStatus() {
	return apiStatus;
}


async function getTokenInfo(symbol) {
	const data = tokenInfo[symbol] || false;
	data || warn(`No token found for symbol ${symbol}`);
	// The reason we're doing this asynch is that getTokenInfo in our
	// CoinGecko API client has to be async, and both api clients need
	// to have identical function signatures/handling
	return data;
}


function initWebsocket(callback) {
	
	setApiStatus(API_STATUS.CONNECTING);

	if(ws) {
		ws.close();
	}
	
	ws = new WebSocket(`${STREAMING_ENDPOINT}?api_key=${config.apiKey}`);
	
	ws.onopen = (event) => {
		
		log('API Connected!');
		setApiStatus(API_STATUS.CONNECTED);
		heartbeatLast = new Date().getTime();

		callback && callback();

		if(0 < subscriptions.size) {
			log('Re-subscribing to streams...');
			subscriptions.forEach((callbacks, symbol) => subscriptionRefresh(symbol));
		}
	};

	ws.onclose = (event) => {
		log('API Disconnected :(');
		setApiStatus(API_STATUS.DISCONNECTED);
	};

	ws.onerror = (event) => {
		error('API Error:');
		console.dir(event);
		setApiStatus(API_STATUS.ERROR);
	};

	// Listen for data
	ws.onmessage = (message) => {

		const data = JSON.parse(message.data);

		// There are various handshake-type messages we can just ignore
		if(data.TYPE === MESSAGE_TYPE_DATA) {
			
			const symbol = data.FROMSYMBOL;
			
			subscriptions
				.get(symbol)
				.forEach(callbacks => callbacks.data(data));
		}
		else if(data.TYPE === MESSAGE_TYPE_HEARTBEAT) {
			// Connection keep-alive
			heartbeatLast = new Date().getTime();
		}
		else if(data.TYPE === MESSAGE_TYPE_ERROR) {
			if(data.MESSAGE === 'SUBSCRIPTION_ALREADY_ACTIVE') {
				// Ignore, this isn't an error pragmatically speaking
			}
			else {
				// 'PARAMETER' is the subscription signature, e.g. 5~CCCAGG~OM~USD
				const error = signMessage(`${data.MESSAGE}: ${data.INFO}`),
					  symbol = data.PARAMETER.split('~')[2];

				// 
				if(subscriptions.has(symbol)) {
					// Save reference to error callbacks because subscriptionRemove unsets them,
					// and we want to remove the subscription before we call the callbacks
					const errorCallbacks = subscriptions.get(symbol).map(callbacks => callbacks.error);

					// Remove - we don't want further updates wrt this token
					subscriptionRemove(symbol);

					// Must pass symbol AND error back per our ApiProxy requirement
					errorCallbacks.forEach(callback => callback(symbol, error));
				}
			}
		}
	};

	initialized = true;
}


function error(str) {
	console.error(signMessage(str));
}


function warn(str) {
	coinscout.warn(signMessage(str));
}


function log(str) {
	coinscout.log(signMessage(str));
}


function monitorApiConnection() {
	window.setInterval(() => {

		const now = new Date().getTime();

		if(API_STATUS.CONNECTED !== getApiStatus()) {
			log('API disconnected, attempting to reconnect...');
			initWebsocket();
		}
		else if(heartbeatLast <= (now - HEARTBEATS_MISSED_THRESHOLD * HEARTBEAT_INTERVAL_MILLIS)) {
			warn(`Missed ${HEARTBEATS_MISSED_THRESHOLD} heartbeats, re-initializing WebSocket...`);
			setApiStatus(API_STATUS.DISCONNECTED);
			initWebsocket();
		}
	}, RECONNECT_INTERVAL_MILLIS);
}


function setApiStatus(status) {
	apiStatus = status;
	statusListeners.forEach(callback => callback(status));
}


function subscriptionAdd(symbol, callbackData, callbackError) {
	
	const subscribed = subscriptions.has(symbol);

	subscribed || log('Adding coin subscription: ' + symbol);
	subscribed || subscriptions.set(symbol, []);

	// Even if already subscribed, add the additional callbacks
	subscriptions.get(symbol).push({
		data: callbackData,
		error: callbackError
	});

	subscribed || subscriptionUpdate(symbol, 'SubAdd');
}


function subscriptionRefresh(symbol) {
	// This function's called when subscription callbacks are already
	// registered and we just want to start getting updates for the
	// symbol again (e.g. after a network drop/reconnect)
	subscriptionUpdate(symbol, 'SubAdd');
}


function subscriptionRemove(symbol) {
	// Unsubscribe from API
	subscriptionUpdate(symbol, 'SubRemove');
	// Remove from our local map of subscriptions/callbacks
	subscriptions.delete(symbol);	
}


function subscriptionUpdate(symbol, action) {
	
	let subKey = buildSubKey(symbol);

	websocketSend({
		action: action,
		subs: [subKey]
	});
}


function websocketSend(obj) {
	if(apiConnected()) {
		ws.send(JSON.stringify(obj));
	}
	else {
		throw signMessage(`Cannot send websocket message, status is ${getApiStatus()}. Message was: ${JSON.stringify(obj)}`);
	}
}


export { addApiStatusListener, apiInit, apiSubscribe, getApiStatus, getTokenInfo };