import * as d3 from "d3";
import "../../style/style.css";
import "../../style/tippy.css";
import { Gantt } from "../Chart/gantt";
import { getMargin, toTitleCase, registerResize } from "../../utils";
import config from "../../data/chart-config.json";
import eventLabelMap from "../../data/event-map-config.json";
import { useEffect, useRef, useState } from "react";
import useIsMobile from "../../hooks/useIsMobile";

function chart(processedData, config) {
  const statusLabel = toTitleCase;
  const eventLabel = (d) =>
    eventLabelMap[d] ? eventLabelMap[d] : toTitleCase(d);

  const gantt = Gantt(processedData, {
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
            <p>
              Below is a timeline chart of plants I've grown from seed over the
              last year. Each species is its own color - horizontal bars
              represent long statuses in a plant's life, while black dots
              represent spefifc day-level events.
            </p>
            <p>
              This sample below is the timeline of Plant 1 - Germinating for a
              month, sprouted and alive for another month or two, then dormant
              and died.
            </p>
          </div>
        ) : (
          <div className="copy">
            <p>
              The below chart is an interactive timeline, in the form of a Gantt
              Chart, showing the lifespan of all plants I've grown from seed.
              Some are still going strong, while others were with me for just a
              short time before rotting, withering in the sun, getting stolen,
              or meeting another fate.
            </p>
            <p style={{ marginBottom: 0 }}>
              In this timeline, each species has a specific color, and bars
              represent long statuses of the plant's life - germinating,
              being-sprouted, dormant, or recovered. Black dots represent
              specific events, like day of planting, or certain overvations.
              Below is an example timeline: germinating (roots but no shoot yet)
              from Sept - Oct. Sprouting, and actively growing, from Oct - Dec.
              Dormant (not dead but no growth) from Dec - Jan.
            </p>
          </div>
        )}
        <div>
          <svg className="gantt-example" id="gantt-example"></svg>
        </div>
      </div>
    </div>
  );
}

export default GanttChart;
