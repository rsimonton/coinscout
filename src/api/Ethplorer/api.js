// e.g. https://api.ethplorer.io/getAddressInfo/0x0f8b7D1223A72E4e489a49bfd4877d6213499BD7?apiKey=freekey
//
// see:  https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API?from=etop
const API_ENDPOINT = 'https://api.ethplorer.io/';
const API_KEY = 'freekey';

const ENDPOINT_WALLET_INFO = API_ENDPOINT + 'getAddressInfo/';

function get(baseUri) {
	return fetch(baseUri + '?apiKey=' + API_KEY);
}

function getWalletInfo(address, callback) {
	get(ENDPOINT_WALLET_INFO + address)
		.then((res) => {
			return res.json();
		})
		.then(json => callback(json));
}

export { getWalletInfo };