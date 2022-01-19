/**
 * For personal reference,
 * This file is used to use actions and 
 * create `interactions` (A custom terminology, not from React)
 * Here, We handle all of our blockchain interactions by dispatching Redux Actions.
 */

import Web3 from "web3"
import {
  exchangeLoaded,
  tokenLoaded,
  web3AccountLoaded,
  web3Loaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded,
  orderCancelling,
  orderCancelled,
  orderFilling,
  orderFilled,
  etherBalanceLoaded,
  tokenBalanceLoaded,
  exchangeEtherBalanceLoaded,
  exchangeTokenBalanceLoaded,
  balancesLoaded,
  balancesLoading
} from "./actions"
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { ETHER_ADDRESS } from "../helpers"

export const loadWeb3 = (dispatch) => {
  const web3 = new Web3(window.ethereum)
  dispatch(web3Loaded(web3))
  return web3
}

export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts()
  const account = accounts[0]
  dispatch(web3AccountLoaded(account))
  return account
}

export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
    dispatch(tokenLoaded(token))
    return token
  } catch (error) {
    console.log("Contract not deployed to the current network. Please select another network in Metamask.")
    return null
  }
}

export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
    dispatch(exchangeLoaded(exchange))
    return exchange
  } catch (error) {
    console.log("Contract not deployed to the current network. Please select another network in Metamask.")
    return null
  }
}

export const loadAllOrders = async (exchange, dispatch) => {
  // Fetch cancelled orders with the "Cancel" event stream
  const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
  const cancelledOrders = await cancelStream.map((event) => event.returnValues)
  dispatch(cancelledOrdersLoaded(cancelledOrders))

  // Fetch the filled orders (also called trades) with the "Trade" event stream
  const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
  const filledOrders = await tradeStream.map((event) => event.returnValues)
  dispatch(filledOrdersLoaded(filledOrders))

  // Fetch all orders with the "Order" event stream
  const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
  const allOrders = await orderStream.map((event) => event.returnValues)
  dispatch(allOrdersLoaded(allOrders))
}

export const cancelOrder = async (dispatch, exchange, order, account) => {
  /** 
   * We are using the event emitter approach to handle this async call.
   * This means we have access to several lifecyle (of a transaction) events.
   */
  exchange.methods.cancelOrder(order.id).send({ from: account })
    .on('transactionHash', (hash) => {
      /**
       * This event means, that transaction has occurred and 
       * we get the transaction hash now.
       */
      dispatch(orderCancelling())
    })
    .on('error', (error) => {
      console.log(error)
      window.alert('There was an error.')
    })
}

export const fillOrder = async (dispatch, exchange, order, account) => {
  /** 
   * We are using the event emitter approach to handle this async call.
   * This means we have access to several lifecyle (of a transaction) events.
   */
  exchange.methods.fillOrder(order.id).send({ from: account })
    .on('transactionHash', (hash) => {
      /**
       * This event means, that transaction has occurred and 
       * we get the transaction hash now.
       */
      dispatch(orderFilling())
    })
    .on('error', (error) => {
      console.log(error)
      window.alert('There was an error.')
    })
}

export const subscribeToEvents = async (exchange, dispatch) => {
  exchange.events.Cancel({}, (err, event) => {
    dispatch(orderCancelled(event.returnValues))
  })

  exchange.events.Trade({}, (err, event) => {
    dispatch(orderFilled(event.returnValues))
  })

  exchange.events.Deposit({}, (err, event) => {
    dispatch(balancesLoaded())
  })

  exchange.events.Withdraw({}, (err, event) => {
    dispatch(balancesLoaded())
  })
}

export const loadBalances = async (dispatch, web3, exchange, token, account) => {
  // Ether balance in wallet
  const etherBalance = await web3.eth.getBalance(account)
  dispatch(etherBalanceLoaded(etherBalance))

  // Token balance in wallet
  const tokenBalance = await token.methods.balanceOf(account).call()
  dispatch(tokenBalanceLoaded(tokenBalance))

  // Ether balance in exchange
  const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
  dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))

  // Token balance in exchange
  const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
  dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

  // Trigger all balances loaded
  dispatch(balancesLoaded())
}

export const depositEther = (dispatch, exchange, web3, amount, account) => {
  exchange.methods.depositEther().send({ from: account, value: web3.utils.toWei(amount, 'ether') })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error', (error) => {
      console.log(error)
      window.alert('There was an error.')
    })
}

export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
  exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error', (error) => {
      console.log(error)
      window.alert('There was an error.')
    })
}

export const depositToken = (dispatch, exchange, web3, token, amount, account) => {
  amount = web3.utils.toWei(amount, 'ether')

  token.methods.approve(exchange.options.address, amount).send({ from: account })
    .on('transactionHash', (hash) => {
      exchange.methods.depositToken(token.options.address, amount).send({ from: account })
        .on('transactionHash', (hash) => {
          dispatch(balancesLoading())
        })
        .on('error', (error) => {
          console.log(error)
          window.alert('There was an error.')
        })
    })
}

export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
  exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error', (error) => {
      console.log(error)
      window.alert('There was an error.')
    })
}