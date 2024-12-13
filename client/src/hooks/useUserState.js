// useUserState.js
import { useState, useEffect } from "react";
import socket from "../socket";

export const useUserState = () => {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [userTrainMap, setUserTrainMap] = useState({});

    // Update the connected users and user train map
    useEffect(() => {
        socket.on("update-users", setConnectedUsers);
        socket.on("update-user-trains", setUserTrainMap);

        return () => {
            socket.off("update-users");
            socket.off("update-user-trains");
        };
    }, []);

    // Reset the user's name
    const resetName = () => {
        socket.emit("reset-name");
    };

    return { connectedUsers, userTrainMap, resetName };
};
