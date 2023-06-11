import React, { useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "../../style/sidebar.css";
import data from "../../data/processed-data.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import { toTitleCase, toPlural } from "../../utils";

const mapDataToSpecies = () =>
  Array.from(new Set(data.map((p) => p.name.replace(/[0-9.]/g, "")))).map((a) =>
    a.trim()
  );

// Dropdown options need id, label
const mapDataToDropdownChoices = () =>
  Array.from(new Set(data.map((p) => p.name)));

const representPlant = (name, plural = false, initialCheckBox = true) => {
  let r = {};
  r.id = name;
  r.label = plural ? toTitleCase(toPlural(name)) : toTitleCase(name);
  r.checked = initialCheckBox;
  return r;
};

const Sidebar = ({ onChoicesChanged }) => {
  const [multiSelections, setMultiSelections] = useState([]);

  const dropdownOptions = [
    ...mapDataToDropdownChoices()
      .map((s) => representPlant(s))
      .map((s) => ({ ...s, inputType: "dropdown" })),
  ];

  const [checkboxes, setCheckboxes] = useState(
    mapDataToSpecies()
      .map((s) => representPlant(s, true, false))
      .map((s) => ({
        ...s,
        inputType: "checkbox",
      }))
  );

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxes((prevState) => {
      const newState = prevState.map((checkbox) =>
        checkbox.id === name ? { ...checkbox, checked } : checkbox
      );
      console.log(newState);
      onChoicesChanged([...newState, ...multiSelections]);
      return newState;
    });
  };

  const handleTypeaheadChange = (e) => {
    let lowerCaseEs = e.map((a) => a.toLowerCase());
    let chosen = dropdownOptions.filter((option) =>
      lowerCaseEs.includes(option.label.toLowerCase())
    );
    setMultiSelections(chosen);
    onChoicesChanged([...chosen, ...checkboxes]);
  };

  return (
    <div className="sidebar">
      <h4>Select plants:</h4>
      <div class="plant-selector">
        <Typeahead
          id="basic-typeahead-multiple"
          labelKey="name"
          multiple
          onChange={handleTypeaheadChange}
          options={dropdownOptions.map((a) => a.label)}
          placeholder="Choose some plants..."
          selected={multiSelections.map((a) => a.label)}
        />
      </div>

      <h4>Select species:</h4>
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
