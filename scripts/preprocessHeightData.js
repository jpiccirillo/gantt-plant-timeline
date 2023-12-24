const csv = require("csvtojson");
const csvFilePath = "./original-height-data.csv";
const {
  writePreprocessedData,
  formatDate,
  getSpeciesDisplayName,
} = require("./utils");

const standardizeUnits = (a) =>
  a.Unit === "inches" ? Number(a.Height) : Number(a.Height / 2.54);

csv()
  .fromFile(csvFilePath)
  .then(preprocessData)
  .then((content) => {
    writePreprocessedData(content.finalData, "processed-height-data");
  });

async function preprocessData(csvData) {
  let mapIndexedByPlant = {};
  for (let recording of csvData) {
    if (!(recording.Name in mapIndexedByPlant)) {
      mapIndexedByPlant[recording.Name] = [];
    }
    mapIndexedByPlant[recording.Name].push(recording);
  }

  // Combine available plant recordings with full date set, so that every
  // plant has a baseline of the full dates.  Dates for which there was no
  // recording are null
  let mapWithBlankDays = {};
  for (let plantName in mapIndexedByPlant) {
    let plantRecordings = mapIndexedByPlant[plantName];
    let sortedByDates = plantRecordings.sort(
      (a, b) => new Date(a.Date) - new Date(b.Date)
    );

    let dates = sortedByDates.map((a) => formatDate(a.Date));
    let values = sortedByDates.map((a) => standardizeUnits(a));
    mapWithBlankDays[plantName] = { dates, values };
  }

  // Now finally prepare the data the way c3.js expects
  let finalData = [];
  for (let plantName in mapWithBlankDays) {
    let data = mapWithBlankDays[plantName];
    finalData.push({
      name: plantName,
      species: getSpeciesDisplayName(plantName),
      data,
    });
  }

  return { finalData };
}
