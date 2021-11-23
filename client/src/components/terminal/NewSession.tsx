import React from 'react';
import ConnectionService from '../../services/connection';
import IConnection from '../../models/connection';
import { Button, Dialog, DialogTitle,
  DialogContent, DialogContentText,
  DialogActions, TextField, IconButton, Paper
  } from '@material-ui/core';
import Stack from '@mui/material/Stack'
import Xtermjs from './Xtermjs';
import { Terminal as TerminalType } from 'xterm';
import CloseIcon from '@material-ui/icons/Close';
import ZoomOutMap from '@material-ui/icons/ZoomOutMap';
import './styles.css';

interface IProps {
  open: boolean
  handleOpen(b: any): void 
}

interface IState {
  open: boolean
  username: string
  password: string
  cols: number
  rows: number
  authenticated: boolean
  fullScreen: boolean
  style: Object
}

class Terminal extends React.Component<IProps, IState> {
  private defaultWidth: string = '849px';
  private defaultHeight: string = '432px';
  private defaultCols: number = 93;
  private defaultRows: number = 24;
  private xterm: any = null;
  private connection: any;

  state: IState = {
    open: this.props.open,
    username: '',
    password: '',
    authenticated: false,
    rows: this.defaultRows,
    cols: this.defaultCols,
    fullScreen: false,
    style: {
      height: this.defaultHeight,
      width: this.defaultWidth,
    },
  }

  componentWillUnmount() {
    this.setState({
      username: '',
      password: '',
      authenticated: false,
      fullScreen: false,
    });
  };

  onChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
    const username = e.target.value;
    this.setState({
      username, 
    });
  };

  onChangePassword(e: React.ChangeEvent<HTMLInputElement>){
    const password = e.target.value;
    this.setState({
      password, 
    });
  };

  async connect() {
    const data : IConnection = {
      user: this.state.username,
      password: this.state.password,
      cols: this.defaultCols,
      rows: this.defaultRows,
    };

    try {
      this.connection = new ConnectionService();
      this.connection.connect(data);
      this.setState({
        authenticated: true,
      });
    } catch (e) {
    }
  }

  sendSizes(term: TerminalType) {
    const { cols, rows } = term;
    this.connection.updateSizes(cols, rows);
  };

  handleSize() {
      this.setState({
        style: {
          height: !this.state.fullScreen ? '100%': this.defaultHeight,
          width: !this.state.fullScreen ? '100%': this.defaultWidth,
        },
        fullScreen: !this.state.fullScreen,
      });
  };

  onHandleScreenChange() {
    this.setState({
      fullScreen: !this.state.fullScreen 
    });
  };

  renderDialogContent () {
    if (!this.state.authenticated) {
      return (
        <div className="form-dialog">
          <DialogContent dividers className="dialog-content">
            <DialogContentText className="content-text">
              Authentication required
            </DialogContentText>
            <Stack
              spacing={2}
            >
            <div className="form-elements">
              <TextField
                data-test="username-field"
                value={this.state.username}
                onChange={ (e:React.ChangeEvent<HTMLInputElement>) => this.onChangeUsername(e) }
                autoFocus
                label="Username"
              />
              <TextField
                data-test="password-field"
                value={this.state.password}
                onChange={ (e: React.ChangeEvent<HTMLInputElement>) => this.onChangePassword(e) }
                margin="normal"
                label="Password"
                type="password"
              />
            </div>
          </Stack>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button data-test="connect-button" onClick={ () => this.connect() }>Connect</Button>
          </DialogActions>
        </div>
      )
    } else {
      return (
        <Xtermjs data-test="xtermjs" fullScreen={this.state.fullScreen} sendSizes={this.sendSizes} style={this.state.style} connection={this.connection}/>
      )
    }
  };

  render() {
    return (
        <Dialog maxWidth='md' open={this.state.open} onClose={this.props.handleOpen} className="dialog" fullScreen={this.state.fullScreen}>
            <div className="header-dialog">
              <div className="header-start">
                <IconButton
                  edge="start"
                  color="inherit"
                  data-test="close-icon"
                  onClick={this.props.handleOpen}
                >
                  <CloseIcon/>
                </IconButton>
                <DialogTitle className="dialog-title">WebTerminal</DialogTitle>
              </div>
              { this.state.authenticated ? 
                <IconButton
                  color="inherit"
                  data-test="max-icon"
                  className="max-icon"
                  onClick={ () => this.handleSize() }
                >
                  <ZoomOutMap/>
                </IconButton> :
                null
              }
            </div>
          { this.renderDialogContent() }
        </Dialog>
    )
  }
}

export default Terminal;
