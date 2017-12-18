/**
 * User configuration file for coins/tokens to track. Save a copy of this
 * file in this same directory as "coins.js" to start tracking coins.
 */
const config = {
	//
	// Set to true convert the coin sign/value to USD, false to display
	// the target market sign/value.  For this to work properly in an
	// arbitrary case, the 'market' symbol of a given coin must have a
	// corresponding symbol/market entry to USD. For example if you want
	// to track a coin 'XYZ' on e.g. Bitfinex, and the only market that
	// Bitfinex has for that coin is XYZ/OMG, then you must also include
	// a coin that maps OMG to USD.  The default configuration includes
	// markets for BTC/USD and ETH/USD, as most exchanges have BTC or ETH
	// markets for all coins.
	//
	// TODO - allow normalization to currencies other that USD
	// TODO - add 'conversion' config section to allow users to add
	//        'converstion markets' as described above without displaying
	//        those coins in the UI
	//
	normalizeValues: true,
	//
	// The number of non-zero decimal digits to display for values that are
	// not USD-denominated.  Example:
	//
	//		12.00074981 ETH w/ pricePrecision:2 ---> 12.00075
	//
	// This global value may be overridden on a per-coin basis by adding
	// 'pricePrecision' in any coin's config.  This setting has no effect
	// if 'normalizeValues' is true
	//
	pricePrecision: 3,
	//
	// Add coins/tokens in your portfolio here. To determine correct values
	// to use for 'exchange' and 'market', check the "markets" tab for teh
	// coin of interest on CryptoCompare's website, as market data is source
	// from there and as such only markets that they recognize/support are
	// supported  by Coinscout:
	//
	//		https://www.cryptocompare.com/
	//
	// Note that 'exchange' values *are* case-sensitive, so make sure to 
	// enter values exactly as displalyed on CryptoCompare's site (I'm looking
	// at you, BitTrex).
	//
	//	{
	//
	//		name: 'Ethereum',
	//		symbol': 'ETH',
	//		exchange': 'Coinbase',
	//		market': 'USD',
	//		stack: {
	//			// Where you hold coins, and how much you hold - used to calulate balance
	//			Coinbase: 5
	//		}
	//	},
	//
	// Configuration options will be expanded in the future to support additional
	// functionality, e.g. shares owned, purchase dates/costs, etc.
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
	// (but don't have a portfolio value, sinc you you don't own them ;)
	watchlist: [
		
	]
};

export default config;