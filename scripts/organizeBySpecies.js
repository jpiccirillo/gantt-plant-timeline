const { writePreprocessedData, getSpeciesName } = require("./utils");

const data = require("../src/data/processed-data.json");

function generatePlantNameLookupMap() {
  let plantMap = {};
  for (let plantEntry of data) {
    const key = getSpeciesName(plantEntry.name).toLowerCase();
    if (!plantMap[key]) plantMap[key] = new Set();
    plantMap[key].add(plantEntry.name);
  }
  return {
    plantMap:  Object.entries(plantMap).reduce((a, [name, value]) => { 
      a[name] = Array.from(value)
      return a;
    }, {})
  }
}

const { plantMap } = generatePlantNameLookupMap();

writePreprocessedData(plantMap, "organized-by-species");
