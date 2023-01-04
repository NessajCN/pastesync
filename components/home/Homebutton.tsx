import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ReactMarkdown from "react-markdown";
import { ChangeEvent, useState, Dispatch, SetStateAction } from "react";

type HomebuttonProps = {
  roomid: string;
  setRoomid: Dispatch<SetStateAction<string>>;
  // setInRoom: Dispatch<SetStateAction<boolean>>;
  isRoomError: boolean;
  setIsRoomError: Dispatch<SetStateAction<boolean>>;
  handleCreate: () => Promise<void>;
  handleJoin: () => Promise<void>;
};

// interface HomebuttonProps {
//   setInRoom:Dispatch<SetStateAction<boolean>>
// }

const intro = `# How to use:
- Create a room with a random ID by clicking \`[CREATE A ROOM]\` button on any client page.

- Input the created room ID in the text field above and click \`[JOIN THE ROOM]\` button on other clients.
`;

const Homebutton = ({
  roomid,
  // setInRoom,
  setRoomid,
  isRoomError,
  setIsRoomError,
  handleCreate,
  handleJoin,
}: HomebuttonProps): JSX.Element => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsRoomError(false);
    setRoomid(e.target.value);
  };

  return (
    <Box component="form" sx={{ width: 350 }}>
      <Stack spacing={5}>
        <Button variant="contained" onClick={handleCreate} sx={{ height: 50 }}>
          Create a room
        </Button>
        <Stack direction="row" spacing={2}>
          <TextField
            id="room"
            label="Room ID"
            value={roomid}
            onChange={handleChange}
            sx={{ width: "50%" }}
            variant="outlined"
            error={isRoomError}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleJoin();
              }
            }}
            helperText={isRoomError ? "Invalid room ID.":"8-character room ID."}
          />
          <Button
            variant="contained"
            onClick={handleJoin}
            sx={{ height: 55, width: "50%" }}
          >
            Join the room
          </Button>
        </Stack>
        <Box component="div">
          <ReactMarkdown children={intro} />
        </Box>
        {/* <TextField
          id="room"
          label="Room No."
          value={roomid}
          onChange={handleChange}
          // sx={{ border: 1 }}
          variant="outlined"
        />
        <Button variant="contained" sx={{ height: 50 }}>
          Join room
        </Button> */}
      </Stack>
    </Box>
  );
};

export default Homebutton;
