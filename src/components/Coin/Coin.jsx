import React, { Component } from 'react';
import CoinLabel from './CoinLabel.jsx';
import CoinPrice from './CoinPrice.jsx';
import CoinStack from './CoinStack.jsx';

import { apiSubscribe as websocketApi } from 'api/CryptoCompare/api.js';
import { apiSubscribe as restApi } from 'api/CoinGecko/api.js';

import './Coin.css';

export default class Coin extends Component {
	
	constructor(props) {
		super(props);

		this.formatter = this.props.formatters.USD;
		this.lastPrice = NaN;
		this.priceChangeLast = CoinPrice.changeTypes[CoinPrice.UNCHANGED];	
		this.priceHistory = {};

		this.state = {
			api: websocketApi,	// Try websockets first
			priceUpdates: 0,
			invalid: true,
			subscribed: false,
			weight: 0
		};

		this.apiSubscribe = this.apiSubscribe.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleApiData = this.handleApiData.bind(this);
		this.handleApiError = this.handleApiError.bind(this);
		this.handleHide = this.handleHide.bind(this);
		this.handleStackValueChange = this.handleStackValueChange.bind(this);		
	}

	// This intentional name collision is ridiculous lol
	apiSubscribe() {

		const subscribed = this.state.api(
			this.props.symbol,
			this.handleApiData,
			this.handleApiError
		);

		const newState = { subscribed };

		this.state.price && (newState.invalid = subscribed === true);

		this.setState(newState);
	}

	componentDidMount() {
		this.apiSubscribe();
	}

	componentWillReceiveProps(nextProps) {

		const priceRaw = parseFloat(nextProps.price);

		if(Number.isNaN(priceRaw)) {
			this.state.invalid || this.setState({invalid: true});
			return;
		}

		const priceStr = priceRaw ? priceRaw.toString() : '';
		const denomination = nextProps.denomination;		
		const precisionRaw = nextProps.pricePrecision;
		
		let pricePrecision = 0;

		if(priceRaw) {
			const decimalIndex = priceStr.indexOf('.');
			pricePrecision = 'USD' !== denomination
				? decimalIndex + priceStr.substr(decimalIndex).search(/[1-9]/) + precisionRaw - 2
				: priceRaw < 1 ? 3 : 2;
		}

		//console.log('riceStr + ' length: ' + priceStr.length + ' precision: ' + pricePrecision)
		const priceNormalized = parseFloat(priceRaw).toFixed(pricePrecision);

		// Did the price go up/down or unchanged?
		const priceUnchanged = priceNormalized === parseFloat(this.state.price).toFixed(pricePrecision);
		const priceChangeThis = priceUnchanged
			? this.state.priceChange
			: this.state.priceChange; // CoinPrice.changeTypes[flags]; -- CoinGecko todo

		//console.log('change: ' + flags + ' = ' + priceChangeThis);
		const newWeight = priceUnchanged
			? this.state.weight
			: this.state.weight; // + (flags === CoinPrice.INCREASING ? 1 : -1); -- CoinGecko todo (but not used?)

		// Keep track of last price change
		this.priceChangeLast = priceChangeThis;

		const newState = {};

		// We have a price, so we're valid now unless still not subscribed
		this.state.subscribed && (newState.invalid = false);
		
		priceUnchanged || Object.assign(newState, {
			price: priceNormalized,
			priceChange: priceChangeThis,
			weight: newWeight
		});

		Object.keys(newState).length && this.setState(newState);

		// This is where we were bubbling the coins weight change up to the app, 
		// with the idea that the app could sort the coins based on their weights.
		// This causes problems with React due to too many updates, which I'm not
		// sure what the cause of was, so shelving that idea for now.
		//priceUnchanged || this.props.onWeightChange(this.props.symbol, newWeight);
	}

