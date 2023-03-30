import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "node:http";
import type { Socket as NetSocket } from "node:net";

import { Server as IOServer } from "socket.io";
import { SocketSDP, SocketIceCandidate } from "@/types/sockettype";
import { nanoid } from "nanoid";

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & { server: HTTPServer & { io?: IOServer | undefined } };
}

export default async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket && !res.socket.server.io) {
    const io = new IOServer(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("connect", () => {
        console.log(`socket ${socket.id} has connected.`);
      });

      socket.on("error", (err) => {
        console.log(`socket ${socket.id} error:${err}`);
      });
      socket.on("disconnect", (reason) => {
        console.log(
          `socket ${socket.id} has disconnected, \nreason: ${reason}`
        );
      });

      socket.on("disconnecting", (reason) => {
        socket.rooms.forEach((room: string) => {
          socket.to(room).emit("hangup", socket.id);
        });
      });

      // sdp handler
      let room: string = "";
      // sending to all clients in the room (channel) except sender
      socket.on("message", (message) => {
        socket.to(room).emit("message", message);
      });

      socket.on("create", () => {
        room = nanoid(8);
        socket.join(room);
        console.log(`created room: ${room}`);
        socket.emit("roomin", room);
      });
      socket.on("join", (roomid: string) => {
        if ([...io.sockets.adapter.rooms.keys()].includes(roomid)) {
          room = roomid;
          socket.join(room);
          socket.emit("roomin", roomid);
          socket.to(room).emit("joined", socket.id);
        } else {
          socket.emit("noroom", roomid);
        }
      });

      socket.on("pcoffer", ({ socketid, sdp }: SocketSDP) => {
        io.to(socketid).emit("offer", { socketid: socket.id, sdp });
      });

      socket.on("pcanswer", ({ socketid, sdp }: SocketSDP) => {
        io.to(socketid).emit("answer", { socketid: socket.id, sdp });
      });

      socket.on(
        "pcicecandidate",
        ({ socketid, candidate }: SocketIceCandidate) => {
          io.to(socketid).emit("icecandidate", {
            socketid: socket.id,
            candidate,
          });
        }
      );
        
      socket.on("iceconnectionfailed", (socketid: string) => {
        // emit "icefailed" event to signal a dial back.
        io.to(socketid).emit("icefailed", socket.id);
      });

      socket.on("leave", (roomid: string) => {
        // sending to all clients in the room (channel) except sender
        if (socket.rooms.has(roomid)) {
          socket.to(roomid).emit("hangup", socket.id);
          socket.leave(roomid);
        }
      });
    });
    // io.on("disconnect", (socket) => { })
  }
  res.end();
};
