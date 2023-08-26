import GanttChart from "./components/GanttChart";
import LineChart from "./components/LineChart";
import LegendOverview from "./components/LegendOverview";
import Sidebar from "./components/Sidebar";
import data from "./data/processed-data.json";
import exampleData from "./data/example-data.json";
import originalHeightData from "./data/processed-height-data.json";
import dataByName from "./data/organized-by-name.json";
import dataBySpecies from "./data/organized-by-species.json";
import { useEffect, useState } from "react";
import "./style.css";
import "tippy.js/dist/tippy.css";
import { toTitleCase } from "./utils";
import { dataViewNames } from "./dataViews";

function determinePlantDropdown(_dataByName, dataViewStep) {
  let lineGraphMode = dataViewNames[dataViewStep] === dataViewNames[1];
  let options = lineGraphMode
    ? originalHeightData.map((a) => a.title)
    : Object.keys(_dataByName);

  return options.map(toTitleCase);
}

function determineSpeciesDropdown(_dataBySpecies, dataViewStep) {
  let lineGraphMode = dataViewNames[dataViewStep] === dataViewNames[1];
  let options = lineGraphMode
    ? originalHeightData.map((a) => a.species)
    : Object.keys(_dataBySpecies);

  return Array.from(new Set(options.map(toTitleCase)));
}

function App() {
  let defaultDataViewIndex = 0;
  let [parentData, setParentData] = useState(data);
  let [heightData, setHeightData] = useState(originalHeightData);
  const [activeStep, setActiveStep] = useState(defaultDataViewIndex);
  let [plantDropdownOptions, setPlantDropdownOptions] = useState(
    determinePlantDropdown(dataByName, activeStep)
  );
  let [speciesDropdownOptions, setSpeciesDropdownOptions] = useState(
    determineSpeciesDropdown(dataBySpecies, activeStep)
  );

  const handleCheckboxChange = (matchingData) => {
    const matchingPlants = !matchingData ? data : matchingData;

    const chartData = matchingPlants.length ? matchingPlants : data;
    let uniquePlantNames = Array.from(
      new Set(matchingPlants.map((a) => a.name))
    );

    setParentData(chartData);
    setHeightData(
      uniquePlantNames.length
        ? originalHeightData.filter(
            (entry) =>
              uniquePlantNames.includes(entry.title) || entry.title === "x"
          )
        : originalHeightData
    );
  };

  const handleDataViewChange = (chosenView) => {
    setActiveStep(dataViewNames.indexOf(chosenView));
  };

  // Switch dropdown options when changing activeStep
  useEffect(() => {
    setPlantDropdownOptions(determinePlantDropdown(dataByName, activeStep));
    setSpeciesDropdownOptions(
      determineSpeciesDropdown(dataBySpecies, activeStep)
    );
  }, [activeStep]);

  const viewMapping = {
    [dataViewNames[0]]: (
      <GanttChart
        data={parentData}
        isActive={dataViewNames[activeStep] === dataViewNames[0]}
      />
    ),
    [dataViewNames[1]]: (
      <LineChart
        data={heightData}
        isActive={dataViewNames[activeStep] === dataViewNames[1]}
      />
    ),
  };

  return (
    <div className="App">
      <LegendOverview
        data={exampleData}
        activeView={dataViewNames[activeStep]}
      />
      <div id="gantt-wrapper">
        <div class="data-view">{viewMapping[dataViewNames[activeStep]]}</div>
        <Sidebar
          plantDropdownOptions={plantDropdownOptions}
          speciesDropdownOptions={speciesDropdownOptions}
          onChoicesChanged={handleCheckboxChange}
          onDataViewChanged={handleDataViewChange}
        />
      </div>
    </div>
  );
}

export default App;
