import type { NextApiRequest, NextApiResponse } from 'next'
import { Server } from "socket.io";

type Data = {
  name: string
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (!res.socket?.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      // socket.on("servo-control", async ({ url: camurl, pwm }) => {
      //   await servoControl(camurl, 18, pwm);
      // });
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

      // custom heartbeat check for client connection 
      // to enable rtsp streaming on device.
      socket.on("heartbeatping", () => {
        io.in(device).emit("heartbeatpong");
        // console.log(device,"pong");
      });

      socket.on("find", (devid) => {
        // const url = socket.request.headers.referer.split("/");
        device = devid;
        const sr = io.sockets.adapter.rooms.get(device);
        // console.log("sr:",sr)
        if (sr === undefined) {
          // no room with such name is found so create it
          socket.join(device);
          socket.emit("create");
          console.log("created:", [...io.sockets.sockets.keys()], sr);
          // } else {
        } else if (sr.size === 1) {
          socket.join(device);
          socket.emit("join");
          console.log("join:", [...io.sockets.sockets.keys()], sr);
        } else {
          // max two clients
          socket.emit("full", device);
          // console.log("full:",[...io.sockets.sockets.keys()],sr)
        }
      });
      socket.on("servo-control", ({ param }) => {
        // if(param>=500 && param <=2500) {
        socket.broadcast.to(device).emit("servo-control", param);
        // }
      });

      // Events to transfer recording list.
      socket.on("getRecList", () => {
        socket.to(device).emit("getRecList");
      });
      socket.on("recList", (list) => {
        socket.to(device).emit("recList", list);
      });
      socket.on("fetchRecs", (recFile) => {
        socket.to(device).emit("fetchRecs", recFile);
      });

      // socket.on("auth", data => {
      socket.on("auth", () => {
        const sid = socket.id;
        // sending to all clients in the room (channel) except sender
        socket.broadcast.to(device).emit("approve", sid);
        // console.log(io.sockets.adapter.rooms.get(device))
      });
      socket.on("accept", (pathid) => {
        // console.log(io.sockets.sockets.get(id));
        // io.sockets.sockets.get(id).join(device);
        // io.sockets.adapter.rooms[id].join(device);
        // sending to all clients in 'device' room(channel), include sender
        io.to(device).emit("bridge", pathid);
        // socket.broadcast.to(device).emit("bridge", id);
      });
      socket.on("reject", () => socket.emit("full"));
      socket.on("leave", () => {
        console.log("left");
        // sending to all clients in the room (channel) except sender
        socket.broadcast.to(device).emit("hangup");
        socket.leave(device);
      });
    });
    // io.on("disconnect", (socket) => { })
  }
  res.end();
}

