import config from './config.js';

// Ethplorer API integation. Started seeing 429s so introduced rudimentary
// request throttling and that did the trick.
//
// e.g. https://api.ethplorer.io/getAddressInfo/0x0f8b7D1223A72E4e489a49bfd4877d6213499BD7?apiKey=freekey
//
// see:  https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API?from=etop
const API_ENDPOINT = 'https://api.ethplorer.io',
	API_KEY = config.apiKey,
	ENDPOINT_TOKEN_INFO = 'getTokenInfo',
	ENDPOINT_WALLET_INFO = 'getAddressInfo',
	REQUEST_QUEUE = [],
	THROTTLE_INTERVAL = 3000; // millis - avoid 429s @ Ethplorer.io

// Just syntactic sugar
const get = (uri) => fetch(`${uri}?apiKey=${API_KEY}`);

// Accept and queue token info requests
const getTokenInfo = (address, callback) => REQUEST_QUEUE.unshift({endpoint: ENDPOINT_TOKEN_INFO, address, callback});

// Accept and queue address requests
const getWalletInfo = (address, callback) => REQUEST_QUEUE.unshift({endpoint: ENDPOINT_WALLET_INFO, address, callback});

// Throttle by pulling request from queue @ given interval
setInterval(() => {
	let request = REQUEST_QUEUE.pop();
	
	request && get(`${API_ENDPOINT}/${request.endpoint}/${request.address}/`)
		.then(res => res.json())
		.then(json => request.callback(json))
		.catch(e => {
			console.log('Ethplorer API error:');
			//console.dir(e);
		});

}, THROTTLE_INTERVAL);

export { getTokenInfo, getWalletInfo };