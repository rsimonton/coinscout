import React, { Component } from 'react';

export default class PriceHistory extends Component {

	constructor(props) {
		super(props);
		this.state = Object.assign(UserPrefs.defaults, props);
	}

	componentDidMount() {
		console.log('UserPrefs:');
		console.dir(this.state);
	}

	render() {

		const ticks = this.props.history.map((tick, index) {
			<PriceTick {...tick} />
		});

		<div id="price-history">
			<ul class="ticks">
				{ticks}
			</ul>
		</div>
	}

}