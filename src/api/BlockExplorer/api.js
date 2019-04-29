// BlockExplorer API integation. Query Bitcoin addresses
//
// e.g. https://blockexplorer.com/api/addr/3P8R6sEdvMPkVnn538wuTsTQ6ASyeBgitg
//
// see:  https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API?from=etop
const API_ENDPOINT = 'https://blockexplorer.com/api/',
	ENDPOINT_ADDRESS_INFO = `${API_ENDPOINT}/addr`,
	REQUEST_QUEUE = [],
	THROTTLE_INTERVAL = 10; // millis

// Just syntactic sugar
const get = (address) => fetch(`${ENDPOINT_ADDRESS_INFO}/${address}/`);
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