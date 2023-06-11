import GanttChart from "./components/Chart/Chart";
import Sidebar from "./components/Sidebar/Sidebar";
import data from "./data/processed-data.json";
import { useState } from "react";
import "./style/App.css";
import "tippy.js/dist/tippy.css";
import { removeDuplicates } from "./utils/";

function App() {
  let [parentData, setParentData] = useState(data);

  // Takes {id:name + number, label: numberedPlant} list from dropdown and finds all matching plants
  function identifyByPlantName(state) {
    if (!state.length) return [];

    return data.filter((plant) => {
      return state.find(({ id }) => {
        return plant.name.toLowerCase() === id.toLowerCase();
      });
    });
  }

  // Takes {id:name, label: maybePlural} list from checkbox selectors
  // and finds all matching plants per this species
  function identifyBySpecies(state) {
    if (!state.length) return [];

    return data.filter((plant) => {
      return state.find(({ id }) => {
        return plant.name.toLowerCase().startsWith(id.toLowerCase());
      });
    });
  }

  const handleCheckboxChange = (stateOfInputs) => {
    const dropdownInputs = stateOfInputs.filter(
      (a) => a.inputType === "dropdown"
    );
    const checkboxInputs = stateOfInputs
      .filter((a) => a.inputType === "checkbox")
      .filter((t) => t.checked);

    const matchingPlants = removeDuplicates(
      [
        ...identifyByPlantName(dropdownInputs),
        ...identifyBySpecies(checkboxInputs),
      ],
      "name",
      "type"
    );

    const chartData = matchingPlants.length ? matchingPlants : data;
    // Remove duplicates
    setParentData(chartData);
  };

  return (
    <div className="App">
      <div id="gantt-wrapper">
        <GanttChart data={parentData} />
        <Sidebar onChoicesChanged={handleCheckboxChange} />
      </div>
    </div>
  );
}

export default App;
