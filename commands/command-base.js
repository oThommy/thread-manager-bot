const { PREFIX } = require('../config.js');
const errorHandler = require('../error-handler.js');

const defaultValidator = (type) => {
    const defaultValidators = {
        'ANY': {
            validator: () => true,
        },
        'NUMBER': {
            validator: (argVal) => {
                return !isNaN(argVal);
            },
            validatorErr: (argName) => {
                return `Argument \`[${argName}]\` needs to be a number`;
            }
        }
    }
    return defaultValidators[type];
}

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        const args = message.content
            .substring(PREFIX.length)
            .trim()
            .split(/\s+/);
        const cmd = args.shift().toLowerCase();

        if (!client.allCommands.has(cmd)) return;

        const { minArgs, expectedArgs, callback } = client.allCommands.getCommandOptions(cmd);
        if (args.length < minArgs) {
            return message.reply(`You need to give at least ${minArgs} arguments: \`${client.allCommands.genCommandUsage(cmd)}\``);
        }

        const argChecks = Math.min(args.length, expectedArgs.length);
        for (let i = 0; i < argChecks; i++) {
            const arg = args[i];
            const expectedArg = expectedArgs[i];
            const { validator, validatorErr } = expectedArg.hasOwnProperty('type') ? defaultValidator(expectedArg.type) : expectedArg.customValidator; // use default validator if a type is specified, otherwise use the custom validator
            if (!validator(arg)) {
                return message.reply(validatorErr(expectedArg.name));
            }
        }

        await callback({message, args, client}).catch((err) => errorHandler(err, message));
    });
};