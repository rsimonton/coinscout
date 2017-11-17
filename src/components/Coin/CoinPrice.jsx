import React, { Component } from 'react';
import CCC from 'api/CryptoCompare/vendor.js';

class CoinPrice extends Component {

	constructor(props) {
		super(props);
		
		this.changeTypes = [
			null,
			'increasing',
			'decreasing',
			null,
			'unchanged'
		];

		this.lastChange = this.changeTypes[CoinPrice.UNCHANGED];
	}
	
	render() {
		//console.log(this.props);

		const price = this.props.price;
		const priceStr = price ? price.toString() : '';
		const flags = parseInt(this.props.flags, 10);
		const denomination = this.props.denomination;
		const symbol = CoinPrice.SIGNS[denomination];
		let pricePrecision = 0;

		if(price) {
			const decimalIndex = priceStr.indexOf('.');
			pricePrecision = 'USD' !== denomination
				? decimalIndex + priceStr.substr(decimalIndex).search(/[1-9]/) + this.props.precision -2
				: 2;

			/*
			console.log(
				' priceStr: ' + priceStr + 
				' decimalIndex:' + decimalIndex + 
				' firstNonZero:' + priceStr.substr(decimalIndex).search(/[1-9]/) +
				' precision:' + pricePrecision +
				' result:' + parseFloat(price).toFixed(pricePrecision)
			);
			*/
		}
		
		//console.log(priceStr + ' length: ' + priceStr.length + ' precision: ' + pricePrecision)
		const priceConverted = parseFloat(price).toFixed(pricePrecision);
		
		// Did the price go up/down or unchanged?
		const change = flags === CoinPrice.UNCHANGED || null === this.changeTypes[flags]
			? this.lastChange
			: this.changeTypes[flags];

		//console.log('change: ' + flags + ' = ' + change);

		// Keep track of last price change
		this.lastChange = change;

		return (
			<span className={'Coin-price Coin-price-' + change}>
				<span className='Coin-price-sign'>{symbol}</span>
				<span className='Coin-price-price'>{priceConverted}</span>
			</span>
		);
	}

}

CoinPrice.INCREASING = 1;
CoinPrice.DECREASING = 2;
CoinPrice.UNCHANGED = 4;
CoinPrice.SIGNS = CCC.STATIC.CURRENCY.SYMBOL;

export default CoinPrice;