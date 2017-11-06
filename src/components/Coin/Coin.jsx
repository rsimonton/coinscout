import React, { Component } from 'react';
import CoinPrice from 'components/Coin/CoinPrice.jsx';
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

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		window.open('https://coinmarketcap.com/currencies/' + this.props.name.toLowerCase().replace(/ /g, '-') + '/');
	}

	handleData(data) {
		//console.dir(data);
		data.FLAGS === '4' && delete data.FLAGS;
		this.setState(data);
	}

	render() {

		let {onClick, ...props} = this.props;

		return (
			<div className={'Coin Coin-' + this.props.symbol} onClick={this.handleClick}>
				<div className="Coin-current">
					<div className="Coin-pair">{this.state.FROMSYMBOL} / {this.state.TOSYMBOL}</div>
					<CoinPrice flags={this.state.FLAGS} symbol={this.state.TOSYMBOL} price={this.state.PRICE} />
				</div>
			</div>
		);
	}

}

export default Coin;