import React, { Component } from 'react';

import Coin from './components/Coin/Coin.jsx';
import { apiInit, apiFinalize } from './api/CryptoCompare/api.js';
//import ApiManager from 'api/ApiManager.js';
//import UserPrefs from 'components/UserPrefs/UserPrefs.jsx';

import appConfig from './config/coinscout.js';
import logo from './logo.svg';

import './App.css';

class App extends Component {

	constructor(props) {
		super(props);

		//this.apiManager = new ApiManager();
		
		// For now treat portfolio and watchlist the same
		this.coinConfig = appConfig.portfolio.concat(appConfig.watchlist);			
		this.normalizeValues = appConfig.normalizeValues;
		this.pricePrecision = appConfig.pricePrecision;
		this.rawPrices = { USD: 1 };
		this.userDenomination = 'USD';  // for now...		

		this.state = {
			prices: {},
			signs: {}
		};

		this.handleData = this.handleData.bind(this);
		
		apiInit();
	}

	componentDidMount() {
		apiFinalize();

		/* A succesful experiment - reorder Coin elements iu UI based on symbol after 3 seconds -- cool!
		let self = this;
		window.setTimeout(function() {
			coinConfig.sort(function(a,b) {
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

	render() {

		//const userPrefs = <UserPrefs convertValues="USD" />;
		const prices = this.state.prices;

		// Ok React, this is pretty rad - render Coins from JSON config array, write into variable
		const coinComponents = this.coinConfig.map((coin, index) =>
			<Coin key={index}
				price={prices[coin.symbol]}
				denomination={this.normalizeValues ? this.userDenomination : coin.market}
				pricePrecision={coin.pricePrecision || appConfig.pricePrecision}
				onData={this.handleData}
				{...coin} />
		);

		return (
			<div className="App">

				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to CoinScout</h2>
				</div>
			
				<div className="App-content">
					<div className="App-coins">
						{coinComponents}
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
