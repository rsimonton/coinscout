import * as coinGecko from 'api/CoinGecko/api.js';
import * as cryptoCompare from 'api/CryptoCompare/api.js';
import { utils as coinscout } from 'util/Utils.js';

/**
 * API abstraction to provide a unified interface for app that
 * wraps multiple APIs
 */
class ApiProxy {

	constructor() {
		// Sorted in order of preference
		this.apis = [
			cryptoCompare,	// websocket
			coinGecko		// REST
		];

		this.subscriptions = new Map();
	}

	getApis() {
		return this.apis.slice(0);
	}

	getNextApi(api) {

		let nextIndex = api
			? this.apis.indexOf(api) + 1
			: 0;

		return nextIndex < this.apis.length
			? this.apis[nextIndex]
			: null;
	}

	getSubscription(symbol) {
		return this.subscriptions.get(symbol);
	}

	addSubscription(symbol, api) {
		this.subscriptions.set(symbol, api);
	}

	removeSubscription(symbol) {
		this.subscriptions.delete(symbol);
	}

}


class ApiSubscription {

	constructor(symbol, api, callbackSuccess, callbackError) {
		this.symbol = symbol;
		this.api = api;
		this.callbackSuccess = callbackSuccess;
		this.callbackError = callbackError;
	}

	getApi() { return this.api; }
	getCallbackSuccess() { return this.callbackSuccess; }
	getCallbackError() { return this.callbackError; }
	getSymbol() { return this.symbol; }
	setApi(api) { this.api = api; }

}

//
//	Variables
// 
const proxy = new ApiProxy(),
	  signMessage = (msg) => `ApiProxy - ${msg}`,
	  warn = (msg) => { coinscout.warn(signMessage(msg)) };


//
// Private functions
//
function _doSubscribe(sub) {
	sub.getApi().apiSubscribe(
		sub.getSymbol(),
		sub.getCallbackSuccess(),
		_handleApiError	// Note this is our internal error handler
	);
}


function _handleApiError(symbol, error) {

	let sub = proxy.getSubscription(symbol);

	if(!sub) {
		// This seems to happen due to the CryptoCompare API not honoring subscription
		// removal requests; even after doing so, we continue to get error messages that
		// a token is invalid. So, we'll just ignore this, since it means that we've
		// previously handled the subscription error and removed it
		return;
	}

	
	let nextApi = proxy.getNextApi(sub.getApi());

	warn(error);

	if(null === nextApi) {
		// All APIs exhausted, delete subscription and call subscribor error handler
		proxy.removeSubscription(symbol);
		sub.getCallbackError()(error);
	}
	else {
		//  Degrade to next API
		sub.setApi(nextApi);
		_doSubscribe(sub);
	}
}


//
// Exported functions
//


function apiSubscribe(symbol, callbackSuccess, callbackError) {
	// Get the primary API
	let api = proxy.getNextApi(),
		sub = new ApiSubscription(symbol, api, callbackSuccess, callbackError);

	proxy.addSubscription(symbol, sub);

	_doSubscribe(sub);
}


async function getTokenInfo(symbol, callback) {

	let tokenInfo;

	for(let api of proxy.getApis()) {
		
		tokenInfo = await api.getTokenInfo(symbol);

		if(tokenInfo) {
			return tokenInfo;
		}
	}

	return false;
}

export { apiSubscribe, getTokenInfo };