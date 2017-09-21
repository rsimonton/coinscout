import React, { Component } from 'react';
import CCC from 'api/CryptoCompare/vendor.js';
import { apiSubscribe } from 'api/CryptoCompare/api.js';

import './Coin.css';

class Coin extends Component {
	
	constructor(props) {
		super(props);

		this.state = {};

		apiSubscribe(
			this.props.exchange,
			this.props.symbol,
			this.props.to,
			this.handleData.bind(this)
		);
	}

	handleData(data) {
		//console.dir(data);
		data.FLAGS === '4' && delete data.FLAGS;
		this.setState(data);
	}

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
			<div className={'Coin Coin-' + this.props.symbol}>
				<div className="Coin-current">
					<div className="Coin-pair">{this.state.FROMSYMBOL} / {this.state.TOSYMBOL}</div>
					<span className={'Coin-price Coin-price-' + lastChange[this.state.FLAGS]}>{CCC.STATIC.CURRENCY.SYMBOL[this.state.TOSYMBOL]} {parseFloat(this.state.PRICE).toFixed(pricePrecision)}</span>
				</div>
			</div>
		);
	}

}

export default Coin;