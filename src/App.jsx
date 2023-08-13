import GanttChart from "./components/GanttChart";
import LineChart from "./components/LineChart";
import LegendOverview from "./components/LegendOverview";
import Sidebar from "./components/Sidebar";
import data from "./data/processed-data.json";
import exampleData from "./data/example-data.json";
import heightData from "./data/processed-height-data.json";
import { useState } from "react";
import "./style.css";
import "tippy.js/dist/tippy.css";
import { removeDuplicates } from "./utils";
import { dataViewNames } from "./dataViews";

function App() {
  let [parentData, setParentData] = useState(data);
  const [activeStep, setActiveStep] = useState(0);

  const handleCheckboxChange = (matchingData) => {
    const matchingPlants = removeDuplicates(
      !matchingData ? data : matchingData,
      "name",
      "type"
    );

    const chartData = matchingPlants.length ? matchingPlants : data;
    setParentData(chartData);
  };

  const handleDataViewChange = (chosenView) => {
    setActiveStep(dataViewNames.indexOf(chosenView));
  };

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
          onChoicesChanged={handleCheckboxChange}
          onDataViewChanged={handleDataViewChange}
        />
      </div>
    </div>
  );
}

export default App;
