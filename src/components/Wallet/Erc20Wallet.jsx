import { Component } from 'react';
import { getWalletInfo } from 'api/Ethplorer/api.js';

export default class Erc20Wallet extends Component {

	static defaults = {
		convertValues: false
	}

	constructor(props) {
		super(props);

		this.state = {};
		this.tokens = [];
		
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);

		getWalletInfo(this.props.address, this.handleWalletLoaded);
	}

	addToken(name, symbol, stack) {
		let data = {
			address: this.props.address,
			name: name.replace(/Token$/,'').replace(/ .*/,''),
			symbol: symbol, 
			market: 'USD',
			stack: [{
				source: this.props.address,
				balance: stack
			}]			
		};

		this.tokens.push(data);
	}

	getTokens() {
		// { name: 'Bitcoin', symbol: 'BTC', exchange: 'Coinbase', market: 'USD', stack: { Coinbase: 0 } },
		return this.tokens;
	}

	handleWalletLoaded(walletInfo) {

		let token;

		// API breaks out ETH, treating it differently that ERC20 tokens
		walletInfo.ETH && walletInfo.ETH.balance
			&& this.addToken('Ethereum', 'ETH', walletInfo.ETH.balance);

		walletInfo.tokens && walletInfo.tokens.forEach(data => {

			token = data.tokenInfo;

			console.log('Loaded token ' + token.name + ' from ERC20 address ' + this.props.address);
		
			if(!(token.name && token.symbol && data.balance)) {
				console.warn('Ignoring incomplete token data');
				//console.dir(token);
				return; // 'continue' equiv
			}

			this.addToken(
				token.name,
				token.symbol,
				data.balance * Math.pow(10, -token.decimals)				
			);
		});

		this.props.onWalletLoaded && this.props.onWalletLoaded(this);
	}

	render() {
		return null;
	}

}