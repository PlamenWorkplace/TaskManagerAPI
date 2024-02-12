import RabbitMQ from "../rabbitmq/RabbitMQ.js";

const userConnections = {};

export async function handleMessage(ws, message) {
    try {
        const payload = JSON.parse(message);
        const {email, command} = payload;
        let response;
        if (command === "DISCONNECTED" && userConnections[email]) {
            delete userConnections[email];
        } else if (command === "CONNECTED" && !userConnections[email]) {
            response = await RabbitMQ.sendTask(command, payload);
            userConnections[email] = ws;
            ws.send(JSON.stringify(response));
        } else if (userConnections[email]) {
            RabbitMQ.sendAsyncTask(command, payload);
        }
    } catch (e) {
        console.error("TaskController.handleMessage(): ", e);
    }
}
