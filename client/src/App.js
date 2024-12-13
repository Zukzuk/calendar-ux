import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import socket from "./socket"; // Import the singleton socket instance
import NameInput from "./components/NameInput";
import ActiveTrainUsers from "./components/ActiveTrainUsers";
import TrainSelector from "./components/TrainSelector";
import CalendarGrid from "./components/CalendarGrid";
import Title from "./components/Title";
import { useUserState } from "./hooks/useUserState";
import { useTrainState } from "./hooks/useTrainState";
import "./App.css";

const trains = ["Train A", "Train B", "Train C"];

function App() {
    const [name, setName] = useState("");
    const [activeTrain, setActiveTrain] = useState(trains[0]);
    const [hasSubmittedName, setHasSubmittedName] = useState(false);

    const { connectedUsers, userTrainMap, resetName } = useUserState();
    const { selectedDates, pendingDates, handleDateClick, resetDates } = useTrainState(activeTrain);

    useEffect(() => {
        const cachedName = Cookies.get("username");
        if (cachedName) {
            setName(cachedName);
            setHasSubmittedName(true);
            socket.emit("set-name", cachedName); // Use the imported socket
        }
    }, []);

    const handleNameSubmit = () => {
        if (name.trim()) {
            setHasSubmittedName(true);
            Cookies.set("username", name.trim(), { expires: 7 });
            socket.emit("set-name", name.trim()); // Use the imported socket
        }
    };

    const handleResetName = () => {
        resetName();
        Cookies.remove("username");
        setName("");
        setHasSubmittedName(false);
    };

    return (
        <div className="app-container">
            <Title />
            {!hasSubmittedName ? (
                <NameInput name={name} setName={setName} onSubmit={handleNameSubmit} />
            ) : (
                <>
                    <TrainSelector trains={trains} activeTrain={activeTrain} setActiveTrain={setActiveTrain} />
                    <ActiveTrainUsers
                        activeTrain={activeTrain}
                        userTrainMap={userTrainMap}
                        connectedUsers={connectedUsers}
                        handleResetName={handleResetName}
                        handleResetDates={resetDates}
                    />
                    <CalendarGrid
                        handleDateClick={handleDateClick}
                        selectedDates={selectedDates}
                        pendingDates={pendingDates}
                    />
                </>
            )}
        </div>
    );
}

export default App;
