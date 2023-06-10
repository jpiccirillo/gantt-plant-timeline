import * as d3 from "d3";
import "../../style/style.css";
import "../../style/tippy.css";
import { Gantt } from "./gantt";
import { isMobile, toTitleCase, registerResize, cm } from "../../utils";
import { useEffect, useRef, useState } from "react";

let margin = isMobile()
  ? { top: 30, right: 10, bottom: 30, left: 10, laneGutter: 90 }
  : { top: 30, right: 20, bottom: 30, left: 20, laneGutter: 120 };

const config = {
  fixedRowHeight: true,
  rowHeight: 13,
  height: 500,
  labelMinWidth: 50,
  roundRadius: 2,
  xPadding: 0,
  yPadding: 0.1,
  showLaneLabels: "left",
  showAxis: true,
};

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
  const eventLabelMap = {
    inwater: "Placed in water jar",
  };
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
    labelMinWidth: config.labelMinWidth,
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
    margin,
    width: config.width,
    fixedRowHeight: config.fixedRowHeight,
    //   height: config.height,
    rowHeight: config.rowHeight,
    roundRadius: config.roundRadius,
    showLaneBoundaries: config.showLaneBoundaries,
    showLaneLabels: config.showLaneLabels,
    //   xScale
    //   xDomain
    yPadding: config.yPadding,
    xPadding: config.xPadding,
    showAxis: config.showAxis, // Only one of rowHeight or height takes effect based on fixedRowHeight
    //   svg
    referenceLines,
  });

  return { gantt: gantt };
}

function GanttChart({ data }) {
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

  useEffect(() => {
    if (g.gantt) {
      g.gantt._update().referenceLines([], DESIRED_UPDATE_TIMEOUT);
      g.gantt._update().bars(data, DESIRED_UPDATE_TIMEOUT);
    }
  }, [data, g]);
  return <svg className="gantt" id="gantt"></svg>;
}

export default GanttChart;
