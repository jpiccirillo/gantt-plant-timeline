import React, { useState } from "react";
import "../../style/sidebar.css";

const Sidebar = ({ onSidebarEvent }) => {
  const [checkboxes, setCheckboxes] = useState([
    { id: "mango", label: "Mangos", checked: false },
    { id: "avocado", label: "Avocados", checked: false },
    { id: "persimmon", label: "Persimmons", checked: false },
    { id: "lemon", label: "Lemons", checked: false },
    { id: "pink lemon", label: "Pink Lemons", checked: false },
    { id: "pom", label: "Pomegranates", checked: false },
  ]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxes((prevState) => {
      const newState = prevState.map((checkbox) =>
        checkbox.id === name ? { ...checkbox, checked } : checkbox
      );
      onSidebarEvent(newState);
      return newState;
    });
  };

  return (
    <div className="sidebar">
      <h3>Show only:</h3>
      <div className="checkboxes-container">
        {checkboxes.map((checkbox) => (
          <span className="label-input" key={`span-${checkbox.id}`}>
            <label key={checkbox.id}>
              <input
                type="checkbox"
                name={checkbox.id}
                checked={checkbox.checked}
                onChange={handleCheckboxChange}
              />
              {checkbox.label}
            </label>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
