import GanttChart from "./components/Chart/Chart";
import data from "./data/processed-data.json";
import { useState } from "react";

function App() {
  let [parentData, setParentData] = useState(data);

  function toMangoData() {
    setParentData(
      data.filter(
        (plant) => plant.name === "Mango 29" || plant.name === "Mango 31"
      )
    );
  }

  function toAvocadoData() {
    setParentData(data.filter((plant) => plant.name.includes("Avocado")));
  }

  function toPersimmonData() {
    setParentData(data.filter((plant) => plant.name.includes("Persimmon")));
  }

  return (
    <div className="App">
      <button className="App-header" onClick={toMangoData}>
        Change Data to only mangos
      </button>
      <button className="App-header" onClick={toAvocadoData}>
        Change Data to only avocado
      </button>
      <button className="App-header" onClick={toPersimmonData}>
        Change Data to only persimmon
      </button>
      <div id="gantt-wrapper">
        <GanttChart data={parentData} />
      </div>
    </div>
  );
}

export default App;
