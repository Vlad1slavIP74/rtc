import _ from 'lodash';
import Emitter from './Emitter';

/**
 * Manage all media devices
 */
class MediaDevice extends Emitter {
  /**
   * Start media devices and send stream
   */
  start() {
    // const constraints = {
    //   video: {
    //     facingMode: 'user',
    //     height: { min: 360, ideal: 720, max: 1080 }
    //   },
    //   audio: true
    // };


    // for PC without video
    // const constraints = {
    //   audio: true,
    //   video: false
    // };


    navigator.mediaDevices.enumerateDevices()
      .then((info) => {
        console.log('enumerateDevices', JSON.stringify(info, null, 3));

        const constraints = {}

        constraints.audio = true
        constraints.video = !!info.find(deviceInfo => deviceInfo.kind === 'videoinput')
        
        console.log(constraints)
        
        navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.stream = stream;
          console.log(this.stream);
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


    // navigator.mediaDevices
    //   .getUserMedia(constraints)
    //   .then((stream) => {
    //     this.stream = stream;
    //     console.log(this.stream);
    //     this.emit('stream', stream);
    //   })
    //   .catch((err) => {
    //     if (err instanceof DOMException) {
    //       console.log(err);
    //       alert('Cannot open webcam and/or microphone');
    //     } else {
    //       console.log(err);
    //     }
    //   });

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
