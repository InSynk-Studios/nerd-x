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
    default:
      return state
  }
}

function token(state = {}, action) {
  switch (action.type) {
    case 'TOKEN_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state
  }
}

function exchange(state = {}, action) {
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    case 'CANCELLED_ORDERS_LOADED':
      return { ...state, cancelledOrders: { loaded: true, data: action.cancelledOrders } }
    case 'FILLED_ORDERS_LOADED':
      return { ...state, filledOrders: { loaded: true, data: action.filledOrders } }
    case 'ALL_ORDERS_LOADED':
      return { ...state, allOrders: { loaded: true, data: action.allOrders } }
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