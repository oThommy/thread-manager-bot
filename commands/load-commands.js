const path = require('path');
const { PREFIX, FILE_LOAD_COMMANDS, FILE_COMMAND_BASE } = require('../config.js');
const fs = require('fs');

class CommandsCollection {
    constructor() {
        this.commandsArr = [];
    }

    // returns commandsArr
    getCommandsArr() {
        return this.commandsArr;
    }

    // add a command (command options) to the collection (array)
    add(commandOptions) {
        this.commandsArr.push(commandOptions);
    }

    // returns boolean whether the command exists
    has(alias) {
        return this.commandsArr
            .reduce((acc, { aliases }) => {
                return [...acc, ...aliases];
            }, [])
            .includes(alias);
    }

    // return command options for corresponding alias
    getCommandOptions(alias) {
        return this.commandsArr.find(({ aliases }) => aliases.includes(alias));
    }

    // generate command usage string (!cmd [arg1] [arg2])
    genCommandUsage(alias) {
        let usageStr = `${PREFIX}`;
        const { aliases: [ cmd ], expectedArgs} = this.getCommandOptions(alias);
        usageStr += cmd;
        for (const expectedArg of expectedArgs) {
            usageStr += ` [${expectedArg.name}]`;
        }
        return usageStr;
    }
}

module.exports = (client) => {
    client.allCommands = new CommandsCollection();

    const loadCommands = (dir) => {
        // get file array with directories and *.js files and filter out the command base and the current filename
        const files = fs.readdirSync(dir).filter(file => {
            return (file.endsWith('.js') || fs.lstatSync(path.join(dir, file)).isDirectory()) && 
            !(file === FILE_LOAD_COMMANDS || file === FILE_COMMAND_BASE);
        });
        for (const file of files) {
            const PATH_FILE = path.join(dir, file);
            if (fs.lstatSync(PATH_FILE).isDirectory()) {
                loadCommands(PATH_FILE);
            } else {
                let commandOptions = require(PATH_FILE);

                // default values
                let {
                    aliases,
                    description = '',
                    minArgs = 0,
                    expectedArgs = []
                } = commandOptions;

                // ensure the command aliases are in an array
                const ensureArray = (propArr) => {
                    propArr.forEach((el, i) => {
                        if (typeof el === 'string') {
                            if (el.length === 0) {
                                propArr[i] = [];
                            } else {
                                propArr[i] = [el];
                            }
                        }
                    });
                    return propArr;
                }
                [ aliases ] = ensureArray([aliases]);

                // overwrite commandOptions with properties in an array or default values in case it didn't include the property
                client.allCommands.add({
                    ...commandOptions,
                    aliases,
                    description,
                    minArgs,
                    expectedArgs
                });
            }
        }
    }

    // recursively load all the commandOptions and add them to allCommands
    loadCommands(__dirname);
};