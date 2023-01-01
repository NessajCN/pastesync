import type { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import { SocketSDP } from "../../../types/sockettype";
// type Data = {
//   server: string;
// };

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (res.socket && !res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("error", (err) => {
        console.log(err);
      });
      socket.on("disconnect", (reason) => {
        console.log(reason);
      });

      // sdp handler
      let room: string = "";
      // sending to all clients in the room (channel) except sender
      socket.on("message", (message) => {
        socket.to(room).emit("message", message);
      });

      socket.on("create", () => {
        room = socket.id;
        socket.join(room);
        socket.emit("created", socket.id);
      });
      socket.on("join", (roomid: string) => {
        if ([...io.sockets.adapter.rooms.keys()].includes(roomid)) {
          room = roomid;
          socket.join(room);
          // socket.emit("joined", roomid);
          socket.to(room).emit("joined", socket.id);
        } else {
          socket.emit("noroom", roomid);
        }
      });

      socket.on("pcoffer",({socketid, sdp}: SocketSDP)=>{
        io.to(socketid).emit("offer", {socketid: socket.id, sdp})
      });

      socket.on("pcanswer",({socketid, sdp}: SocketSDP)=>{
        io.to(socketid).emit("answer", {socketid: socket.id, sdp})
      });

      socket.on("leave", () => {
        // sending to all clients in the room (channel) except sender
        if (room !== "") {
          socket.to(room).emit("hangup");
          socket.leave(room);
        }
      });
    });
    // io.on("disconnect", (socket) => { })
  }
  res.end();
};
