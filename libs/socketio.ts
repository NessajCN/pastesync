import { io, Socket } from "socket.io-client";
import { Dispatch, SetStateAction } from "react";
import { SocketSDP, SocketIceCandidate } from "../types/sockettype";
// type SocketSDP = {
//   socketid: string;
//   sdp: RTCSessionDescriptionInit;
// };

// type SocketPC = {
//   socketid: string;
//   pc: RTCPeerConnection;
// };

const socketIOInit = async (
  setPasteContent: Dispatch<SetStateAction<string>>,
  // setSocket: Dispatch<SetStateAction<Socket | undefined>>,
  pcs: Map<string, RTCPeerConnection>,
  setPcs: Dispatch<SetStateAction<Map<string, RTCPeerConnection>>>,
  dcs: Map<string, RTCDataChannel>,
  setDcs: Dispatch<SetStateAction<Map<string, RTCDataChannel>>>,
  setIsRoomError: Dispatch<SetStateAction<boolean>>,
  setRoomid: Dispatch<SetStateAction<string>>,
  setInRoom: Dispatch<SetStateAction<boolean>>
) => {
  await fetch("/api/socketio/socket");
  const socketio = io();
  // let pc: RTCPeerConnection;

  socketio.on("connect", () => {
    console.log("connected");
  });

  socketio.on("roomin", (roomid: string) => {
    if (pcs.size > 0) {
      // if(pc && pc.connectionState === "connected") {
      pcs.forEach((pc, _socketid) => {
        pc.close();
      });
    }
    pcs.clear();
    dcs.clear();
    setPcs(pcs);
    setDcs(dcs);
    setRoomid(roomid);
    setInRoom(true);

    // this.props.media.setState({user: 'host', bridge: 'create'});
    console.log(`Successfully entering room ${roomid}`);
    // const pc0 = await peerConnect(socketio);
    // setPcs([pc0]);
  });

  socketio.on("joined", async (socketid: string) => {
    /**
     * When a guest joins a room, the room host and all other guests
     * get the "joined" event and create a new peerConnection. To make
     * a peerConnection explicit we attach the socketID of the remote
     * peer on socket.io server and define
     * @type {Map<string,RTCPeerConnection>} - who has a <key, value> pair as
     * @property {socketID} socketid - socketid of remote peer on socket.io server
     * @property {RTCPeerConnection} pc - RTCPeerConnection with provided socketID.
     * It is now available to send offer:RTCSessionDescriptionInit to the remote peer.
     */

    console.log(`${socketid} has joined the room.`);
    const pcnow = await peerConnect();

    pcnow.onicecandidate = ({ candidate }: RTCPeerConnectionIceEvent) => {
      socketio.emit("pcicecandidate", { socketid, candidate });
    };

    const dc = pcnow.createDataChannel("chat");
    // dc.binaryType = "arraybuffer";
    dc.onmessage = (msg) => {
      // console.log("received message over data channel:" + msg.data);
      setPasteContent(msg.data === "n/a" ? "" : msg.data);
    };
    dc.onopen = () => {
      console.log(`data channel created:${dcs.get(socketid)?.id}`);
    };
    dc.onclose = () => {
      console.log("The Data Channel is Closed");
    };
    dcs.set(socketid, dc);
    setDcs(dcs);
    const offer = await pcnow.createOffer();

    await pcnow.setLocalDescription(offer);
    // socket.send(pc.localDescription);
    socketio.emit("pcoffer", { socketid, sdp: offer });
    pcs.set(socketid, pcnow);

    setPcs(pcs);
  });

  socketio.on("offer", async ({ socketid, sdp }: SocketSDP) => {
    /**
     * Guests who joined a room will get peerConnection invitation from
     * the room host and all other guests who joined before.
     */
    if (sdp.type === "offer") {
      const pcnow = await peerConnect();

      pcnow.ondatachannel = (e: RTCDataChannelEvent) => {
        const dc = e.channel;
        dc.onmessage = (msg) => {
          // console.log("received message over data channel:" + msg.data);
          setPasteContent(msg.data === "n/a" ? "" : msg.data);
        };
        dc.onopen = () => {
          console.log(`data channel created:${dcs.get(socketid)?.id}`);
        };
        dc.onclose = () => {
          console.log("The Data Channel is Closed");
        };
        dcs.set(socketid, dc);
        setDcs(dcs);
      };
      pcnow.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
        socketio.emit("pcicecandidate", { socketid, candidate: e.candidate });
      };
      await pcnow.setRemoteDescription(sdp);
      const answer = await pcnow.createAnswer();
      await pcnow.setLocalDescription(answer);
      socketio.emit("pcanswer", { socketid, sdp: answer });
      pcs.set(socketid, pcnow);
      setPcs(pcs);
    }
  });

  socketio.on("answer", async ({ socketid, sdp }: SocketSDP) => {
    if (sdp.type === "answer" && pcs.has(socketid)) {
      await pcs.get(socketid)?.setRemoteDescription(sdp);
    }
  });

  socketio.on(
    "icecandidate",
    async ({ socketid, candidate }: SocketIceCandidate) => {
      await pcs.get(socketid)?.addIceCandidate(candidate);
    }
  );

  socketio.on("hangup", (socketid: string) => {
    console.log(`socket ${socketid} has left.`);
    pcs.get(socketid)?.close();
    pcs.delete(socketid);
    setPcs(pcs);
    dcs.delete(socketid);
    setDcs(dcs);
  });
  socketio.on("noroom", () => {
    setIsRoomError(true);
    setInRoom(false);
    console.log("noroom");
  });
  // setSocket(socketio);
  return socketio;
};

