const express = require("express");
const router = express.Router();

// Example route: Health check
router.get("/health", (req, res) => {
    res.json({ status: "ok", message: "API is running" });
});

// Add more routes as needed

module.exports = router;
