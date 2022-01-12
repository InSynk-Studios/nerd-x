require('chai').use(require('chai-as-promised')).should()
const Token = artifacts.require("./Token")

contract('Token', (accounts) => {
    const name = 'NerdX Token';
    const symbol = 'NEX';
    const decimals = '18';
    const totalSupply = '1000000000000000000000000';

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
    })
})