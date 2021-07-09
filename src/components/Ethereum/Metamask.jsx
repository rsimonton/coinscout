import React, { Component } from 'react';

import { ethers } from "ethers";

import './Metamask.css';

export default class Metamask extends Component {

	constructor(props) {
		super(props);

		this.state = {
			connected: false,
			ethereumEnabled: false
		};

		this.handleButtonClick = this.handleButtonClick.bind(this);
	}

	componentDidMount() {
		window.ethereum.enable().then(() => {
			this.setState({ ethereumEnabled: true });
		});
	}

	handleButtonClick(event) {
		this.provider = new ethers.providers.Web3Provider(window.ethereum);
		this.signer = this.provider.getSigner();
		this.setState({ connected: true });
	}

	render() {

		const connected = this.state.connected;

		return connected
			? 'Connected!'
			: <button onClick={this.handleButtonClick}>Connect Wallet</button>;
	}

}