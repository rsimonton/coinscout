import Wallet from './Wallet.js';
import { getWalletInfo } from 'api/BlockchainInfo/api.js';
import Logger from 'util/Logger.js';

/**
 * This is a misnomer, Bitcoin doesn't have a wallet concept, it uses one-time-use
 * addresses.  As such, your total Bitcoin holdings are the sum of the amounts sent
 * to the addresses you control.
 */
export default class BitcoinWallet extends Wallet {

	constructor(props) {
		super(props);
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		this.logger = new Logger('BitcoinWallet.js');
		
		getWalletInfo(this.props.address, this.handleWalletLoaded);
		
		window.setInterval(
			() => getWalletInfo(this.props.address, this.handleWalletLoaded),
			this.REFRESH_INTERVAL
		);	
	}

	async handleWalletLoaded(balance) {

		this.logger.log('Loaded Bitcoin address ' + this.props.address);
	
		const tokenInfo = await this.getTokenInfo('BTC');

		tokenInfo && this.addToken(
			tokenInfo.CoinName,
			'BTC',
			tokenInfo.ImageUrl,
			// Convert from sats to btc
			balance / 100000000
		);

		this.props.onWalletLoaded && this.props.onWalletLoaded(this);
	}

}