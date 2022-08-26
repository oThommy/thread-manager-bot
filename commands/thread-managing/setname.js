const { PREFIX } = require('../../config.js');

module.exports = {
    aliases: ['setname'],
    minArgs: 1,
    expectedArgs: [
        {
            name: 'name',
            customValidator: {
                validator: (argVal) => {
                    return argVal.length <= 100;
                },
                validatorErr: (argName) => {
                    return `Argument ${argName} needs to be 100 characters or fewer in length`;
                }
            }
        }
    ],
    description: 'Sets the name of a thread',
    callback: async ({ message, args }) => {
        if (!message.channel.isThread()) return await message.reply(`You have to be in a thread to use this command`);
        const newName = args.join(' ');
        await message.channel.setName(newName, `${message.author.username} issued the command ${PREFIX}setname`);
        return;
    }
};