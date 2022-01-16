const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts(); // An array of all arrays provided by ganache
  
  await deployer.deploy(Token); // Deploy Token on blockchain

  const feeAccount = accounts[0];
  const feePercent = 10;

  await deployer.deploy(Exchange, feeAccount, feePercent); // Deploy Exchange on blockchain
};
