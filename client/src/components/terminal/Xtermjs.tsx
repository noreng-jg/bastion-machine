import React, { useEffect } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { DialogContent } from '@material-ui/core';
import 'xterm/css/xterm.css';
import './styles.css';

interface IProps {
  fullScreen: boolean
  sendSizes(xterm: Terminal): void 
  style: Object
  connection: any
}

interface IState {
  xterm: Terminal
  addon: FitAddon
  width: string
}

class Xtermjs extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.termRef=React.createRef()
  }

  xterm: Terminal;
  addon: FitAddon;

  private termRef: React.RefObject<any>;

  state: IState = {
    xterm: new Terminal(),
    addon: new FitAddon(),
    width: '849px',
  }

  componentWillUnmount() {
    this.props.connection.closeConnection();
    window.removeEventListener('resize', this.onResize);
  }

  componentDidUpdate(nextProps: any) {
    console.log(this.props.style);
    const { fullScreen, style } = this.props;
    console.log(style);
    if (fullScreen !== nextProps.fullScreen) {
      this.addon.fit();
      this.props.sendSizes(this.xterm);
    }
  }

  componentDidMount() {
    this.xterm = new Terminal({
      cursorBlink: true,
      fontFamily: 'monospace',
    });
    this.addon = new FitAddon();
    this.xterm.loadAddon(this.addon);
    this.xterm.open(this.termRef.current!);
    this.addon.fit();
    window.addEventListener('resize', this.onResize);
    console.log(this.xterm.cols);
    console.log(this.xterm.rows);

    this.props.connection.websocketListener(this.xterm);
  }

  onResize = () => {
    this.addon.fit();
    this.props.sendSizes(this.xterm);
  };

  render() {
    return (
      <div className="xtermjs-div" ref={this.termRef} style={this.props.style}>
      </div>
    )
  }
}

export default Xtermjs;
