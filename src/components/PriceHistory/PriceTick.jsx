import React, { Component } from 'react';

export default class PriceTick extends Component {

	render() {

		const {price, type, timestamp, ...tick} = this.props;

		return {
			<li className={"tick " + type}>
				<span className="change-price"></span>
				<span className="change-percent"</span>
				<span className="prcie"></span>
			</li>
		}
	}

}