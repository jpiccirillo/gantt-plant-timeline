import GanttChart from "./components/Chart/Chart";
import Sidebar from "./components/Sidebar/Sidebar";
import data from "./data/processed-data.json";
import { useState } from "react";
import "./style/App.css";

function App() {
  let [parentData, setParentData] = useState(data);

  const handleSidebarEvent = (tags) => {
    setParentData(
      data.filter((plant) => {
        const validTags = tags.filter((t) => t.checked);
        return !validTags.length
          ? true
          : validTags.find(({ id }) => {
              return plant.name.toLowerCase().startsWith(id.toLowerCase());
            });
      })
    );
  };

  return (
    <div className="App">
      <div id="gantt-wrapper">
        <GanttChart data={parentData} />
        <Sidebar onSidebarEvent={handleSidebarEvent} />
      </div>
    </div>
  );
}

export default App;
