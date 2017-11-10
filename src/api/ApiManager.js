import config from './exchange/accounts.json';
import BittrexClient from './exchange/Bittrex/BittrexClient.js';

class ApiManager {

	constructor() {	
		// Can't get Bittrex to work, they don't enable CORS. Leaving for future reference
		this.bittrexClient = new BittrexClient(config.Bittrex);
	}

	initApi(name) {
		
	}

}

export default ApiManager;