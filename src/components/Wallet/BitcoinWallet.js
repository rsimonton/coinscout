import Wallet from './Wallet.js';
import { getWalletInfo } from 'api/BlockchainInfo/api.js';

/**
 * This is a misnomer, Bitcoin doesn't have a wallet concept, it uses one-time-use
 * addresses.  As such, your total Bitcoin holdings are the sum of the amounts sent
 * to the addresses you control.
 */
export default class BitcoinWallet extends Wallet {

	constructor(props) {
		super(props);
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		
		getWalletInfo(this.props.address, this.handleWalletLoaded);
		
		window.setInterval(
			() => getWalletInfo(this.props.address, this.handleWalletLoaded),
			this.REFRESH_INTERVAL
		);	
	}

	handleWalletLoaded(balance) {

		console.log('Loaded Bitcoin address ' + this.props.address);
	
		this.getTokenInfo('BTC', tokenInfo => {

			tokenInfo && this.addToken(
				tokenInfo.CoinName,
				'BTC',
				tokenInfo.ImageUrl,
				// Convert from sats to btc
				balance / 100000000
			);
		});

		this.props.onWalletLoaded && this.props.onWalletLoaded(this);
	}

}