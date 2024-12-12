import React from "react";
import "./TrainSelector.css";

const TrainSelector = ({ trains, activeTrain, setActiveTrain }) => {
    return (
        <div className="train-selector">
            <h4>Selecteer trein</h4>
            <div className="train-buttons">
                {trains.map((train) => (
                    <div key={train} className="train-button-container">
                        <button
                            onClick={() => setActiveTrain(train)}
                            className={`train-button ${activeTrain === train ? "active" : ""}`}
                        >
                            {train}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrainSelector;
