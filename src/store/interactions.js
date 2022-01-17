/**
 * For personal reference,
 * This file is used to use actions and 
 * create `interactions` (A custom terminology, not from React)
 * Here, We handle all of our blockchain interactions by dispatching Redux Actions.
 */

import Web3 from "web3"
import { exchangeLoaded, tokenLoaded, web3AccountLoaded, web3Loaded, cancelledOrdersLoaded, filledOrdersLoaded, allOrdersLoaded } from "./actions"
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'

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