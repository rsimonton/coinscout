import React, { Component } from 'react';
import CCC from 'api/CryptoCompare/vendor.js';

class CoinPrice extends Component {
	
	render() {

		const pricePrecision = 2;	// decimal places
		const lastChange = [
			null,
			'increasing',
			'decreasing',
			null,
			'unchanged'
		];
	
		return (
			<span className={'Coin-price Coin-price-' + lastChange[this.props.flags]}>
				{CCC.STATIC.CURRENCY.SYMBOL[this.props.symbol]} {parseFloat(this.props.price).toFixed(pricePrecision)}
			</span>
		);
	}

}

export default CoinPrice;