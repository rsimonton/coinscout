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
		const price = this.props.price;
		const flags = this.props.flags;
		const denomination = this.props.denomination;
		
		// Did the price go up/down or unchanged?
		const change = flags === CoinPrice.UNCHANGED
			? this.lastChange
			: this.changeTypes[flags];

		// Set precision based on denomination if we have a price
		const pricePrecision = price
			? ('USD' === denomination ? (price < .2 ? 3 : 2) : 3 + price.toString().search(/[1-9]/))
			: 0;

		const priceConverted = parseFloat(price).toFixed(pricePrecision);
		const symbolConverted = CoinPrice.SIGNS[denomination];

		// Keep track of last price change
		this.lastChange = change;

		return (
			<span className={'Coin-price Coin-price-' + change}>
				<span className='Coin-price-sign'>{symbolConverted}</span>
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