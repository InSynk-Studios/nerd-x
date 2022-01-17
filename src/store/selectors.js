/**
 * For personal reference,
 * (Reselect) Selectors, in React, are very much similar to getters in Vuex.
 * You can use these selectors to get data from the state,
 * and you can do any kind of filtering/modification of that data.
 */

import { get } from 'lodash'
import { createSelector } from 'reselect'

const account = state => get(state, 'web3.account') // Basically, `state.web3.account`. 
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