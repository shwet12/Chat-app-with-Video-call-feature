import React, { useState, useEffect, useRef } from "react";
import queryString from 'query-string';
import io from "socket.io-client";
import Peer from "simple-peer";

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import './Chat.css';

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [stream, setStream] = useState()
  // const [videoCallInitiated, setvideoCallInitiated] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState("")
  const [callerSignal, setCallerSignal] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  const [idToCall, setIdToCall] = useState("")
  const [callEnded, setCallEnded] = useState(false)
  const [callerName, setCallerName] = useState("")
  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()
  const ENDPOINT = 'localhost:5000';

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name)

    socket.emit('join', { name, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }, [ENDPOINT, location.search]);

  useEffect(() => {

    if (myVideo.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        if (idToCall) {
          myVideo.current.srcObject = stream
          callUser(stream);
        }
        else if (callAccepted) {
          myVideo.current.srcObject = stream
          console.log(receivingCall);
          answerCall(stream);
        }
      })

    }
  }, [idToCall, callAccepted, caller]);

  useEffect(() => {
    console.log('call ended effect');
    console.log(receivingCall);
    setIdToCall('');
    setCallAccepted(false);
    setCaller('');
  }, [callEnded]);

  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    socket.on("callUser", (data) => {
      console.log('call received');
      setReceivingCall(true)
      setCaller(data.from)
      setCallerName(data.name)
      setCallerSignal(data.signal)
    })
    socket.on("callEnded", (data) => {
      console.log('call ended', idToCall, caller);
      myVideo.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      myVideo.current.srcObject = null;
      connectionRef.current.destroy();
      setCallEnded(true)
    })
  }, []);
  const callUser = (myStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: myStream
    })
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: idToCall,
        signalData: data,
        from: socket.id,
        name: name
      })
    })
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream

    })
    socket.on("callAccepted", (signal) => {
      // setReceivingCall(false);
      // setCallAccepted(true)
      peer.signal(signal)
    })

    connectionRef.current = peer
  }
  const answerCall = (myStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: myStream
    })
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller })
    })
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream
    })

    peer.signal(callerSignal)
    connectionRef.current = peer
    // setReceivingCall(false);
    // setCallAccepted(true);
  }

  const leaveCall = () => {
    myVideo.current.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    myVideo.current.srcObject = null;
    connectionRef.current.destroy();
    socket.emit("callEnded", {
      userToCallEnd: idToCall ? idToCall : caller,
    })
    setCallEnded(true)
  }
  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  }
  const handleVideoCall = (idToCall) => {
    // setvideoCallInitiated(true);
    // callUser(idToCall);
    setIdToCall(idToCall);
  }


  return (
    <>
      <div className="outerContainer">
        <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} />
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
        </div>
        {(callAccepted || idToCall) ?
          (
            <div className="secondContainer">
              <div className="videoContainer">
                <video className="videoStyle" ref={myVideo} autoPlay playsInline />
                <video className="videoStyle" ref={userVideo} autoPlay playsInline />
              </div>
              {callAccepted && !callEnded ? (
                <button className="endCall" onClick={leaveCall}>End Call</button>
              ) : (
                null
              )}
            </div>) :
          <div className="callContainer">
            <TextContainer handleVideoCall={handleVideoCall} users={users.filter((value) => value.id !== socket.id)} />
            {receivingCall && !callAccepted ? (
              <div className="caller">
                <h1 >{callerName} is calling...</h1>
                <button className="sendButton" onClick={() => {
                  setCallAccepted(true);
                  setReceivingCall(false);
                }}>Answer</button>
              </div>
            ) : null}
          </div>}
      </div>
    </>
  );
}

export default Chat;
