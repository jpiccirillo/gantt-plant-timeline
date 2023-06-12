import React, { useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "../../style/sidebar.css";
import data from "../../data/processed-data.json";
import statusMapping from "../../data/status-map-config.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import useIsMobile from "../../hooks/useIsMobile";

const mapDataToSpecies = () =>
  Array.from(new Set(data.map((p) => p.name.replace(/[0-9.]/g, "")))).map((a) =>
    a.trim()
  );

// Dropdown options need id, label
const mapDataToPlants = () => Array.from(new Set(data.map((p) => p.name)));

const Sidebar = ({ onChoicesChanged }) => {
  const [plantSelections, setPlantSelections] = useState([]);
  const [speciesSelections, setSpeciesSelections] = useState([]);
  const [plantsMatchedBySpecies, setPlantsMatchedBySpecies] = useState([]);
  const [plantsMatchedByName, setPlantsMatchedByName] = useState([]);
  const [plantsMatchedByStatus, setPlantsMatchedByStatus] = useState([]);
  const plantDropdownOptions = mapDataToPlants();
  const speciesDropdownOptions = mapDataToSpecies();

  const [checkboxes, setCheckboxes] = useState(
    statusMapping.map(({ original, label }) => ({
      id: original,
      checked: false,
      originalLabel: original,
      label,
    }))
  );

  const handlePlantDropdownChange = (e) => {
    // Map chosen plants to their objects in data
    let matchingData = data.filter((plant) =>
      e.find((p) => plant.name.toLowerCase() === p.toLowerCase())
    );
    setPlantSelections(e);
    setPlantsMatchedByName(matchingData);
    // Combine plants matched by name, with any existing data matched by species
    onChoicesChanged([
      ...matchingData,
      ...plantsMatchedBySpecies,
      ...plantsMatchedByStatus,
    ]);
  };

  const handleSpeciesDropdownChange = (e) => {
    let matchingData = data.filter((plant) =>
      e.find((p) => plant.name.toLowerCase().startsWith(p.toLowerCase()))
    );
    setSpeciesSelections(e);
    setPlantsMatchedBySpecies(matchingData);
    // Combine plants matched by species, with any existing data matched by full name
    onChoicesChanged([
      ...matchingData,
      ...plantsMatchedByName,
      ...plantsMatchedByStatus,
    ]);
  };

  const handleStatusCheckbox = (e) => {
    const { name, checked } = e.target;
    setCheckboxes((prevState) => {
      const newState = prevState.map((checkbox) =>
        checkbox.id === name ? { ...checkbox, checked } : checkbox
      );
      let originalDescriptors = newState
        .filter((a) => a.checked)
        .map((a) => a.originalLabel);

      let matchingData = data.filter((entry) =>
        originalDescriptors.includes(entry.type)
      );

      setPlantsMatchedByStatus(matchingData);
      onChoicesChanged([
        ...matchingData,
        ...plantsMatchedBySpecies,
        ...plantsMatchedByName,
      ]);
      return newState;
    });
  };

  const isMobile = useIsMobile();

  return (
    <div className="sidebar">
      <h4>Select specific plants:</h4>
      <div className="plant-selector">
        <Typeahead
          id="plant-typeahead"
          labelKey="name"
          multiple
          onChange={handlePlantDropdownChange}
          options={plantDropdownOptions}
          placeholder={isMobile ? "Select plants..." : "Choose some plants..."}
          selected={plantSelections}
        />
      </div>
      <h4>Select species:</h4>
      <Typeahead
        id="species-typeahead"
        labelKey="name"
        multiple
        onChange={handleSpeciesDropdownChange}
        options={speciesDropdownOptions}
        placeholder={isMobile ? "Select species..." : "Type a species..."}
        selected={speciesSelections}
      />
      <h4>Show only plants that:</h4>
      {checkboxes.map((checkbox) => (
        <span className="label-input" key={`span-${checkbox.id}`}>
          <label key={checkbox.id}>
            <input
              type="checkbox"
              name={checkbox.id}
              checked={checkbox.checked}
              onChange={handleStatusCheckbox}
            />
            {checkbox.label}
          </label>
        </span>
      ))}
    </div>
  );
};

export default Sidebar;
