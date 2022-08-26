const errorHandler = async (err, message) => {
    if (typeof err === 'function') {
        err();
    } else {
        console.error(err);
    }

    if (message) {
        await message.reply(`Something went wrong whilst executing the command, please contact <@245620207307980800> to resolve the issue`).catch(errorHandler);
    }
};

module.exports = errorHandler;