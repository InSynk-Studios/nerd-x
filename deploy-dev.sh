#!/bin/sh

printf "\n\033[0;96m>> Deploying smart contracts on local blockchain\033[0m\n"
truffle migrate --reset

printf "\n\033[0;96m>> Filling NerdX with seed data\033[0m\n"
truffle exec scripts/seed-exchange.js

printf "\n\033[0;92m>> Success!!\033[0m\n"