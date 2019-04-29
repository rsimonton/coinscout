import Wallet from './Wallet.js';
import { getWalletInfo } from 'api/Ethplorer/api.js';

export default class Erc20Wallet extends Wallet {

	constructor(props) {
		super(props);
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		getWalletInfo(this.props.address, this.handleWalletLoaded);			
	}

	handleWalletLoaded(walletInfo) {

		let token, tokenInfo;

		// API breaks out ETH, treating it differently that ERC20 tokens
		if(walletInfo.ETH && walletInfo.ETH.balance) {
			tokenInfo = this.getTokenInfo('ETH');
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

			tokenInfo = this.getTokenInfo(token.symbol);

			tokenInfo && this.addToken(
				tokenInfo.CoinName,
				token.symbol,
				tokenInfo.ImageUrl,
				data.balance * Math.pow(10, -token.decimals)				
			);
		});

		this.props.onWalletLoaded && this.props.onWalletLoaded(this);
	}

}