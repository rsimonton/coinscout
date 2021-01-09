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

// Helper method attempts to generate a unique identifier for each token
// based on its symbol and name. This was required due to shortcoming of
// Coingecko's API in available ways to disambiguate tokens with the same
// symbol (in our specific case, UNI)
const getTokenKey = (symbol, name) => `${symbol}~${name}`.toLowerCase();

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
		console.error('Cannot call apiInit more than once');
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
			coins.forEach(coin => tokenIds[getTokenKey(coin.symbol, coin.name)] = coin.id);

			initialized = true;
			callback && callback();	
		})
		.catch(function(err) {
			throw Error('api.js -- failed to load coin infos: ' + err);
		});
}


function apiSubscribe(symbol, name, callback) {
	
	if(!initialized) {
		throw new Error('api.js -- you must call apiInit before calling apiSubscribe');
	}

	let tokenKey = getTokenKey(symbol,  name);
	
	if(!tokenIds[tokenKey]) {
		console.error('No coin found for token key: ' + tokenKey);
		return false;
	}

	console.log('Adding coin subscription: ' + tokenKey);

	// Store reference to subscription-specific callback - allowing for multiple subs to same symbol
	subscriptions.has(tokenKey) || subscriptions.set(tokenKey, []);
	subscriptions.get(tokenKey).push(callback);

	window.setInterval(() => updateSubscription(symbol, name), INTERVAL_UPDATE_SUBSCRIPTION);

	// Indicate success
	return true;
}


function getApiStatus() {
	return apiStatus;
}


function getTokenInfo(symbol, name, callback) {

	let tokenKey = getTokenKey(symbol, name),
		token = tokenInfo[tokenKey],
		coinGeckoId = tokenIds[tokenKey];

	if(!coinGeckoId) {
		//console.warn(`No CoinGecko data found for token '${symbol}', ignoring`);
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
					ImageUrl: data.image.thumb, // other sizes available
					Symbol: symbol
				};

				// Return copy
				tokenInfo[getTokenKey(symbol, data.name)] = Object.assign({}, token);

				callback(token);
			});
	}
}


function setStatus(status) {
	apiStatus = status;
	statusListeners.forEach(callback => callback(status));
}

function updateSubscription(symbol, name) {

	const tokenKey = getTokenKey(symbol, name),
		tokenId = tokenIds[tokenKey];

	fetchUri(`/simple/price?ids=${tokenId}&vs_currencies=usd`)
		.then(response => response.json())
		.then(data => {
			// Sigh, legacy tech debt
			const hack = {
				FROMSYMBOL: symbol,
				TOSYMBOL: 'USD',
				PRICE: data[tokenId].usd
			};
			subscriptions.get(tokenKey).forEach(callback => callback(hack));
		});
}

export { addApiStatusListener, apiInit, apiSubscribe, getApiStatus, getTokenInfo };