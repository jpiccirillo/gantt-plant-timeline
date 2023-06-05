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
    //  margin
    //   width: width,
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
    referenceLines: [
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
    ],
  });

  const node = d3.create("div").style("overflow", "auto").node();
  node.appendChild(gantt);
  document.getElementById("body").appendChild(node);

  return Object.assign(node, { gantt: gantt });
}

fetch("./processed-data.json")
  .then((response) => response.json())
  .then((data) => chart(data, config))
  .then(furtherCode);

function furtherCode(g) {
  // // g, the gantt object, is available in scope here since promise has resolved
  // setTimeout(() => {
  //   fetch("./processed-data.json")
  //     .then((response) => response.json())
  //     .then((data) =>
  //       data.filter(
  //         (plant) => plant.name === "Mango 29" || plant.name === "Mango 31"
  //       )
  //     )
  //     .then((filteredData) => {
  //       g.gantt._update().referenceLines([], 100);
  //       g.gantt._update().bars(filteredData, 100);
  //     });
  // }, 3000);
}
