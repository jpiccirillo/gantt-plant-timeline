const csv = require("csvtojson");
const eventNames = ["departed", "planted", "inwater"];
const csvFilePath = "./original-data.csv";
const { writePreprocessedData } = require("./utils");

csv()
  .fromFile(csvFilePath)
  .then(preprocessData)
  .then((content) => writePreprocessedData(content, "processed-data"));

function preprocessData(json) {
  return json
    .filter((entry) =>
      ["Intake date", "Departure date", "Name"].every((requiredKey) =>
        Object.keys(entry).includes(requiredKey)
      )
    )
    .map(format)
    .map(expandEntries)
    .flat();
}

function format(entry) {
  entry.name = entry.Name;
  entry.dates = {};
  entry.plantType = entry.name.replace(/[\ \.0-9]/g, "").toLowerCase();
  let dateKeys = [
    { orig: "Departure date", new: "departed" },
    { orig: "Intake date", new: "germinating" },
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
