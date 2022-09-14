//const api = import('node.bittrex.api');
//import NodeBittrexApi from 'node.bittrex.api';
import CryptoJS from 'crypto-js';

class BittrexClient {

	constructor(config) {
		// Authenticate
		/*
		api.options({
		  'apikey' : config.key,
		  'apisecret' : config.secret 
		});
		*/
		let nonce = new Date().getTime();
		let uri = config.uri + 'getticker?market=BTC-LTC&apikey=' + config.key + '&nonce=' + nonce;

		let hash = CryptoJS.HmacSHA512(uri, config.secret);

		let requestHeaders = new Headers();
		requestHeaders.append('apisign', hash);

		fetch(uri, { headers: requestHeaders, mode: 'cors' }).then(function(response) {
			logger.log('API response:');
			//console.dir(response);
		})
	}

	init() {
		// First look 
		/*
		api.getbalances( function( data, err ) {
  			logger.log('data );
		});
		*/
	}
}

export default BittrexClient;