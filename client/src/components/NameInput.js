import React from "react";
import "./NameInput.css";

const NameInput = ({ name, setName, onSubmit }) => {
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            onSubmit();
        }
    };

    return (
        <div style={{ marginBottom: "20px" }}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your name"
                style={{ padding: "10px", marginRight: "10px", width: "300px" }}
            />
            <button onClick={onSubmit} style={{ padding: "10px 20px" }}>
                Login
            </button>
        </div>
    );
};

export default NameInput;
