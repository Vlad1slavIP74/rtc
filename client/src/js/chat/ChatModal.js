import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import socket from '../socket';

const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });


class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messages: []
    };
  }

  componentDidMount() {
    socket
      .on('sendMessage', (data) => {
        console.log(data.message);

        const { message } = data;
        this.addMessage(message);

        console.log(this.state);
      });
  }

  addMessage(message) {
    this.setState((state) => ({ messages: [message, ...state.messages] }));
  }


  submitMessage(messageString) {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    const { sendMessage } = this.props;
    const message = {
      message: messageString
    };

    sendMessage(message);

    this.addMessage(message);
  }

  render() {
    const { messages } = this.state;
    return (
      <div>
        {/* <label htmlFor="name">
          Name:&nbsp;
          <input
            type="text"
            id="name"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => this.setState({ name: e.target.value })}
          />
        </label> */}
        <ChatInput
          onSubmitMessage={(messageString) => this.submitMessage(messageString)}
        />
        {messages.map((message) => (
          <ChatMessage
            // key={index}
            message={message.message}
            name={message.name}
          />
        ))}
      </div>
    );
  }
}

Chat.propTypes = {
  sendMessage: PropTypes.func.isRequired,
  clientId: PropTypes.string.isRequired
};

export default Chat;
