import config from './exchange/accounts.json';
import BittrexClient from './exchange/Bittrex/BittrexClient.js';

class ApiManager {

	constructor() {	
		this.bittrexClient = new BittrexClient(config.Bittrex);
	}

	initApi(name) {
		
	}

}

export default ApiManager;