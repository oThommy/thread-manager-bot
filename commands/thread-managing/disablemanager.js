const { PATH_THREADS_LIST, THREADS_LIST_DEFAULT_CONTENTS } = require('../../config.js');
const { readDatabase, updateDatabase } = require('../../json-database-util.js');

module.exports = {
    aliases: ['disablemanager'],
    description: 'Disables automatic unarchiving when used in a thread',
    callback: async ({ message }) => {
        if (!message.channel.isThread()) return await message.reply(`You have to be in a thread to use this command`);
        let threads = await readDatabase(PATH_THREADS_LIST, THREADS_LIST_DEFAULT_CONTENTS);
        if (!threads.includes(message.channel.id)) return await message.reply(`Automatic unarchiving hasn't been enabled yet in this thread`);
        threads = threads.filter((threadId) => threadId !== message.channel.id);
        await updateDatabase(PATH_THREADS_LIST, threads);
        return await message.reply(`Automatic unarchiving has been disabled in this thread`);
    }
};