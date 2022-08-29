const path = require('path');
const { PATH_THREADS_LIST, THREADS_LIST_DEFAULT_CONTENTS } = require('./config.js');
const { readDatabase, updateDatabase } = require('./json-database-util.js');
const errorHandler = require('./error-handler.js');

const reviveThread = async (thread) => {
	if (thread.archived) {
		await thread.setArchived(false, 'keeping the thread alive').catch(errorHandler);
	}
	if (thread.autoArchiveDuration < 1440) {
		await thread.setAutoArchiveDuration(1440, 'Longer auto archiving results in less usage of the bot\'s resources').catch(errorHandler);
	}
	const message = await thread.send(`Keeping thread alive!`);
	setTimeout(() => {
		message.delete();
	}, 1000);

	return console.log(`${new Date().toLocaleString()}		revived ${thread.name}`);
};

const keepThreadsAlive = async (client) => {
    let threads = await readDatabase(path.join(__dirname, PATH_THREADS_LIST), THREADS_LIST_DEFAULT_CONTENTS);
    let updateFlag = false;
    threads = await threads.reduce(async (acc, threadId) => {
        let filterFlag = false;
        const thread = await client.channels.fetch(threadId).catch(async (err) => {
            errorHandler(err);
            filterFlag = true;
            updateFlag = true;
        });
        if (filterFlag) {
            return await acc;
        }

		await reviveThread(thread);

        return [...await acc, threadId];
    }, []);
    if (updateFlag) {
        updateDatabase(PATH_THREADS_LIST, threads);
    }
};

const threadUpdateListener = (client) => {
    client.on('threadUpdate', async (temp, newThread) => {
        const threads = await readDatabase(path.join(__dirname, PATH_THREADS_LIST), THREADS_LIST_DEFAULT_CONTENTS).catch(errorHandler);
        if (!threads?.includes(newThread.id)) return; // return if the newThread is not in threads-list.json. optional chaining in case an error occurs and threads = undefined
        await reviveThread(newThread);
    });
};

const threadDeleteListener = (client) => {
    client.on('threadDelete', async (deletedThread) => {
        let threads = await readDatabase(path.join(__dirname, PATH_THREADS_LIST), THREADS_LIST_DEFAULT_CONTENTS).catch(errorHandler);
        if (!threads?.includes(deletedThread.id)) return;
        threads = threads.filter(threadId => threadId !== deletedThread.id);
        await updateDatabase(PATH_THREADS_LIST, threads);
    });
}

module.exports = {
    keepThreadsAlive,
    threadUpdateListener,
    threadDeleteListener
};