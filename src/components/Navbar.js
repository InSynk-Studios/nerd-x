import { Component } from "react";
import { connect } from "react-redux";
import logo from '../assets/nerdx.svg';
import { accountSelector } from "../store/selectors";

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 position-relative">
        <a className="navbar-brand" href="/#">
          <span style={{ height: '35px', display: 'block' }}></span>
          <img
            src={logo}
            className="App-logo position-absolute"
            alt="logo"
            style={{
              height: '45px',
              top: '5px'
            }} />
        </a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <a
              className="nav-link small"
              href={`https://etherscan.io/address/${this.props.account}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {this.props.account}
            </a>
          </li>
        </ul>
      </nav>
    )
  }
}


function mapStateToProps(state) {
  return {
    account: accountSelector(state)
  }
}

// Connect function connects the redux store to our app, 
// and allows access to information in component props.
export default connect(mapStateToProps)(Navbar);
