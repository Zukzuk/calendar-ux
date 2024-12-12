import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarGrid.css";

const CalendarGrid = ({ handleDateClick, selectedDates }) => {
    const getTileStyle = (date) => {
        // Get style for date tiles
        const dateString = date.toDateString();
        if (selectedDates[dateString]) {
            return {
                backgroundColor: selectedDates[dateString].color,
                color: "white",
                width: "100%",
                height: "100%",
                display: "block",
            };
        }
        return {};
    };

    const generateCalendarData = () => {
        const currentYear = new Date().getFullYear();
        const months = [
            { year: currentYear - 1, month: 11 }, // December of last year
            ...Array.from({ length: 12 }, (_, i) => ({ year: currentYear, month: i })), // January to December of this year
        ];
        return months;
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "10px",
            }}
        >
            {generateCalendarData().map(({ year, month }) => (
                <div key={`${year}-${month}`} style={{ textAlign: "left" }}>
                    <h4 style={{ marginBottom: "10px" }}>
                        {new Date(year, month).toLocaleString("default", { month: "long" })} {year}
                    </h4>
                    <Calendar
                        view="month"
                        activeStartDate={new Date(year, month, 1)}
                        tileContent={({ date, view }) =>
                            view === "month" ? <span style={{ ...getTileStyle(date) }}></span> : null
                        }
                        onClickDay={handleDateClick}
                        showNavigation={false}
                    />
                </div>
            ))}
        </div>
    );
};

export default CalendarGrid;
