import React, { Component } from 'react';

class CoinLabel extends Component {
	
	render() {

		const icon = this.props.icon,
			  name = this.props.name,
			  size = 32,
			  logoStyle = {
			      backgroundImage: 'url(https://www.cryptocompare.com' + icon + ')'
			  };

		return (
			<div className={'Coin-label Coin-label-' + size}>
				<div className="Coin-logo" style={logoStyle} alt={name}></div>
				<span className="Coin-name">{name}</span>
			</div>
		);
	}
}

export default CoinLabel;