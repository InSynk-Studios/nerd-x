import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar';
import Content from './Content';
import { loadAccount, loadExchange, loadToken, loadWeb3 } from '../store/interactions';
import { connect } from 'react-redux';
import { contractsLoadedSelector } from '../store/selectors';

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = loadWeb3(dispatch)
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3, dispatch)
    const token = await loadToken(web3, networkId, dispatch)
    if(!token) {
      window.alert('Token smart contract not detected on the current network. Please seleect another network with Metamask.')
      return
    }

    const exchange = await loadExchange(web3, networkId, dispatch)
    if(!exchange) {
      window.alert('Exchange smart contract not detected on the current network. Please seleect another network with Metamask.')
      return
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? <Content /> : <div className='content'></div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state)
  }
}

// Connect function connects the redux store to our app, 
// and allows access to information in component props.
export default connect(mapStateToProps)(App);
