const config = {
  fixedRowHeight: true,
  rowHeight: 15,
  height: 500,
  labelMinWidth: 50,
  roundRadius: 2,
  xPadding: 0,
  yPadding: 0.1,
  showLaneLabels: "left",
  showAxis: true,
};

let cm = d3
  .scaleOrdinal(d3.schemeSet2)
  .domain([...d3.group(data, (d) => d.exit).keys()])
  .unknown(null);

function format(entry) {
  entry["Departure date"] = !entry["Departure date"]
    ? "5/29/2023"
    : entry["Departure date"];

  return entry;
}

function chart(config) {
  console.log(data);
  const gantt = Gantt(
    data
      .filter((entry) =>
        ["Intake date", "Departure date", "Name"].every((requiredKey) => {
          return Object.keys(entry).includes(requiredKey);
        })
      )
      .map(format),
    {
      key: (d) => d.Name.split(" ").join("_") + d.id,
      start: (d) => new Date(d["Intake date"]),
      end: (d) => new Date(d["Departure date"]),
      lane: (d) => d.Name,
      color: (d) => cm(d.Name.split(" ")[0]),
      label: (d) => d.Name,
      labelMinWidth: config.labelMinWidth,
      title: (d) => {
        const f = d3.timeFormat("%b %d");
        return `${f(new Date(d["Intake date"]))} to ${f(
          new Date(d["Departure date"])
        )}`;
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
    }
  );

  const node = d3.create("div").style("overflow", "auto").node();
  node.appendChild(gantt);
  console.log(node, gantt);
  document.getElementById("body").appendChild(node);

  return Object.assign(node, { gantt: gantt });
}

let g = chart(config);
// setTimeout(() => {
//   return g.gantt._update().bars(
//     data.filter((d) => ["Cuba", "Croatia"].includes(d.countryname)),
//     1000
//   );
// }, 5000);
