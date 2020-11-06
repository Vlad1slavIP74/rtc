import React from 'react';
import PropTypes from 'prop-types';

function displayMessage({ name, message }) {
  return (
    <p>
      <strong>{name}</strong>
      {' '}
      <em>{message}</em>
    </p>
  );
}

export default displayMessage;


displayMessage.propTypes = {
  name: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired
};
