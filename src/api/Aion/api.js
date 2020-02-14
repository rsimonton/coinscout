//
// AION API integation:  https://docs.aion.network/reference
//
const API_ENDPOINT = 'https://mainnet-api.theoan.com/aion/dashboard',	// 'mastery-api' for Testnet
	ENDPOINT_WALLET_INFO = `${API_ENDPOINT}/getAccountDetails`,
	REQUEST_QUEUE = [],
	THROTTLE_INTERVAL = 10; // millis - avoid 429s @ Ethplorer.io

// Just syntactic sugar
const get = (walletAddress) => fetch(`${ENDPOINT_WALLET_INFO}/?accountAddress=${walletAddress}`);
// Main method - accept and queue address requests
const getWalletInfo = (address, callback) => REQUEST_QUEUE.unshift({address, callback});

// Throttle by pulling request from queue @ given interval
setInterval(() => {
	let request = REQUEST_QUEUE.pop();
	
	request && get(request.address)
		.then(res => res.json())
		.then(json => request.callback(json.content[0]));	// unwrap

}, THROTTLE_INTERVAL);

export { getWalletInfo };