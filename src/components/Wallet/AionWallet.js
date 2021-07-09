import Wallet from './Wallet.js';
import { getWalletInfo } from 'api/Aion/api.js';
import { utils as coinscout } from 'util/Utils.js';

export default class AionWallet extends Wallet {

	constructor(props) {
		super(props);
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		// We don't bother auto-refreshing this one
		getWalletInfo(this.props.address, this.handleWalletLoaded);
	}

	handleWalletLoaded(walletInfo) {

		coinscout.log('Loaded AION address ' + this.props.address);
	
		this.getTokenInfo('AION', tokenInfo => {

			tokenInfo && this.addToken(
				tokenInfo.CoinName,
				tokenInfo.Symbol,
				tokenInfo.ImageUrl,
				Number(walletInfo.balance) // suddenly started being returned by API as a string
			);
		});

		this.props.onWalletLoaded && this.props.onWalletLoaded(this);
	}

}