let connectedUsers = {};
let userTrainMap = {};
let selectedDatesByTrain = {};

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        const stringToColor = (input) => {
            // Simple hash function
            const hash = Array.from(input).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
            // Map the hash to a hue value
            let hue = hash % 360;
            if (hue >= 50 && hue <= 70) {
                hue = (hue + 100) % 360; // Shift hue if in yellow range
            }
        
            const saturation = 80; // High saturation for vibrant colors
            const lightness = 40; // Lower lightness for darker shades
        
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };
        
        connectedUsers[socket.id] = { id: socket.id, name: socket.id };
        io.emit("update-users", Object.values(connectedUsers));

        let currentTrain = null;

        socket.on("set-name", (name) => {
            connectedUsers[socket.id].name = name || socket.id;
            const defaultColor = stringToColor(name);
            connectedUsers[socket.id].color = defaultColor;
            console.log("User logged in:", socket.id, connectedUsers[socket.id].name);
            io.emit("update-users", Object.values(connectedUsers));
        });

        socket.on("reset-name", () => {
            console.log("User logged out:", socket.id, connectedUsers[socket.id].name);
            delete connectedUsers[socket.id].name;
            io.emit("update-users", Object.values(connectedUsers));
        });

        socket.on("toggle-date", ({ date, train }) => {
            if (!selectedDatesByTrain[train]) selectedDatesByTrain[train] = {};

            setTimeout(() => {
                let conflict = false;

                for (const [otherTrain, dates] of Object.entries(selectedDatesByTrain)) {
                    if (otherTrain !== train && dates[date]) {
                        conflict = true;
                        socket.emit("date-error", {
                            date,
                            message: `Already planned for '${otherTrain}'`,
                        });
                        break;
                    }
                }

                if (!conflict) {
                    if (selectedDatesByTrain[train][date]) {
                        delete selectedDatesByTrain[train][date];
                    } else {
                        selectedDatesByTrain[train][date] = {
                            user: connectedUsers[socket.id].name,
                            color: connectedUsers[socket.id].color,
                        };
                    }

                    io.to(train).emit("update-dates", selectedDatesByTrain[train]);
                }
            }, Math.random() * 3000);
        });

        socket.on("reset-dates", () => {
            if (currentTrain) {
                selectedDatesByTrain = {};
                io.to(currentTrain).emit("update-dates", selectedDatesByTrain);
            }
        });

        socket.on("switch-train", (train) => {
            currentTrain = train;
            if (!selectedDatesByTrain[train]) selectedDatesByTrain[train] = {};
            socket.emit("init-dates", selectedDatesByTrain[train]);
        });

        socket.on("join-train", (train) => {
            userTrainMap[socket.id] = train;
            socket.leave(currentTrain);
            socket.join(train);
            currentTrain = train;

            io.emit("update-user-trains", userTrainMap);
            io.emit("update-users", Object.values(connectedUsers));
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            delete connectedUsers[socket.id];
            delete userTrainMap[socket.id];

            io.emit("update-users", Object.values(connectedUsers));
            io.emit("update-user-trains", userTrainMap);
        });
    });
};
