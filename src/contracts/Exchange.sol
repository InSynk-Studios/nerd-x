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
    [X] Make order 
    [X] Cancel order
    [X] Fill order
    [X] Charge fees
 */

contract Exchange {
    using SafeMath for uint256;

    address public feeAccount; // the account that receives exchange fees.
    uint256 public feePercent; // the fee percentage.
    address constant ETHER = address(0); // store Ether in tokens mapping with blank address
    uint256 public orderCount;

    // Stores all the tokens mapped to the users who deposited those tokens, and how much.
    mapping(address => mapping(address => uint256)) public tokens; // First key is token address, second is user address (who is depositing token) and value is total no. of tokens deposited by user (basically his balance on the exchange).

    // Stores all the generated orders, mapped to the order id as key.
    mapping(uint256 => _Order) public orders; // uint256 is the id, attached to _Order
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );

    struct _Order {
        /**
        A model for the order.
       */
        uint256 id;
        address user;
        address tokenGet; // Address of Token they are giving
        uint256 amountGet; // Amount of Token they are giving
        address tokenGive; // Address of Token they wanna get in exchange
        uint256 amountGive; // Amount of Token they wanna get in exchange
        uint256 timestamp; // Time of order creation
    }

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

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        /**
        Make an order and store in the orders mapping.
       */
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id]; // storage means that we are fetching it from storage on blockchain.
        require(address(_order.user) == msg.sender); // Order should be cancelled by the creator.
        require(_order.id == _id); // Order must exist.
        orderCancelled[_id] = true;
        emit Cancel(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
        );
    }

    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount);
        require(!orderFilled[_id]);
        require(!orderCancelled[_id]);
        _Order storage _order = orders[_id];
        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );
        orderFilled[_order.id] = true;
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        /**
          Function to make the trade.
          - Fee paid by the user that fills the order, a.k.a. `msg.sender`.
          - Fee deducted from `_amountGet`.
          - Fee added to `feeAccount`.
       */

        uint256 _feeAmount = _amountGive.mul(feePercent).div(100);

        // Give token to the order creator, that he wanted to "get"
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(
            _amountGet.add(_feeAmount)
        ); // `msg.sender` is the one who is filling the order.
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet); // `_user` is the one who created the order.

        // Collect the fees
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(
            _feeAmount
        );

        // Take token from the order creator, that he wanted to "give" in return
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(
            _amountGive
        );

        // Emit a trade event
        emit Trade(
            _orderId,
            _user,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            msg.sender,
            block.timestamp
        );
    }
}
