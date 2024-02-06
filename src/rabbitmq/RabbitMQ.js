import {connect} from "amqplib";
import { EventEmitter } from "events";
import config from "../rabbitmq/config.js";

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
            this.userConsumerChannel = await connection.createChannel();

            await this.userConsumerChannel.assertQueue(config.queues.userResponseQueue, {exclusive: true});

            this.eventEmitter = new EventEmitter();

            await this.startConsumer();
        } catch(error) {
            console.log("Error: ", error);
        }
    }

    async sendUser(commandName, payload) {
        if (payload.userId) {
            this.userProducerChannel.sendToQueue(
                config.queues.userRequestQueue,
                Buffer.from(JSON.stringify({ name: commandName, payload: payload })),
                {
                    replyTo: config.queues.userResponseQueue,
                    correlationId: payload.userId.toString(),
                    expiration: 10
                }
            );

            return new Promise(resolve =>
                this.eventEmitter.once(payload.userId, async data => {
                    resolve(JSON.parse(data.content.toString()));
                })
            );
        } else {
            return { error: "User id is not put!" };
        }
    }

    async startConsumer() {
        this.userConsumerChannel.consume(
            config.queues.userResponseQueue,
            message => this.eventEmitter.emit(message.properties.correlationId.toString(), message),
            { noAck: true }
        );
    }

}

export default RabbitMQ.getInstance();
