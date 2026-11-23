# Chess Together

Mobile-friendly browser multiplayer chess with private room links, no accounts, chess.js legal moves, and Socket.IO live synchronization.

## Run locally

```bash
npm install
npm start
```

Visit http://localhost:3000. To play from different devices over the internet, deploy the app to a Node.js host with WebSocket support (for example Render or Railway). Set the start command to `npm start`. Share the generated HTTPS URL; the first visitor becomes White and the second becomes Black. Additional visitors can spectate.

## Important notes

- This is an MVP. Rooms and games are stored in memory and disappear if the server restarts or everyone leaves.
- Players are assigned seats by connection order; refreshing may change a seat. There is no authentication or reconnect token.
- Anyone with the room link can join. No password, matchmaking, timers or chat yet.
- A backend host is necessary for cross-device multiplayer. A browser-only page cannot provide dependable room synchronization by itself.
