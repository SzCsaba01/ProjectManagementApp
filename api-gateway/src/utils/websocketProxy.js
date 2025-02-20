import WebSocket from 'ws';
import { WebSocketServer } from 'ws';

const createWebSocketProxy = (server, route) => {
    const wsProxy = new WebSocketServer({ server });

    wsProxy.on('connection', (clientSocket, _req) => {
        console.log('API Gateway: WebSocket connection from client');

        const microserviceSocket = new WebSocket(
            route.url.replace('http', 'ws'),
        );

        microserviceSocket.on('open', () => {
            console.log('API Gateway: Connected to Microservice WebSocket');

            clientSocket.on('message', (message) => {
                console.log(`API Gateway: Received: ${message}`);
                microserviceSocket.send(message);
            });

            microserviceSocket.on('message', (message) => {
                console.log(
                    `API Gateway: Forwarding from Microservice: ${message}`,
                );
                clientSocket.send(message);
            });

            clientSocket.on('close', () => {
                console.log('API Gateway: Client disconnected');
                microserviceSocket.close();
            });

            microserviceSocket.on('close', () => {
                console.log('API Gateway: Microservice WebSocket disconnected');
                clientSocket.close();
            });
        });

        // Handle WebSocket errors for microservice connection
        microserviceSocket.on('error', (error) => {
            console.error(
                'API Gateway: Error in Microservice WebSocket connection:',
                error,
            );
            clientSocket.close();
        });
    });

    console.log(`WebSocket Proxy enabled for ${route.route}`);
};

export default createWebSocketProxy;
