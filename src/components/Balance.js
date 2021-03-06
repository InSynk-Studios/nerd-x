import { Component } from "react";
import { connect } from "react-redux";
import {
  web3Selector,
  exchangeSelector,
  tokenSelector,
  accountSelector,
  etherBalanceSelector,
  tokenBalanceSelector,
  exchangeEtherBalanceSelector,
  exchangeTokenBalanceSelector,
  balancesLoadingSelector,
  etherDepositAmountSelector,
  etherWithdrawAmountSelector,
  tokenDepositAmountSelector,
  tokenWithdrawAmountSelector
} from "../store/selectors";
import {
  depositEther,
  withdrawEther,
  depositToken,
  withdrawToken
} from "../store/interactions";
import Spinner from './Spinner';
import { Tabs, Tab } from "react-bootstrap";
import {
  etherDepositAmountChanged,
  etherWithdrawAmountChanged,
  tokenDepositAmountChanged,
  tokenWithdrawAmountChanged
} from "../store/actions";

const renderForm = (props) => {
  const {
    dispatch,
    etherBalance,
    exchangeEtherBalance,
    tokenBalance,
    exchangeTokenBalance,
    etherDepositAmount,
    etherWithdrawAmount,
    tokenDepositAmount,
    tokenWithdrawAmount,
    exchange,
    web3,
    account,
    token
  } = props

  return (
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
      <Tab eventKey="deposit" title="Deposit" className="bg-dark">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{exchangeEtherBalance}</td>
            </tr>
          </tbody>
        </table>

        <form className="row px-1" onSubmit={(event) => {
          event.preventDefault()
          depositEther(dispatch, exchange, web3, etherDepositAmount, account)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={(e) => dispatch(etherDepositAmountChanged(e.target.value))}
              className="form-control form-control-sm bg-dark text-white mb-2"
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button
              type="submit"
              className="btn btn-primary btn-block btn-sm"
            >Deposit</button>
          </div>
        </form>

        <table className="table table-dark table-sm small">
          <tbody>
            <tr>
              <td>NEX</td>
              <td>{tokenBalance}</td>
              <td>{exchangeTokenBalance}</td>
            </tr>
          </tbody>
        </table>

        <form className="row px-1" onSubmit={(event) => {
          event.preventDefault()
          depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="NEX Amount"
              onChange={(e) => dispatch(tokenDepositAmountChanged(e.target.value))}
              className="form-control form-control-sm bg-dark text-white mb-2"
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button
              type="submit"
              className="btn btn-primary btn-block btn-sm"
            >Deposit</button>
          </div>
        </form>
      </Tab>
      <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{exchangeEtherBalance}</td>
            </tr>
          </tbody>
        </table>

        <form className="row px-1" onSubmit={(event) => {
          event.preventDefault()
          withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={(e) => dispatch(etherWithdrawAmountChanged(e.target.value))}
              className="form-control form-control-sm bg-dark text-white mb-2"
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button
              type="submit"
              className="btn btn-primary btn-block btn-sm"
            >Withdraw</button>
          </div>
        </form>

        <table className="table table-dark table-sm small">
          <tbody>
            <tr>
              <td>NEX</td>
              <td>{tokenBalance}</td>
              <td>{exchangeTokenBalance}</td>
            </tr>
          </tbody>
        </table>

        <form className="row px-1" onSubmit={(event) => {
          event.preventDefault()
          withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="NEX Amount"
              onChange={(e) => dispatch(tokenWithdrawAmountChanged(e.target.value))}
              className="form-control form-control-sm bg-dark text-white mb-2"
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button
              type="submit"
              className="btn btn-primary btn-block btn-sm"
            >Withdraw</button>
          </div>
        </form>
      </Tab>
    </Tabs>
  )
}

class Balance extends Component {
  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Balance
        </div>
        <div className="card-body">
          {this.props.showForm ? renderForm(this.props) : <Spinner />}
        </div>
      </div>
    )
  }
}


function mapStateToProps(state) {
  const balancesLoading = balancesLoadingSelector(state)
  return {
    account: accountSelector(state),
    token: tokenSelector(state),
    exchange: exchangeSelector(state),
    web3: web3Selector(state),
    etherBalance: etherBalanceSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    balancesLoading,
    showForm: !balancesLoading,
    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountSelector(state)
  }
}

// Connect function connects the redux store to our app, 
// and allows access to information in component props.
export default connect(mapStateToProps)(Balance);
