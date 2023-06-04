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

let eventNames = ["departed", "planted", "inwater"];

function format(entry) {
  entry.name = entry.Name;
  entry.dates = {};
  entry.plantType = entry.name.replace(/[\ \.0-9]/g, "").toLowerCase();
  let dateKeys = [
    { orig: "Departure date", new: "departed" },
    { orig: "Intake date", new: "intake" },
    { orig: "Sprouted date", new: "sprouted" },
    { orig: "Planted date", new: "planted" },
    { orig: "Water date", new: "inwater" },
    { orig: "Dormant date", new: "dormant" },
    { orig: "Undormant date", new: "recovered" },
  ];
  dateKeys.forEach((key) => {
    if (entry[key.orig] && entry[key.orig].trim())
      entry.dates[key.new] = new Date(entry[key.orig]);
  });

  return entry;
}

// Expand a given plant into separate chunks, or horizontal 'bars' for various sections of its lifetime
function expandEntries(plant) {
  let sortedArray = Object.entries(plant.dates)
    .sort((a, b) => a[1] - b[1])
    .filter(([name]) => !eventNames.includes(name));

  let buckets = [];

  for (let i = 0; i < sortedArray.length - 1; i++) {
    let bucket = {
      start: sortedArray[i][1],
      end: sortedArray[i + 1][1],
      type: sortedArray[i][0],
      name: plant.name,
      species: plant.plantType,
    };
    buckets.push(bucket);
  }

  // The last bucket has the same start and end date
  buckets.push({
    start: sortedArray[sortedArray.length - 1][1],
    end: new Date(),
    type: sortedArray[sortedArray.length - 1][0],
    name: plant.name,
    species: plant.plantType,
  });

  // If departed date is specified, ammend last bucket to end at that date
  if (plant.dates.departed) {
    buckets[buckets.length - 1].end = plant.dates.departed;
  }

  // Now after we've calculated the buckets, add an entry in for planted date
  for (let event of eventNames) {
    if (plant.dates[event]) {
      buckets.push({
        start: plant.dates[event],
        type: event,
        name: plant.name,
        species: plant.plantType,
      });
    }
  }

  return buckets;
}

function chart(processedData, config) {
  let cm = (species) => {
    let map = {
      mango: "#37031A",
      avocado: "#6E260E",
      jackfruit: "#0a481e",
      pomegranate: "#f2003c",
      pineapple: "#FEEA63",
      guava: "#69b562",
      blueberry: "#464196",
      medjooldate: "#351E10",
      serranopepper: "#507002",
      poblanopepper: "#074304",
      habanero: "#ff8100",
      papaya: "#FFB90C",
      lemon: "#FAFA33",
      keylime: "#11b502",
      turmeric: "#8FC128",
      ginger: "#E5E3A8",
      tomato: "#EA0001",
      grapefruit: "#075900",
      pinklemon: "#F2B4C0",
      honeytangerine: "#FBBD66",
      persimmon: "#9FC47F",
      anaheimpepper: "#72A60A",
      etrog: "#FFD507",
      jalapeno: "#629e07",
    };
    return map[species];
  };

  const gantt = Gantt(processedData, {
    key: (d) => d.name.split(" ").join("_") + d.start,
    start: (d) => new Date(d.start),
    end: (d) => new Date(d.end),
    lane: (d) => d.name,
    color: (d) => cm(d.species),
    label: (d) => d.type,
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
  });

  const node = d3.create("div").style("overflow", "auto").node();
  node.appendChild(gantt);
  console.log(node, gantt);
  document.getElementById("body").appendChild(node);

  return Object.assign(node, { gantt: gantt });
}

const _data = data
  // .filter((plant) => plant.Name.includes("Lemon"))
  .filter((entry) =>
    ["Intake date", "Departure date", "Name"].every((requiredKey) => {
      return Object.keys(entry).includes(requiredKey);
    })
  )
  .map(format)
  .map(expandEntries)
  .flat();

let g = chart(_data, config);

// setTimeout(() => {
//   let __data = _data.filter(
//     (d) =>
//       d.name.includes("Lemon") ||
//       d.name.includes("Etrog") ||
//       d.name.includes("Pineapple") ||
//       d.name.includes("Avocado") ||
//       d.name.includes("Mango")
//   );

//   console.log(__data);
//   return g.gantt._update().bars(__data, 100);
// }, 3000);
