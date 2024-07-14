const { Permissions } = require('discord.js');

module.exports = {
    name: "interactionCreate",
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;
        if (!interaction.guildId) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        if (command.guildOnly && !interaction.guild) {
            return interaction.reply({ content: "Cette commande ne peut être utilisée que dans un serveur.", ephemeral: true }).catch(() => {});
        }
        if (command.guildOwnerOnly && interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ content: "Cette commande ne peut être exécutée que par le propriétaire du serveur.", ephemeral: true }).catch(() => {});
        }
        if (command.botOwnerOnly && interaction.user.id !== client.config.botOwnerId) {
            return interaction.reply({ content: "Cette commande ne peut être exécutée que par le propriétaire du bot.", ephemeral: true }).catch(() => {});
        }
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (command.permissions && !member.permissions.has(command.permissions)) {
            return interaction.reply({ content: "Vous n'avez pas les permissions nécessaires pour exécuter cette commande.", ephemeral: true }).catch(() => {});
        }

        try {
            await command.executeSlash(client, interaction);
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande ${command.name}:`, error);
            await interaction.reply({ content: "Une erreur est survenue lors de l'exécution de cette commande.", ephemeral: true }).catch(() => {});
        }
    }
}