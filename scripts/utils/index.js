const fs = require("fs");
const path = require("path");

function writePreprocessedData(content, filename) {
  fs.writeFileSync(
    path.resolve(__dirname, `../../src/data/${filename}.json`),
    JSON.stringify(content, null, 2)
  );
}

function getSpeciesName(p) {
  return p.replace(/[0-9.]/g, "").trim();
}

module.exports = { writePreprocessedData, getSpeciesName };
