import React, { Component } from 'react';
import Coin from 'components/Coin/Coin.jsx';
import { apiInit, apiFinalize } from 'api.js';


import logo from './logo.svg';
import './App.css';
import './components/Coin/Coin.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};

    apiInit('wss://streamer.cryptocompare.com');
  }

  componentDidMount() {
    apiFinalize();
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to CoinScout</h2>
        </div>
        <div className="App-coins">
          <Coin exchange="Coinbase" symbol="ETH" to="USD" />
          <Coin exchange="Bitfinex" symbol="OMG" to="USD" />
        </div>
      </div>      
    );
  }
}

export default App;
