import React, { Component } from 'react';

class CoinLabel extends Component {

	constructor(props) {
		super(props);
		this.handleLogoClick = this.handleLogoClick.bind(this);
	}

	handleLogoClick(event) {
		event && event.stopPropagation();
		this.props.url && window.open(this.props.url);
	}
	
	render() {

		const { icon, name, symbol, url, ...props } = this.props,
			  priceUpdates = this.props.priceUpdates,
			  logoStyle = {
			      backgroundImage: 'url(' + icon + ')'
			  };

		// Remove 'Network Token' from end of tokens' names, so dumb
		const coinNameNormalized = name.replace(/ Network Token$/, '');

		return (
			<div className="Coin-label">
				<div className="Coin-logo" style={logoStyle} alt={name} title={url} onClick={this.handleLogoClick}></div>
				<div className="Coin-symbol-and-name">
					<span className="Coin-symbol" title={`Updates: ${priceUpdates}`}>{symbol}</span>
					<span className="Coin-name">{coinNameNormalized}</span>
				</div>
			</div>
		);
	}
}

export default CoinLabel;