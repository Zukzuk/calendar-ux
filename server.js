const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Global state
let connectedUsers = {}; // Store connected users as { socketId: { name, color } }
let userTrainMap = {}; // { socketId: trainName }
let selectedDatesByTrain = {}; // { train: { date: { user, color } } }

// Serve React static files
const clientBuildPath = path.join(__dirname, "client/build");
app.use(express.static(clientBuildPath));

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const defaultColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
    connectedUsers[socket.id] = { id: socket.id, name: socket.id, color: defaultColor };
    io.emit("update-users", Object.values(connectedUsers));

    // Track which train the user is currently viewing
    let currentTrain = null;

    socket.on("set-name", (name) => {
        connectedUsers[socket.id].name = name || socket.id;
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
            // Check for conflicts
            let conflict = false;

            for (const [otherTrain, dates] of Object.entries(selectedDatesByTrain)) {
                if (otherTrain !== train && dates[date]) {
                    // Conflict: Date is already selected by another train
                    conflict = true;
                    socket.emit("date-error", {
                        date,

                        message: `Already planned for '${otherTrain}'`,
                    });
                    break;
                }
            }

            // If no conflict, toggle the date
            if (!conflict) {
                if (selectedDatesByTrain[train][date]) {
                    // Unselect the date
                    delete selectedDatesByTrain[train][date];
                } else {
                    // Select the date
                    selectedDatesByTrain[train][date] = {
                        user: connectedUsers[socket.id].name,
                        color: connectedUsers[socket.id].color,
                    };
                }

                // Broadcast the updated state
                io.to(train).emit("update-dates", selectedDatesByTrain[train]);
            }
        }, Math.random()*3000); // Simulate a delay to mimic real-world validation
    });


    socket.on("reset-dates", () => {
        // Reset selectedDatesByTrain for the current train
        if (currentTrain) {
            selectedDatesByTrain = {};
            // Notify all users in the train's room about the reset
            io.to(currentTrain).emit("update-dates", selectedDatesByTrain);
        }
    });

    socket.on("switch-train", (train) => {
        currentTrain = train;
        if (!selectedDatesByTrain[train]) selectedDatesByTrain[train] = {};
        socket.emit("init-dates", selectedDatesByTrain[train]);
    });

    socket.on("join-train", (train) => {
        userTrainMap[socket.id] = train; // Update user's active train
        socket.leave(currentTrain); // Leave the previous train's room
        socket.join(train); // Join the new train's room
        currentTrain = train; // Update current train

        // Broadcast updated user-train mapping and connected users
        io.emit("update-user-trains", userTrainMap);
        io.emit("update-users", Object.values(connectedUsers));
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete connectedUsers[socket.id];
        delete userTrainMap[socket.id]; // Remove user from train map

        // Broadcast updated users and user-train mapping
        io.emit("update-users", Object.values(connectedUsers));
        io.emit("update-user-trains", userTrainMap);
    });
});

// Fallback route to serve React index.html for unknown routes
app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
