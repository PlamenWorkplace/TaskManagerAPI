import express from "express";
import RabbitMQ from "./src/rabbitmq/RabbitMQ.js";

const server = express();
server.use(express.json());

server.post("/user/login", async (req, res) => {
    const response = await RabbitMQ.sendUser("login", req.body);
    res.send(response);
});

server.post("/user/signup", async (req, res) => {
    const response = await RabbitMQ.sendUser("signup", req.body);
    res.send(response);
});

server.listen(3000, RabbitMQ.initialize());
