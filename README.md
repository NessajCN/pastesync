# pastesync
### Syncing text among multiple devices.

#### How to use:
- Visit [Pastesync](https://pastesync.nessaj.net "Pastesync live demo") on different devices you are willing to sync paste.

- Click `CREATE A ROOM` on one visited page of the devices to generate a room with its random 8-character ID displaying at the text area.

- Input the random room ID in `Room ID` text box in all pages of other devices and click "JOIN THE ROOM" button.

- Wait until peer names displayed in `Local peer` and `Remote peers` areas.

- Paste your text in the text pasting area to sync your contents.

#### Deploy your own pastesync
**This project is still in active development. Feel free to fork the project and deploy your own pastesync site.**

```bash
git clone https://github.com/NessajCN/pastesync.git
cd pastesync
npm i
npm run build
npm run start
```