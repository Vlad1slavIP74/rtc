import React, { Component } from 'react';
import _ from 'lodash';
import socket from './socket';
import PeerConnection from './PeerConnection';
import MainWindow from './MainWindow';
import CallWindow from './CallWindow';
import CallModal from './CallModal';
import ChatModal from './chat/ChatModal';

class App extends Component {
  constructor() {
    super();
    this.state = {
      clientId: '',
      callWindow: '',
      callModal: '',
      isChatOpen: true,
      callFrom: '',
      localSrc: null,
      peerSrc: null,
      friendId: null
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
    this.sendMessageHandler = this.sendMessage.bind(this);
    this.setFriendId = this.setFriendId.bind(this);
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
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
  }

  setFriendId(friendId) {
    this.setState({ friendId });
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

  rejectCall() {
    const { callFrom } = this.state;
    socket.emit('end', { to: callFrom });
    this.setState({ callModal: '' });
  }

  sendMessage(data) {
    const { friendId } = this.state;
    socket.emit('sendMessage', { ...data, to: friendId });
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
    const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc,
      isChatOpen, friendId } = this.state;
    return (
      <div>
        <MainWindow
          clientId={clientId}
          startCall={this.startCallHandler}
          setFriendId={this.setFriendId}
          friendId={friendId}
        />
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
        {
          isChatOpen && clientId && (
            <ChatModal
              sendMessage={this.sendMessageHandler}
              clientId={clientId}
            />
          )
        }
      </div>
    );
  }
}

export default App;
