import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";
import NameInput from "./components/NameInput";
import ActiveTrainUsers from "./components/ActiveTrainUsers";
import TrainSelector from "./components/TrainSelector";
import CalendarGrid from "./components/CalendarGrid";
import Title from "./components/Title";
import "./App.css";

const socket = io();
const trains = ["Train A", "Train B", "Train C"]; // List of trains

function App() {
    const [selectedDates, setSelectedDates] = useState({}); // Selected dates with user info
    const [pendingDates, setPendingDates] = useState({}); // Pending dates by train
    const [connectedUsers, setConnectedUsers] = useState([]); // List of connected users
    const [userTrainMap, setUserTrainMap] = useState({}); // Map of users to their trains
    const [name, setName] = useState(""); // User's name input
    const [activeTrain, setActiveTrain] = useState(trains[0]); // Currently active train
    const [hasSubmittedName, setHasSubmittedName] = useState(false); // Track if name has been submitted

    useEffect(() => {
        // Check for cached name in cookies
        const cachedName = Cookies.get("username");
        if (cachedName) {
            setName(cachedName); // Set name from cookie
            setHasSubmittedName(true); // Mark as submitted
            socket.emit("set-name", cachedName); // Send name to server
        }
    }, []);

    useEffect(() => {
        // Initialize data and listen for updates
        socket.on("init-dates", (dates) => setSelectedDates(dates));
        socket.on("update-dates", (updatedDates) => setSelectedDates(updatedDates));
        socket.on("update-users", (users) => setConnectedUsers(users));
        socket.on("update-user-trains", (trainMap) => setUserTrainMap(trainMap));

        return () => {
            socket.off("init-dates");
            socket.off("update-dates");
            socket.off("update-users");
            socket.off("update-user-trains");
        };
    }, []);

    useEffect(() => {
        // Fetch data for the active train when it changes
        socket.emit("join-train", activeTrain); // Join the train's room
        socket.emit("switch-train", activeTrain); // Request data for the active train
    }, [activeTrain]);

    useEffect(() => {
        // Listen for updates to dates
        socket.on("update-dates", (updatedDates) => {
            setPendingDates((prev) => {
                const updatedPending = { ...prev };

                // Remove all resolved dates for the current train
                const currentPending = new Set(prev[activeTrain] || []);
                Object.keys(updatedDates).forEach((date) => currentPending.delete(date));

                // Ensure dates not present in the server response are also cleared
                Array.from(currentPending).forEach((pendingDate) => {
                    if (!updatedDates[pendingDate]) {
                        currentPending.delete(pendingDate);
                    }
                });

                updatedPending[activeTrain] = currentPending;
                return updatedPending;
            });

            // Fully rely on the server response to update selected dates
            setSelectedDates(updatedDates);
        });

        // Handle errors for conflicting dates
        socket.on("date-error", ({ date, message }) => {
            console.log("date-error::", date, '->', message);

            setPendingDates((prev) => {
                const updatedPending = { ...prev };
                const currentPending = new Set(prev[activeTrain] || []);
                currentPending.delete(date);
                updatedPending[activeTrain] = currentPending;
                return updatedPending;
            });
        });

        return () => {
            socket.off("update-dates");
            socket.off("date-error");
        };
    }, [activeTrain]);


    const handleDateClick = (date) => {
        const dateString = date.toDateString();

        // Add to pending dates for the current train
        setPendingDates((prev) => ({
            ...prev,
            [activeTrain]: new Set([...(prev[activeTrain] || []), dateString]),
        }));

        // Optimistically remove the date from selectedDates
        setSelectedDates((prev) => {
            const updated = { ...prev };
            delete updated[dateString];
            return updated;
        });

        // Emit the toggle-date command to the server
        socket.emit("toggle-date", { date: dateString, train: activeTrain });
    };

    const handleNameSubmit = () => {
        // Submit name to server
        if (name.trim()) {
            setHasSubmittedName(true); // Mark as submitted
            Cookies.set("username", name.trim(), { expires: 7 }); // Cache name in cookie for 7 days
            socket.emit("set-name", name.trim()); // Send name to server
        }
    };

    const handleResetName = () => {
        // Reset name by clearing the cookie and state
        socket.emit("reset-name"); // Notify the server to reset the name
        Cookies.remove("username"); // Remove the username cookie
        setName(""); // Clear the name state
        setHasSubmittedName(false); // Reset the submitted state
    };

    const handleResetDates = () => {
        socket.emit("reset-dates"); // Notify the server to reset the dates
    };

    return (
        <div className="app-container">
            <Title />
            {!hasSubmittedName ? (
                // Render NameInput as landing page
                <NameInput name={name} setName={setName} onSubmit={handleNameSubmit} />
            ) : (
                // Render calendar-related components after name submission
                <>
                    <TrainSelector
                        trains={trains}
                        activeTrain={activeTrain}
                        setActiveTrain={setActiveTrain}
                    />
                    <ActiveTrainUsers
                        activeTrain={activeTrain}
                        userTrainMap={userTrainMap}
                        connectedUsers={connectedUsers}
                        handleResetName={handleResetName}
                        handleResetDates={handleResetDates}
                    />
                    <CalendarGrid
                        handleDateClick={handleDateClick}
                        selectedDates={selectedDates}
                        pendingDates={pendingDates[activeTrain] || new Set()} // Only pass pending dates for the active train
                    />
                </>
            )}
        </div>
    );
}

export default App;
