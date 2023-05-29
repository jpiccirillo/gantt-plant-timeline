const config = {
  fixedRowHeight: true,
  rowHeight: 20,
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

function chart(config) {
  console.log(data);
  const gantt = Gantt(
    data.filter((d) =>
      ["United States of America", "Solomon Islands"].includes(d.countryname)
    ),
    {
      key: (d) => d.obsid,
      start: (d) => new Date(d.startdate),
      end: (d) => new Date(d.enddate),
      lane: (d) => d.countryname,
      color: (d) => cm(d.exit),
      label: (d) => d.leader,
      labelMinWidth: config.labelMinWidth,
      title: (d) =>
        `${d.countryname} - ${d.leader} - ${d3.timeFormat("%Y")(
          new Date(d.startdate)
        )} to ${d3.timeFormat("%Y")(new Date(d.enddate))}`,
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
          start: new Date(1989, 11, 9),
          label: "Berlin Wall Falls",
          color: "black",
        },
        { start: new Date(1939, 9, 1), label: "WWII", color: "black" },
        { start: new Date(1945, 9, 2), label: "", color: "#555" },
        { start: new Date(1914, 7, 28), label: "WWI", color: "black" },
        { start: new Date(1918, 11, 11), label: "", color: "#555" },
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
setTimeout(() => {
  return g.gantt._update().bars(
    data.filter((d) => ["Cuba", "Croatia"].includes(d.countryname)),
    1000
  );
}, 5000);
