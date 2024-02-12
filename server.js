import express from "express";
import http from "http";
import RabbitMQ from "./src/rabbitmq/RabbitMQ.js";
import userController from "./src/controllers/UserController.js";
import { handleMessage } from "./src/controllers/TaskController.js";
import { WebSocketServer } from "ws";

const api = express();
const server = http.createServer(api);
const wss = new WebSocketServer({ server: server, path: "/task" });

api.use(express.json());
api.use("/user", userController);

wss.on('connection', ws => {
    ws.on('message', async message => {
        await handleMessage(ws, message);
    });
});

server.listen(3000, RabbitMQ.initialize());
