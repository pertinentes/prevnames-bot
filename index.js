const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require("fs");
const colors = require("colors");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent,
        Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User
    ],
    restTimeOffset: 0,
    failIfNotExists: false,
    presence: {
        activities: [{
            name: `Safeness is here`,
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/hisxokaq"
        }],
        status: "dnd"
    },
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false
    }
});

client.config = require("./config.js");
const clientId = client.config.Clientid;

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const commands = [];
    client.commands.forEach(command => {
        if (command.data && (!command.guildOnly || command.guildOnly === true)) {
            commands.push(command.data.toJSON());
        }
    });

    const rest = new REST({ version: '10' }).setToken(client.config.token);

    try {
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        console.log(`Successfully registered ${data.length} application commands.`);
        data.forEach(command => console.log(`Registered command: ${command.name}`));
    } catch (error) {
        console.error('Error while registering application commands:', error);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----');
    console.log(promise);
    console.log('----- Reason -----');
    console.log(reason);
});

client.login(client.config.token);
