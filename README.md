# Task Manager: API Gateway

The Task Manager API Gateway serves as a middleware between the client and the business logic.
On one hand, it receives http requests for creating and authenticating users.
They are sent to RabbitMQ and a synchronous response is expected to be returned.
On the other hand, it also receives messages through a websocket related to the users' tasks.
They are also send asynchronously to RabbitMQ for further processing.
