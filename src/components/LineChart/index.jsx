import * as d3 from "d3";
import { ChartFactory, setUpTooltips } from "./helper";
import { useEffect, useRef, useState } from "react";
import { registerResize, cm } from "../../utils";
import "./c3.css";
import "./style.css";

function chart(processedData) {
  const gantt = ChartFactory(processedData);
  return { gantt: gantt };
}

function GanttChart({ data, isActive }) {
  let [g, setG] = useState({});
  const gantIsSetup = useRef(false);

  useEffect(() => {
    if (!g.gantt && !gantIsSetup.current) {
      gantIsSetup.current = true;
      let _g = chart(data);
      registerResize(() =>
        _g.gantt.resize({ height: window.innerWidth < 810 ? 300 : 900 })
      );
      setUpTooltips();
      setG(_g);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="line-chart" id="chart"></div>;
}

export default GanttChart;
