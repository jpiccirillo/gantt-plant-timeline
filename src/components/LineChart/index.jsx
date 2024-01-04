import * as d3 from "d3";
import { ChartFactory, setUpTooltips } from "./helper";
import { useEffect, useRef, useState } from "react";
import { registerResize, cm } from "../../utils";
import originalHeightData from "../../data/processed-height-data.json";
import "./c3.css";
import "./style.css";

function formatData(d) {
  return {
    xs: d.reduce((a, i, index) => {
      a[i.name] = index;
      return a;
    }, {}),
    columns: [
      ...d.map((a, i) => [i, ...a.data.dates.map((a) => new Date(a))]),
      ...d.map((a, i) => [a.name, ...a.data.values]),
    ],
  };
}

function chart(processedData) {
  const colors = originalHeightData.reduce((agg, plant) => {
    agg[plant.name] = cm(plant.species);
    return agg;
  }, {});

  const gantt = ChartFactory(formatData(processedData), {
    colors,
    xScale: d3.scaleTime(),
    svgID: "line-chart",
    margin: { left: 15, right: -20, top: 0, bottom: -20, laneGutter: -15 },
  });

  return { gantt: gantt };
}

function LineChart({ data }) {
  let [g, setG] = useState({});
  const gantIsSetup = useRef(false);

  // When chart first loads
  useEffect(() => {
    if (!g.gantt && !gantIsSetup.current) {
      gantIsSetup.current = true;
      let _g = chart(data);
      registerResize(() =>
        _g.gantt.resize({ height: window.innerWidth < 810 ? 400 : 700 })
      );
      setG(_g);
      setUpTooltips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When data inputs are mutated
  useEffect(() => {
    if (g.gantt && gantIsSetup) {
      g.gantt.load({
        ...formatData(data),
        unload: true,
        done: setUpTooltips,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return <div className="line-chart" id="chart"></div>;
}

export default LineChart;
