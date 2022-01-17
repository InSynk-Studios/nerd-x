import { get } from 'lodash' // To get a default value if web3 doesn't exist
import { createSelector } from 'reselect'

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, account => account)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

export const contractsLoadedSelector = createSelector(
  tokenLoaded,
  exchangeLoaded,
  (tl, el) => (tl && el)
)