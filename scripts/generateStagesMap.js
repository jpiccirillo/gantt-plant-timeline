const data = require("../src/data/processed-data.json");
const { writePreprocessedData } = require("./utils");

function generateStagesPerPlant() {
  let plantMap = {};
  let stages = [];
  for (let plantEntry of data) {
    if (!plantMap[plantEntry.name]) plantMap[plantEntry.name] = [];
    if (plantEntry.end) {
      // if it has end value, aka is a stage,
      plantMap[plantEntry.name].push(plantEntry.type);
      if (!stages.includes(plantEntry.type)) stages.push(plantEntry.type);
    }
  }
  return { plantMap, stages };
}

let { plantMap, stages } = generateStagesPerPlant();

writePreprocessedData(plantMap, "plant-stages-data");
writePreprocessedData(stages, "possible-stages-data");
