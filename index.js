const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const { PREFIX, DIR_COMMANDS, FILE_LOAD_COMMANDS, FILE_COMMAND_BASE } = require('./config.js');
const { Client, Intents } = require('discord.js');
const commandBase = require(path.join(__dirname, DIR_COMMANDS, FILE_COMMAND_BASE));
const loadCommands = require(path.join(__dirname, DIR_COMMANDS, FILE_LOAD_COMMANDS));
const { keepThreadsAlive, threadUpdateListener, threadDeleteListener } = require('./threads-manager.js');
const errorHandler = require('./error-handler.js');

const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ],
    presence: {
        status: 'online',
        activities: [{
            name: `${PREFIX}help`,
            type: 'WATCHING'
        }]
    }
});

client.once('ready', async () => {
    console.log(`${client.user.tag} has logged in.`);
    const startTime = new Date();

    // load all commands on the client
    loadCommands(client);
    // start eventlistener for messages and execute commands with the commandhandler
    commandBase(client);

    // activate any archived threads
    await keepThreadsAlive(client).catch(errorHandler);
    // activate threadUpdate listener to prevent archiving of threads in threads-list.json and other unwanted changes
    threadUpdateListener(client);
    // activate threadDelete listener to remove threads from threads-list.json in case they are deleted
    threadDeleteListener(client);
    
    const endTime = new Date();
    console.log(`${client.user.tag} is ready. (${endTime - startTime} ms)`);
});

client.login(process.env.THREAD_MANAGER_BOT_TOKEN);