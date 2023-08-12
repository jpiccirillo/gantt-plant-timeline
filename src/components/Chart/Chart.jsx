import * as d3 from "d3";
import "../../style/style.css";
import "../../style/tippy.css";
import { Gantt } from "./gantt";
import { getMargin, toTitleCase, registerResize, cm } from "../../utils";
import config from "../../data/chart-config.json";
import eventLabelMap from "../../data/event-map-config.json";
import { useEffect, useRef, useState } from "react";

const referenceLines = [
  {
    start: new Date(2023, 4, 2),
    label: "Some plants stolen",
    color: "indianred",
  },
  {
    start: new Date(2023, 1, 20),
    label: "Threw plants away when moving",
    color: "indianred",
  },
  {
    start: new Date(2023, 1, 19),
    label: "",
    color: "indianred",
  },
];

const DESIRED_UPDATE_TIMEOUT = 100;

function chart(processedData, config) {
  const statusLabel = toTitleCase;
  const eventLabel = (d) =>
    eventLabelMap[d] ? eventLabelMap[d] : toTitleCase(d);

  const gantt = Gantt(processedData, {
    key: (d) => d.name.split(" ").join("_") + d.start,
    start: (d) => new Date(d.start),
    end: (d) => new Date(d.end),
    lane: (d) => d.name,
    color: (d) => cm(d.species),
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
    // layout
    margin: getMargin(),
    svgID: "gantt",
    referenceLines,
    ...config,
  });

  return { gantt: gantt };
}

function GanttChart({ data, isActive }) {
  let [g, setG] = useState({});
  const gantIsSetup = useRef(false);

  useEffect(() => {
    if (!g.gantt && !gantIsSetup.current) {
      gantIsSetup.current = true;
      let _g = chart(data, config);
      registerResize(() => {
        isActive && _g.gantt._width();
      });
      setG(_g);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (g.gantt) {
      g.gantt._update().referenceLines([], DESIRED_UPDATE_TIMEOUT);
      g.gantt._update().bars(data, DESIRED_UPDATE_TIMEOUT);
    }
  }, [data, g]);
  return <svg className="gantt" id="gantt"></svg>;
}

export default GanttChart;
