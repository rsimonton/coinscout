import Logger from 'util/Logger.js';

// API Docs: https://www.coingecko.com/en/api#explore-api
const API_ENDPOINT = 'https://api.coingecko.com/api/v3';

const API_STATUS = {
	CONNECTING: 'Connecting',
	CONNECTED: 'Connected',
	DISCONNECTED: 'Disconnected'
};

const INTERVAL_API_STATUS = 20000,
	INTERVAL_UPDATE_SUBSCRIPTION = 10000,
	RESPONSE_OK = 200,
	SUBSCRIPTION_QUEUE = [],
	TOKEN_IDS_TO_SYMBOLS_MAP = {},
	TOKEN_SYMBOLS_TO_IDS_MAP = {},
	TOKEN_ID_OVERRIDES = {
		//ECO: 'ecofi',
		XYZ: 'universe-xyz'
	},
	WARNED = {};

let apiStatus = API_STATUS.DISCONNECTED,
	initialized = false,
	logger = new Logger('CoinGecko API'),
	statusListeners = [],
	subscriptions = new Map(),
	tokenInfo = {};

const signMessage = msg => `CoinGecko API - ${msg}`;

function addApiStatusListener(callback) {
	statusListeners.push(callback);
}

function fetchUri(path) {
	return fetch(`${API_ENDPOINT}${path}`)
		.then(response => {
			// Return response for non-error codes
			if (response.status >= 200 && response.status < 300) {
				
				// Was it redirected?
				if(response.status === 242) {
					// Initiate redirect - however it is up to calling code to check response.redirected
					// and to handle that case as needed. We cannot know what the right way to do so in
					// all cases, here.
					logger.error('TODO Reid; handle redirect');
				}
				
				return response;
			}

			// Raise an exception for error codes
			const error = new Error(response.statusText);
			error.response = response;
			throw error;
		})
		.catch(error => {
  			logger.error('fetchUri:', error.message);
  			throw error;
		});
}

function getServerStatus() {
	fetchUri('/ping')
		.then(response => setStatus(
			response.status === RESPONSE_OK
				? API_STATUS.CONNECTED
				: API_STATUS.DISCONNECTED
		))
		.catch(error => {
			logger.error(`getServerStatus - API status temporarily unknown...`);
			setStatus(API_STATUS.CONNECTING);
		});
}

function apiInit(callback) {

	if(initialized) {
		logger.error('Cannot call apiInit more than once');
		return false;
	}

	let symbol;

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
			coins.forEach(coin => {
				symbol = normalizeSymbol(coin.symbol);
				if(!TOKEN_SYMBOLS_TO_IDS_MAP[symbol]) {
					// We don't have it mapped yet. Use any override set, or use what API returned
					if(TOKEN_ID_OVERRIDES[symbol] && TOKEN_ID_OVERRIDES[symbol] !== coin.id) {
						logger.warn(`Overriding CoinGecko API id for $ECO! Default '${coin.id}' but using '${TOKEN_ID_OVERRIDES[symbol]}'`);
					}
					else {
						TOKEN_SYMBOLS_TO_IDS_MAP[symbol] = coin.id;
					}
				}
			});

			// Do the opposite
			Object.assign(
				TOKEN_IDS_TO_SYMBOLS_MAP,
				Object.fromEntries(Object.entries(TOKEN_SYMBOLS_TO_IDS_MAP).map(([k, v]) => [v, k]))
			);

			initialized = true;

			window.setInterval(() => updateSubscriptions(), INTERVAL_UPDATE_SUBSCRIPTION);
			
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

	if(!TOKEN_SYMBOLS_TO_IDS_MAP[symbol]) {
		logger.warn('No coin found for symbol: ' + symbol);
		return false;
	}

	logger.log('Adding coin subscription: ' + symbol);

	// Store reference to subscription-specific callback - allowing for multiple subs to same symbol
	subscriptions.has(symbol) || subscriptions.set(symbol, []);
	subscriptions.get(symbol).push({
		data: callbackData,
		error: callbackError
	});

	// Add to recurring updates queue
	queueSubscription(symbol);
	// Update initially, now
	updateSubscriptions(symbol);

	// Indicate success
	return true;
}


function getApiStatus() {
	return apiStatus;
}


async function getTokenInfo(tokenSymbol) {

	let token = tokenInfo[tokenSymbol],
		coinGeckoId = TOKEN_SYMBOLS_TO_IDS_MAP[tokenSymbol];

	if(!coinGeckoId) {
		logger.warnOnce(`No price data found for token '${tokenSymbol}', ignoring`);
		return false;
	}
	else if(token) {
		return Object.assign({}, token);
	}
	else {
		// fetch and cache
		return fetchUri(`/coins/${coinGeckoId}?localization=false`)
			.then(response => response.json())
			.then(data => {
				//
				// Much more, interesting data available, see docs!
				//
				token = {
					CoinName: data.name,
					ImageUrl: data.image.thumb, 	// other sizes available
					Symbol: data.symbol
				};

				// Cache? This was missing, added it, not 100% sure I should
				tokenInfo[tokenSymbol] = token;

				// Return copy
				return Object.assign({}, token);
			});
	}
}


async function getTokenInfos(tokenSymbols) {
	
	// Map to symbols and ignore missing entries
	const tokens = {},
		tokenIds = tokenSymbols
			.map(symbol => TOKEN_SYMBOLS_TO_IDS_MAP[symbol])
			.filter(id => !!id);

	// fetch and cache
	return fetchUri(`/coins/markets?vs_currency=usd&ids=${tokenIds.join(',')}`)
		.then(response => response.json())
		.then(data => {
			data.forEach(item => {
				//
				// Much more, interesting data available, see docs!
				//
				let token = {
					CoinName: item.name,
					ImageUrl: item.image, 	// other sizes available
					Symbol: item.symbol
				};

				// Cache? This was missing, added it, not 100% sure I should
				tokenInfo[item.symbol] = token;

				// Return copy
				tokens[item.symbol] = Object.assign({}, token);
			});

			return tokens;
		});
}


function queueSubscription(symbol) {
	// Add to queue to be updated at next API interval
	SUBSCRIPTION_QUEUE.push(symbol);
}

// Our app uses uppers, CoinGecko doesn't - need to fix that
function normalizeSymbol(symbol) {
	return symbol.toUpperCase();
}


function setStatus(status) {
	apiStatus = status;
	statusListeners.forEach(callback => callback(status));
}

function updateSubscriptions(symbol) {

	const requestTokenIds = symbol
		? TOKEN_SYMBOLS_TO_IDS_MAP[symbol]
		: SUBSCRIPTION_QUEUE.map(symbol => TOKEN_SYMBOLS_TO_IDS_MAP[symbol]).join(',');

	fetchUri(`/simple/price?ids=${requestTokenIds}&vs_currencies=usd`)
		.then(response => response.json())
		.then(data => {
			// Sigh, legacy tech debt
			Object.keys(data).forEach(tokenId => {
				
				const symbol = TOKEN_IDS_TO_SYMBOLS_MAP[tokenId],
					normalized = {
						FROMSYMBOL: symbol,
						TOSYMBOL: 'USD',
						PRICE: data[tokenId].usd
					};

				subscriptions.get(symbol).forEach(callbacks => callbacks.data(normalized));
			});
		})
		.catch(error => {
			// Must passback symbol with error per our ApiProxy's requirements
			//subscriptions.get(symbol).forEach(callbacks => callbacks.logger.error(symbol, error));	
		})
}

export { addApiStatusListener, apiInit, apiSubscribe, getApiStatus, getTokenInfo, getTokenInfos };