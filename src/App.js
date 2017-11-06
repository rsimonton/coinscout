import React, { Component } from 'react';

import ApiManager from 'api/ApiManager.js';
import Coin from 'components/Coin/Coin.jsx';
import { apiInit, apiFinalize } from 'api/CryptoCompare/api.js';

import coinConfig from 'config/coins.js';
import logo from './logo.svg';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {coinConfig: coinConfig};

    this.apiManager = new ApiManager();

    apiInit();
  }

  componentDidMount() {
    apiFinalize();

    /* A succesful experiment - reorder Coin elements iu UI based on symbol after 3 seconds -- cool!
    let self = this;
    window.setTimeout(function() {
      coinConfig.sort(function(a,b) {
        return a.symbol < b.symbol ? -1 : (a.symbol === b.symbol ? 0 : 1);
      });

      self.setState({coinConfig: coinConfig});
    }, 3000);
    */
  }

  render() {

    // Ok React, this is pretty rad - render Coins from JSON config array, write into variable
    const coins = this.state.coinConfig.map((coin, index) =>
      <Coin name={coin.name} key={coin.symbol} exchange={coin.exchange} symbol={coin.symbol} to={coin.per} />
    );

    return (
      <div className="App">

        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to CoinScout</h2>
        </div>
      
        <div className="App-content">
          <div className="App-coins">
            {coins}
          </div>
        </div>
      
        <div className="App-footer">
          Data Courtesy of <a className="attribution" href="https://www.cryptocompare.com/">CryptoCompare.com</a>
        </div>
      
      </div>      
    );
  }
}

export default App;
