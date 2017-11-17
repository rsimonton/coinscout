import React, { Component } from 'react';
import CoinLabel from './CoinLabel.jsx';
import CoinPrice from './CoinPrice.jsx';
import { apiSubscribe } from 'api/CryptoCompare/api.js';

import './Coin.css';

class Coin extends Component {
	
	constructor(props) {
		super(props);

		this.label = this.props.label;
		this.name = this.props.name;
		this.symbol = this.props.symbol;	// need a permanent reference
		
		this.state = {};

		this.handleClick = this.handleClick.bind(this);
		this.handleData = this.handleData.bind(this);

		apiSubscribe(
			this.props.exchange,
			this.props.symbol,
			this.props.market,
			this.handleData
		);
	}

	handleClick() {
		window.open('https://coinmarketcap.com/currencies/' + this.props.name.toLowerCase().replace(/ /g, '-') + '/');
	}

	handleData(data) {
		//console.dir(data);
		this.setState(data, function() {
			this.props.onData(data)
		});
	}

	render() {

		const {...props} = this.props;
		const flags = this.state.FLAGS;

		return (
			<div className={'Coin Coin-' + this.symbol} onClick={this.handleClick}>
				<div>					
					<CoinLabel name={this.name} label={this.label} />
					<div className="Coin-data">
						<CoinPrice flags={flags} {...props} />
					</div>
				</div>
			</div>
		);
	}

}

export default Coin;