import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ChatInput extends Component {
  constructor() {
    super();
    this.state = {
      message: ''
    };
  }

  render() {
    const { onSubmitMessage } = this.props;
    const { message } = this.state;
    return (
      <form
        action="."
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitMessage(message);
          this.setState({ message: '' });
        }}
      >
        <input
          type="text"
          placeholder="Enter message..."
          value={message}
          onChange={(e) => this.setState({ message: e.target.value })}
        />
        <input type="submit" value="Send" />
      </form>
    );
  }
}

ChatInput.propTypes = {
  onSubmitMessage: PropTypes.func.isRequired

};

export default ChatInput;
