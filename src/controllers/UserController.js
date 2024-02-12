import RabbitMQ from "../rabbitmq/RabbitMQ.js";
import express from "express";

const router = express.Router();

router.options((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
});

router.post("/login", async (req, res) => {
    const response = await RabbitMQ.sendUser("LOGIN", req.body);
    res.send(response);
});

router.post("/signup", async (req, res) => {
    const response = await RabbitMQ.sendUser("SIGNUP", req.body);
    res.send(response);
});

export default router;
