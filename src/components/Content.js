import { Component } from "react";
import { connect } from "react-redux";
import { loadAllOrders, subscribeToEvents } from "../store/interactions";
import { exchangeSelector } from "../store/selectors";
import Balance from "./Balance";
import MyTransactions from "./MyTransactions";
import NewOrder from "./NewOrder";
import OrderBook from "./OrderBook";
import PriceChart from "./PriceChart";
import Trades from './Trades';

class Content extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }

  async loadBlockchainData(props) {
    const { dispatch, exchange } = props
    await loadAllOrders(exchange, dispatch);
    await subscribeToEvents(exchange, dispatch);
  }

  render() {
    return (
      <div className="content bg-secondary">
        <div className="vertical-split">
          <Balance />
          <NewOrder />
        </div>
        <OrderBook />
        <div className="vertical-split">
          <PriceChart />
          <MyTransactions />
        </div>
        <Trades />
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state)
  }
}

// Connect function connects the redux store to our app, 
// and allows access to information in component props.
export default connect(mapStateToProps)(Content);
