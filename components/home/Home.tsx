'use client'
import Head from "next/head";
import styles from "@/styles/Home.module.css";

import Homebutton from "./Homebutton";
import { useEffect, useState } from "react";

import socketIOInit from "@/libs/socketio";
import { Socket } from "socket.io-client";
import Pastein from "../room/Pastein";

type HomeProps = {
  rid?: string;
};

export default function Home({ rid }: HomeProps) {
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [roomid, setRoomid] = useState<string>("");
  const [pasteContent, setPasteContent] = useState<string>("");

  const [pcs, setPcs] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [dcs, setDcs] = useState<Map<string, RTCDataChannel>>(new Map());
  const [socket, setSocket] = useState<Socket | undefined>();
  const [isRoomError, setIsRoomError] = useState<boolean>(false);

  const handleCreate = async () => {
    setInRoom(true);
    const socketio = await socketIOInit(
      setPasteContent,
      pcs,
      setPcs,
      dcs,
      setDcs,
      setIsRoomError,
      setRoomid,
      setInRoom
    );
    socketio.emit("create");
    setSocket(socketio);
  };
  const handleJoin = async () => {
    if (roomid === "") {
      setIsRoomError(true);
    } else {
      setInRoom(true);
      const socketio = await socketIOInit(
        setPasteContent,
        pcs,
        setPcs,
        dcs,
        setDcs,
        setIsRoomError,
        setRoomid,
        setInRoom
      );
      socketio.emit("join", roomid);
      setSocket(socketio);
    }
  };

  const handleLeave = () => {
    socket?.emit("leave", roomid);
    setRoomid("");
    socket?.disconnect();
    dcs.forEach((dc: RTCDataChannel) => {
      dc.close();
    });
    pcs.forEach((pc: RTCPeerConnection) => {
      pc.close();
    });
    pcs.clear();
    dcs.clear();
    setPcs(pcs);
    setDcs(dcs);
    setPasteContent("");
    setInRoom(false);
  };

  // useEffect(() => {
  //   if (rid) {
  //     handleJoin();
  //   }
  // },[rid]);
  return (
    <main className={styles.main}>
      <h1>Pastesync</h1>
      {!inRoom && (
        <Homebutton
          // setInRoom={setInRoom}
          roomid={roomid}
          setRoomid={setRoomid}
          isRoomError={isRoomError}
          setIsRoomError={setIsRoomError}
          handleCreate={handleCreate}
          handleJoin={handleJoin}
        />
      )}
      {/* {inRoom && <div className={styles.description}>{roomid}</div>} */}
      {inRoom && (
        <Pastein
          roomid={roomid}
          dcs={dcs}
          socket={socket}
          pasteContent={pasteContent}
          setPasteContent={setPasteContent}
          handleLeave={handleLeave}
        />
      )}
    </main>
  );
}
