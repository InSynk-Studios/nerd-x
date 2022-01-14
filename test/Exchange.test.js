import { ether, ETHER_ADDRESS, EVM_REVERT, tokens } from './helpers'
require('chai').use(require('chai-as-promised')).should()

const Token = artifacts.require("./Token")
const Exchange = artifacts.require("./Exchange")

contract('Exchange', ([deployer, feeAccount, user1]) => {
  let token;
  let exchange;
  const feePercent = 10; // 10% fees

  beforeEach(async () => {
    // Deploy token
    token = await Token.new();

    // Transfer some tokens to user 1
    token.transfer(user1, tokens(100), { from: deployer })

    // Deploy exchange
    exchange = await Exchange.new(feeAccount, feePercent)
  })

  describe('deployment', () => {
    it('tracks the fee account', async () => {
      const result = await exchange.feeAccount()
      result.should.equal(feeAccount);
    })
    it('tracks the fee percent', async () => {
      const result = await exchange.feePercent()
      result.toString().should.equal(feePercent.toString());
    })
  })

  describe("fallback", () => {
    it('reverts when Ether is sent directly (without deposit function)', async () => {
      await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
    })
  })

  describe('depositing ether', async () => {
    let result;
    let amount;
    beforeEach(async () => {
      amount = ether(1);
      result = await exchange.depositEther({ from: user1, value: amount })
    })

    it('tracks the ether deposit', async () => {
      // Balance of the exchange after deposit.
      const balance = await exchange.tokens(ETHER_ADDRESS, user1);
      balance.toString().should.equal(amount.toString());
    })

    it("emits a Deposit event", async () => {
      const log = result.logs[0];
      log.event.should.equal("Deposit");
      const event = log.args;
      event.token.toString().should.equal(ETHER_ADDRESS, "ether address is correct");
      event.user.should.equal(user1, "user address is correct");
      event.amount.toString().should.equal(amount.toString(), "amount is correct");
      event.balance.toString().should.equal(amount.toString(), "balance is correct");
    })
  })

  describe("withdrawing Ether", async () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(1);
      await exchange.depositEther({ from: user1, value: amount })
    })

    describe("success", async () => {
      beforeEach(async () => {
        // Withdraw Ether
        result = await exchange.withdrawEther(amount, { from: user1 });
      })

      it("withdraws Ether funds", async () => {
        const balance = await exchange.tokens(ETHER_ADDRESS, user1);
        balance.toString().should.equal("0")
      })

      it("emits a Withdraw event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Withdraw");
        const event = log.args;
        event.token.toString().should.equal(ETHER_ADDRESS, "ether address is correct");
        event.user.should.equal(user1, "user address is correct");
        event.amount.toString().should.equal(amount.toString(), "amount is correct");
        event.balance.toString().should.equal("0", "balance is correct");
      })
    })

    describe("failure", async () => {
      it("rejects withdraws for insufficient balances", async () => {
        await exchange.withdrawEther(ether(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
      })
    })
  })

  describe('depositing tokens', () => {
    let result;
    let amount = tokens(10);

    describe("success", () => {
      beforeEach(async () => {
        await token.approve(exchange.address, amount, { from: user1 })
        result = await exchange.depositToken(token.address, tokens(10), { from: user1 })
      })

      it('tracks the token deposit', async () => {
        // Balance of the exchange after deposit.
        let balance = await token.balanceOf(exchange.address);
        balance.toString().should.equal(amount.toString());

        // Balance of user1, on the exchange, after deposit.
        balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      })

      it("emits a Deposit event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Deposit");
        const event = log.args;
        event.token.toString().should.equal(token.address, "token address is correct");
        event.user.should.equal(user1, "user address is correct");
        event.amount.toString().should.equal(amount.toString(), "amount is correct");
        event.balance.toString().should.equal(amount.toString(), "balance is correct");
      })
    })

    describe("failure", () => {
      it('rejects ether deposits', async () => {
        await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
      })
      it('tracks the token deposit', async () => {
        // Don't approve any tokens after depositing
        await exchange.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
      })
    })
  })

  describe("withdrawing tokens", async () => {
    let result;
    let amount;

    describe("success", async () => {
      beforeEach(async () => {
        amount = tokens(10)
        await token.approve(exchange.address, amount, { from: user1 })
        await exchange.depositToken(token.address, amount, { from: user1 })

        result = await exchange.withdrawToken(token.address, amount, { from: user1 })
      })

      it("withdraws token funds", async () => {
        const balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal("0")
      })

      it("emits a Withdraw event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Withdraw");
        const event = log.args;
        event.token.toString().should.equal(token.address, "token address is correct");
        event.user.should.equal(user1, "user address is correct");
        event.amount.toString().should.equal(amount.toString(), "amount is correct");
        event.balance.toString().should.equal("0", "balance is correct");
      })
    })

    describe("failure", async () => {
      it("rejects Ether withdraw", async () => {
        await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
      })
      it("fails for insufficient balances", async () => {
        // Attempt to withdraw tokens without depositing any first.
        await exchange.withdrawToken(token.address, tokens(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
      })
    })
  })

  describe("checking balances", () => {
    beforeEach(async () => {
      await exchange.depositEther({ from: user1, value: ether(1) });
    })

    it('returns user balance', async () => {
      const result = await exchange.balanceOf(ETHER_ADDRESS, user1);
      result.toString().should.equal(ether(1).toString())
    })
  })
})