	handleClick() {
		
		let link = false;

		switch(this.props.marketCapSite) {
			case 'CoinGecko':
				link = `https://www.coingecko.com/en/coins/${this.props.name.toLowerCase().replace(/ /g, '-')}/`;
				break;
			case 'CoinMarketCap':
				link = 'https://coinmarketcap.com/currencies/' + this.props.name.toLowerCase().replace(/ /g, '-') + '/';
				break;
			case 'CryptoCompare':
				link = 'https://cryptocompare.com/coins/' + this.props.symbol.toLowerCase() + '/markets/' + this.props.market;
				break;
			case 'LiveCoinWatch':
				link = 'https://www.livecoinwatch.com/price/' + this.props.name.replace(/ /g, '') + '-' + this.props.symbol;
				break;
			case 'Messari':
				link = 'https://messari.io/asset/' + this.props.name.toLowerCase().replace(/ /g, '-') + '/';
				break;
			case 'CoinPaprika':
				link = `https://coinpaprika.com/coin/${this.props.symbol.toLowerCase()}-${this.props.name.toLowerCase().replace(/ /g, '-')}/`;
				break;
			default:
				console.log('No "marketCapSite" config item set, ignoring coin click');
		}

		link && window.open(link);
	}

	handleApiData(data) {
		//console.dir(data);

		// 'data' is null if API subscription attempt returned no data. Hide the symbol
		if(null === data) {
			this.handleHide();
			return;
		}

		this.setState(data, function() {
			this.props.onData(data)
		});
	}

	handleApiError(error) {
		
		const newState = {
			invalid: true,
			subscribed: false
		};

		if(this.state.api === websocketApi) {
			console.error(`Coin ${this.props.symbol} - websocket error: ${error} -- falling back to REST API`);
			
			newState.api = restApi;
			
			this.setState(newState, function() {
				this.apiSubscribe()
			});
		}
		else {
			console.error(`Coin ${this.props.symbol} - REST error: ${error} -- giving up`);
			
			// Oh sure why not
			newState.api = null;

			this.setState(newState);
		}
	}

	handleHide(event) {
		event && event.stopPropagation();
		this.props.onHide && this.props.onHide(this.props);
	}

	handlePriceChange(upOrDown) {
		const newWeight = this.state.weight + upOrDown;
		this.setState({weight: newWeight}, function() {
			console.log(this.props.symbol + ' new weight is: ' + this.state.weight);
		});
	}

	handleStackValueChange(newValue) {
		this.props.onStackValueChange && this.props.onStackValueChange(newValue);
	}

	render() {
		
		//console.dir(this.props);

		const {denomination, formatters, label, name, pricePrecision, icon, stack, symbol, url, ...props} = this.props,
			  api = this.state.api,
			  invalid = this.state.invalid,
			  priceChange = this.state.priceChange,
			  price = this.state.price,
			  weight = this.state.weight,
			  priceUpdates = Object.keys(this.priceHistory).length + 1;

		const coinApiClass = null === api ? '' : `Coin-${websocketApi === api ? 'websocket' : 'rest'}`,
			  coinValidityClass = `Coin-${invalid ? 'invalid' : 'valid'}`,
			  coinClass = `Coin Coin-${symbol} ${coinApiClass} ${coinValidityClass}`;

		if(price !== this.lastPrice) {
			this.lastPrice = price;
			this.priceHistory[new Date().getTime()] = price;
		}

		//console.log(name + ': ' + Object.keys(this.priceHistory).length + ' updates');
		
		return (
			<div className={coinClass} data-weight={weight} onClick={this.handleClick}>
				<CoinHideButton onClick={this.handleHide} />
				<CoinLabel
					name={name}
					label={label}
					icon={icon}
					priceUpdates={priceUpdates}
					url={url} />
				<CoinPrice
					change={priceChange}
					price={price}
					denomination={denomination}
					priceHistory={this.priceHistory} />
				<CoinStack
					formatters={formatters}
					onValueChange={this.handleStackValueChange}
					symbol={symbol}
					price={price}
					stack={stack} 
					{...props} />				
			</div>
		);
	}

}

class CoinHideButton extends Component {
	render() {
		const {...props} = this.props;
		return <div className="Coin-hide-button" {...props}>✕</div>;
	}
}