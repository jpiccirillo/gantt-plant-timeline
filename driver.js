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
  entry.name = entry.Name;
  entry.dates = {};
  let dateKeys = [
    { orig: "Departure date", new: "departed" },
    { orig: "Intake date", new: "intake" },
    { orig: "Sprouted date", new: "sprouted" },
    { orig: "Planted date", new: "planted" },
    { orig: "Water date", new: "inwater" },
  ];
  dateKeys.forEach((key) => {
    if (entry[key.orig].trim())
      entry.dates[key.new] = new Date(entry[key.orig]);
  });

  return entry;
}

// Expand a given plant into separate chunks, or horizontal 'bars' for various sections of its lifetime
function expandEntries(plant) {
  let sortedArray = Object.entries(plant.dates)
    .sort((a, b) => a[1] - b[1])
    .filter(([name]) => name !== "departed");

  let buckets = [];

  for (let i = 0; i < sortedArray.length - 1; i++) {
    let bucket = {
      start: sortedArray[i][1],
      end: sortedArray[i + 1][1],
      type: sortedArray[i][0],
      name: plant.name,
    };
    buckets.push(bucket);
  }

  // The last bucket has the same start and end date
  buckets.push({
    start: sortedArray[sortedArray.length - 1][1],
    end: new Date(),
    type: sortedArray[sortedArray.length - 1][0],
    name: plant.name,
  });

  // If departed date is specified, ammend last bucket to end at that date
  if (plant.dates.departed) {
    buckets[buckets.length - 1].end = plant.dates.departed;
  }

  return buckets;
}

function chart(config) {
  const gantt = Gantt(
    data
      .filter((entry) =>
        ["Intake date", "Departure date", "Name"].every((requiredKey) => {
          return Object.keys(entry).includes(requiredKey);
        })
      )
      .map(format)
      .map(expandEntries)
      .flat(),
    {
      key: (d) => d.name.split(" ").join("_") + d.start,
      start: (d) => new Date(d.start),
      end: (d) => new Date(d.end),
      lane: (d) => d.name,
      color: (d) => cm(d.name.split(" ")[0]),
      label: (d) => d.name,
      labelMinWidth: config.labelMinWidth,
      title: (d) => {
        const f = d3.timeFormat("%b %d");
        return `${f(new Date(d.start))} to ${f(new Date(d.end))}`;
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
