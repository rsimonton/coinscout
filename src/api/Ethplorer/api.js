import config from './config.js';

// Ethplorer API integation. Started seeing 429s so introduced rudimentary
// request throttling and that did the trick.
//
// e.g. https://api.ethplorer.io/getAddressInfo/0x0f8b7D1223A72E4e489a49bfd4877d6213499BD7?apiKey=freekey
//
// see:  https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API?from=etop
const API_ENDPOINT = 'https://api.ethplorer.io',
	API_KEY = config.apiKey,
	ENDPOINT_WALLET_INFO = `${API_ENDPOINT}/getAddressInfo`,
	REQUEST_QUEUE = [],
	THROTTLE_INTERVAL = 100; // millis - avoid 429s @ Ethplorer.io

// Just syntactic sugar
const get = (walletAddress) => fetch(`${ENDPOINT_WALLET_INFO}/${walletAddress}/?apiKey=${API_KEY}`);
// Main method - accept and queue address requests
const getWalletInfo = (address, callback) => REQUEST_QUEUE.unshift({address, callback});

// Throttle by pulling request from queue @ given interval
setInterval(() => {
	let request = REQUEST_QUEUE.pop();
	
	request && get(request.address)
		.then(res => res.json())
		.then(json => request.callback(json));

}, THROTTLE_INTERVAL);

export { getWalletInfo };