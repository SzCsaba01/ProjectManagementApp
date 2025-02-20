import { useEffect, useState } from 'react';

const useWebSocket = (url, page, id, userId, onMessageReceived) => {
    const [socket, setSocket] = useState();

    useEffect(() => {
        if (!url || !userId || !page || !id) {
            return;
        }

        if (socket) {
            return;
        }

        const ws = new WebSocket(url);

        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
            console.log('WebSocket connected');
            ws.send(
                JSON.stringify({
                    type: 'IDENTIFY',
                    userId: userId,
                    page: page,
                    id: id,
                }),
            );
        };

        ws.onmessage = (event) => {
            if (event.data instanceof ArrayBuffer) {
                const decoder = new TextDecoder('utf-8');
                const text = decoder.decode(event.data);

                try {
                    const jsonData = JSON.parse(text);
                    onMessageReceived(jsonData);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(ws);

        return () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [url, userId, socket, id, page, onMessageReceived]);

    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    };

    return {
        sendMessage,
    };
};

export default useWebSocket;
