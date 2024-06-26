import * as d3 from "d3";
import {
  createRefLinesGroup,
  createEventGroup,
  createBarGroup,
  createAxisGroup,
  createLanesGroup,
  refLineGroupUtils,
  eventGroupUtils,
  barGroupUtils,
  laneGroupUtils,
  getPxWidth,
  longMonthNames,
} from "../../utils";

export function ChartFactory(
  _data,
  {
    // Data Accessors
    key = (d, i) => i, // given d in data, return a unique key
    start = (d, i) => d.start, // given d in data, return the start of the bar as a date or number
    end = (d, i) => d.end, // given d in data, return the end of the bar as a date or number
    lane = (d, i) => 0, // given d in data, return the lane the bar belongs to
    color = (d, i) => "black", // given d in data, return the color of the bar (might be a d3.scale of some sort, or just a function)
    label = undefined, // given d in data, return the label for the bar if desired
    labelMinWidth = 50, // Minimum bar width to allow writing labels on.
    title = undefined, // given d in data, return the title to displayed on hover.
    eventTitle = undefined,
    layout = assignLanes, // Function to use for layout of bars into lanes and rows. Defaults to assignlanes
    // Chart Config
    height = null, // Height of chart. Leave undefined and use rowHeight to have the height determined by the number of lanes required * rowHeight
    rowHeight = 50, // Height of an individual row. Determines the overall chart height if you dont otherwise constrain height.
    roundRadius = 4, // Rounded corner radius for bars.
    showLaneBoundaries = true, // Whether to draw dividing lines for swim lanes
    xScale = d3.scaleTime(), // Kind of scale to use for the x axis, choose d3.scaleTime for dates, or d3.scaleLinear for numbers as your start and end values.
    yPadding = 0.2, // Padding between rows (float from 0-1)
    xPadding = 5, // Padding between bars in the same row (pixels)
    showAxis = true,
    svgID, // An existing svg element to insert the resulting content into.
    // Supplemental data.
    referenceLines = [], // Can be an array of {start: Date, label: string, color: string} objects.
    margin,
  } = {}
) {
  // SETUP
  let _referenceLines = referenceLines;
  let svg = d3.select(`#${svgID}`).attr("width", "100%");
  let width = getPxWidth(margin, svgID);

  const axisGroup = createAxisGroup(svg, margin.top);
  const barsGroup = createBarGroup(svg);
  const eventGroup = createEventGroup(svg);
  const lanesGroup = createLanesGroup(svg);
  const referenceLinesGroup = createRefLinesGroup(svg);

  var y = d3.scaleBand().padding(yPadding);

  function getXScale() {
    return xScale.range([
      margin.left + margin.laneGutter,
      width - margin.right,
    ]);
  }

  function barLength(d, i, shrink = 0.0) {
    return Math.max(
      Math.round(getXScale()(end(d)) - getXScale()(start(d)) - shrink),
      0
    ); // Subtract 2 for a pixels gap between every bar.
  }

  const options = {
    y,
    title,
    eventTitle,
    label,
    width,
    start,
    barLength,
    color,
    key,
    roundRadius,
    labelMinWidth,
    margin,
  };

  function updateReferenceLines(referenceLines, newHeight) {
    const refOptions = { ...options, height: newHeight, x: getXScale() };
    // Update reference lines
    referenceLinesGroup
      .selectAll("g")
      .data(referenceLines)
      .join(
        (enter) => refLineGroupUtils.enter.apply({ enter, ...refOptions }),
        (update) => refLineGroupUtils.update.apply({ update, ...refOptions }),
        (exit) => exit.remove()
      );
    _referenceLines = referenceLines;
  }

  function updateBars(_newData, duration = 0) {
    const updateOptions = { ...options, duration, width, x: getXScale() };
    const x = getXScale();
    // Persist data|
    _data = _newData;
    // Create x scales using our raw data. Since we need a scale to map it with assignLanes
    const xDomainData = [
      d3.min([..._data.map(start), ..._referenceLines.map((d) => d.start)]),
      d3.max([..._data.map(end), ..._referenceLines.map((d) => d.start)]),
    ];

    // Update the x domain
    x.domain(xDomainData);
    // if (!isMobile()) x.nice();

    // Map our _data to swim lanes
    const data = layout(_data, {
      start: start,
      end: end,
      lane: lane,
      xScale: x,
      xPadding: xPadding,
    });

    let map = {};
    for (let entry of data) if (!map[entry.name]) map[entry.name] = entry;

    const statusData = data.filter((p) => p.end);
    const eventData = data
      .filter((p) => !p.end)
      .map((p) => ({ ...p, rowNo: map[p.name].rowNo }));

    const nRows = d3.max(data.map((d) => d.laneNo + 1));
    // Calculate the height of our chart if not specified exactly.
    height = rowHeight * nRows + margin.top + margin.bottom;

    // Update the yDomain
    const yDomain = [...new Set(statusData.map((d) => d.rowNo))];
    y.domain(yDomain).range([margin.top, height - margin.bottom]);

    // Update bars
    barsGroup
      .selectAll("g")
      .data(statusData, key)
      .join(
        (enter) =>
          barGroupUtils.enter.apply({ enter, duration, ...updateOptions }),
        (update) => barGroupUtils.update.apply({ update, ...updateOptions }),
        (exit) => exit.remove()
      );

    eventGroup
      .selectAll("g")
      .data(eventData, key)
      .join(
        (enter) =>
          eventGroupUtils.enter.apply({ enter, duration, ...updateOptions }),
        (update) => eventGroupUtils.update.apply({ update, ...updateOptions }),
        (exit) => exit.remove()
      );

    if (showLaneBoundaries) {
      const lanes = d3.flatRollup(
        statusData,
        (v) => d3.max(v, (d) => d.rowNo),
        (d) => lane(d)
      );

      lanesGroup
        .selectAll("g")
        .data(lanes)
        .join(
          (enter) => laneGroupUtils.enter.apply({ enter, ...updateOptions }),
          (update) => laneGroupUtils.update.apply({ update, ...updateOptions }),
          (exit) => exit.remove()
        );
    }
    // Draw axis
    if (showAxis) {
      axisGroup
        .transition()
        .duration(duration)
        .call(
          d3.axisTop(x).tickFormat((one) => {
            const label = x.tickFormat()(one);
            return longMonthNames.includes(label)
              ? d3.timeFormat("%b")(one)
              : label;
          })
        )
        .selectAll("text")
        .attr("y", -5)
        .attr("x", 5)
        .attr("dx", ".35em")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "start");
    }

    // Update the reference lines, since our axis has adjusted
    updateReferenceLines(_referenceLines, height);

    // When data changes, the # of countries changes too, so update height of the SVG
    svg.attr("height", height);

    return { height };
  }

  updateBars(_data, 100);

  return Object.assign(svg.node(), {
    _key: (f) => {
      if (f === undefined) return key;
      key = f;
      updateBars(_data);
      return key;
    },
    _start: (f) => {
      if (f === undefined) return start;
      start = f;
      updateBars(_data);
      return start;
    },
    _end: (f) => {
      if (f === undefined) return end;
      end = f;
      updateBars(_data);
      return end;
    },
    _lane: (f) => {
      if (f === undefined) return lane;
      lane = f;
      updateBars(_data);
      return lane;
    },
    _color: (f) => {
      if (f === undefined) return color;
      color = f;
      updateBars(_data);
      return color;
    },
    _title: (f) => {
      if (f === undefined) return title;
      title = f;
      updateBars(_data);
      return title;
    },
    _label: (f) => {
      if (f === undefined) return label;
      label = f;
      updateBars(_data);
      return label;
    },
    _height: (f) => {
      if (f === undefined) return height;
      height = f;
      updateBars(_data);
      return height;
    },
    _width: () => {
      width = getPxWidth(margin, 'parentId');
      updateBars(_data);
      return width;
    },
    _margin: (f) => {
      if (f === undefined) return margin;
      margin = f;
      updateBars(_data);
      return margin;
    },
    _scales: () => {
      return { x: getXScale(), y };
    },
    _update: () => {
      return { bars: updateBars, referenceLines: updateReferenceLines };
    },
  });
}

