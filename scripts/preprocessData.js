const csv = require("csvtojson");
const eventNames = ["departed", "planted", "inwater"];
const csvFilePath = "./original-data.csv";
const heightFilePath = "./original-height-data.csv"
const dormancyDataPath = "./original-dormancy-data.csv";
const { writePreprocessedData, getSpeciesDisplayName } = require("./utils");
const MIN_DISPLAYED_PLANT_LIFESPAN = 60; // In days - plants w lifespans shorter than this hidden

Promise.all([
  csv().fromFile(csvFilePath).then(ensureMinimumFieldsExist),
  csv().fromFile(dormancyDataPath).then(convertToObject).then(findDuplicates),
  csv().fromFile(heightFilePath).then(convertToObject)
])
  .then(preprocessData)
  .then(([buckets, stillAlive]) => {
    writePreprocessedData(buckets, "processed-data");
    writePreprocessedData(stillAlive, "still-alive-data");
  });

let dateLabelMap = {
  "Departure date": "departed",
  "Intake date": "germinating",
  "Sprouted date": "sprouted",
  "Planted date": "planted",
  "Water date": "inwater",
  Dormant: "dormant",
  Undormant: "recovered",
};

const dateFields = Object.keys(dateLabelMap).filter(k => k.includes('date'))
const sortDateFields = (entry) => {
  return dateFields.map(keyName => entry[keyName])
    .filter(Boolean)
    .map(d => new Date(d))
    .sort((a, b) => a < b ? -1 : 1)
}

function preprocessData([originalData, dormancyData, heightData]) {
  const formattedData = originalData
    .sort((a, b) => {
      return a.Name.localeCompare(b.Name, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    })
    .sort((a, b) => {
      const earliestdateForA = sortDateFields(a)
      const earliestdateForB = sortDateFields(b)
      return earliestdateForA[0] < earliestdateForB[0] ? -1 : 1
    })
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
    .filter((a) => {
      // Select only plants whose entire lifespan is/was more than X days 
      const first = a.dates[0].date;
      const departedEntry = a.dates.find(d => d.stage === 'departed');
      const last = departedEntry ? departedEntry.date : new Date()
      const diffInMs = new Date(last) - new Date(first)
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      // and those for whom there is at least one measurement
      // This ensures data compatibility when switching btwn timeline and height charts
      const hasHeightEntry = heightData[a.name]
      return diffInDays > MIN_DISPLAYED_PLANT_LIFESPAN || hasHeightEntry;
    })

  const buckets = formattedData.map(expandEntries).flat();

  const stillAlive = formattedData
    .filter((a) => a["Departure date"] === "")
    .map((a) => a.Name);
  return [buckets, stillAlive];
}

function format(entry) {
  entry.name = entry.Name;
  entry.plantType = getSpeciesDisplayName(entry.name);
  Object.entries(dateLabelMap).forEach(([key, value]) => {
    if (entry[key] && entry[key].trim())
      entry.dates.push({ stage: value, date: new Date(entry[key]) });
  })

  entry.dates.sort((a, b) => a.date < b.date ? -1 : 1)

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

  let sortedArray = dates.filter(({ stage }) => !eventNames.includes(stage));

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

  return buckets.filter(({ start, end }) =>  (start && end) ? start.toString() !== end.toString() : true)
}
