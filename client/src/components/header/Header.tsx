import React from 'react';
import NewSession from '../terminal/NewSession';
import { Button } from '@material-ui/core';
import './styles.css';

interface HeaderProps {
  headerTitle ?: string
}

interface HeaderState {
  open: boolean
}

class Header extends React.Component<HeaderProps, HeaderState> {
  state: HeaderState = {
    open: false,
  }

  handleClickClose = () => {
    this.setState({open: false});
  };

  handleClickOpen= () => {
    this.setState({
      open: true,
    });
  };

  renderTerminal() {
    if (this.state.open) {
      return (
      <div className="terminal-component">
        <NewSession open={this.state.open} handleOpen={this.handleClickClose}/>
      </div>
      )
    } else {
      return null;
    }
  }

  render() {
    return (
      <div className="header">
        <h3 className="header-title">
          SSH
        </h3>
        <div className="connect-button">
          <Button color="primary" onClick={this.handleClickOpen}>Start session</Button>
          { this.renderTerminal() }
        </div>
      </div>
    )
  }
}

export default Header;
