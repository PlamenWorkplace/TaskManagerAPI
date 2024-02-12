import {connect} from "amqplib";
import { EventEmitter } from "events";
import config from "./Config.js";

class RabbitMQ {

    static instance;

    static getInstance() {
        if (!this.instance) {
            this.instance = new RabbitMQ();
        }
        return this.instance;
    }

    async initialize() {
        try {
            const connection = await connect(config.url);

            this.userProducerChannel = await connection.createChannel();
            this.taskProducerChannel = await connection.createChannel();
            this.consumerChannel = await connection.createChannel();
            await this.consumerChannel.qos(1, false);

            await this.consumerChannel.assertQueue(config.queues.userResponseQueue);
            await this.consumerChannel.assertQueue(config.queues.taskResponseQueue);

            this.eventEmitter = new EventEmitter();

            await this.startConsumer();
        } catch(e) {
            console.error("RabbitMQ.initialize(): ", e);
        }
    }

    async sendUser(commandName, payload) {
        if (payload.email) {
            this.userProducerChannel.sendToQueue(
                config.queues.userRequestQueue,
                Buffer.from(JSON.stringify({ name: commandName, payload: payload })),
                {
                    replyTo: config.queues.userResponseQueue,
                    correlationId: payload.email.toString(),
                    expiration: 10
                }
            );

            return new Promise(resolve =>
                this.eventEmitter.once(payload.email, async data => {
                    resolve(JSON.parse(data.content.toString()));
                })
            );
        } else {
            return "0";
        }
    }

    sendAsyncTask(commandName, payload) {
        if (payload.email) {
            this.taskProducerChannel.sendToQueue(
                config.queues.taskRequestQueue,
                Buffer.from(JSON.stringify({ name: commandName, payload: payload })),
                {
                    replyTo: config.queues.taskResponseQueue,
                    correlationId: payload.email.toString(),
                    expiration: 10
                }
            );
        } else {
            console.error("RabbitMQ.sendAsyncTask(): Email is not defined!")
        }
    }

    async sendTask(commandName, payload) {
        this.sendAsyncTask(commandName, payload)

        return new Promise(resolve =>
            this.eventEmitter.once(payload.email, async data => {
                resolve(JSON.parse(data.content.toString()));
            })
        );
    }

    async startConsumer() {
        await this.consumerChannel.consume(
            config.queues.userResponseQueue,
            message => this.eventEmitter.emit(message.properties.correlationId.toString(), message),
            { noAck: true }
        );

        await this.consumerChannel.consume(
            config.queues.taskResponseQueue,
            message => this.eventEmitter.emit(message.properties.correlationId.toString(), message),
            { noAck: true }
        );
    }
}

export default RabbitMQ.getInstance();