function assignRows(data, opts = {}) {
  // Algorithm used to assign bars to lanes.
  const slots = [];
  const findSlot = (slots, barStart, barEnd) => {
    // Add some padding to bars to leave space between them
    // Do comparisons in pixel space for cleaner padding.
    const barStartPx = Math.round(opts.xScale(barStart));
    const barEndPaddedPx = Math.round(opts.xScale(barEnd) + opts.xPadding);

    for (var i = 0; i < slots.length; i++) {
      if (slots[i][1] <= barStartPx && !opts.monotonic) {
        slots[i][1] = barEndPaddedPx;
        return slots[i][0];
      }
    }
    // Otherwise add a new slot and return that.
    slots.push([slots.length, barEndPaddedPx]);
    return slots.length - 1;
  };

  return (
    data
      // .sort((a, b) => Number(opts.start(a)) - Number(opts.start(b))) // Sort by the date.
      .map((d) => ({
        ...d,
        rowNo: findSlot(slots, opts.start(d), opts.end(d)),
      }))
  );
}

function assignLanes(data, options = {}) {
  // Assign rows, but grouped by some keys so that bars are arranged in groups belonging to the same lane.
  const groups = d3.flatGroup(data, options.lane);
  const newData = [];
  var rowCount = 0;
  groups.forEach(([laneName, _groupData], i) => {
    // For each group assign rows.
    const groupData = assignRows(_groupData, options);
    groupData.forEach((d) => {
      newData.push({
        ...d,
        lane: laneName,
        laneNo: i,
        rowNo: rowCount + d.rowNo,
      });
      // Offset future rows by the maximum row number from this gorup.
    });
    rowCount += d3.max(groupData.map((d) => d.rowNo)) + 1;
  });
  return newData;
}
