import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function MainWindow({ startCall, clientId }) {
  const [friendID, setFriendID] = useState(null);
  const [audioDevices, setAudioDevice] = useState([]);
  const [videoDevices, setVideoDevice] = useState([]);
  const [loader, setLoader] = useState(true);
  const [userAudio, setUserAudio] = useState('NOTHING');

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    // { video: { deviceId: myPreferredCameraDeviceId } }
    const config = { audio: true, video };
    return () => friendID && startCall(true, friendID, config);
  };

  /**
   * Get List available audio device
   */

  const list = async () => {
    const listDevices = await navigator.mediaDevices.enumerateDevices();

    const videoDevicesList = listDevices.filter((device) => device.kind === 'videoinput');
    const audioDevicesList = listDevices.filter((device) => device.kind === 'audioinput');
    setAudioDevice(audioDevicesList);
    setVideoDevice(videoDevicesList);
    setLoader(false);
  };

  useEffect(() => {
    if (loader) {
      list();
    }
  }, []);

  if (loader) {
    return null;
  }


  const getUserAudio = (event) => {
    console.log(event.target.value);
    setUserAudio(event.target.value);
  };

  const getUserVideo = (event) => {

  };

  const videoSelector = videoDevices.length
    ? (
      <select
        style={
        {
          color: 'black'
        }
      }
        onChange={(event) => getUserVideo(event)}
      >
        {videoDevices.map((item) => <option>{item.label}</option>)}
      </select>
    )
    : null;

  const audioSelector = audioDevices.length
    ? (
      <select
        style={
        {
          color: 'black'
        }
      }
        value={userAudio}
        onChange={(event) => getUserAudio(event)}
      >
        {audioDevices.map((item) => <option>{item.label}</option>)}
      </select>
    )
    : null;


  return (
    <div className="container main-window">
      <div>
        <h3>
          Hi, your ID is
          <input
            type="text"
            className="txt-clientId"
            defaultValue={clientId}
            readOnly
          />
        </h3>
        <h4>Get started by calling a friend below</h4>
      </div>
      <div>
        <input
          type="text"
          className="txt-clientId"
          spellCheck={false}
          placeholder="Your friend ID"
          onChange={(event) => setFriendID(event.target.value)}
        />
        <div>
          <button
            type="button"
            className="btn-action fa fa-video-camera"
            onClick={callWithVideo(true)}
          />
          <button
            type="button"
            className="btn-action fa fa-phone"
            onClick={callWithVideo(false)}
          />
          {videoSelector}
          {audioSelector}
        </div>
      </div>
    </div>
  );
}

MainWindow.propTypes = {
  clientId: PropTypes.string.isRequired,
  startCall: PropTypes.func.isRequired
};

export default MainWindow;
