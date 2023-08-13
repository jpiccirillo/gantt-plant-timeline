import * as d3 from "d3";
import "../GanttChart/style.css";
import "../../style/tippy.css";
import { ChartFactory } from "../GanttChart/helper";
import { getMargin, toTitleCase, registerResize } from "../../utils";
import config from "../../data/chart-config.json";
import eventLabelMap from "../../data/event-map-config.json";
import copy from "./copy";
import { dataViewNames } from "../../dataViews";
import { useEffect, useRef, useState } from "react";
import useIsMobile from "../../hooks/useIsMobile";

function chart(processedData, config) {
  const statusLabel = toTitleCase;
  const eventLabel = (d) =>
    eventLabelMap[d] ? eventLabelMap[d] : toTitleCase(d);

  const gantt = ChartFactory(processedData, {
    key: (d) => d.name.split(" ").join("_") + d.start,
    start: (d) => new Date(d.start),
    end: (d) => new Date(d.end),
    lane: (d) => d.name,
    color: (d) => "forestgreen",
    label: (d) => d.type,
    eventLabel: (d) => eventLabelMap[d],
    title: (d) => {
      const f = d3.timeFormat("%b %d");
      return `${d.name} - ${statusLabel(d.type)} from ${f(
        new Date(d.start)
      )} to ${f(new Date(d.end))}`;
    },
    eventTitle: (d) => {
      const f = d3.timeFormat("%b %d");
      return `${d.name} - ${eventLabel(d.type)} on ${f(new Date(d.start))}`;
    },
    margin: { ...getMargin(), laneGutter: 50 },
    svgID: "gantt-example",
    ...config,
  });

  return { gantt: gantt };
}

function GanttChart({ data, activeView }) {
  let [g, setG] = useState({});
  const gantIsSetup = useRef(false);

  useEffect(() => {
    if (!g.gantt && !gantIsSetup.current) {
      gantIsSetup.current = true;
      let _g = chart(data, config);
      registerResize(() => _g.gantt._width());
      setG(_g);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMobile = useIsMobile();

  return (
    <div>
      <h3>A Plant's Life</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gridGap: "10px",
        }}
      >
        {isMobile ? (
          <div className="copy">
            <p>{copy[activeView].mobile[0]}</p>
            <p>{copy[activeView].mobile[1]}</p>
          </div>
        ) : (
          <div className="copy">
            <p>{copy[activeView].desktop[0]}</p>
            <p style={{ marginBottom: 0 }}>{copy[activeView].desktop[1]}</p>
          </div>
        )}
        <div
          style={{
            height: activeView === dataViewNames[0] ? "100px" : "0px",
            visibility: activeView === dataViewNames[0] ? "visible" : "hidden",
          }}
        >
          <svg className="gantt-example" id="gantt-example"></svg>
        </div>
      </div>
    </div>
  );
}

export default GanttChart;
