import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { ChangeEvent, useState, Dispatch, SetStateAction } from "react";

type HomebuttonProps = {
  roomid: string;
  setRoomid: Dispatch<SetStateAction<string>>;
  setInRoom: Dispatch<SetStateAction<boolean>>;
  isRoomError: boolean;
  setIsRoomError: Dispatch<SetStateAction<boolean>>;
  handleCreate: () => Promise<void>;
  handleJoin: () => Promise<void>;
};

// interface HomebuttonProps {
//   setInRoom:Dispatch<SetStateAction<boolean>>
// }

const Homebutton = ({
  roomid,
  setInRoom,
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
    <Box component="form" sx={{ width: 300 }}>
      <Stack spacing={5}>
        <Button variant="contained" onClick={handleCreate} sx={{ height: 50 }}>
          Create room
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
            onKeyDown={async (e)=>{if (e.key === 'Enter') {
              await handleJoin();
            }}}
            helperText={isRoomError && "Invalid room ID."}
          />
          <Button
            variant="contained"
            onClick={handleJoin}
            sx={{ height: 55, width: "50%" }}
          >
            Join room
          </Button>
        </Stack>
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
