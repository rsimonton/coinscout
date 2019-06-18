import Wallet from './Wallet.js';
import { getWalletInfo } from 'api/Aion/api.js';

export default class AionWallet extends Wallet {

	constructor(props) {
		super(props);
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		getWalletInfo(this.props.address, this.handleWalletLoaded);			
	}

	handleWalletLoaded(walletInfo) {

		console.log('Loaded AION address ' + this.props.address);
	
		const tokenInfo = this.getTokenInfo('AION');

		tokenInfo && this.addToken(
			tokenInfo.CoinName,
			tokenInfo.Symbol,
			tokenInfo.ImageUrl,
			Number(walletInfo.balance) // suddenly started being returned by API as a string
		);

		this.props.onWalletLoaded && this.props.onWalletLoaded(this);
	}

}