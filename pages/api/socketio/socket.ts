import type { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";

type Data = {
  server: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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
      let device = "";
      // sending to all clients in the room (channel) except sender
      socket.on("message", (message) => {
        socket.broadcast.to(device).emit("message", message);
      });


      socket.on("create", () => {
        socket.join(socket.id);
        socket.emit("created", socket.id);
      });
      socket.on("join", (room: string) => {
        if ([...io.sockets.adapter.rooms.keys()].includes(room)) {
          socket.join(room);
          socket.emit("joined", room);
        } else {
          socket.emit("failed", room);
        }
      });

      socket.on("leave", (room: string | undefined) => {
        // sending to all clients in the room (channel) except sender
        if (room) {
          socket.broadcast.to(room).emit("hangup");
          socket.leave(room);
        }
      });
    });
    // io.on("disconnect", (socket) => { })
  }
  res.end();
};
