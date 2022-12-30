import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { ChangeEvent, useState } from "react";

const Homebutton = () => {
  const [roomNo, setRoomNo] = useState("");
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomNo(e.target.value);
  };
  return (
    <Box component="form" sx={{ width: 300 }}>
      <Stack spacing={5}>
        <Button variant="contained" sx={{ height: 50 }}>
          Create room
        </Button>
        <Stack direction="row" spacing={2}>
          <TextField
            id="room"
            label="Room No."
            value={roomNo}
            onChange={handleChange}
            sx={{ width: "50%" }}
            variant="outlined"
          />
          <Button variant="contained" sx={{ height: 55, width: "50%" }}>
            Join room
          </Button>
        </Stack>
        {/* <TextField
          id="room"
          label="Room No."
          value={roomNo}
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
