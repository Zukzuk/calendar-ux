import React from "react";
import "./ActiveTrainUsers.css"; // Optional, for styling if needed

const ActiveTrainUsers = ({ activeTrain, userTrainMap, connectedUsers, handleResetName, handleResetDates }) => {
    // Filter users for the active train
    const usersForActiveTrain = Object.entries(userTrainMap)
        .filter(([_, train]) => train === activeTrain)
        .map(([userId]) => connectedUsers.find((user) => user.id === userId))
        .filter(Boolean); // Remove undefined entries

    return (
        <div className="active-train-users">
            <button className="reset-button" onClick={handleResetDates}>
                Reset complete calendar
            </button>
            <br />
            <button className="reset-button" onClick={handleResetName}>
                Logout
            </button>
            <h5>Users in {activeTrain}</h5>
            {usersForActiveTrain.length > 0 ? (
                usersForActiveTrain.map((user) => (
                    <div
                        key={user.id}
                        className="user-label"
                        style={{ backgroundColor: user.color || "#ccc" }}
                    >
                        {user.name || "Anonymous"}
                    </div>
                ))
            ) : (
                <p className="no-users">No users connected</p>
            )}
        </div>
    );
};

export default ActiveTrainUsers;
