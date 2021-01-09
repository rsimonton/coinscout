import React, { Component } from 'react';

import './SettingsPanel.css';

class SettingsPanel extends Component {

	constructor(props) {
		super(props);

		this.state = props.settings;

		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {

	}

	handleChange(event) {
		const setting = event.target.attributes['data-setting'].value,
			  value = event.target.localName === 'input' ? event.target.checked : event.target.value;

		let newState = {};

		newState[setting] = value;

		this.setState(newState, function() {
			this.props.onChange && this.props.onChange(newState);
		});
	}
	
	render() {

		const marketCapSite = this.state.marketCapSite,
			  showWatchList = this.state.showWatchList,
			  showBalances = this.state.showBalances,
			  showStack = this.state.showStack;

		return (
			<div className={'Settings-panel' + (this.props.isOpen ? ' open' : '')}>
				
				<div className="Setting">
					<label>Market Cap Site:&nbsp;
						<select
							className={'Market-cap-site'}
							data-setting="marketCapSite"
							onChange={this.handleChange}
							value={marketCapSite}>
								<option>CoinGecko</option>
								<option>CoinPaprika</option>
								<option>CoinMarketCap</option>
								<option>CryptoCompare</option>
								<option>LiveCoinWatch</option>
								<option>Messari</option>
						</select>
					</label>
				</div>

				<div className="Setting">
					<label>
						<input
							type="checkbox"
							data-setting="showStack"
							defaultChecked={showStack}
							onChange={this.handleChange} />
						Show Stack
					</label>
				</div>

				<div className="Setting">
					<label>
						<input
							type="checkbox"
							data-setting="showBalances"
							defaultChecked={showBalances}
							onChange={this.handleChange} />
						Show Balances
					</label>
				</div>

				<div className="Setting">
					<label>
						<input
							type="checkbox"
							data-setting="showWatchList"
							defaultChecked={showWatchList}
							onChange={this.handleChange} />
						Show Watch List
					</label>
				</div>
				
			</div>
		);
	}

}

export default SettingsPanel;