/**
 * CoinScout user configuration file
 */
export default {
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
	// Setting this value to one of the options below enables clicking on a
	// coin to see its current info on the corresponding 3rd party site. Set
	// to null to disable this functionality. Supported (case-sensitive)
	// options include:
	//
	//		* CoinMarketCap
	//		* CryptoCompare
	//		* LiveCoinWatch
	//
	// Note that not all sites list all markets for every coin, or even list
	// every coin.
	//
	marketCapSite: 'LiveCoinWatch',
	showBalances: true,
	showWatchList: true
};