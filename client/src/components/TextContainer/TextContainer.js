import React from 'react';

// import onlineIcon from '../../icons/onlineIcon.png';
import camera from '../Icons/camera.png';

import './TextContainer.css';

const TextContainer = ({ users, handleVideoCall }) => (
  <div className="textContainer">
    <div>
      <h1>Realtime Chat Application with Video Call <span role="img" aria-label="emoji">💬</span></h1>
    </div>
    {
      users
        ? (
          <div>
            <h2>Select a friend you want to call<span role="img" aria-label="emoji">⬅️</span></h2>
            <div className="activeContainer">
              {users.map(({ name, id }) => (
                <div key={name} className="activeItem" onClick={e => handleVideoCall(id)}>
                  {name}
                  <span><img src={camera} style={{ height: "24px" }} alt="video" /></span>
                  {/* <img alt="Online Icon" src={onlineIcon}/> */}
                </div>
              ))}
            </div>
          </div>
        )
        : null
    }
  </div>
);

export default TextContainer;