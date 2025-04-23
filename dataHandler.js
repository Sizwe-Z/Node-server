const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data.json');

function initDataFile() {
  if (!fs.existsSync(filePath)) {
    const defaultData = { movies: [], series: [], songs: [] };
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

function readData() {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  initDataFile,
  readData,
  writeData
};
