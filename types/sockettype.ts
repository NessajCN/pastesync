export interface SocketSDP {
  socketid: string;
  sdp: RTCSessionDescriptionInit;
}

// export interface SocketPC {
//   socketid: string;
//   pc: RTCPeerConnection;
// }

export interface SocketIceCandidate {
  socketid: string;
  candidate: RTCIceCandidate;
}
