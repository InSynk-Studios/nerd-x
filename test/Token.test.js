import { EVM_REVERT, tokens } from './helpers'
require('chai').use(require('chai-as-promised')).should()

const Token = artifacts.require("./Token")

contract('Token', ([deployer, receiver, exchange]) => {
    const name = 'NerdX Token';
    const symbol = 'NEX';
    const decimals = '18';
    const totalSupply = tokens(1000000).toString();

    let token;

    beforeEach(async () => {
        token = await Token.new()
    })

    describe('deployment', () => {
        it('tracks the name', async () => {
            // const token = await Token.new()
            const result = await token.name()
            result.should.equal(name);
        })

        it('tracks the symbol', async () => {
            // const token = await Token.new()
            const result = await token.symbol()
            result.should.equal(symbol);
        })
        it('tracks the decimals', async () => {
            const result = await token.decimals()
            result.toString().should.equal(decimals);
        })
        it('tracks the total supply', async () => {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply);
        })
        it('assigns total supply to the deployer', async () => {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply);
        })
    })

    describe("sending tokens", () => {
        let amount, result;

        describe("success", async () => {
            beforeEach(async () => {
                amount = tokens(100);
                // Transfer
                result = await token.transfer(receiver, amount, { from: deployer }) // { from: deployer } is a metadata that we provide for the function to derive msg.sender from it. It is a web3.js concept.
            })

            it('transfers token balances', async () => {
                let balanceOf;
                balanceOf = await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999900).toString())
                balanceOf = await token.balanceOf(receiver);
                balanceOf.toString().should.equal(tokens(100).toString())
            })

            it("emits a Transfer event", async () => {
                const log = result.logs[0];
                log.event.should.equal("Transfer");
                const event = log.args;
                event.from.toString().should.equal(deployer, "from is correct");
                event.to.should.equal(receiver, "to is correct");
                event.value.toString().should.equal(amount.toString(), "value is correct");
            })
        })

        describe("failure", async () => {

            it('rejects insufficient balances', async () => {
                let invalidAmount
                invalidAmount = tokens(10000000) // 100 million - greater than the totalSupply
                await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT)

                // Attempt transfer tokens, when you have none
                invalidAmount = tokens(10) // recipient has no tokens
                await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects invalid recipients', async () => {
                await token.transfer(0x0, amount, { from: deployer }).should.be.rejected;
            })
        })
    })

    describe("approving tokens", () => {
        let result
        let amount

        beforeEach(async () => {
            amount = tokens(100)
            result = await token.approve(exchange, amount, { from: deployer })
        })

        describe("success", () => {
            it("allocates an allowance for delegated token spending on an exchange", async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString())
            })

            it("emits an Approval event", async () => {
                const log = result.logs[0];
                log.event.should.equal("Approval");
                const event = log.args;
                event.owner.toString().should.equal(deployer, "owner is correct");
                event.spender.should.equal(exchange, "spender is correct");
                event.value.toString().should.equal(amount.toString(), "value is correct");
            })
        })

        describe("failure", () => {
            it('rejects invalid recipients', async () => {
                await token.transfer(0x0, amount, { from: deployer }).should.be.rejected;
            })
        })
    })

    describe("delegated token transfer", () => {
        let amount, result;

        beforeEach(async () => {
            amount = tokens(100);
            // Approve
            result = await token.approve(exchange, amount, { from: deployer }) // { from: deployer } is a metadata that we provide for the function to derive msg.sender from it. It is a web3.js concept.
        })

        describe("success", async () => {
            beforeEach(async () => {
                // Transfer
                result = await token.transferFrom(deployer, receiver, amount, { from: exchange }) // { from: deployer } is a metadata that we provide for the function to derive msg.sender from it. It is a web3.js concept.
            })

            it('transfers token balances', async () => {
                let balanceOf;
                balanceOf = await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999900).toString())
                balanceOf = await token.balanceOf(receiver);
                balanceOf.toString().should.equal(tokens(100).toString())
            })

            it("resets the allowance", async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal('0')
            })

            it("emits a Transfer event", async () => {
                const log = result.logs[0];
                log.event.should.equal("Transfer");
                const event = log.args;
                event.from.toString().should.equal(deployer, "from is correct");
                event.to.should.equal(receiver, "to is correct");
                event.value.toString().should.equal(amount.toString(), "value is correct");
            })
        })

        describe("failure", async () => {
            it('rejects insufficient amounts', async () => {
                let invalidAmount
                invalidAmount = tokens(1000000000) // greater than the totalSupply and allowance
                await token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects invalid recipients', async () => {
                await token.transfer(deployer, 0x0, amount, { from: exchange }).should.be.rejected;
            })
        })
    })
})