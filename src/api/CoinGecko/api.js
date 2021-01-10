// API Docs: https://www.coingecko.com/en/api#explore-api
const API_ENDPOINT = 'https://api.coingecko.com/api/v3/';

const API_STATUS = {
	CONNECTING: 'Connecting',
	CONNECTED: 'Connected',
	DISCONNECTED: 'Disconnected'
};

const INTERVAL_API_STATUS = 10000,
	INTERVAL_UPDATE_SUBSCRIPTION = 8000,
	RESPONSE_OK = 200;

let initializedSubsCount = 0,
	apiStatus = API_STATUS.DISCONNECTED,
	tokenInfo = {},
	tokenIds = {},
	initialized = false,
	statusListeners = [],
	subscriptions = new Map();

function addApiStatusListener(callback) {
	statusListeners.push(callback);
}

function fetchUri(path) {
	return fetch(`${API_ENDPOINT}${path}`);
}

function getServerStatus() {
	fetchUri('/ping')
		.then(response => setStatus(
			response.status === RESPONSE_OK
				? API_STATUS.CONNECTED
				: API_STATUS.DISCONNECTED
		));
}

function apiInit(callback) {

	if(initialized) {
		error('Cannot call apiInit more than once');
		return false;
	}

	// Ping API occasionally to make sure online
	getServerStatus();
	window.setInterval(() => getServerStatus(), INTERVAL_API_STATUS);

	//
	// Fetch general info for all coins - returns array of objects whose
	// 'id' value is used in subsequent coin lookup calls:
	//
	//	{
    //		"id": "aave-susd",
    //		"symbol": "asusd",
    //		"name": "Aave SUSD"
  	//	},
	//
	fetchUri('/coins/list')
		.then(response => response.json())
		.then(coins => {
			// Map symbol to API internal ID
			coins.forEach(coin => tokenIds[normalizeSymbol(coin.symbol)] = coin.id);

			initialized = true;
			callback && callback();	
		})
		.catch(function(err) {
			throw Error('api.js -- failed to load coin infos: ' + err);
		});
}


function apiSubscribe(symbol, callbackData, callbackError) {
	
	if(!initialized) {
		throw new Error('api.js -- you must call apiInit before calling apiSubscribe');
	}

	if(!tokenIds[symbol]) {
		error('No coin found for symbol: ' + symbol);
		return false;
	}

	log('Adding coin subscription: ' + symbol);

	// Store reference to subscription-specific callback - allowing for multiple subs to same symbol
	subscriptions.has(symbol) || subscriptions.set(symbol, []);
	subscriptions.get(symbol).push({
		data: callbackData,
		error: callbackError
	});

	window.setInterval(() => updateSubscription(symbol), INTERVAL_UPDATE_SUBSCRIPTION);

	// Indicate success
	return true;
}


function getApiStatus() {
	return apiStatus;
}


function getTokenInfo(symbol, callback) {

	let token = tokenInfo[symbol],
		coinGeckoId = tokenIds[symbol];

	if(!coinGeckoId) {
		error(`No CoinGecko data found for token '${symbol}', ignoring`);
		callback(false);
	}
	else if(token) {
		callback(Object.assign({}, token));
	}
	else {
		// fetch and cache
		fetchUri(`/coins/${coinGeckoId}?localization=false`)
			.then(response => response.json())
			.then(data => {
				//
				// Much more, interesting data available, see docs!
				//
				token = {
					CoinName: data.name,
					ImageUrl: data.image.thumb, 	// other sizes available
					Symbol: symbol
				};

				// Return copy
				tokenInfo[symbol] = Object.assign({}, token);

				callback(token);
			});
	}
}


function error(str) {
	console.error(`CoinGecko API: ${str}`);
}

function log(str) {
	console.log(`CoinGecko API: ${str}`);
}


// Our app uses uppers, CoinGecko doesn't - need to fix that
function normalizeSymbol(symbol) {
	return symbol.toUpperCase();
}


function setStatus(status) {
	apiStatus = status;
	statusListeners.forEach(callback => callback(status));
}

function updateSubscription(symbol) {

	const tokenId = tokenIds[symbol];

	fetchUri(`/simple/price?ids=${tokenId}&vs_currencies=usd`)
		.then(response => response.json())
		.then(data => {
			// Sigh, legacy tech debt
			const hack = {
				FROMSYMBOL: symbol,
				TOSYMBOL: 'USD',
				PRICE: data[tokenId].usd
			};
			subscriptions.get(symbol).forEach(callbacks => callbacks.data(hack));
		})
		.catch(error => {
			subscriptions.get(symbol).forEach(callbacks => callbacks.error(error));	
		})
}

export { addApiStatusListener, apiInit, apiSubscribe, getApiStatus, getTokenInfo };