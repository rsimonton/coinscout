import React, { Component } from 'react';

import AppStatus from './components/App/AppStatus';
import Coin from './components/Coin/Coin.jsx';
import Coins from './components/Coins/Coins.jsx';
import AionWallet from './components/Wallet/AionWallet.js';
import BitcoinWallet from './components/Wallet/BitcoinWallet.js';
import Erc20Wallet from './components/Wallet/Erc20Wallet.js';
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
			getTokenInfo(coin.symbol, tokenInfo => {

				if(tokenInfo) {
					coins[coin.symbol] = {
						name: tokenInfo.CoinName,
						symbol: coin.symbol,
						icon: tokenInfo.ImageUrl,
						stack: coin.stack,
						weight: 0
					};
				}
				else {
					console.warn('Ignoring unkown token in app config file: ' + coin.symbol);
				}
			});
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
		this.handleHide = this.handleHide.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.handleStatusChange = this.handleStatusChange.bind(this);
		this.handleWalletLoaded = this.handleWalletLoaded.bind(this);
		this.handleWeightChange = this.handleWeightChange.bind(this);
		this.toggleSettings = this.toggleSettings.bind(this);

		addApiStatusListener(this.handleStatusChange);
	}

	
	componentDidMount() {

		// This may not be necessary - force to boolean
		this.setState(prevState => { 
			return { settingsOpen: !!prevState.settings.settingsOpen }
		});

		// Load blockchain addresses from config and register with respective API
		for(let blockchain in coinConfig.blockchains) {

			let addresses = coinConfig.blockchains[blockchain];

			switch(blockchain) {
				
				case 'aion':
					addresses.forEach(addr => {
						let w = new AionWallet({
							address: addr,
							onWalletLoaded: this.handleWalletLoaded
						});
					});
					break;

				case 'bitcoin':
					addresses.forEach(addr => {
						let w = new BitcoinWallet({
							address: addr,
							onWalletLoaded: this.handleWalletLoaded
						});
					});
					break;

				case 'ethereum':
					addresses.forEach(addr => {
						let w = new Erc20Wallet({
							address: addr,
							onWalletLoaded: this.handleWalletLoaded
						});
					});
					break;
				
				default:
					console.warn(`API integration for ${blockchain} not yet implemented`);
			}
		}
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

	handleHide(coinProps) {
		let hidden = this.state.settings.hidden || [];
		hidden.push(coinProps.symbol);
		this.handleSettingsChange({hidden});
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
		this.setState(currentState => {

			const coins = currentState.coins;				  

			// getTokens() returns a map of symbol => data
			Object.values(wallet.getTokens()).forEach(token => {
				if(coins[token.symbol]) {
					// We're already tracking this token, just update stack
					//coins[token.symbol].stack = coins[token.symbol].stack.concat(token.stack);
					// Update or set the stack for the token (handling periodic auto-refreshes properly)
					Object.assign(coins[token.symbol].stack, token.stack);		
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


	handleWeightChange(symbol, newWeight) {
		this.setState(prevState => {
			prevState.coins[symbol].weight = newWeight;
			prevState.totalWeight = Object.values(prevState.coins).reduce((total, coin) => total + (coin.weight || 0), 0);
			return prevState;
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

		const hidden = settings.hidden || [];

		// Ok React, this is pretty rad - render Coins from JSON config array, write into variable
		const coinComponents = Object.values(coins)
			.filter(coin => !hidden.includes(coin.symbol))
			.sort((a,b) => a.weight < b.weight ? 1 : (a.weight > b.weight ? -1 : 0))
			.map((coin, index) =>
				<Coin key={index}
					denomination={this.normalizeValues ? this.userDenomination : coin.market}
					formatters={this.currencyFormatters}
					marketCapSite={settings.marketCapSite}
					onData={this.handleData}
					onHide={this.handleHide}
					onWeightChange={this.handleWeightChange}
					price={prices[coin.symbol]}
					pricePrecision={coin.pricePrecision || appConfig.pricePrecision}
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
					<div className="column coins">
						<Coins coins={coinComponents} />
						{watchlist && <Coins coins={watchlist} />}
					</div>
					<div className="column history">
						
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