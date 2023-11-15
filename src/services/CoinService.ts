import redis from 'redis';
import { Coin } from '../models/Coin';

const client = redis.createClient({
    url: '127.0.0.1:6379'
});

const MAX_VALUES = 100;

export class CoinService {

   static async generateCoins(room: string, quantity: number): Promise<Array<Object>> {

    const reply: string | null = await client.get("coins-"+room);
    const data = reply ? JSON.parse(reply) : null;
    if(data !== null) {
        return data
    } else {
        let i = 1;
        let coins = [];
        while(i <= quantity) {
            let coin: Coin = {
                id: i,
                area: {
                    x: Math.floor(Math.random() * MAX_VALUES) + 1,
                    y: Math.floor(Math.random() * MAX_VALUES) + 1,
                    z: Math.floor(Math.random() * MAX_VALUES) + 1
                }
            }
            coins.push(coin);
            i++;
        }
        await client.set("coins-"+room, JSON.stringify(coins), {EX: 60*60}); //expires in one hour
        return coins;
    }

  }

  static async getCoinsInRoom(room: string): Promise<number> {
    const coins: string | null = await client.get("coins-"+room);
    if(coins !== null) 
        return coins.length
    else {
        return 0;
    }
    
  }

  static async deleteCoin(room: string, id: number): Promise<void> {
    const coins: string | null = await client.get("coins-"+room);
    const data = coins ? JSON.parse(coins) : null;
    let auxData = data
    for (var i = 0; i < data.length; i++) {
        if(data[i].id === id) {
            auxData.splice(i, 1)
        }
    }
    await client.set("coins-"+room, JSON.stringify(auxData)); //here doesnt expire when coin is deleted
  }
  
}