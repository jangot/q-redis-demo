import EventEmitter from 'events';
import { commandOptions } from 'redis';

export const EVENT = {
    DONE: 'done',
    ADD: 'add'
}

const TIMEOUT = 5;
export class Listener {
    emitter = new EventEmitter();
    count = 0;
    list = [];

    constructor(client, queueName, size) {
        this.client = client;
        this.queueName = queueName;
        this.size = size;
    }
    async listen() {
        const res = await this.client.blPop(
            commandOptions({ isolated: true }),
            this.queueName,
            TIMEOUT
        );

        this.addItem(res);
        if (this.wasFinished()) {
            return this.finish();
        }

        return this.listen();
    }

    finish() {
        this.emitter.emit(EVENT.DONE, { list: this.list });
    }

    wasFinished() {
        return this.count > this.size;
    }
    addItem(event) {
        if (!event) return;

        try {
            const data = JSON.parse(event.element);
            if (
                isNaN(data.number)
                || this.list[data.number]
                || data.number < 0
                || data.number > this.size
            ) return;

            const item = {
                value: data.number,
                time: new Date().getTime()
            }
            this.count++;
            this.list[data.number] = item;

            this.emitter.emit(EVENT.ADD, { item });
        } catch (err) {
            console.log(err);
        }
    }
}