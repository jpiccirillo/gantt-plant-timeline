const fs = require("fs");
const path = require("path");
const data = require("./src/data/processed-data.json");

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

function writePreprocessedData({ plantMap, stages }) {
  fs.writeFileSync(
    path.resolve(__dirname, `./plant-stages-data.json`),
    JSON.stringify(plantMap, null, 2)
  );

  fs.writeFileSync(
    path.resolve(__dirname, `./possible-stages.json`),
    JSON.stringify(stages, null, 2)
  );
}

writePreprocessedData(generateStagesPerPlant());
