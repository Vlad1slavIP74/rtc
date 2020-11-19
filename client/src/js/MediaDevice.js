import _ from 'lodash';
import Emitter from './Emitter';

/**
 * Manage all media devices
 */
class MediaDevice extends Emitter {
  /**
   * Start media devices and send stream
   */
  start(config) {
    console.log('MediaDevice', { config });

    navigator.mediaDevices.enumerateDevices()
      .then(() => {
        navigator.mediaDevices
          .getUserMedia(config)
          .then((stream) => {
            this.stream = stream;
            // console.log(this.stream);
            this.emit('stream', stream);
          })
          .catch((err) => {
            if (err instanceof DOMException) {
              console.log(err);
              alert('Cannot open webcam and/or microphone');
            } else {
              console.log(err);
            }
          });
      })
      .catch((errorCallback) => {
        console.log(errorCallback);
      });

    return this;
  }

  /**
   * Turn on/off a device
   * @param {String} type - Type of the device
   * @param {Boolean} [on] - State of the device
   */
  toggle(type, on) {
    const len = arguments.length;
    if (this.stream) {
      this.stream[`get${type}Tracks`]().forEach((track) => {
        const state = len === 2 ? on : !track.enabled;
        _.set(track, 'enabled', state);
      });
    }
    return this;
  }

  /**
   * Stop all media track of devices
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    return this;
  }
}

export default MediaDevice;
