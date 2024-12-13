import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarGrid.css";

const CalendarGrid = ({ handleDateClick, selectedDates, pendingDates }) => {
    const getTileStyle = (date) => {
        const dateString = date.toDateString();

        if (selectedDates[dateString]) {
            return {
                backgroundColor: selectedDates[dateString].color,
                color: "white",
                pointer: "default",
            };
        }

        if (pendingDates.has(dateString)) {
            return {
                backgroundColor: "yellow",
                color: "black",
                pointer: "not-allowed",
            };
        }

        return {
            backgroundColor: "transparent",
            color: "white",
            pointer: "default",
        };
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
                            <span style={{ ...getTileStyle(date) }}></span>
                        }
                        onClickDay={(date) => {
                            const dateString = date.toDateString();
                            if (!pendingDates.has(dateString)) {
                                handleDateClick(date); // Only handle clicks for non-pending dates
                            }
                        }}
                        showNavigation={false}
                    />
                </div>
            ))}
        </div>
    );
};

export default CalendarGrid;
