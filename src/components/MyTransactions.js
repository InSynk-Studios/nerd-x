import React, { Component } from "react";
import { connect } from "react-redux";
import { Tab, Tabs } from 'react-bootstrap';
import {
  accountSelector,
  exchangeSelector,
  myFilledOrdersLoadedSelector,
  myFilledOrdersSelector,
  myOpenOrdersLoadedSelector,
  myOpenOrdersSelector,
  orderCancellingSelector
} from "../store/selectors";
import Spinner from "./Spinner";
import { cancelOrder } from "../store/interactions";

const renderMyFilledOrders = (props) => {
  const { myFilledOrders } = props
  return (
    <tbody>
      {myFilledOrders.map((order) => {
        return (
          <tr key={order.id}>
            <td className="text-muted">{order.formattedTimestamp}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
          </tr>
        )
      })}
    </tbody>
  )
}

const renderMyOpenOrders = (props) => {
  const { myOpenOrders, dispatch, exchange, account } = props

  return (
    <tbody>
      {myOpenOrders.map((order) => {
        return (
          <tr key={order.id}>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
            <td
              className="text-muted cancel-order"
              onClick={(e) => {
                cancelOrder(dispatch, exchange, order, account)
              }}
            >X</td>
          </tr>
        )
      })}
    </tbody>
  )
}

class Navbar extends Component {
  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          My Transactions
        </div>
        <div className="card-body">
          <Tabs defaultActiveKey="trades" className="bg-dark text-white">
            <Tab eventKey="trades" title="Trades" className="bg-dark">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>NEX</th>
                    <th>NEX/ETH</th>
                  </tr>
                </thead>
                {this.props.showMyFilledOrders ? renderMyFilledOrders(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
            <Tab eventKey="orders" title="Orders">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>NEX/ETH</th>
                    <th>Cancel</th>
                  </tr>
                </thead>
                {this.props.showMyOpenOrders ? renderMyOpenOrders(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}


function mapStateToProps(state) {
  const myOpenOrdersLoaded =  myOpenOrdersLoadedSelector(state)
  const orderCancelling = orderCancellingSelector(state)

  return {
    myFilledOrders: myFilledOrdersSelector(state),
    showMyFilledOrders: myFilledOrdersLoadedSelector(state),
    myOpenOrders: myOpenOrdersSelector(state),
    showMyOpenOrders: myOpenOrdersLoaded && !orderCancelling,
    exchange: exchangeSelector(state),
    account: accountSelector(state)
  }
}

// Connect function connects the redux store to our app, 
// and allows access to information in component props.
export default connect(mapStateToProps)(Navbar);
