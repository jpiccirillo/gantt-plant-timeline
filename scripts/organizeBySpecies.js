const { writePreprocessedData, getSpeciesName } = require("./utils");

const data = require("../src/data/processed-data.json");

function generatePlantNameLookupMap() {
  let plantMap = {};
  for (let plantEntry of data) {
    const key = getSpeciesName(plantEntry.name);
    if (!plantMap[key]) plantMap[key] = [];
    plantMap[key].push(plantEntry);
  }
  return { plantMap };
}

const { plantMap } = generatePlantNameLookupMap();

writePreprocessedData(plantMap, "organized-by-species");
