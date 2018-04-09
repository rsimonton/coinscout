import React, { Component } from 'react';

import AppStatus from './components/App/AppStatus';
import Coin from './components/Coin/Coin.jsx';
import Coins from './components/Coins/Coins.jsx';
import Erc20Wallet from './components/Wallet/Erc20Wallet.jsx';
import PortfolioSummary from './components/Portfolio/PortfolioSummary.jsx';
import SettingsPanel from './components/Settings/SettingsPanel.jsx';
import { addApiStatusListener, getApiStatus, getTokenInfo } from './api/CryptoCompare/api.js';

//import ApiManager from 'api/ApiManager.js';
//import UserPrefs from 'components/UserPrefs/UserPrefs.jsx';

import appConfig from './config/config.js';
import coinConfig from './config/coins.js';

import logo from './logo.svg';

import './App.css';

class App extends Component {

	constructor(props) {
		super(props);

		const cache = window.localStorage;
		let cachedSettings = {},
			coins = [];

		//this.apiManager = new ApiManager();		
		
		this.normalizeValues = appConfig.normalizeValues;
		this.pricePrecision = appConfig.pricePrecision;
		this.rawPrices = { USD: 1 };
		this.userDenomination = 'USD';  // for now...

		// Set up formatters for currencies we want to display
		this.currencyFormatters = {
			USD: new Intl.NumberFormat('en-US', {
            	style: 'currency',
            	currency: 'USD',
            	minimumFractionDigits: 2,
            	maximumFractionDigits: 2
            })
		}

		// Load saved users settings if any from window.localStorage
		Object.keys(cache).forEach(setting =>
			cachedSettings[setting] = JSON.parse(cache[setting])
		);

		// Main goal here is to create a map of each coin, keyed by its symbol
		coinConfig.portfolio.forEach(coin => {
			// Restructuring coin.stack here - consider doing this in config itself.
			// e.g. { BitTrex: 30 } ---> [ { source:BitTrex, balance: 30} ]
			const tokenInfo = getTokenInfo(coin.symbol);

			if(tokenInfo) {
				let stack = [];

				Object.keys(coin.stack).forEach(source => {
					stack.push({
						source: source,
						balance: coin.stack[source]
					});
				});

				coin.stack = stack;

				coins[coin.symbol] = {
					name: tokenInfo.CoinName,
					symbol: coin.symbol,
					icon: tokenInfo.ImageUrl,
					stack: stack
				};
			}
			else {
				console.warn('Ignoring unkown token in app config file: ' + coin.symbol);
			}
		});

		// Initialize state, extending default settings w/ cached user settings
		this.state = {
			apiStatus: getApiStatus(),
			coins: coins,
			prices: {},
			signs: {},
			settings: Object.assign(appConfig, cachedSettings)
		};		

		// Bind handlers
		this.handleData = this.handleData.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.handleStatusChange = this.handleStatusChange.bind(this);
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		this.toggleSettings = this.toggleSettings.bind(this);

		addApiStatusListener(this.handleStatusChange);
	}

	
	componentDidMount() {

		//apiFinalize();

		// This may not be necessary - force to boolean
		this.setState(prevState => { 
			return { settingsOpen: !!prevState.settings.settingsOpen }
		});

		/* A succesful experiment - reorder Coin elements iu UI based on symbol after 3 seconds -- cool!
		let self = this;
		window.setTimeout(function() {
			coinConfig.portfolio.sort(function(a,b) {
				return a.symbol < b.symbol ? -1 : (a.symbol === b.symbol ? 0 : 1);
			});

			self.setState({coinConfig: coinConfig});
		}, 3000);
		*/

		coinConfig.erc20Wallets.forEach(addr => {
			let w = new Erc20Wallet({
				address: addr,
				onWalletLoaded: this.handleWalletLoaded
			});
		});
	}

	
	convertPrice(price, from, to) {
		//console.dir(arguments);
		return price * this.rawPrices[from] / this.rawPrices[to];
	}

	
	handleData(data) {

		if(typeof data.PRICE === 'undefined' || Number.isNaN(data.PRICE)) {
			return;
		}
		
		let convertedPrice = {};

		// Convert price iff user has overridden market set in coin config
		convertedPrice[data.FROMSYMBOL] = this.normalizeValues && this.userDenomination !== data.TOSYMBOL
			? this.convertPrice(data.PRICE, data.TOSYMBOL, this.userDenomination)
			: data.PRICE;

		//console.log(data.FROMSYMBOL + ': ' + data.PRICE + ' ' + data.TOSYMBOL + ' --> ' + convertedPrice[data.FROMSYMBOL] + ' ' + this.userDenomination);
		//console.dir(convertedPrice);
		
		this.rawPrices[data.FROMSYMBOL] = data.PRICE;

		// Safely update price base on previous state
		this.setState((prevState) => {
			return Object.assign(prevState.prices, convertedPrice);
		});
	}


