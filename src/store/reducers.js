/**
 * For personal reference,
 * Reducers, in React, are a little similar to Vue.js mutations, 
 * but it also has a lot of differences.
 * A reducer is, as you may already know, one function that 
 * accepts the `previous state` and the `action`, and returns the `next state`.
 * 
 * In the following,
 * Each function is a reducer, which are all combined to create a rootReducer.
 */
import { combineReducers } from 'redux'

function web3(state = {}, action) {
  switch (action.type) {
    case 'WEB3_LOADED':
      return { ...state, connection: action.connection }
    case 'WEB3_ACCOUNT_LOADED':
      return { ...state, account: action.account }
    case 'ETHER_BALANCE_LOADED':
      return { ...state, balance: action.balance }
    default:
      return state
  }
}

function token(state = {}, action) {
  switch (action.type) {
    case 'TOKEN_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    case 'TOKEN_BALANCE_LOADED':
      return { ...state, balance: action.balance }
    default:
      return state
  }
}

function exchange(state = {}, action) {
  let index, data;

  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    case 'CANCELLED_ORDERS_LOADED':
      return { ...state, cancelledOrders: { loaded: true, data: action.cancelledOrders } }
    case 'FILLED_ORDERS_LOADED':
      return { ...state, filledOrders: { loaded: true, data: action.filledOrders } }
    case 'ALL_ORDERS_LOADED':
      return { ...state, allOrders: { loaded: true, data: action.allOrders } }
    case 'ORDER_CANCELLING':
      return { ...state, orderCancelling: true }
    case 'ORDER_CANCELLED':
      // Append the cancelled order to the cancelledOrder.data
      return {
        ...state,
        orderCancelling: false,
        cancelledOrders: {
          ...state.cancelledOrders,
          data: [
            ...state.cancelledOrders.data,
            action.order
          ]
        }
      }
    case 'ORDER_FILLED':
      // Prevent duplicate orders
      index = state.filledOrders.data.findIndex(order => order.id === action.order.id)

      if (index === -1) {
        // Only add a new order to data if this order is not present in the filledOrders 
        data = [...state.filledOrders.data, action.order]
      } else {
        data = state.filledOrders.data
      }

      return {
        ...state,
        orderFilling: false,
        filledOrders: {
          ...state.filledOrders,
          data
        }
      }
    case 'ORDER_FILLING':
      return { ...state, orderFilling: true }
    case 'EXCHANGE_ETHER_BALANCE_LOADED':
      return { ...state, etherBalance: action.balance }
    case 'EXCHANGE_TOKEN_BALANCE_LOADED':
      return { ...state, tokenBalance: action.balance }
    case 'BALANCES_LOADING':
      return { ...state, balancesLoading: true }
    case 'BALANCES_LOADED':
      return { ...state, balancesLoading: false }
    case 'ETHER_DEPOSIT_AMOUNT_CHANGED':
      return { ...state, etherDepositAmount: action.amount }
    case 'ETHER_WITHDRAW_AMOUNT_CHANGED':
      return { ...state, etherWithdrawAmount: action.amount }
    case 'TOKEN_DEPOSIT_AMOUNT_CHANGED':
      return { ...state, tokenDepositAmount: action.amount }
    case 'TOKEN_WITHDRAW_AMOUNT_CHANGED':
      return { ...state, tokenWithdrawAmount: action.amount }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  web3,
  token,
  exchange
})

export default rootReducer