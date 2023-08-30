import { getTokenInfo } from "api/ApiProxy.js";

export default class Wallet {
  REFRESH_INTERVAL = 60000;

  constructor(props) {
    this.props = props;
    this.tokens = {};
    this.getTokenInfo = getTokenInfo.bind(this);
  }

  /**
   * For now, 'url' only applies to ERC20 tokens
   */
  addToken(name, symbol, icon, quantity, url, isNft = false) {
    let data = {
      name,
      symbol,
      icon,
      isNft,
      url,
      address: this.props.address,
      isDust: true,
      market: "USD",
      stack: {},
    };

    data.stack[this.props.address] = quantity;

    this.tokens[symbol] = data;
  }

  getTokens() {
    return this.tokens;
  }
}