	/**
	 * @param setting Key/value of setting and it's new value
	 */
	handleSettingsChange(setting) {
		// Cache user setting
		const key = Object.keys(setting)[0]
		const val = Object.values(setting)[0];

		window.localStorage.setItem(key, JSON.stringify(val));
		
		// Safely update state based on current state
		this.setState((prevState) => {
			return Object.assign(prevState.settings, setting);
		});
	}


	handleStatusChange(apiStatus) {
		this.setState({apiStatus: apiStatus});
	}


	handleWalletLoaded(wallet) {
		// Passing a function to setState guarantees that state will be up
		// to date when the funtion executes, otherwise this.state may not
		// be up to date when we access it due to queued updates
		//
		// https://reactjs.org/docs/react-component.html#setstate
		//
		this.setState((currentState) => {

			const coins = currentState.coins;				  

			wallet.getTokens().forEach(token => {
				if(coins[token.symbol]) {
					// We're already tracking this token, just update stack
					coins[token.symbol].stack = coins[token.symbol].stack.concat(token.stack);					
				}
				else {
					coins[token.symbol] = token;
				}
			});

			return {
				coins: coins
			};
		});
	}


	toggleSettings() {
		const isOpen = this.state.settingsOpen,
			  nextState = !isOpen;

		this.setState({settingsOpen: nextState});
		window.localStorage.setItem('settingsOpen', JSON.stringify(nextState));
	}


	render() {
		
		const apiStatus = this.state.apiStatus,
			  coins = this.state.coins,
			  prices = this.state.prices,
			  settings = this.state.settings,
			  settingsOpen = this.state.settingsOpen;

		// Ok React, this is pretty rad - render Coins from JSON config array, write into variable
		const coinComponents = Object.values(coins).map((coin, index) =>
			<Coin key={index}
				marketCapSite={settings.marketCapSite}
				price={prices[coin.symbol]}
				denomination={this.normalizeValues ? this.userDenomination : coin.market}
				pricePrecision={coin.pricePrecision || appConfig.pricePrecision}
				onData={this.handleData}
				formatters={this.currencyFormatters}
				settings={settings}
				{...coin} />
		);

		// Populate watch list, or not, based on settings
		const watchlist = settings.showWatchList ? coinConfig.watchlist.map((coin, index) =>
			<Coin key={index}
				marketCapSite={settings.marketCapSite}
				price={prices[coin.symbol]}
				denomination={this.normalizeValues ? this.userDenomination : coin.market}
				pricePrecision={coin.pricePrecision || appConfig.pricePrecision}
				onData={this.handleData}
				formatters={this.currencyFormatters}
				settings={settings}
				{...coin} />
		) : false;

		return (
			<div className={"App " + apiStatus.toLowerCase()}>

				<div className="App-header">

					<AppStatus status={apiStatus} />
				
					<img src={logo} className="App-logo" alt="logo" onClick={this.toggleSettings} />
					<h2>Welcome to CoinScout</h2>
				
					<PortfolioSummary
						coins={coins}
						prices={prices}
						formatters={this.currencyFormatters}
						showBalances={settings.showBalances} />					
				</div>

				<SettingsPanel settings={settings} onChange={this.handleSettingsChange} isOpen={settingsOpen} />
				
				<div className="App-content">
					<div class="column coins">
						<Coins coins={coinComponents} />
						{watchlist && <Coins coins={watchlist} />}
					</div>
					<div class="column history">
						
					</div>
				</div>
			
				<div className="App-footer">
					Data Courtesy of <a className="attribution" href="https://www.cryptocompare.com/">CryptoCompare.com</a>
				</div>
			
			</div>      
		);
	}
}

export default App;