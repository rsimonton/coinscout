import React, { Component } from 'react';
import { apiSubscribe } from 'api.js';

class Coin extends Component {

	constructor(props) {
		super(props);

		this.state = {};
		//this.state[this.props.symbol] = 'Connecting...';

		apiSubscribe(
			this.props.exchange,
			this.props.symbol,
			this.props.to,
			this.handleData.bind(this)
		);
	}

	handleData(data) {
		console.dir(data);

		this.setState(Object.assign(
			{_prev: this.state},
			data
		));
	
		let newPrice = parseFloat(this.state.PRICE),
			// If we don' have a last price yet, set to current price (mimic 'unchanged')
			prev = this.state._prev.PRICE || this.state.PRICE,
			prevPrice = parseFloat(prev);

		let lastChange = newPrice > prevPrice
			? 'increasing'
			: (newPrice < prevPrice
				? 'decreasing'
				: 'unchanged');

		this.setState({
			lastChange: lastChange === 'unchanged' ? this.state._prev.lastChange : lastChange
		});
	}

	render() {
		
		const {symbol, ...props} = this.props;

		return (
			<div className={'Coin Coin-' + symbol}>
				<div className="Coin-current">
					<span className="Coin-symbol">{this.state.FROMSYMBOL}</span>: <span className={'Coin-price Coin-price-' + this.state.lastChange}>${parseFloat(this.state.PRICE).toFixed(2)}</span>
				</div>
			</div>
		);
	}

}

export default Coin;