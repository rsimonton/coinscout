/**
 * Save a copy of this file as coins.js, and make your changes there.
 *
 * Configuration options will be expanded in the future to support additional
 * functionality, e.g. shares owned, purchase dates/costs, etc.
 */
export default {
	//
	// Public ERC20 wallet addresses hodling ETH/tokens
	//
	erc20Wallets: [
		
	],
	//
	// Entery coins you hold on exchanges here.
	//
	// Each entry is an object with format:
	//
	//	{
	//
	//		name: 'Ethereum',
	//      label: 'Optional Name Override',
	//		symbol': 'ETH',
	//		stack: {
	//			// Where you hold coins, and how much you hold, used to
	//			// calulate balances
	//			Coinbase: 5
	//		}
	//	},
	//
	portfolio: [
		
	],
	//
	// Same format as portfolio config, with the intention that these are coins
	// you're interested in but don't own. There will be enhancements around this
	// in the future but for now these are treated identically to portfolio coins
	// (but don't have a portfolio value, since you you don't own them ;)
	//
	watchlist: [
		
	],
	//
	// Coins sold, cut/paste from 'portfolio' -- as of yet unused
	//	
	sold: [
		
	]
};