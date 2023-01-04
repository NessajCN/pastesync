import Head from "next/head";
// import Image from "next/image";
// import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";

import Homebutton from "../components/home/Homebutton";
import { useState } from "react";

import socketIOInit from "../libs/socketio";
import { Socket } from "socket.io-client";
import Pastein from "../components/room/Pastein";

// const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [roomid, setRoomid] = useState<string>("");
  const [pasteContent, setPasteContent] = useState<string>("");

  const [pcs, setPcs] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [dcs, setDcs] = useState<Map<string, RTCDataChannel>>(new Map());
  const [socket, setSocket] = useState<Socket | undefined>();
  const [isRoomError, setIsRoomError] = useState<boolean>(false);

  // const pcs: Map<string, RTCPeerConnection> = new Map();
  // const dcs: Map<string, RTCDataChannel> = new Map();
  // let socket: Socket;

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
    // console.log(`socket:${socket?.id}`);
    // console.log(`pcs:${[...pcs.keys()]}`);
    // console.log(`dcs:${pcs}`);
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

  return (
    <>
      <Head>
        <title>Pastesync</title>
        <meta name="description" content="Paste texts among devices" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
            pasteContent={pasteContent}
            setPasteContent={setPasteContent}
            handleLeave={handleLeave}
          />
        )}
      </main>
      {/* <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Get started by editing&nbsp;
            <code className={styles.code}>pages/index.tsx</code>
          </p>
          <div>
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{" "}
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className={styles.vercelLogo}
                width={100}
                height={24}
                priority
              />
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            />
          </div>
        </div>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Find in-depth information about Next.js features and&nbsp;API.
            </p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Learn <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Templates <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Discover and deploy boilerplate example Next.js&nbsp;projects.
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Deploy <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Instantly deploy your Next.js site to a shareable URL
              with&nbsp;Vercel.
            </p>
          </a>
        </div>
      </main> */}
    </>
  );
}
