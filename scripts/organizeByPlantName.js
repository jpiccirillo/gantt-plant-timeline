const { writePreprocessedData } = require("./utils");

const data = require("../src/data/processed-data.json");

function generatePlantNameLookupMap() {
  let plantMap = {};
  for (let plantEntry of data) {
    const key = plantEntry.name.toLowerCase();
    if (!plantMap[key]) plantMap[key] = [];
    plantMap[key].push(plantEntry);
  }
  return { plantMap };
}

const { plantMap } = generatePlantNameLookupMap();

writePreprocessedData(plantMap, "organized-by-name");
