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

function getSpeciesDisplayName(p) {
  return p
    .replace(/[\ \0-9.]/g, "")
    .trim()
    .toLowerCase();
}

function getDatesBetween(beginning, end) {
  let fullDateSet = [];
  let currentDate = beginning;
  let d;

  while (currentDate <= end) {
    d = new Date(currentDate);
    let y = d.getFullYear();
    let m = (d.getMonth() + 1).toString().padStart(2, 0);
    let day = d.getDate().toString().padStart(2, 0);
    fullDateSet.push(`${m}/${day}/${y}`);
    currentDate += 24 * 60 * 60 * 1000; // add one day
  }
  return fullDateSet;
}

module.exports = {
  writePreprocessedData,
  getSpeciesName,
  getSpeciesDisplayName,
  getDatesBetween,
};
