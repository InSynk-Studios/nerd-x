import { Component } from "react";
import { connect } from "react-redux";
import MetamaskLogo from '../assets/metamask-fox.svg'
import { loginMetamask } from '../store/interactions';

class WalletConnection extends Component {
  render() {
    return (
      <div className="content bg-secondary">
        <button
          className="btn btn-dark btn-block btn-sm px-4 my-auto"
          onClick={() => loginMetamask(this.props.dispatch)}
          style={{
            height: '70px',
            cursor: 'pointer'
          }}
        >
          <img
            src={MetamaskLogo}
            className="me-2"
            alt="logo"
            style={{
              height: '40px',
              top: '40px'
            }}
          />
          Connect to Metamask
        </button>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
  }
}

// Connect function connects the redux store to our app, 
// and allows access to information in component props.
export default connect(mapStateToProps)(WalletConnection);
