import { WebSocketServer } from 'ws';

let wss;
const userConnections = new Map();

const sprintClients = new Map();
const backlogClients = new Map();

export const initializeWebSocketServer = (server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws, _req) => {
        let currentUserId = null;
        let currentSprintId = null;
        let currentBacklogId = null;

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'IDENTIFY') {
                    currentUserId = data.userId;
                    if (data.page === 'SPRINT') {
                        currentSprintId = data.id;
                    } else if (data.page === 'BACKLOG') {
                        currentBacklogId = data.id;
                    }

                    userConnections.set(currentUserId, ws);

                    if (currentSprintId) {
                        if (!sprintClients.has(currentSprintId)) {
                            sprintClients.set(currentSprintId, []);
                        }
                        sprintClients.get(currentSprintId).push(currentUserId);
                    }
                    if (currentBacklogId) {
                        if (!backlogClients.has(currentBacklogId)) {
                            backlogClients.set(currentBacklogId, []);
                        }
                        backlogClients
                            .get(currentBacklogId)
                            .push(currentUserId);
                    }
                }
            } catch (error) {
                console.error('Invalid WebSocket message received:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            if (currentUserId) {
                userConnections.delete(currentUserId);
            }
            if (currentSprintId) {
                const users = sprintClients.get(currentSprintId) || [];
                sprintClients.set(
                    currentSprintId,
                    users.filter((id) => id !== currentUserId),
                );
            }
            if (currentBacklogId) {
                const users = backlogClients.get(currentBacklogId) || [];
                backlogClients.set(
                    currentBacklogId,
                    users.filter((id) => id !== currentUserId),
                );
            }
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    });
};

export const sendUpdateToSprintAsync = async (sprintId, message) => {
    if (sprintClients.has(sprintId)) {
        const userIds = sprintClients.get(sprintId);
        await Promise.all(
            userIds.map(async (userId) => {
                const userWs = userConnections.get(userId);
                if (userWs && userWs.readyState === userWs.OPEN) {
                    const jsonMessage = JSON.stringify(message);
                    await new Promise((resolve) => {
                        userWs.send(jsonMessage, resolve);
                    });
                }
            }),
        );
    }
};

export const sendUpdateToBacklogAsync = async (backlogId, message) => {
    if (backlogClients.has(backlogId)) {
        const userIds = backlogClients.get(backlogId);
        await Promise.all(
            userIds.map(async (userId) => {
                const userWs = userConnections.get(userId);
                if (userWs && userWs.readyState === userWs.OPEN) {
                    const jsonMessage = JSON.stringify(message);
                    await new Promise((resolve) => {
                        userWs.send(jsonMessage, resolve);
                    });
                }
            }),
        );
    }
};
