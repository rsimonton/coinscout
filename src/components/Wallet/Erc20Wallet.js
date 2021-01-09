import Wallet from './Wallet.js';
import { getWalletInfo } from 'api/Ethplorer/api.js';

export default class Erc20Wallet extends Wallet {

	constructor(props) {
		super(props);
		
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		
		this.initializeWallet();		
	}

	initializeWallet() {
		console.log(`Initializing wallet ${this.props.address}...`);

		getWalletInfo(this.props.address, this.handleWalletLoaded);

		// Reload wallet
		window.setInterval(
			() => this.refreshWallet(),
			this.REFRESH_INTERVAL
		);
	}

	refreshWallet() {
		console.log(`Refreshing wallet ${this.props.address}...`);
		getWalletInfo(this.props.address, this.handleWalletLoaded);		
	}

	handleWalletLoaded(walletInfo) {
		
		let token, tokenDetails, tokens = [];

		console.log(`Loaded wallet ${walletInfo.address}`);

		// API breaks out ETH, treating it differently that ERC20 tokens
		if(walletInfo.ETH && walletInfo.ETH.balance) {
			tokens.push({
				address: '0x',
				balance: walletInfo.ETH.balance,
				decimals: 0,
				name: 'Ethereum',
				symbol: 'ETH'
			});
		}

		walletInfo.tokens && walletInfo.tokens.forEach(token => {
			tokens.push({
				address: token.tokenInfo.address,
				balance: token.balance,		// Note balance is @ walletInfo level
				decimals: token.tokenInfo.decimals,
				name: token.tokenInfo.name,
				symbol: token.tokenInfo.symbol
			})
		});

		tokens.forEach(token => {
		
			if(!(token.name && token.symbol && token.balance)) {
				console.warn(`Ignoring incomplete token token ${token.name} (${token.symbol}):`);
				console.dir(token);
				return; // 'continue' equiv
			}

			this.getTokenInfo(token.symbol, tokenDetails => {

				console.log(`Loaded token ${token.name} (${token.symbol}) from ERC20 address ${this.props.address}`);

				tokenDetails && this.addToken(
					tokenDetails.CoinName,
					tokenDetails.Symbol,
					tokenDetails.ImageUrl,
					token.balance * Math.pow(10, -token.decimals),
					`https://etherscan.io/token/${token.address}` 	// token.contract address, not wallet address				
				);
			});

		});

		this.props.onWalletLoaded && this.props.onWalletLoaded(this);
	}

}