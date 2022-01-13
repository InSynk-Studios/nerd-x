// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract Token {
    using SafeMath for uint;

    // Variables
    string public name = "NerdX Token";
    string public symbol = "NEX";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance; // First address is of the approver, second address of the exchanges or addresses that are allowed, uint is the allowance amount (how much can they spend).

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor() {
        totalSupply = 1000000 * (10**decimals);
        balanceOf[msg.sender] = totalSupply; // Solidity has global variables like `msg`
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        /**
            _to: who are we transferring token to.
            _value: how many tokens.
         */
        require(balanceOf[msg.sender] >= _value);
        _transfer(msg.sender, _to, _value);
        return true;
    }

    // Approve tokens
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal {
        require(_to != address(0));
        balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(_from, _to, _value);
    }

    // Transfer from
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _transfer(_from, _to, _value);
        return true;
    }
}
