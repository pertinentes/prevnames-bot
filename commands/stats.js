const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const axios = require('axios');
const fs = require('fs');

module.exports = {
    name: "stats",
    description: "Affiche les statistiques de l'API",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ViewChannel],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    guildOnly: false,
    async execute(client, message, args) {
        const embedMessage = await sendStatsEmbed(message.channel);
        saveEmbedMessageInfo(embedMessage);

        const interval = setInterval(async () => {
            try {
                await updateStatsEmbed(embedMessage);
            } catch (error) {
                console.error('Erreur lors de la mise à jour de l\'embed des statistiques :', error);
                clearInterval(interval);
            }
        }, 60000);
    },
    async executeSlash(client, interaction) {
        const embedMessage = await sendStatsEmbed(interaction.channel);
        saveEmbedMessageInfo(embedMessage);

        const interval = setInterval(async () => {
            try {
                await updateStatsEmbed(embedMessage);
            } catch (error) {
                console.error('Erreur lors de la mise à jour de l\'embed des statistiques :', error);
                clearInterval(interval);
            }
        }, 60000);
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
};

async function sendStatsEmbed(channel) {
    const embed = await createStatsEmbed();
    return channel.send({ embeds: [embed] });
}

async function updateStatsEmbed(message) {
    const embed = await createStatsEmbed();
    return message.edit({ embeds: [embed] });
}

async function createStatsEmbed() {
    const apiStatus = await checkApiStatus();
    const prevnamesStatus = await checkPrevnamesStatus();
    const prevnamesCount = await getPrevnamesCount();

    const embed = new EmbedBuilder()
        .setColor(apiStatus ? '#00ff00' : '#ff0000')
        .setTitle('📊 Statistiques de l\'API')
        .setDescription('Voici l\'état actuel de l\'API. Les informations sont mises à jour toutes les minutes.')
        .addFields(
            { name: 'API Status', value: apiStatus ? '🟢 **ON**' : '🔴 **OFF**', inline: true },
            { name: 'Prevnames Status', value: prevnamesStatus ? '🟢 **ON**' : '🔴 **OFF**', inline: true },
            { name: 'Prevnames Count', value: `**${prevnamesCount}**`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Safeness API', iconURL: "https://cdn.discordapp.com/avatars/1255197122354221056/3d3153b9d2b635b35ae89daeca7ebf1c.webp?size=1024&format=webp&width=0&height=384" });

    return embed;
}

async function checkApiStatus() {
    try {
        await axios.get('http://localhost:20005/on');
        return true;
    } catch (error) {
        return false;
    }
}

async function checkPrevnamesStatus() {
    try {
        await axios.get('http://localhost:20005/prevnames/');
        return true;
    } catch (error) {
        return false;
    }
}

async function getPrevnamesCount() {
    try {
        const response = await axios.get('http://localhost:20005/prevnamescount');
        return response.data.count;
    } catch (error) {
        return 'Erreur';
    }
}

function saveEmbedMessageInfo(embedMessage) {
    const data = {
        channelId: embedMessage.channel.id,
        messageId: embedMessage.id,
    };
    fs.writeFileSync('statsUpdate.json', JSON.stringify(data, null, 2));
}
