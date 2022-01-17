/**
 * For personal reference,
 * (Reselect) Selectors, in React, are very much similar to getters in Vuex.
 * You can use these selectors to get data from the state,
 * and you can do any kind of filtering/modification of that data.
 */

import { get } from 'lodash'
import moment from 'moment'
import { createSelector } from 'reselect'
import { ETHER_ADDRESS, tokens, ether, GREEN, RED } from '../helpers'

const account = state => get(state, 'web3.account') // Basically, `state.web3.account`. 
export const accountSelector = createSelector(account, account => account)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract', false)
export const exchangeSelector = createSelector(exchange, e => e)

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(filledOrders, (orders) => {
  // Sort orders by date ascending for price comparison
  orders = orders.sort((a, b) => a.timestamp - b.timestamp)

  orders = decorateFilledOrders(orders)

  // Sort orders by date descending for display
  orders = orders.sort((a, b) => b.timestamp - a.timestamp)
  return orders
})

const decorateFilledOrders = (orders) => {
  // Track previous order to compare history
  let previousOrder = orders[0];
  return (
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateFilledOrder(order, previousOrder)
      previousOrder = order // Update the previous order once it's decorated
      return order
    })
  )
}

const decorateOrder = (order) => {
  // Calculate token and ether amount
  let etherAmount, tokenAmount;

  if (order.tokenGive === ETHER_ADDRESS) {
    etherAmount = order.amountGive;
    tokenAmount = order.amountGet;
  } else {
    etherAmount = order.amountGet;
    tokenAmount = order.amountGive;
  }

  // Calculate token price to 5 decimal places
  const precision = 100000
  let tokenPrice = etherAmount / tokenAmount; // How many ether per token, is the price.
  tokenPrice = Math.round(tokenPrice * precision) / precision;

  return ({
    ...order,
    etherAmount: ether(etherAmount),
    tokenAmount: tokens(tokenAmount),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
  })
}

const decorateFilledOrder = (order, previousOrder) => {
  return ({
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
  })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  // Show green price if only one order exists
  if (previousOrder.id === orderId) {
    return GREEN
  }
  if (previousOrder.tokenPrice <= tokenPrice) {
    // Show green price if order price higher than previous order price
    return GREEN
  } else {
    // Show red price if order price lower than previous order price
    return RED
  }
}

export const contractsLoadedSelector = createSelector(
  tokenLoaded,
  exchangeLoaded,
  (tl, el) => (tl && el)
)