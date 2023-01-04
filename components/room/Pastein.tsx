import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Stack from "@mui/material/Stack";

import Container from "@mui/material/Container";
// import styles from "../../styles/Home.module.css";
import { useState, ChangeEvent, Dispatch, SetStateAction } from "react";
import { Socket } from "socket.io-client";

type PasteinProps = {
  roomid: string;
  dcs: Map<string, RTCDataChannel>;
  pasteContent: string;
  setPasteContent: Dispatch<SetStateAction<string>>;
  handleLeave: () => void;
};

const Pastein = ({
  roomid,
  dcs,
  pasteContent,
  setPasteContent,
  handleLeave,
}: PasteinProps): JSX.Element => {
  //   const [pasteContent, setPasteContent] = useState<string>("");

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
      </Box>
    </Container>
  );
};

export default Pastein;
