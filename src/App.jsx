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
import { getPlantsFromURL} from "./utils/url"

function determinePlantDropdown(_dataByName, lineGraphMode) {
  let options = lineGraphMode
    ? originalHeightData.map((a) => a.name)
    : Object.keys(_dataByName);

  return options.map(toTitleCase);
}

function determineSpeciesDropdown(_dataBySpecies, lineGraphMode) {
  let options = lineGraphMode
    ? originalHeightData.map((a) => a.species)
    : Object.keys(_dataBySpecies);

  return Array.from(new Set(options.map(toTitleCase)));
}

function withUrlChoices(a) {
  const urlChoices = getPlantsFromURL();
  return urlChoices.length ? a.filter((entry) => urlChoices.includes(entry.name)) : a;
}

function App() {
  let defaultDataViewIndex = 0;
  let [parentData, setParentData] = useState(withUrlChoices(data));
  let [heightData, setHeightData] = useState(withUrlChoices(originalHeightData));
  const [activeStep, setActiveStep] = useState(defaultDataViewIndex);
  let lineGraphMode = dataViewNames[activeStep] === dataViewNames[1];
  let [plantDropdownOptions, setPlantDropdownOptions] = useState(
    determinePlantDropdown(dataByName, lineGraphMode)
  );
  let [speciesDropdownOptions, setSpeciesDropdownOptions] = useState(
    determineSpeciesDropdown(dataBySpecies, lineGraphMode)
  );

  const handleCheckboxChange = (nonUniqueNameList) => {
    const uniqueNameList = new Set(nonUniqueNameList);
    const cb = (entry) => uniqueNameList.has(entry.name);

    setParentData(uniqueNameList.size ? data.filter(cb) : data);
    setHeightData(
      uniqueNameList.size ? originalHeightData.filter(cb) : originalHeightData
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

  return (
    <div className="App">
      <LegendOverview
        data={exampleData}
        activeView={dataViewNames[activeStep]}
      />
      <div id="gantt-wrapper">
        <div className={"data-view"} id="parentId">
          <div
            className={`line-chart ${activeStep === 1 ? "active" : "hidden"}`}
          >
            <LineChart data={heightData} />
          </div>
          <div
            className={`gantt-chart ${activeStep === 0 ? "active" : "hidden"}`}
          >
            <GanttChart data={parentData} />
          </div>
        </div>
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
