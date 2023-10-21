const csv = require("csvtojson");
const eventNames = ["departed", "planted", "inwater"];
const csvFilePath = "./original-data.csv";
const dormancyDataPath = "./original-dormancy-data.csv";
const { writePreprocessedData, getSpeciesDisplayName } = require("./utils");

Promise.all([
  csv().fromFile(csvFilePath).then(ensureMinimumFieldsExist),
  csv().fromFile(dormancyDataPath).then(convertToObject).then(findDuplicates),
])
  .then(preprocessData)
  .then((content) => writePreprocessedData(content, "processed-data"));

let dateLabelMap = {
  "Departure date": "departed",
  "Intake date": "germinating",
  "Sprouted date": "sprouted",
  "Planted date": "planted",
  "Water date": "inwater",
  Dormant: "dormant",
  Undormant: "recovered",
};

function preprocessData([originalData, dormancyData]) {
  return originalData
    .map((originalEntry) => {
      originalEntry.dates = [];
      // now weave in dormancy data
      let dormancyEntries = dormancyData[originalEntry.Name];
      if (dormancyEntries && dormancyEntries.length) {
        for (let entry of dormancyEntries) {
          originalEntry.dates.push({
            stage: dateLabelMap[[entry.Note]],
            date: new Date(entry.Date),
          });
        }
      }

      // TODO: Weave in custom event data
      return originalEntry;
    })
    .map(format)
    .map(expandEntries)
    .flat();
}

function format(entry) {
  entry.name = entry.Name;
  entry.plantType = getSpeciesDisplayName(entry.name);
  Object.entries(dateLabelMap).forEach(([key, value]) => {
    if (entry[key] && entry[key].trim())
      entry.dates.push({ stage: value, date: new Date(entry[key]) });
  });
  return entry;
}

function convertToObject(csv) {
  let map = {};
  for (let entry of csv) {
    if (!(entry.Name in map)) {
      map[entry.Name] = [entry];
    } else {
      map[entry.Name].push(entry);
    }
  }
  return map;
}

function findDuplicatesInArray(arr) {
  const duplicates = [];
  arr.forEach((el, i) => {
    arr.forEach((element, index) => {
      if (i === index) return null;
      if (
        element.Name === el.Name &&
        element.Date === el.Date &&
        element.Note === el.Note
      ) {
        if (!duplicates.includes(el)) duplicates.push(el);
      }
    });
  });
  return duplicates;
}

function findDuplicates(_map) {
  let errors = [];
  for (let keyName in _map) {
    let value = _map[keyName];
    if (findDuplicatesInArray(value).length) {
      errors.push(keyName);
    }
  }

  if (errors.length)
    throw new Error(`Some plants had duplicates: ${errors.join(",")}`);
  else return _map;
}

function ensureMinimumFieldsExist(originalData) {
  return originalData.filter((entry) =>
    ["Intake date", "Departure date", "Name"].every((requiredKey) =>
      Object.keys(entry).includes(requiredKey)
    )
  );
}

// Expand a given plant into separate chunks, or horizontal 'bars' for various sections of its lifetime
function expandEntries({ name, plantType, dates }) {
  let datesAsMap = dates.reduce((a, i) => {
    a[i.stage] = i.date;
    return a;
  }, {});

  let sortedArray = dates
    .sort((a, b) => a.date - b.date)
    .filter(({ stage }) => !eventNames.includes(stage));

  // Edge case for when germinating + dormant are on same day (transplanted from soil elsewhere)
  let germinatingEntry = sortedArray.find((e) => e.stage === "germinating");
  let dormantEntry = sortedArray.find((e) => e.stage === "dormant");

  if (
    germinatingEntry &&
    dormantEntry &&
    germinatingEntry.date.toString() === dormantEntry.date.toString()
  ) {
    sortedArray = sortedArray.filter((a) => a.stage !== "germinating");
  }

  let buckets = [];

  for (let i = 0; i < sortedArray.length - 1; i++) {
    let bucket = {
      start: sortedArray[i].date,
      end: sortedArray[i + 1].date,
      type: sortedArray[i].stage,
      name: name,
      species: plantType,
    };
    buckets.push(bucket);
  }

  // The last bucket has the same start and end date
  buckets.push({
    start: sortedArray[sortedArray.length - 1].date,
    end: new Date(),
    type: sortedArray[sortedArray.length - 1].stage,
    name: name,
    species: plantType,
  });

  // If departed date is specified, ammend last bucket to end at that date
  if (datesAsMap.departed) {
    const departedDate = datesAsMap.departed;
    buckets[buckets.length - 1].end = departedDate;
  }

  // Now after we've calculated the buckets, add an entries for event data
  for (let event of eventNames) {
    if (datesAsMap[event]) {
      buckets.push({
        start: datesAsMap[event],
        type: event,
        name: name,
        species: plantType,
      });
    }
  }

  return buckets;
}
