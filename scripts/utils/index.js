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
    .replace(/[0-9.]/g, "")
    .trim()
    .toLowerCase();
}

function formatDate(d) {
  let date = new Date(d)
  let y = date.getFullYear();
  let m = (date.getMonth() + 1).toString().padStart(2, 0);
  let day = date.getDate().toString().padStart(2, 0);
  return `${m}/${day}/${y}`
}

function getDatesBetween(beginning, end) {
  let fullDateSet = [];
  let currentDate = beginning;
  let d;

  while (currentDate <= end) {
    d = new Date(currentDate);
    fullDateSet.push(formatDate(d));
    currentDate += 24 * 60 * 60 * 1000; // add one day
  }
  return fullDateSet;
}

module.exports = {
  writePreprocessedData,
  getSpeciesName,
  getSpeciesDisplayName,
  formatDate,
  getDatesBetween,
};
