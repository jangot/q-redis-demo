import { createClient } from 'redis';
import { EVENT, Listener } from './Listener.mjs';

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
console.log('Connected')

const QUEUE_NAME = 'my:event';
const listener = new Listener(client, QUEUE_NAME, 5);

listener.emitter.on(EVENT.ADD, async (data) => {
    console.log(data);
});

listener.emitter.on(EVENT.DONE, async ({ list }) => {
    let first = new Date().getTime();
    let last = 0;

    const numbersGenerated = list.map(it => {
        if (first > it.time) first = it.time;
        if (last < it.time) last = it.time;

        return it.value;
    });
    console.log('DONE', {
        timeSpent: last - first,
        numbersGenerated
    });
    await client.disconnect();
});

listener.listen();
