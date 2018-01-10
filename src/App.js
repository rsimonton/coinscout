import React, { Component } from 'react';

import Coin from './components/Coin/Coin.jsx';
import Coins from './components/Coins/Coins.jsx';
import PortfolioSummary from './components/Portfolio/PortfolioSummary.jsx';
import SettingsPanel from './components/Settings/SettingsPanel.jsx';
import { apiInit, apiFinalize } from './api/CryptoCompare/api.js';

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
		let cachedSettings = {};

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
		Object.keys(cache).forEach(setting => cachedSettings[setting] = JSON.parse(cache[setting]));

		// Initialize state, extending default settings w/ cached user settings
		this.state = {
			coinConfig: coinConfig,
			prices: {},
			signs: {},
			settings: Object.assign(appConfig, cachedSettings)
		};

		this.state.settingsOpen = !!this.state.settings.settingsOpen;

		// Bind handlers
		this.handleData = this.handleData.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.toggleSettings = this.toggleSettings.bind(this);

		apiInit();
	}

	
	componentDidMount() {

		apiFinalize();

		/* A succesful experiment - reorder Coin elements iu UI based on symbol after 3 seconds -- cool!
		let self = this;
		window.setTimeout(function() {
			coinConfig.portfolio.sort(function(a,b) {
				return a.symbol < b.symbol ? -1 : (a.symbol === b.symbol ? 0 : 1);
			});

			self.setState({coinConfig: coinConfig});
		}, 3000);
		*/
	}

	
	convertPrice(price, from, to) {
		//console.dir(arguments);
		return price * this.rawPrices[from] / this.rawPrices[to];
	}

	
	handleData(data) {

		if(typeof data.PRICE === 'undefined' || Number.isNaN(data.PRICE)) {
			return;
		}
		
		const prices = this.state.prices;
		let convertedPrice = {};

		// Convert price iff user has overridden market set in coin config
		convertedPrice[data.FROMSYMBOL] = this.normalizeValues && this.userDenomination !== data.TOSYMBOL
			? this.convertPrice(data.PRICE, data.TOSYMBOL, this.userDenomination)
			: data.PRICE;

		//console.log(data.FROMSYMBOL + ': ' + data.PRICE + ' ' + data.TOSYMBOL + ' --> ' + convertedPrice[data.FROMSYMBOL] + ' ' + this.userDenomination);
		//console.dir(convertedPrice);
		
		this.rawPrices[data.FROMSYMBOL] = data.PRICE;
		this.setState(Object.assign(prices, convertedPrice));
	}


	/**
	 * @param setting Key/value of setting and it's new value
	 */
	handleSettingsChange(setting) {
		// Cache user setting
		const key = Object.keys(setting)[0]
		const val = Object.values(setting)[0];
		window.localStorage.setItem(key, JSON.stringify(val));
		this.setState(Object.assign(this.state.settings, setting));
	}


	toggleSettings() {
		const isOpen = this.state.settingsOpen,
			  nextState = !isOpen;

		this.setState({settingsOpen: nextState});
		window.localStorage.setItem('settingsOpen', JSON.stringify(nextState));
	}


	render() {
		
		const coinConfig = this.state.coinConfig,
			  prices = this.state.prices,
			  settings = this.state.settings,
			  settingsOpen = this.state.settingsOpen;

		const coinsToDisplay = settings.showWatchList === false
			? coinConfig.portfolio
			: coinConfig.portfolio.concat(coinConfig.watchlist);

		// Ok React, this is pretty rad - render Coins from JSON config array, write into variable
		const coinComponents = coinsToDisplay.map((coin, index) =>
			<Coin key={index}
				marketCapSite={settings.marketCapSite}
				price={prices[coin.symbol]}
				denomination={this.normalizeValues ? this.userDenomination : coin.market}
				pricePrecision={coin.pricePrecision || appConfig.pricePrecision}
				onData={this.handleData}
				formatters={this.currencyFormatters}
				showBalances={settings.showBalances}
				{...coin} />
		);

		return (
			<div className="App">

				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" onClick={this.toggleSettings} />
					<h2>Welcome to CoinScout</h2>
					<PortfolioSummary
						prices={prices}
						formatters={this.currencyFormatters}
						showBalances={settings.showBalances} />					
				</div>

				<SettingsPanel settings={settings} onChange={this.handleSettingsChange} isOpen={settingsOpen} />
				
				<div className="App-content">
					<Coins coins={coinComponents} />
				</div>
			
				<div className="App-footer">
					Data Courtesy of <a className="attribution" href="https://www.cryptocompare.com/">CryptoCompare.com</a>
				</div>
			
			</div>      
		);
	}
}

export default App;