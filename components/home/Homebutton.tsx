import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Homebutton = () => {
  return (
    <Box component="form">
      <Button variant="contained">Create room</Button>
      <Button variant="contained">Join room</Button>
    </Box>
  );
};

export default Homebutton;
