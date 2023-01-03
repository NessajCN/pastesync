import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// import styles from "../../styles/Home.module.css";
import { useState, ChangeEvent, Dispatch, SetStateAction } from "react";

type PasteinProps = {
  roomid: string;
  dcs: Map<string, RTCDataChannel>;
  pasteContent: string;
  setPasteContent: Dispatch<SetStateAction<string>>;
};

const Pastein = ({
  roomid,
  dcs,
  pasteContent,
  setPasteContent,
}: PasteinProps): JSX.Element => {
  //   const [pasteContent, setPasteContent] = useState<string>("");

  const handlePaste = (e: ChangeEvent<HTMLInputElement>) => {
    setPasteContent(e.target.value);
    dcs.forEach((dc) => {
      dc.send(e.target.value ? e.target.value : "n/a");
    });
  };
  return (
    <Container maxWidth="sm">
      {/* <div className={styles.description}>{roomid}</div> */}
      <Box sx={{ width: "100%" }}>
        <TextField
          id="pastefield"
          label={`Room ID: ${roomid}`}
          value={pasteContent}
          onChange={handlePaste}
          multiline
          sx={{ width: "100%" }}
          variant="filled"
        />
      </Box>
    </Container>
  );
};

export default Pastein;
