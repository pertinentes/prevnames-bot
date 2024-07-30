uconst { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const messageCommands = [
    { name: 'ping', description: 'Afficher le ping du bot.' },
    { name: 'prevnames', description: 'Affiche les anciens noms d\'utilisateur' },
    { name: 'clear-prevnames', description: 'Supprime tous vos anciens pseudos de l\'historique du bot' }
];

const slashCommands = [
    { name: 'ping', description: 'Afficher le ping du bot.', id: '1255214389745946695' },
    { name: 'prevnames', description: 'Affiche les anciens noms d\'utilisateur', id: '1255214389745946696' },
    { name: 'clear-prevnames', description: 'Supprime tous vos anciens pseudos de l\'historique du bot', id: '1255274458780798986' }
];

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes disponibles',
    permissions: [PermissionsBitField.Flags.SendMessage],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    guildOnly: true,

    async execute(client, message, args) {
        const embed = createHelpEmbed(messageCommands, slashCommands, client.config.prefix);
        try {
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    },

    async executeSlash(client, interaction) {
        const embed = createHelpEmbed(messageCommands, slashCommands, client.config.prefix);

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
};

function createHelpEmbed(messageCommands, slashCommands, prefix) {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Liste des commandes disponibles')
        .setDescription(
            '**Commandes en prefix :**\n' +
            messageCommands.map(command => `${prefix}${command.name} - ${command.description}`).join('\n') +
            '\n\n' +
            '**Commandes en slash :**\n' +
            slashCommands.map(command => `</${command.name}:${command.id}> - ${command.description}`).join('\n')
        )
        .setFooter({ text: 'Safeness', iconUrl: 'https://cdn.discordapp.com/avatars/1255197122354221056/3d3153b9d2b635b35ae89daeca7ebf1c.webp?size=1024&format=webp&width=0&height=384' });

    return embed;
}
