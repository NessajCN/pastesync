import Image from "next/image";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import styles from "../../styles/Home.module.css";
import {
  useState,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { Socket } from "socket.io-client";
import IconButton from "@mui/material/IconButton";

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
  const [imageSrc, setImageSrc] = useState<string>("");

  const handleImage = async () => {
    try {
      // To be fixed: firefox has no "clipboard-read" permissionName and throws error.
      const permissionName = "clipboard-read" as PermissionName;
      const permission = await navigator.permissions.query({
        name: permissionName,
      });
      if (permission.state === "denied") {
        console.log("Not allowed to read clipboard.");
        return;
      }
      const clipboardContents = await navigator.clipboard.read();
      for (const item of clipboardContents) {
        if (!item.types.includes("image/png")) {
          console.log("Clipboard contains non-image data.");
          return;
        }
        const blob = await item.getType("image/png");
        setImageSrc(URL.createObjectURL(blob));

        dcs.forEach((dc) => {
          dc.send(blob);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  useEffect(() => {
    setLocalpeer(socket ? socket.id : "");
    setRemotepeers([...dcs.keys()]);
  });

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center" }}>
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
      <Box
        sx={{
          width: "100%",
          height: 80,
          position: "relative",
          mt: 3,
        }}
      >
        {/* To be fixed: Image link needed and image size should be loaded. */}
        {imageSrc ? (
          <Image src={imageSrc} alt="pastedImage" fill />
        ) : (
          <IconButton
            sx={{
              width: 80,
              height: 80,
              border: "2px dashed grey",
              borderRadius: 3,
            }}
            aria-label="pasteimage"
            size="large"
            onClick={handleImage}
          >
            <AddPhotoAlternateOutlinedIcon fontSize="inherit" />
          </IconButton>
        )}
      </Box>

      <Box mt={3} sx={{ width: "100%", textAlign: "left" }}>
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
          {remotepeers.length > 0 ? (
            `Remote peers:`
          ) : (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          )}
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
