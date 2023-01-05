import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Stack from "@mui/material/Stack";

import Container from "@mui/material/Container";
import styles from "../../styles/Home.module.css";
import { useState, ChangeEvent, Dispatch, SetStateAction, useEffect } from "react";
import { Socket } from "socket.io-client";

type PasteinProps = {
  roomid: string;
  dcs: Map<string, RTCDataChannel>;
  socket: Socket | undefined;
  pasteContent: string;
  setPasteContent: Dispatch<SetStateAction<string>>;
  handleLeave: () => void;
};

const Pastein = ({
  roomid,
  dcs,
  socket,
  pasteContent,
  setPasteContent,
  handleLeave,
}: PasteinProps): JSX.Element => {
    const [localpeer, setLocalpeer] = useState<string>("");
    const [remotepeers, setRemotepeers] = useState<string[]>([]);

  const handlePaste = (e: ChangeEvent<HTMLInputElement>) => {
    setPasteContent(e.target.value);
    dcs.forEach((dc) => {
      try {
        dc.send(e.target.value ? e.target.value : "n/a");
      } catch (err) {
        console.error(err);
      }
    });
  };

  useEffect(()=>{
    setLocalpeer(socket?socket.id:"");
    setRemotepeers([...dcs.keys()]);
  });

  return (
    <Container maxWidth="sm">
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          onClick={() => {
            setPasteContent("");
            dcs.forEach((dc) => {
              dc.send("n/a");
            });
          }}
          sx={{ height: 55, width: "50%" }}
        >
          Clear contents
        </Button>
        <Button
          variant="contained"
          onClick={handleLeave}
          sx={{ height: 55, width: "50%" }}
        >
          Leave the room
        </Button>
      </Stack>

      <Box mt={5} sx={{ width: "100%" }}>
        <TextField
          id="pastefield"
          label={`Room ID: ${roomid}`}
          value={pasteContent}
          onChange={handlePaste}
          multiline
          sx={{ width: "100%" }}
          variant="filled"
          helperText="Paste your text here."
        />
        <p className={styles.description}>
          Local peer: <br />
          {localpeer}
        </p>
        <p className={styles.description}>
          Remote peers:
          <br />
          {remotepeers.map((item) => (
            <span key={item}>
              {item}
              <br />
            </span>
          ))}
        </p>
      </Box>
    </Container>
  );
};

export default Pastein;
