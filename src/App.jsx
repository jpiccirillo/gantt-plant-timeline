import GanttChart from "./components/Chart/Chart";
import HeightChart from "./components/Timeseries/HeightChart";
import LegendOverview from "./components/LegendOverview/LegendOverview";
import Sidebar from "./components/Sidebar/Sidebar";
import data from "./data/processed-data.json";
import exampleData from "./data/example-data.json";
import { useState } from "react";
import "./style/App.css";
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
    [dataViewNames[0]]: <GanttChart data={parentData} />,
    [dataViewNames[1]]: <HeightChart data={parentData} />,
  };

  return (
    <div className="App">
      <LegendOverview data={exampleData} />
      <div id="gantt-wrapper">
        {viewMapping[dataViewNames[activeStep]]}
        <Sidebar
          onChoicesChanged={handleCheckboxChange}
          onDataViewChanged={handleDataViewChange}
        />
      </div>
    </div>
  );
}

export default App;
