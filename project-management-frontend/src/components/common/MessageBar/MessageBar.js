import React, { useState, useEffect } from "react";

const MessageBar = ({ message, type }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (message) {
            setShow(true);
            const timer = setTimeout(() => setShow(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return show && <div className={`message-bar ${type}`}>{message}</div>;
};

export default MessageBar;
