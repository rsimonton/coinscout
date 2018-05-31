## CoinScout - A Cryptocurrency Portfolio Tracker

### Getting Started

You'll need to have [Node.js installed](https://nodejs.org/en/download/)

  1. Clone repo: [https://github.com/rsimonton/coinscout.git](https://github.com/rsimonton/coinscout.git)
  2. Copy `src/api/Ethplorer/config.js.template` to `src/api/Ethplorer/config.js` (see Ethplorer notes below)
  3. Copy `src/config/coinscout.template.js` to `src/config/coinscout.js`
  4. Read through comments in `coinscout.js` config file
  5. Add your portfolio and watchlist coins, save
  6. From project home directory run:  `npm run start &`
  
  A browser window should launch, bookmark and enjoy

  By default, API requests to Ethplorer (to retrieve ERC20 wallet token balances) will use the free
  API key that Ethplorer provides.  This key has fairly limited bandwidth restrictions, I suggest
  requesting a personal API key from Ethplorer which they'll happily grant, and will allow for far
  more API requests.  See: https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
