import Wallet from './Wallet.js';
import { getWalletInfo } from 'api/Ethplorer/api.js';
import Logger from 'util/Logger.js';

export default class Erc20Wallet extends Wallet {

	constructor(props) {
		super(props);
		
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		this.logger = new Logger('Erc20Wallet.js');
		
		this.initializeWallet();		
	}

	initializeWallet() {
		this.logger.log(`Initializing wallet ${this.props.address}...`);

		getWalletInfo(this.props.address, this.handleWalletLoaded);

		// Reload wallet
		window.setInterval(
			() => this.refreshWallet(),
			this.REFRESH_INTERVAL
		);
	}

	refreshWallet() {
		this.logger.log(`Refreshing wallet ${this.props.address}...`);
		getWalletInfo(this.props.address, this.handleWalletLoaded);		
	}

	handleWalletLoaded(walletInfo) {
		
		const onWalletLoaded = this.props.onWalletLoaded;

		let token,
			tokenInfo,
			tokens = [],
			tokensLoaded = 0;

		this.logger.log(`Loaded wallet ${walletInfo.address}`);

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
			this.maybeAddToken(token).then(() => {
				// Call onWalletLoaded only once all tokens have been loaded
				++tokensLoaded === tokens.length && onWalletLoaded && onWalletLoaded(this);
			});
		});
	}

	async maybeAddToken(token) {

		if(!(token.name && token.symbol && token.balance)) {
			this.logger.warnOnce(`Ignoring incomplete token: ${token.name} (${token.symbol}):`);
			//console.dir(token);
			return;
		}

		let tokenInfo = await this.getTokenInfo(token.symbol);

		if(!tokenInfo) {
			this.logger.warnOnce(`No APIs have token info for '${token.name}' (${token.symbol}) ... dropping`);
			return;
		}

		this.logger.log(`Loaded token ${token.name} (${token.symbol}) from ERC20 address ${this.props.address}`);

		tokenInfo && this.addToken(
			token.name,
			token.symbol,
			tokenInfo.ImageUrl,
			token.balance * Math.pow(10, -token.decimals),
			`https://etherscan.io/token/${token.address}` 	// token.contract address, not wallet address				
		);
	}

}