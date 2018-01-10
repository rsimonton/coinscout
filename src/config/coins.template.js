/**
 * Save a copy of this file as coins.js, and make your changes there.
 *
 * Add coins/tokens in your portfolio here. To determine correct values
 * to use for 'exchange' and 'market', check the "markets" tab for teh
 * coin of interest on CryptoCompare's website, as market data is source
 * from there and as such only markets that they recognize/support are
 * supported  by Coinscout:
 *
 *		https: *www.cryptocompare.com/
 *
 * Note that 'exchange' values *are* case-sensitive, so make sure to 
 * enter values exactly as displalyed on CryptoCompare's site (I'm looking
 * at you, BitTrex).
 *
 *	{
 *
 *		name: 'Ethereum',
 *		symbol': 'ETH',
 *		exchange': 'Coinbase',
 *		market': 'USD',
 *		stack: {
 *			 * Where you hold coins, and how much you hold, used to
 *			 * calulate balances
 *			Coinbase: 5
 *		}
 *	},
 *
 * Configuration options will be expanded in the future to support additional
 * functionality, e.g. shares owned, purchase dates/costs, etc.
 */
export default {
	//
	// Coins you own
	//
	portfolio: [
		{
			'name': 'Bitcoin',
			'symbol': 'BTC',
			'exchange': 'Coinbase',
			'market': 'USD'
		},
		{
			'name': 'Ethereum',
			'symbol': 'ETH',
			'exchange': 'Coinbase',
			'market': 'USD'
		}	
	],
	//
	// Same format as portfolio config, with the intention that these are coins
	// you're interested in but don't own. There will be enhancements around this
	// in the future but for now these are treated identically to portfolio coins
	// (but don't have a portfolio value, since you you don't own them ;)
	//
	watchlist: [
		
	]
};