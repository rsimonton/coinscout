import { Component } from 'react';
import { getWalletInfo } from 'api/Ethplorer/api.js';
import { getTokenInfo } from 'api/CryptoCompare/api.js';

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

	handleWalletLoaded(walletInfo) {

		let token, tokenInfo;

		// API breaks out ETH, treating it differently that ERC20 tokens
		if(walletInfo.ETH && walletInfo.ETH.balance) {
			tokenInfo = getTokenInfo('ETH');
			this.addToken(
				tokenInfo.CoinName,
				'ETH',
				tokenInfo.ImageUrl,
				walletInfo.ETH.balance
			);
		}

		walletInfo.tokens && walletInfo.tokens.forEach(data => {

			token = data.tokenInfo;

			console.log('Loaded token ' + token.name + ' from ERC20 address ' + this.props.address);
		
			if(!(token.name && token.symbol && data.balance)) {
				console.warn('Ignoring incomplete token data');
				return; // 'continue' equiv
			}

			tokenInfo = getTokenInfo(token.symbol);

			tokenInfo && this.addToken(
				tokenInfo.CoinName,
				token.symbol,
				tokenInfo.ImageUrl,
				data.balance * Math.pow(10, -token.decimals)				
			);
		});

		this.props.onWalletLoaded && this.props.onWalletLoaded(this);
	}

	render() {
		return null;
	}

}