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

		const icon = this.props.icon,
			  name = this.props.name,
			  url = this.props.url,
			  size = 32,
			  priceUpdates = this.props.priceUpdates,
			  logoStyle = {
			      backgroundImage: 'url(' + icon + ')'
			  };

		return (
			<div className={'Coin-label Coin-label-' + size}>
				<div className="Coin-logo" style={logoStyle} alt={name} title={url} onClick={this.handleLogoClick}></div>
				<span className="Coin-name" title={`Updates: ${priceUpdates}`}>{name}</span>
			</div>
		);
	}
}

export default CoinLabel;