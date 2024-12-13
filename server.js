const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const apiRoutes = require("./routes/api");
const initializeSockets = require("./sockets/socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve React static files
const clientBuildPath = path.join(__dirname, "client/build");
app.use(express.static(clientBuildPath));

// Attach routes
app.use("/api", apiRoutes);

// Initialize sockets
initializeSockets(io);

// Fallback route to serve React index.html for unknown routes
app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
