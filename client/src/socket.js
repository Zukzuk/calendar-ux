// socket.js
import { io } from "socket.io-client";

const socket = io(); // Create a single socket connection

export default socket; // Export the singleton instance
