import React, { Component } from 'react';

class CoinLabel extends Component {
	
	render() {

		const imageSize = '32',  // '32', etc.
			name = this.props.label || this.props.name,
			logoStyle = {
				backgroundImage: 'url(https://files.coinmarketcap.com/static/img/coins/' + imageSize + 'x' + imageSize + '/' + this.props.name.toLowerCase().replace(/ /g, '-') + '.png)'
			}

		return (
			<div className={'Coin-label Coin-label-' + imageSize}>
				<div className="Coin-logo" style={logoStyle} alt={this.props.name}></div>
				<span className="Coin-name">{name}</span>
			</div>
		);
	}
}

export default CoinLabel;