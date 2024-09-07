const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'clear-prevnames',
  description: 'Supprime tous vos anciens pseudos du bot',
  permissions: [PermissionsBitField.Flags.SendMessage],
  guildOwnerOnly: false,
  botOwnerOnly: false,
  guildOnly: true,
  async execute(client, message, args) {
    const userId = message.author.id;

    try {
      const response = await axios.get('http://localhost:20005/clearprevnames/' + userId);

     const msg = await message.reply('Tous vos anciens pseudos ont bien été supprimés.');
     msg.delete()
    } catch (error) {
      console.error('Erreur lors de la suppression des anciens pseudonymes :', error.message);
      message.reply('Erreur lors de la suppression des anciens pseudonymes.');
    }
  },

  async executeSlash(client, interaction) {
    const userId = interaction.user.id;

    try {
      const response = await axios.get('http://localhost:20005/clearprevnames/' + userId);

      interaction.reply({ content: `Tous vos anciens pseudos ont bien été supprimés.`, ephemeral: true });
    } catch (error) {
      console.error('Erreur lors de la suppression des anciens pseudonymes :', error.message);
      interaction.reply({ content: `Erreur lors de la suppression des anciens pseudonymes.`, ephemeral: true });
    }
  },

  data: new SlashCommandBuilder()
    .setName('clear-prevnames')
    .setDescription('Supprime tous les anciens noms d\'utilisateur d\'un membre')
};
