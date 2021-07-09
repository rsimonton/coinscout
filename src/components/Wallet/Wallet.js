import { getTokenInfo } from 'api/ApiProxy.js';

export default class Wallet {

	REFRESH_INTERVAL = 60000;

	constructor(props) {
		this.props = props;
		this.tokens = {};
		this.getTokenInfo = getTokenInfo.bind(this);
	}

	/**
	 * For now, 'url' only applies to ERC20 tokens
	 */
	addToken(name, symbol, icon, quantity, url) {
		let data = {
			address: this.props.address,
			name: name,
			symbol: symbol,
			icon: icon,
			isDust: true,
			market: 'USD',
			stack: {},
			url: url
		};
		
		data.stack[this.props.address] = quantity;

		this.tokens[symbol] = data;
	}

	getTokens() {
		return this.tokens;
	}

}