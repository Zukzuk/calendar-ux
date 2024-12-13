// useTrainState.js
import { useState, useEffect } from "react";
import socket from "../socket";

export const useTrainState = (activeTrain) => {
    const [selectedDates, setSelectedDates] = useState({});
    const [pendingDates, setPendingDates] = useState({});

    useEffect(() => {
        // Initialize the selected dates and pending dates for the active train
        socket.on("init-dates", (dates) => setSelectedDates(dates));

        // Update the selected dates and pending dates for the active train
        socket.on("update-dates", (updatedDates) => {
            setPendingDates((prev) => {
                const updatedPending = { ...prev };
    
                // Check the pending dates for the active train
                const currentPending = new Set(prev[activeTrain] || []);
    
                // Remove resolved pending dates for the active train
                Object.keys(updatedDates).forEach((date) => {
                    if (currentPending.has(date)) {
                        currentPending.delete(date);
                    }
                });
    
                // Only update the pending dates for the active train
                updatedPending[activeTrain] = currentPending;
                return updatedPending;
            });
    
            // Fully rely on the server response to update selected dates
            setSelectedDates(updatedDates);
        });

        // Handle date collision errors
        socket.on("date-error", ({ date, message }) => {
            console.log("date-error", date, "->", message);
            setPendingDates((prev) => {
                const updatedPending = { ...prev };
                const currentPending = new Set(prev[activeTrain] || []);
                currentPending.delete(date);
                updatedPending[activeTrain] = currentPending;
                return updatedPending;
            });
        });

        return () => {
            socket.off("init-dates");
            socket.off("update-dates");
            socket.off("date-error");
        };
    }, [activeTrain]);

    // Join the active train room and switch to the active train
    useEffect(() => {
        socket.emit("join-train", activeTrain);
        socket.emit("switch-train", activeTrain);
    }, [activeTrain]);

    // Handle date click events
    const handleDateClick = (date) => {
        const dateString = date.toDateString();

        setPendingDates((prev) => ({
            ...prev,
            [activeTrain]: new Set([...(prev[activeTrain] || []), dateString]),
        }));

        setSelectedDates((prev) => {
            const updated = { ...prev };
            delete updated[dateString];
            return updated;
        });

        socket.emit("toggle-date", { date: dateString, train: activeTrain });
    };
    
    // Reset the selected dates for the active train
    const resetDates = () => {
        socket.emit("reset-dates");
    };

    return { selectedDates, pendingDates: pendingDates[activeTrain] || new Set(), handleDateClick, resetDates };
};
