import React, { Component } from 'react';
import './app.scss';
import Navbar from './Navbar';
import Content from './Content';
import WalletConnection from './WalletConnection';
import { loadBalances, loadExchange, loadToken, loadWeb3 } from '../store/interactions';
import { connect } from 'react-redux';
import { accountSelector, contractsLoadedSelector } from '../store/selectors';

const renderContent = (props) => {
  const { contractsLoaded, account } = props
  if (contractsLoaded) {
    return (<Content />)
  }
  if (!account) {
    return (<WalletConnection />)
  }
  return (<div className='content'></div>)
}

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    if (this.props.account) {
      const networkId = await web3.eth.net.getId()

      /**
       * Load account, token, exchange and balances.
       * Alert the user if any of the above is not loaded.
       */
      const token = await loadToken(web3, networkId, dispatch)
      if (!token) {
        window.alert('Token smart contract not detected on the current network. Please seleect another network with Metamask.')
        return
      }

      const exchange = await loadExchange(web3, networkId, dispatch)
      if (!exchange) {
        window.alert('Exchange smart contract not detected on the current network. Please seleect another network with Metamask.')
        return
      }

      await loadBalances(dispatch, web3, exchange, token, this.props.account);

      /**
       * If account changed in Metamask,
       * Reload web3 and balances.
       */
      window.ethereum.on('accountsChanged', async () => {
        await loadWeb3(dispatch)
        await loadBalances(dispatch, web3, exchange, token, this.props.account)
      });

      /**
       * If network changed in Metamask,
       * reload the web page.
       */
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        {renderContent(this.props)}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state),
    account: accountSelector(state)
  }
}

// Connect function connects the redux store to our app, 
// and allows access to information in component props.
export default connect(mapStateToProps)(App);
