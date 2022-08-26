const { PREFIX, PATH_THREADS_LIST, THREADS_LIST_DEFAULT_CONTENTS } = require('../../config.js');
const { readDatabase, updateDatabase } = require('../../json-database-util.js');

module.exports = {
    aliases: ['archive'],
    description: 'Archives a thread and disables automatic unarchiving when used in a thread',
    callback: async ({ message }) => {
        if (!message.channel.isThread()) return await message.reply(`You have to be in a thread to use this command`);
        let threads = await readDatabase(PATH_THREADS_LIST, THREADS_LIST_DEFAULT_CONTENTS);

        if (threads.includes(message.channel.id)) {
            threads = threads.filter(threadId => threadId !== message.channel.id);
            await updateDatabase(PATH_THREADS_LIST, threads);
        }

        return await message.channel.setArchived(true, `${message.author.username} issued the command ${PREFIX}archive`);
    }
};