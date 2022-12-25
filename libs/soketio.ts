import { io, Socket } from "socket.io-client";
// import playRecord from "./playRecord";

const socketIOInit = async () => {
  await fetch("/api/socketio/socket");
  const socketio = io();
  let pc: RTCPeerConnection;

  socketio.on("connect", () => {
    console.log("connected");
  });

  socketio.on("create", () => {
    if (pc) {
      // if(pc && pc.connectionState === "connected") {
      pc.close();
    }
    // this.props.media.setState({user: 'host', bridge: 'create'});
    socketio.emit("auth");
    console.log("created");
  });
  socketio.on("bridge", async (pathid) => {
    pc = await peerConnect(socketio);
  });
  socketio.on("join", () => {
    if (pc) {
      // if(pc && pc.connectionState === "connected") {
      pc.close();
    }
    // this.props.media.setState({user: 'guest', bridge: 'join'});
    socketio.emit("auth");
    console.log("joined");
  });
  socketio.on("full", () => {
    console.log("full");
  });

  socketio.on("message", async (msg) => {
    if (pc) {
      await onMessage(msg, pc, socketio);
    }
  });
  socketio.on("hangup", () => {
    console.log("hangup");
  });
  return socketio;
};

const onMessage = async (
  msg: RTCSessionDescription,
  pc: RTCPeerConnection,
  socket: Socket
) => {
  // if (!msg.type) {
  //   msg = JSON.parse(msg);
  // }
  // console.log(msg)
  if (msg.type === "offer") {
    try {
      // set remote description and answer
      await pc.setRemoteDescription(new RTCSessionDescription(msg));
      // console.log(pc.remoteDescription.sdp)
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      // console.log(pc.localDescription.sdp)
      socket.send(pc.localDescription);
    } catch (err) {
      console.error(err);
    }
  } else if (msg.type === "answer") {
    // set remote description
    // console.log(msg.sdp);
    await pc.setRemoteDescription(new RTCSessionDescription(msg));
    // } else if (msg.type === "candidate") {
    //   // add ice candidate
    //   await pc.addIceCandidate(msg.candidate);
  }
};

const peerConnect = async (socket: Socket) => {
  const iceConf = {
    iceServers: [
      {
        urls: "turn:222.92.212.254:3478",
        username: "tjaiturn",
        credential: "tjaiturn",
      },
    ],
  };

  const pc = new RTCPeerConnection(iceConf);

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.send({
        type: "candidate",
        candidate: e.candidate,
      });
    }
  };

  pc.onconnectionstatechange = () => {
    console.log("connection state: ", pc.connectionState);
  };

  pc.ontrack = (e) => {
    console.log("ontrack", e);
    const rstream = e.streams[0];
  };

  const constraints = {
    // video: true,
    // audio: true,
    audio: { echoCancellation: true },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  console.log("stream before:", pc);
  for (const t of stream.getTracks()) {
    console.log(t);
    pc.addTrack(t);
  }

  const dc = pc.createDataChannel("chat");
  dc.binaryType = "arraybuffer";
  dc.onmessage = (msg) => {
    // console.log("received message over data channel:" + msg.data);
  };
  dc.onopen = () => {
    console.log("data channel created");
    dc.send("getList");
  };
  dc.onclose = () => {
    console.log("The Data Channel is Closed");
  };

  const offer = await pc.createOffer();

  await pc.setLocalDescription(offer);
  socket.send(pc.localDescription);
  return pc;
};
export default socketIOInit;
