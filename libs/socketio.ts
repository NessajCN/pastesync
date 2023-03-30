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
  const peerConnect = async (socketid: string, socketio: Socket) => {
    const iceConf = {
      iceServers: [
        {
          urls: "turn:tongjiai.cn:3478",
          username: "tjaiturn",
          credential: "tjaiturn",
        },
        // {
        //   urls: "stun:stun.l.google.com:19302"
        // },
      ],
    };

    const pc = new RTCPeerConnection(iceConf);
    pc.ondatachannel = (e: RTCDataChannelEvent) => {
      const dc = e.channel;
      dc.onmessage = (msg) => {
        // console.log("received message over data channel:" + msg.data);
        setPasteContent(msg.data === "n/a" ? "" : msg.data);
      };
      dc.onopen = () => {
        console.log(`data channel created:${dcs.get(socketid)?.id}`);
        // pcs.set(socketid, pc);
        // setPcs(pcs);
        dcs.set(socketid, dc);
        setDcs(dcs);
      };
      dc.onclose = () => {
        console.log(`Datachannel of ${socketid} has closed.`);
        dcs.delete(socketid);
        // pcs.delete(socketid);
        setDcs(dcs);
        // setPcs(pcs);
      };
      dcs.set(socketid, dc);
      setDcs(dcs);
    };
    pc.onicecandidate = ({ candidate }: RTCPeerConnectionIceEvent) => {
      socketio.emit("pcicecandidate", { socketid, candidate });
    };

    pc.onnegotiationneeded = (e: Event) => {
      console.log(`negotiation needed.`);
    };

    pc.oniceconnectionstatechange = (e: Event) => {
      switch (pc.iceConnectionState) {
        case "new":
        case "checking":
          console.log("iceconnection state: ", pc.iceConnectionState);
          console.log(`pcs:${[...pcs.keys()]}`);
          break;
        case "disconnected":
          console.log("iceconnection state: ", pc.iceConnectionState);
          console.log(`pcs:${[...pcs.keys()]}`);
          break;
        case "closed":
          console.log("iceconnection state: ", pc.iceConnectionState);
          console.log(`pcs:${[...pcs.keys()]}`);
          break;
        case "failed":
          pcs.delete(socketid);
          setPcs(pcs);
          console.log(`iceconnection state ${pc.iceConnectionState}: ${socketid}`);
          console.log(`pcs:${[...pcs.keys()]}`);
          break;
        case "completed":
          console.log("iceconnection state: ", pc.iceConnectionState);
          console.log(`pcs:${[...pcs.keys()]}`);
          break;
        default:
          console.log("iceconnection state: ", pc.iceConnectionState);
          console.log(`pcs:${[...pcs.keys()]}`);
          break;
      }
      // console.log("connection state: ", pc.connectionState);
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

    return pc;
  };

  const offer = async (socketid: string, socketio: Socket) => {
    const pc = await peerConnect(socketid, socketio);
    const dc = pc.createDataChannel("chat");
    // dc.binaryType = "arraybuffer";
    dc.onmessage = (msg) => {
      // console.log("received message over data channel:" + msg.data);
      setPasteContent(msg.data === "n/a" ? "" : msg.data);
    };
    dc.onopen = () => {
      console.log(`data channel created:${dcs.get(socketid)?.id}`);
      // pcs.set(socketid, pc);
      // setPcs(pcs);
      dcs.set(socketid, dc);
      setDcs(dcs);
    };
    dc.onclose = () => {
      console.log(`Datachannel of ${socketid} has closed.`);
      console.log(`pcs:${[...pcs.keys()]}`);
      dcs.delete(socketid);
      // pcs.delete(socketid);
      setDcs(dcs);
      // setPcs(pcs);

      /**
       * Emit "iceconnectionfailed" event when failed to dial on offer side.
       * Only emit at dc.onclose handler of offer side to ensure offer created
       * on answer side.
       */
      
      socketio.emit("iceconnectionfailed", socketid);
    };

    dcs.set(socketid, dc);
    setDcs(dcs);
    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);
    // socket.send(pc.localDescription);
    socketio.emit("pcoffer", { socketid, sdp: offer });
    pcs.set(socketid, pc);
    setPcs(pcs);
  };

  await fetch("/api/socketio");
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
    console.log(`Successfully entered room ${roomid}`);
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
    await offer(socketid, socketio);

    // const pcnow = await peerConnect(socketid, socketio);
    // pcs.set(socketid, pcnow);
    // setPcs(pcs);
    // const dc = pcnow.createDataChannel("chat");
    // // dc.binaryType = "arraybuffer";
    // dc.onmessage = (msg) => {
    //   // console.log("received message over data channel:" + msg.data);
    //   setPasteContent(msg.data === "n/a" ? "" : msg.data);
    // };
    // dc.onopen = () => {
    //   console.log(`data channel created:${dcs.get(socketid)?.id}`);
    // };
    // dc.onclose = () => {
    //   dcs.set(socketid, dc);
    //   setDcs(dcs);
    //   console.log(`Datachannel of ${socketid} has closed.`);
    // };
    // dcs.set(socketid, dc);
    // setDcs(dcs);
    // const offer = await pcnow.createOffer();

    // await pcnow.setLocalDescription(offer);
    // // socket.send(pc.localDescription);
    // socketio.emit("pcoffer", { socketid, sdp: offer });
    // pcs.set(socketid, pcnow);
    // setPcs(pcs);
  });

  socketio.on("offer", async ({ socketid, sdp }: SocketSDP) => {
    /**
     * Guests who joined a room will get peerConnection invitation from
     * the room host and all other guests who joined before.
     */
    if (sdp.type === "offer") {
      const pcnow = await peerConnect(socketid, socketio);

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
      // console.log(`Added ice candidate: ${candidate?.candidate}`)
    }
  );

  socketio.on("icefailed", async (socketid: string) => {
    console.log(`icefailed event received from ${socketid}.`)
    await offer(socketid, socketio);
  });

  socketio.on("hangup", (socketid: string) => {
    console.log(`socket ${socketid} has left.`);
    pcs.get(socketid)?.close();
    pcs.delete(socketid);
    setPcs(pcs);
    dcs.delete(socketid);
    setDcs(dcs);
    console.log(`pcs: ${[...pcs.keys()]}`);
  });
  socketio.on("noroom", () => {
    setIsRoomError(true);
    setInRoom(false);
    setRoomid("");
    console.log("noroom");
  });
  // setSocket(socketio);
  return socketio;
};

export default socketIOInit;
