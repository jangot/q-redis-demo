import { createClient } from 'redis';
import { EVENT, Listener } from './Listener.mjs';
import {Report} from "./Report.mjs";
import { Producer } from './Producer.mjs';
import { Broker } from './Broker.mjs';

const [
    node,
    script,
    producersCount,
    range
] = process.argv;
console.log(producersCount, range);
if (isNaN(producersCount)) {
    throw new Error('Producers argument must be a number');
}
if (isNaN(range)) {
    throw new Error('Range argument must be a number');
}

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();
console.log('Connected')

const QUEUE_NAME = 'my:event';

const listener = new Listener(client, QUEUE_NAME, range);
const broker = new Broker(client, QUEUE_NAME);
broker.initProducers(producersCount, range);

listener.emitter.on(EVENT.ADD, async (data) => {
    console.log(data);
});

listener.emitter.on(EVENT.DONE, async ({ list }) => {
    broker.stop();
    await broker.lastOperation;
    await client.disconnect();
    const report = new Report(list);
    await report.writeToDisk('random-report');
});

listener.listen();
console.log('listen');
broker.run();
console.log('run');
