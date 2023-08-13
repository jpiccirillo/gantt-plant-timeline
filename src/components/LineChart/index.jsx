import * as d3 from "d3";
import { ChartFactory, setUpTooltips } from "./helper";
import { useEffect, useRef, useState } from "react";
import { registerResize, cm, getXIndexDomain } from "../../utils";
import "./c3.css";
import "./style.css";

function formatData(d) {
  return d.map((a) => [a.title, ...a.data]);
}

function chart(processedData) {
  const colors = processedData
    .filter((a) => a.title !== "x")
    .reduce((agg, plant) => {
      agg[plant.title] = cm(plant.species);
      return agg;
    }, {});

  const gantt = ChartFactory(formatData(processedData), {
    colors,
    xScale: d3.scaleTime(),
    svgID: "line-chart",
    margin: { left: 10, right: -20, top: 0, bottom: -20, laneGutter: -15 },
  });

  return { gantt: gantt };
}

function GanttChart({ data, isActive }) {
  let [g, setG] = useState({});
  const gantIsSetup = useRef(false);

  function afterNewData() {
    setUpTooltips();
    let [min, max] = getXIndexDomain(g.gantt.data());
    let firstDate = data[0].data[min];
    let lastDate = data[0].data[max];
    g.gantt.axis.range({
      min: {
        x: firstDate,
      },
      max: {
        x: lastDate,
      },
    });
  }

  // When chart first loads
  useEffect(() => {
    if (!g.gantt && !gantIsSetup.current) {
      gantIsSetup.current = true;
      let _g = chart(data);
      registerResize(() =>
        _g.gantt.resize({ height: window.innerWidth < 810 ? 300 : 600 })
      );
      setUpTooltips();
      setG(_g);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When data inputs are mutated
  useEffect(() => {
    if (g.gantt && gantIsSetup) {
      g.gantt.load({
        columns: formatData(data),
        unload: true,
        done: afterNewData,
      });
    }
  }, [data]);

  return <div className="line-chart" id="chart"></div>;
}

export default GanttChart;