// const onMessage = async (
//   msg: RTCSessionDescription,
//   pc: RTCPeerConnection,
//   socket: Socket
// ) => {
//   // if (!msg.type) {
//   //   msg = JSON.parse(msg);
//   // }
//   // console.log(msg)
//   if (msg.type === "offer") {
//     try {
//       // set remote description and answer
//       await pc.setRemoteDescription(new RTCSessionDescription(msg));
//       // console.log(pc.remoteDescription.sdp)
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       // console.log(pc.localDescription.sdp)
//       socket.send(pc.localDescription);
//     } catch (err) {
//       console.error(err);
//     }
//   } else if (msg.type === "answer") {
//     // set remote description
//     // console.log(msg.sdp);
//     await pc.setRemoteDescription(new RTCSessionDescription(msg));
//     // } else if (msg.type === "candidate") {
//     //   // add ice candidate
//     //   await pc.addIceCandidate(msg.candidate);
//   }
// };

const peerConnect = async () => {
  const iceConf = {
    iceServers: [
      {
        urls: "turn:gitnessaj.com:3478",
        username: "tjaiturn",
        credential: "tjaiturn",
      },
    ],
  };

  const pc = new RTCPeerConnection(iceConf);

  // pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
  //   if (e.candidate) {
  //     socket.send({
  //       type: "candidate",
  //       candidate: e.candidate,
  //     });
  //   }
  // };

  pc.onconnectionstatechange = () => {
    console.log("connection state: ", pc.connectionState);
  };

  // pc.ontrack = (e) => {
  //   console.log("ontrack", e);
  //   const rstream = e.streams[0];
  // };

  // const constraints = {
  //   // video: true,
  //   // audio: true,
  //   audio: { echoCancellation: true },
  // };
  // const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // for (const t of stream.getTracks()) {
  //   console.log(t);
  //   pc.addTrack(t);
  // }

  // const dc = pc.createDataChannel("chat");
  // // dc.binaryType = "arraybuffer";
  // dc.onmessage = (msg) => {
  //   console.log("received message over data channel:" + msg.data);
  // };
  // dc.onopen = () => {
  //   console.log("data channel created");
  // };
  // dc.onclose = () => {
  //   console.log("The Data Channel is Closed");
  // };
  return pc;
  // const offer = await pc.createOffer();

  // await pc.setLocalDescription(offer);
  // // socket.send(pc.localDescription);
  // socket.emit("pcoffer", {
  //   socketid,
  //   sdp: offer,
  // });
  // return {socketid, pc};
};
export default socketIOInit;
