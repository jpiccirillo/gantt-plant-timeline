import GanttChart from "./components/Chart/Chart";
import LegendOverview from "./components/LegendOverview/LegendOverview";
import Sidebar from "./components/Sidebar/Sidebar";
import data from "./data/processed-data.json";
import exampleData from "./data/example-data.json";
import { useState } from "react";
import "./style/App.css";
import "tippy.js/dist/tippy.css";
import { removeDuplicates } from "./utils";

function App() {
  let [parentData, setParentData] = useState(data);

  const handleCheckboxChange = (matchingData) => {
    const matchingPlants = removeDuplicates(
      !matchingData ? data : matchingData,
      "name",
      "type"
    );

    const chartData = matchingPlants.length ? matchingPlants : data;
    setParentData(chartData);
  };

  return (
    <div className="App">
      <LegendOverview data={exampleData} />
      <div id="gantt-wrapper">
        <GanttChart data={parentData} />
        <Sidebar onChoicesChanged={handleCheckboxChange} />
      </div>
    </div>
  );
}

export default App;
