import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { join } from 'bluebird';


function getConfig({ userAudio, userVideo, audioDevices, videoDevices, video }) {
  // for keys where user did not select nothing
  if (!userAudio && !userVideo) {
    return {
      audio: true,
      video
    };
  }
  console.log(555, videoDevices);
  const videoObj = videoDevices.find((obj) => obj.label === userVideo);
  const audioObj = audioDevices.find((obj) => obj.label === userAudio);
  return {
    audio: userAudio ? {
      deviceId: audioObj ? audioObj.deviceId : undefined
    } : true,
    video: video ? {
      deviceId: videoObj ? videoObj.deviceId : undefined,
      facingMode: 'user',
      height: { min: 360, ideal: 720, max: 1080 }
    } : video
  };
}

function RoomWindow({ createRoom, clientId, joinChat }) {
  const [roomID, setRoomID] = useState(null);
  const [audioDevices, setAudioDevice] = useState([]);
  const [videoDevices, setVideoDevice] = useState([]);

  const [loader, setLoader] = useState(true);

  const [userAudio, setUserAudio] = useState(null);
  const [userVideo, setUserVideo] = useState(null);

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    // { video: { deviceId: myPreferredCameraDeviceId } }

    console.log('RoomWindow', { userAudio, userVideo });


    const config = getConfig({ userAudio, userVideo, audioDevices, videoDevices, video });
    return () => roomID && createRoom({ roomID, config, clientId });
  };

  const joinChatWithVideo = (video = true) => {
    const config = getConfig({ userAudio, userVideo, audioDevices, videoDevices, video });

    return () => roomID && joinChat({ roomID, config, clientId });
  };

  /**
   * Get List available audio device
   */

  const list = async () => {
    const listDevices = await navigator.mediaDevices.enumerateDevices();
    console.log('listDevices', JSON.stringify(listDevices, null, 2));
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
    setUserAudio(event.target.value);
  };

  const getUserVideo = (event) => {
    console.log(event.target);
    setUserVideo(event.target.value);
  };

  const videoSelector = videoDevices.length
    ? (
      <select
        style={
        {
          color: 'black'
        }
      }
        value={userVideo}
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
          {`Hi, ${clientId}`}
        </h3>
        <h4>Get started by creating room or join to existing one</h4>
      </div>
      <div>
        <input
          type="text"
          className="txt-clientId"
          spellCheck={false}
          placeholder="Your room id"
          onChange={(event) => setRoomID(event.target.value)}
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
          <button
            type="button"
            className="btn-action fa fa-meetup"
            onClick={joinChatWithVideo(true)}
          />
          {videoSelector}
          {audioSelector}
        </div>
      </div>
    </div>
  );
}

RoomWindow.propTypes = {
  clientId: PropTypes.string.isRequired,
  joinChat: PropTypes.func.isRequired,
  createRoom: PropTypes.func.isRequired
};

export default RoomWindow;
