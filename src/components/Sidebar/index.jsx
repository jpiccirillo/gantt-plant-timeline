import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import "./style.css";
import data from "../../data/processed-data.json";
import possibleStages from "../../data/possible-stages-data.json";
import plantStagesData from "../../data/plant-stages-data.json";
import dataByName from "../../data/organized-by-name.json";
import dataBySpecies from "../../data/organized-by-species.json";
import useIsMobile from "../../hooks/useIsMobile";
import { dataViewNames } from "../../dataViews";
import MuiltilineChip from "../MultilineChip";

const Sidebar = ({
  plantDropdownOptions,
  speciesDropdownOptions,
  onChoicesChanged,
  onDataViewChanged,
}) => {
  const [plantSelections, setPlantSelections] = useState([]);
  const [speciesSelections, setSpeciesSelections] = useState([]);
  const [currentDisplay, setCurrentDisplay] = useState(dataViewNames[0]);
  const [plantsMatchedBySpecies, setPlantsMatchedBySpecies] = useState([]);
  const [plantsMatchedByName, setPlantsMatchedByName] = useState([]);
  const [plantsMatchedByStatus, setPlantsMatchedByStatus] = useState([]);
  const [checkboxes, setCheckboxes] = useState(
    possibleStages.map((stage) => ({
      id: stage,
      checked: false,
      label: stage,
    }))
  );

  const handlePlantDropdownChange = (e, chosenPlants) => {
    // Map chosen plants to their objects in data
    let matchingData = chosenPlants
      .map((selected) => dataByName[selected.toLowerCase()])
      .flat();

    setPlantSelections(chosenPlants);
    setPlantsMatchedByName(matchingData);
    // Combine plants matched by name, with any existing data matched by species
    onChoicesChanged([
      ...matchingData,
      ...plantsMatchedBySpecies,
      ...plantsMatchedByStatus,
    ]);
  };

  const handleSpeciesDropdownChange = (e, chosenSpecies) => {
    let matchingData = chosenSpecies
      .map((selected) => dataBySpecies[selected.toLowerCase()])
      .flat();

    setSpeciesSelections(chosenSpecies);
    setPlantsMatchedBySpecies(matchingData);
    // Combine plants matched by species, with any existing data matched by full name
    onChoicesChanged([
      ...matchingData,
      ...plantsMatchedByName,
      ...plantsMatchedByStatus,
    ]);
  };

  const handleStatusCheckbox = (e) => {
    let { name, checked } = e.target;

    // Find checked checkbox
    const currentlyChecked = checkboxes
      .filter((c) => c.checked)
      .map((a) => a.id)
      .includes(name);

    // If the currently checked one is being clicked again, set it to false
    if (currentlyChecked) checked = false;

    setCheckboxes((prevState) => {
      const newState = prevState.map(
        (checkbox) =>
          checkbox.id === name
            ? { ...checkbox, checked }
            : { ...checkbox, checked: false } // set all others to false
      );
      let currentDescriptors = newState
        .filter((a) => a.checked)
        .map((a) => a.id);

      // Now find all data for which the current descriptor is the last in the plant's status list
      const applicablePlants = Object.entries(plantStagesData)
        .filter(([, stages]) => {
          return stages[stages.length - 1] === currentDescriptors[0];
        })
        .map((a) => a[0]);

      let matchingData = data.filter((entry) =>
        applicablePlants.includes(entry.name)
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

  const handleChangingDisplay = (e, newValue) => {
    setCurrentDisplay(newValue);
    onDataViewChanged(newValue);
  };

  const isMobile = useIsMobile();

  return (
    <div className="sidebar">
      <ToggleButtonGroup
        color="primary"
        value={currentDisplay}
        exclusive
        onChange={handleChangingDisplay}
        aria-label="Platform"
        fullWidth
        size="small"
      >
        <ToggleButton value={dataViewNames[0]}>Timeline</ToggleButton>
        <ToggleButton value={dataViewNames[1]}>Heights</ToggleButton>
      </ToggleButtonGroup>
      <div>
        <h4>Select specific plants:</h4>
        <div className="plant-selector">
          <Autocomplete
            id="plant-typeahead"
            disablePortal
            multiple
            fullWidth
            size="small"
            onChange={handlePlantDropdownChange}
            options={plantDropdownOptions}
            renderTags={(value, getTagProps) => (
              <MuiltilineChip value={value} getTagProps={getTagProps} />
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isMobile ? "Select plants..." : "Choose some plants..."}
              />
            )}
          />
        </div>
      </div>
      <div>
        <h4>Select species:</h4>
        <div className="plant-selector">
          <Autocomplete
            id="species-typeahead"
            disablePortal
            multiple
            fullWidth
            size="small"
            onChange={handleSpeciesDropdownChange}
            options={speciesDropdownOptions}
            renderTags={(value, getTagProps) => (
              <MuiltilineChip value={value} getTagProps={getTagProps} />
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isMobile ? "Select species..." : "Type a species..."}
              />
            )}
          />
        </div>
      </div>
      <div>
        <h4>Show plants whose last stage was:</h4>
        {checkboxes.map((checkbox) => (
          <span className="label-input" key={`span-${checkbox.id}`}>
            <label key={checkbox.id}>
              <input
                type="radio"
                name={checkbox.id}
                checked={checkbox.checked}
                onClick={handleStatusCheckbox}
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
