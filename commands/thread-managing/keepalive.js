const { PATH_THREADS_LIST, THREADS_LIST_DEFAULT_CONTENTS } = require('../../config.js');
const { readDatabase, updateDatabase } = require('../../json-database-util.js');

module.exports = {
    aliases: 'keepalive',
    description: 'Enables automatic unarchiving when used in a thread',
    callback: async ({ message }) => {
        if (!message.channel.isThread()) return await message.reply(`You have to be in a thread to use this command`);
        const threads = await readDatabase(PATH_THREADS_LIST, THREADS_LIST_DEFAULT_CONTENTS);
        if (threads.includes(message.channel.id)) return await message.reply(`Automatic unarchiving has already been enabled in this thread`);
        if (message.channel.autoArchiveDuration < 1440) {
            await message.channel.setAutoArchiveDuration(1440, 'Longer auto archiving results in less usage of the bot\'s resources');
        }
        threads.push(message.channel.id);
        await updateDatabase(PATH_THREADS_LIST, threads);
        return await message.reply(`Automatic unarchiving has been enabled in this thread`);
    }
};