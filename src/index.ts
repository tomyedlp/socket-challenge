import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { CoinService } from './services/CoinService';

const app: Express = express();

const server = http.createServer(app);
const io: Server = new Server(server);

const PORT = process.env.PORT || 3000;

io.on('connection', (client) => {
  
  client.on('room', (room) => {
    // someone joins a room
    client.join(room);
    const coins = CoinService.getCoinsInRoom(room);
    client.emit('initialCoins', coins);

  });

  //someone grabbed a coin
  client.on('coinGrabbed', (room, coinId) => {
    CoinService.deleteCoin(room, coinId);
    // we emit everybody (except the sender) that coin is no longer available (a message on frontend like "someone grabbed a coin!")
    client.to(room).emit('coinDeleted');
  });
});


app.post('/api/totalcoins', (req: Request, res: Response) => {
    // req.body.room we get this info from somewhere on frontend
    const data = {
        totalCoins: CoinService.getCoinsInRoom(req.body.room),
    }
    res.json(data);
})


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

