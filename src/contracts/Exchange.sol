// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./Token.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

/**
    TODO:
    [X] Set the fee percent when we deploy the smart contract
    [X] Set the fee account
    [X] Deposit Ether
    [X] Withdraw Ether
    [X] Deposit tokens
    [X] Withdraw tokens
    [X] Check balances
    [ ] Make order 
    [ ] Cancel order
    [ ] Fill order
    [ ] Charge fees
 */

contract Exchange {
    using SafeMath for uint256;

    address public feeAccount; // the account that receives exchange fees.
    uint256 public feePercent; // the fee percentage.
    address constant ETHER = address(0); // store Ether in tokens mapping with blank address
    mapping(address => mapping(address => uint256)) public tokens; // First key is token address, second is user address (who is depositing token) and value is total no. of tokens deposited by user (basically his balance on the exchange).

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    fallback() external {
        // Fallback function: reverts if Ether is sent to this smart contract address by mistake.
        revert();
    }

    function depositEther() public payable {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value); // Solidity allows you to pay (in ETHER) using metadata `value`, in payable functions.
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) public payable {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }
}
