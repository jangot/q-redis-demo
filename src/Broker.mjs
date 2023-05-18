import { Producer } from './Producer.mjs';

export class Broker {
    producers = [];
    finished = false;
    constructor(client, queueName) {
        this.client = client;
        this.queueName = queueName;
        this.lastOperation = Promise.resolve();
    }

    initProducers(producersCount, range) {
        for (let i = 0; i < producersCount; i++) {
            this.producers.push(new Producer(this.client, this.queueName, range + 1));
        }
        console.log('this.producers', this.producers.length);
    }

    async run() {
        const promises = this.producers.map(producer => producer.push());
        this.lastOperation = Promise.all(promises);
        await this.lastOperation;
        if (!this.finished) {
            this.run();
        }
    }
    stop() {
        this.finished = true;
    }
}
