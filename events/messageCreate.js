
module.exports = {
  name: 'messageCreate',
  async execute(client, message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (!message.content.startsWith(client.config.prefix)) return;

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.botOwnerOnly && !client.config.owners.includes(message.author.id)) {
      return message.reply("Seul le propriétaire du bot peut exécuter cette commande.").catch(() => {});
    }

    if (command.guildOnly && message.guild.id !== client.config.onlyGuild) {
      return message.reply("Cette commande ne peut être utilisée que dans un serveur spécifique.").catch(() => {});
    }

    if (command.guildOwnerOnly && message.guild.ownerId !== message.author.id) {
      return message.reply("Cette commande ne peut être exécutée que par le propriétaire du serveur.").catch(() => {});
    }

    const member = message.guild.members.cache.get(message.author.id);
    if (command.permissions && !member.permissions.has(command.permissions)) {
      return message.reply("Vous n'avez pas les permissions nécessaires pour exécuter cette commande.").catch(() => {});
    }

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande ${command.name}:`, error);
      await message.reply("Une erreur est survenue lors de l'exécution de cette commande.").catch(() => {});
    }
  },
};
