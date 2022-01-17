import { Component } from "react";
import { connect } from "react-redux";
import { loadAllOrders } from "../store/interactions";
import { exchangeSelector } from "../store/selectors";
import OrderBook from "./OrderBook";
import Trades from './Trades';

class Content extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    await loadAllOrders(this.props.exchange, dispatch);
  }

  render() {
    return (
      <div className="content bg-secondary">
        <div className="vertical-split">
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
        </div>
        <OrderBook />
        <div className="vertical-split">
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
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
