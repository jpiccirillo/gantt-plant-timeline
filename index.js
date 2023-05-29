function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .split(/[^a-z0-9]/)
    .filter((d) => d)
    .join("-");
}

function Gantt(
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
    layout = assignLanes, // Function to use for layout of bars into lanes and rows. Defaults to assignlanes
    // Chart Config
    margin = { top: 30, right: 20, bottom: 30, left: 20, laneGutter: 120 }, // Standard d3 margin convention, plus an extra bit of space to write lane names.
    // width = 1000, // Width of chart
    fixedRowHeight = true, // Whether to use a fixed row height, otherwise specify total height and work it out dynamically.
    height = null, // Height of chart. Leave undefined and use rowHeight to have the height determined by the number of lanes required * rowHeight
    rowHeight = 50, // Height of an individual row. Determines the overall chart height if you dont otherwise constrain height.
    roundRadius = 4, // Rounded corner radius for bars.
    showLaneBoundaries = true, // Whether to draw dividing lines for swim lanes
    showLaneLabels = "left", // Whether to label lanes, enter left, right, or false
    xScale = d3.scaleTime(), // Kind of scale to use for the x axis, choose d3.scaleTime for dates, or d3.scaleLinear for numbers as your start and end values.
    xDomain = undefined, // Constrain the x axis by providing a domain to clip it to.
    yPadding = 0.2, // Padding between rows (float from 0-1)
    xPadding = 5, // Padding between bars in the same row (pixels)
    showAxis = true,
    svg = undefined, // An existing svg element to insert the resulting content into.
    // Supplemental data.
    referenceLines = [], // Can be an array of {start: Date, label: string, color: string} objects.
  } = {}
) {
  // SETUP
  let width = window.innerWidth - margin.laneGutter;
  if (svg === undefined)
    svg = d3.create("svg").attr("class", "gantt").attr("width", width);

  if (!fixedRowHeight) svg.attr("height", height);
  const axisGroup = svg
    .append("g")
    .attr("class", "gantt__group-axis")
    .attr("transform", `translate(0, ${margin.top})`);

  const barsGroup = svg.append("g").attr("class", "gantt__group-bars");
  const lanesGroup = svg.append("g").attr("class", "gantt__group-lanes");
  const referenceLinesGroup = svg
    .append("g")
    .attr("class", "gantt_group-reference-lines");

  var x = xScale.range([
    margin.left + (showLaneLabels === "left" ? margin.laneGutter : 0),
    width - margin.right - (showLaneLabels === "right" ? margin.laneGutter : 0),
  ]);

  var y = d3.scaleBand().padding(yPadding).round(true);
  function updateReferenceLines(referenceLines) {
    // Update reference lines
    referenceLinesGroup
      .selectAll("g")
      .data(referenceLines)
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr("transform", (d) => `translate(${x(d.start)}, 0)`);
          g.append("path")
            .attr(
              "d",
              d3.line()([
                [0, margin.top],
                [0, height - margin.bottom],
              ])
            )
            .attr("stroke", (d) => d.color || "darkgrey");

          g.append("text")
            .text((d) => d.label || "")
            .attr("x", 5)
            .attr("y", height - margin.bottom + 10)
            .attr("fill", (d) => d.color || "darkgrey");

          return g;
        },
        (update) => {
          update.attr("transform", (d) => `translate(${x(d.start)}, 0)`);
          update
            .select("path")
            .attr(
              "d",
              d3.line()([
                [0, margin.top],
                [0, height - margin.bottom],
              ])
            )
            .attr("stroke", (d) => d.color || "darkgrey");
          update
            .select("text")
            .text((d) => d.label || "")
            .attr("y", height - margin.bottom + 10)
            .attr("fill", (d) => d.color || "darkgrey");
          return update;
        },
        (exit) => {
          exit.remove();
        }
      );
  }

  function barLength(d, i, shrink = 0.0) {
    return Math.max(Math.round(x(end(d)) - x(start(d)) - shrink), 0); // Subtract 2 for a pixels gap between every bar.
  }

  function updateBars(_newData, duration = 0) {
    // Persist data|
    _data = _newData;
    // Create x scales using our raw data. Since we need a scale to map it with assignLanes
    const xDomainData = [
      d3.min([..._data.map(start), ...referenceLines.map((d) => d.start)]),
      d3.max([..._data.map(end), ...referenceLines.map((d) => d.start)]),
    ];

    // Update the x domain
    x.domain(xDomain || xDomainData).nice();

    // Map our _data to swim lanes
    const data = layout(_data, {
      start: start,
      end: end,
      lane: lane,
      xScale: x,
      xPadding: xPadding,
    });

    const nRows = d3.max(data.map((d) => d.laneNo + 1));

    // Calculate the height of our chart if not specified exactly.
    if (fixedRowHeight) {
      height = rowHeight * nRows + margin.top + margin.bottom;
      svg.attr("height", height);
    } else {
      rowHeight = (height - margin.top - margin.bottom) / nRows;
    }

    // Update the yDomain
    const yDomain = [...new Set(data.map((d) => d.rowNo))];
    y.domain(yDomain).range([margin.top, height - margin.bottom]);

    // Update bars

    barsGroup
      .selectAll("g")
      .data(data, (d, i) => key(d, i))
      .join(
        (enter) => {
          const g = enter.append("g");
          g
            // It looks nice if we start in the correct y position and scale out
            .attr("transform", (d) => `translate(${width / 2}, ${y(d.rowNo)})`)
            .transition()
            .ease(d3.easeExpOut)
            .duration(duration)
            .attr(
              "transform",
              (d) => `translate(${x(start(d))}, ${y(d.rowNo)})`
            );

          const rect = g
            .append("rect")
            .attr("height", y.bandwidth())
            .attr("fill", (d) => color(d))
            .transition()
            .duration(duration)
            .attr("width", (d) => barLength(d));

          if (title !== undefined) {
            g.append("title").text((d) => title(d));
          }
          if (label !== undefined) {
            // Add a clipping path for text

            const clip = g
              .append("clipPath")
              .attr("id", (d, i) => `barclip-${slugify(key(d, i))}`)
              .append("rect")
              .attr("width", (d, i) => barLength(d, i, 4))
              .attr("height", y.bandwidth());

            g.append("text")
              .attr("x", Math.max(roundRadius * 0.75, 5))
              .attr("y", y.bandwidth() / 2)
              .attr("font-size", d3.min([y.bandwidth() * 0.6, 16]))
              .attr("visibility", (d) =>
                barLength(d) >= labelMinWidth ? "visible" : "hidden"
              ) // Hide labels on short bars
              .attr("clip-path", (d, i) => `url(#barclip-${slugify(key(d, i))}`)
              .text(label);
          }
          return g;
        },
        (update) => {
          update
            .transition()
            .duration(duration)
            .attr("transform", (d) => `translate(${10}, 19})`);
          update
            .select("rect")
            .transition()
            .duration(duration)
            .attr("fill", (d) => color(d))
            .attr("width", (d) => barLength(d))
            .attr("height", y.bandwidth());
          if (title !== undefined) {
            update.select("title").text((d) => title(d));
          }
          if (label !== undefined) {
            update
              .select("clipPath")
              .select("rect")
              .transition()
              .duration(duration)
              .attr("width", (d, i) => barLength(d, i, 4))
              .attr("height", y.bandwidth());
            update
              .select("text")
              .attr("y", y.bandwidth() / 2)
              .attr("font-size", d3.min([y.bandwidth() * 0.6, 16]))
              .attr("visibility", (d) =>
                barLength(d) >= labelMinWidth ? "visible" : "hidden"
              ) // Hide labels on short bars
              .text((d) => label(d));
          }
          return update;
        },
        (exit) => {
          exit.remove();
        }
      );
    if (showLaneBoundaries) {
      const lanes = d3.flatRollup(
        data,
        (v) => d3.max(v, (d) => d.rowNo),
        (d) => lane(d)
      );

      lanesGroup
        .selectAll("g")
        .data(lanes)
        .join(
          (enter) => {
            const g = enter
              .append("g")
              .attr(
                "transform",
                (d) =>
                  `translate(0, ${
                    y(d[1]) + y.step() - y.paddingInner() * y.step() * 0.5
                  })`
              );
            g.append("path")
              .attr(
                "d",
                d3.line()([
                  [margin.left, 0],
                  [width - margin.right, 0],
                ])
              )
              .attr("stroke", "grey");
            if (showLaneLabels) {
              g.append("text")
                .text((d) => d[0])
                .attr(
                  "x",
                  showLaneLabels === "left"
                    ? margin.left + 5
                    : showLaneLabels === "right"
                    ? width - margin.right - 5
                    : 0
                )
                .attr("y", -5)
                .attr(
                  "text-anchor",
                  showLaneLabels === "left" ? "beginning" : "end"
                )
                .attr("dominant-baseline", "bottom")
                .attr("font-size", "0.75em")
                .attr("fill", "grey");
            }
            return g;
          },
          (update) => {
            update
              .transition()
              .duration(duration)
              .attr(
                "transform",
                (d) =>
                  `translate(0, ${
                    y(d[1]) + y.step() - y.paddingInner() * y.step() * 0.5
                  })`
              );
            update.select("text").text((d) => d[0]);
            return update;
          },
          (exit) => {
            exit.remove();
          }
        );
    }
    // Draw axis
    if (showAxis) {
      axisGroup.transition().duration(duration).call(d3.axisTop(x));
    }
    // Update the reference lines, since our axis has adjusted
    updateReferenceLines(referenceLines);
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
    _width: (f) => {
      if (f === undefined) return width;
      width = f;
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
      return { x, y };
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

  return data
    .sort((a, b) => Number(opts.start(a)) - Number(opts.start(b))) // Sort by the date.
    .map((d) => ({ ...d, rowNo: findSlot(slots, opts.start(d), opts.end(d)) }));
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
