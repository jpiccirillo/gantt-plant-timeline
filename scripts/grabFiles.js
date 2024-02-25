const fs = require('fs');
const path = require('path');

// Define the source and destination directories
const sourceDir = '/Users/jeffreypiccirillo/Downloads';
const destinationDir = './';

// Define the regex pattern for the files you're interested in
// For example, to match files with a .txt extension, you could use /\.txt$/

const fileNameMap = [
    { targetName: "original-data.csv", regex: /Plant Spreadsheet - Sheet1.*\.csv$/ },
    { targetName: "original-height-data.csv", regex: /Plant Spreadsheet - Heights.*\.csv$/ },
    { targetName: "original-dormancy-data.csv", regex: /Plant Spreadsheet - DormancyData.*\.csv$/ }
]

const renameFile = (to, from) => {
    fs.rename(to, from, function (moveErr) {
        if (moveErr) {
            console.error('Error moving file:', moveErr);
        } else {
            console.log(`Successfully moved ${to.split("/").pop()}`);
        }
    });
}

const coordinateRename = ({ regex, targetName }) => {
    // Read the source directory{
    fs.readdir(sourceDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        // Filter files based on the regex pattern
        const matchingFiles = files.filter((file) => regex.test(file));

        if (matchingFiles.length === 0) {
            console.log(`No matching files found for ${targetName}`);
            return;
        }

        // Find the newest file
        let sortedByDate = matchingFiles.sort((path1, path2) => {
            return fs.statSync(path.join(sourceDir, path2)).mtime - fs.statSync(path.join(sourceDir, path1)).mtime
        });
        const newestFile = sortedByDate[0]
        const otherMatches = sortedByDate.slice(1)

        // Move the newest file
        const sourcePath = path.join(sourceDir, newestFile);
        const destinationPath = path.join(destinationDir, targetName);
        renameFile(sourcePath, destinationPath)

        // Delete non-newest matches
        otherMatches.forEach((oldMatch) => {
            fs.unlinkSync(path.join(sourceDir, oldMatch))
            console.log(`X Deleted ${oldMatch}`)
        })

    });
}

fileNameMap.forEach(coordinateRename)