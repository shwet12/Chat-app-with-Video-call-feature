import React from 'react';

import onlineIcon from '../Icons/onlineIcon.png';
import closeIcon from '../Icons/closeIcon.png';
import camera from '../Icons/camera.png';

import './InfoBar.css';

const InfoBar = ({ room, handleVideoCall }) => (
  <div className="infoBar">
    <div className="leftInnerContainer">
      <img className="onlineIcon" src={onlineIcon} alt="online icon" />
      <h3>{room}</h3>
    </div>
  </div>
);

export default InfoBar;
