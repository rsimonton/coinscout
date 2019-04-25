import { getTokenInfo } from 'api/CryptoCompare/api.js';

export default class Wallet {

	constructor(props) {
		this.props = props;
		this.tokens = [];
		this.getTokenInfo = getTokenInfo.bind(this);
	}

	addToken(name, symbol, icon, stack) {
		let data = {
			address: this.props.address,
			name: name.replace(/Network Token$/,''),
			symbol: symbol,
			icon: icon,
			market: 'USD',
			stack: [{
				source: this.props.address,
				balance: stack
			}]			
		};

		this.tokens.push(data);
	}

	getTokens() {
		return this.tokens;
	}

}