import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearNotification } from "../../context/notification.actions";
import "./NotificationBar.css";

const NotificationBar = () => {
    const notification = useSelector((state) => state.notifications);
    const dispatch = useDispatch();

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => dispatch(clearNotification()), 3500);
            return () => clearTimeout(timer);
        }
    }, [notification, dispatch]);

    if (!notification) {
        return null;
    }

    return (
        <div className={`notification-bar notification ${notification.type}`}>
            {notification.message}
        </div>
    );
};

export default NotificationBar;
