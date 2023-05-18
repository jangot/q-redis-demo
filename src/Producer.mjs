export class Producer {
    constructor(client, queueName, maxValue) {
        this.client = client;
        this.queueName = queueName;
        this.maxValue = maxValue;
    }

    async push() {
        const number = Math.floor(Math.random() * this.maxValue);
        await this.client.rPush(this.queueName, JSON.stringify({ number }));
    }
}
