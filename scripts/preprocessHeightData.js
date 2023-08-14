const csv = require('csvtojson')
const csvFilePath = './original-height-data.csv'
const {
  writePreprocessedData,
  getDatesBetween,
  getSpeciesDisplayName,
} = require('./utils')

const splitDate = (date) => date
const standardizeUnits = (a) =>
  a.Unit === 'inches' ? Number(a.Height) : Number(a.Height / 2.54)

csv()
  .fromFile(csvFilePath)
  .then(preprocessData)
  .then((content) => {
    writePreprocessedData(content.finalData, 'processed-height-data')
    writePreprocessedData(content.fullDateSet, 'full-date-set')
  })

async function preprocessData(csvData) {
  const sortedData = csvData.sort((a, b) => new Date(a.Date) - new Date(b.Date))

  var dates = [
    splitDate(sortedData[0].Date),
    splitDate(sortedData[sortedData.length - 1].Date),
  ]

  let fullDateSet = getDatesBetween(
    new Date(dates[0]).getTime(),
    new Date(dates[dates.length - 1]).getTime(),
  )

  let mapIndexedByPlant = {}
  for (let recording of csvData) {
    if (!(recording.Name in mapIndexedByPlant)) {
      mapIndexedByPlant[recording.Name] = []
    }
    mapIndexedByPlant[recording.Name].push(recording)
  }

  // Combine available plant recordings with full date set, so that every
  // plant has a baseline of the full dates.  Dates for which there was no
  // recording are null
  let mapWithBlankDays = {}
  for (let plantName in mapIndexedByPlant) {
    let plantRecordings = mapIndexedByPlant[plantName]
    let paddedPlantRecordings = Array.from(fullDateSet).map((date) => {
      let dateEntry = { date, value: null }
      let format = (b) => new Date(b).toString()
      for (let a = 0; a < plantRecordings.length; a++) {
        if (format(plantRecordings[a].Date) === format(date)) {
          return { ...dateEntry, value: standardizeUnits(plantRecordings[a]) }
        }
      }
      return dateEntry
    })
    mapWithBlankDays[plantName] = paddedPlantRecordings.map((a) => a.value)
  }

  // Now finally prepare the data the way c3.js expects
  let finalData = []
  for (let plantName in mapWithBlankDays) {
    let data = mapWithBlankDays[plantName]
    finalData.push({
      title: plantName,
      species: getSpeciesDisplayName(plantName),
      data,
    })
  }

  return { finalData, fullDateSet }
}
