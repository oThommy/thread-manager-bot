const path = require('path');
const fs = require('fs');

const readDatabase = (pathDatabase, defaultContents) => {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(pathDatabase)) {
                fs.mkdirSync(path.dirname(pathDatabase), { recursive: true }); // recursively make base directory of database
                fs.writeFileSync(pathDatabase, JSON.stringify(defaultContents, null, 4)); // make database with default contents
            }
            resolve(JSON.parse(fs.readFileSync(pathDatabase)));
        } catch (err) {
            reject(() => {
                console.error(`ERROR: Something went wrong whilst trying to %sread%s database ${pathDatabase}`, '\x1b[4m', '\x1b[0m'); // underscore = \x1b[4m reset = \x1b[0m
                console.error(err);
            });
        }
    });
};

const updateDatabase = (pathDatabase, contents) => {
    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(pathDatabase, JSON.stringify(contents, null, 4));
            resolve();
        } catch (err) {
            reject(() => {
                console.error(`ERROR: Something went wrong whilst trying to %supdate%s database ${pathDatabase}`, '\x1b[4m', '\x1b[0m');
                console.error(err);
            });
        }
    });
};

module.exports = {
    readDatabase,
    updateDatabase
};