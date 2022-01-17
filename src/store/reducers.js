import { combineReducers } from 'redux'

function web3(state = {}, action) {
  switch (action.type) {
    // TODO: Update the state
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
    // TODO: Update the state
    case 'TOKEN_LOADED':
      return { ...state, contract: action.contract }
    default:
      return state
  }
}

function exchange(state = {}, action) {
  switch (action.type) {
    // TODO: Update the state
    case 'EXCHANGE_LOADED':
      return { ...state, contract: action.contract }
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