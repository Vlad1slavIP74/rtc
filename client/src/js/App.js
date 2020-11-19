import React, { Component } from 'react';
import _ from 'lodash';
import socket from './socket';
import PeerConnection from './PeerConnection';
import MainWindow from './MainWindow';
import CallWindow from './CallWindow';
import CallModal from './CallModal';
import RoomWindow from './Room/RoomWindow';
import '@babel/polyfill';

class App extends Component {
  constructor() {
    super();
    this.state = {
      clientId: '',
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null
      // audioDevice: null,
      // videoDevice: null
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
    this.createRoomHandler = this.createRoom.bind(this);
    this.joinChatHandler = this.joinChat.bind(this);
  }

  componentDidMount() {
    socket
      .on('init', ({ id: clientId }) => {
        console.log('FROM CLIENT');
        document.title = `${clientId} - VideoCall`;
        this.setState({ clientId });
      })
      .on('request', ({ from: callFrom }) => {
        console.log(callFrom);
        this.setState({ callModal: 'active', callFrom });
      })
      .on('call', (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else {
          this.pc.addIceCandidate(data.candidate);
        }
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
  }

  startCall(isCaller, friendID, config) {
    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))

      .start(isCaller, config);
  }

  createRoom({ roomID, config, clientId }) {
    this.config = config;
    console.log('createRoom', config);
    // bad way but fast
    this.pc = new PeerConnection(_, roomID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .createRoomPeer({ roomID, config, clientId });
  }

  joinChat({ roomID, config, clientId }) {
    this.config = config;
    console.log('joinChat', roomID);
    this.pc = new PeerConnection(_, roomID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .joinRoomPeer({ roomID, config, clientId });
  }

  rejectCall() {
    const { callFrom } = this.state;
    socket.emit('end', { to: callFrom });
    this.setState({ callModal: '' });
  }

  endCall(isStarter) {
    if (_.isFunction(this.pc.stop)) {
      this.pc.stop(isStarter);
    }
    this.pc = {};
    this.config = null;
    this.setState({
      callWindow: '',
      callModal: '',
      localSrc: null,
      peerSrc: null
    });
  }


  render() {
    const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc } = this.state;

    return (
      <div>
        <div className="WindowsContainer">

          <MainWindow
            clientId={clientId}
            startCall={this.startCallHandler}
          />
          <RoomWindow
            clientId={clientId}
            createRoom={this.createRoomHandler}
            joinChat={this.joinChatHandler}
          />

        </div>

        {!_.isEmpty(this.config) && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
          />
        ) }
        <CallModal
          status={callModal}
          startCall={this.startCallHandler}
          rejectCall={this.rejectCallHandler}
          callFrom={callFrom}
        />
      </div>
    );
  }
}

export default App;
