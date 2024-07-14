const fs = require('fs');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: "ready",
    async execute(client) {
        console.log(`[READY] ${client.user.tag} (${client.user.id}) est prêt | ${client.guilds.cache.size.toLocaleString('fr-FR')} serveurs | ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString('fr-FR')} utilisateurs`.green);

        const filePath = path.join(__dirname, '..', 'statsUpdate.json');

        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath));
            const channel = await client.channels.fetch(data.channelId);
            const message = await channel.messages.fetch(data.messageId);

            try {
                await updateStatsEmbed(message);
            } catch (error) {
                console.error('Erreur lors de la première mise à jour de l\'embed des stats :', error);
            }

            const interval = setInterval(async () => {
                try {
                    await updateStatsEmbed(message);
                } catch (error) {
                    console.error('Erreur lors de la mise à jour de l\'embed des stats :', error);
                    clearInterval(interval);
                }
            }, 60000);
        }
    }
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
