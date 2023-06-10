import React, { useState } from "react";

const Sidebar = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [checkboxes, setCheckboxes] = useState({
    checkbox1: false,
    checkbox2: false,
    checkbox3: false,
    checkbox4: false,
    checkbox5: false,
  });

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxes((prevState) => ({ ...prevState, [name]: checked }));
  };

  return (
    <div className="sidebar">
      <h3>Dropdown Typeahead</h3>
      <input
        type="text"
        value={selectedOption}
        onChange={handleDropdownChange}
      />

      <h3>Checkboxes</h3>
      <label>
        <input
          type="checkbox"
          name="checkbox1"
          checked={checkboxes.checkbox1}
          onChange={handleCheckboxChange}
        />
        Checkbox 1
      </label>

      <label>
        <input
          type="checkbox"
          name="checkbox2"
          checked={checkboxes.checkbox2}
          onChange={handleCheckboxChange}
        />
        Checkbox 2
      </label>

      <label>
        <input
          type="checkbox"
          name="checkbox3"
          checked={checkboxes.checkbox3}
          onChange={handleCheckboxChange}
        />
        Checkbox 3
      </label>

      <label>
        <input
          type="checkbox"
          name="checkbox4"
          checked={checkboxes.checkbox4}
          onChange={handleCheckboxChange}
        />
        Checkbox 4
      </label>

      <label>
        <input
          type="checkbox"
          name="checkbox5"
          checked={checkboxes.checkbox5}
          onChange={handleCheckboxChange}
        />
        Checkbox 5
      </label>
    </div>
  );
};

export default Sidebar;
