const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: "prevnames",
    description: "Affiche les anciens noms d'utilisateur",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ViewChannel],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    guildOnly: true,
    async execute(client, message, args) {
        let userId = args[0];
        if (!userId) {
            userId = message.author.id;
        }
      
        let username = await getUsername(message, userId, client);
      
        if (!username) {
          username = 'Utilisateur inconnu';
        }
      
        try {
          const response = await axios.get(`http://localhost:20005/prevnames/${userId}`);
          const prevNames = response.data;
      
          if (prevNames.length === 0) {
            const embed = createNoDataEmbed(username);
            return message.channel.send({ embeds: [embed] });
          }
      
          let paginatedNames = [];
          for (let i = 0; i < prevNames.length; i += 10) {
            const currentNames = prevNames.slice(i, i + 10);
            const embed = createPaginationEmbed(message, currentNames, username, i, prevNames.length);
            paginatedNames.push(embed);
          }
          const messageInstance = await message.channel.send({ embeds: [paginatedNames[0]] });
          if (paginatedNames.length > 1) {
            addPaginationButtons(messageInstance, paginatedNames);
          }
      
        } catch (error) {
          if (error.response && error.response.status === 404) {
            const embed = createNoDataEmbed(username);
            message.channel.send({ embeds: [embed] });
          } else {
            console.error('Erreur lors de la récupération des anciens pseudonymes :', error.message);
            message.reply('Erreur lors de la récupération des anciens noms d\'utilisateur.');
          }
        }
    },
    async executeSlash(client, interaction) {
        const userId = interaction.options.getUser('membre')?.id || interaction.user.id;
      
        let username = await getUsername(interaction, userId, client);
      
        if (!username) {
          username = 'Utilisateur inconnu';
        }
      
        try {
          const response = await axios.get(`http://localhost20005/prevnames/${userId}`);
          const prevNames = response.data;
      
          if (prevNames.length === 0) {
            const embed = createNoDataEmbed(username);
            return interaction.reply({ embeds: [embed] });
          }
      
          let paginatedNames = [];
          for (let i = 0; i < prevNames.length; i += 10) {
            const currentNames = prevNames.slice(i, i + 10);
            const embed = createPaginationEmbed(interaction, currentNames, username, i, prevNames.length);
            paginatedNames.push(embed);
          }
          await interaction.reply({ embeds: [paginatedNames[0]] });
          if (paginatedNames.length > 1) {
            const reply = await interaction.fetchReply();
            addPaginationButtons(reply, paginatedNames);
          }
      
        } catch (error) {
          if (error.response && error.response.status === 404) {
            const embed = createNoDataEmbed(username);
            interaction.reply({ embeds: [embed] });
          } else {
            console.error('Erreur lors de la récupération des anciens pseudonymes :', error.message);
            interaction.reply({ content: `Erreur lors de la récupération des anciens pseudonymes.`, ephemeral: true });
          }
        }
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option.setName('membre')
                    .setDescription('Le membre dont vous voulez afficher les anciens pseudos')
                    .setRequired(false)
            );
    }
};

async function getUsername(target, userId, client) {
  let username = userId;
  async function fetchUsernameFromAPI(userId) {
    try {
      const response = await axios.get(`https://discord.com/api/v9/users/${userId}`, {
        headers: {
          Authorization: `Bot ${client.token}`
        }
      });
      
      return response.data.username;
    } catch (error) {
      console.error('Erreur lors de la récupération du nom d\'utilisateur via l\'API Discord :', error.message);
      return 'Unknown User';
    }
  }

  if (target instanceof require('discord.js').Message) {
    const member = target.mentions.members.first();
    if (member) {
      username = member.user.username;
    } else {
      username = await fetchUsernameFromAPI(userId);
    }
  } else if (target instanceof require('discord.js').CommandInteraction) {
    username = await fetchUsernameFromAPI(userId);
  }
  return username;
}


function createPaginationEmbed(target, names, username, startIndex, totalLength) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Liste des anciens pseudos de ${username}`)
    .setFooter({ text: `Page ${Math.floor(startIndex / 10) + 1}/${Math.ceil(totalLength / 10)} • Safeness`, iconUrl: "https://cdn.discordapp.com/avatars/1255197122354221056/3d3153b9d2b635b35ae89daeca7ebf1c.webp?size=1024&format=webp&width=0&height=384" });

  let description = '';
  names.forEach((entry, index) => {
    description += `${entry.changedAt} - **${entry.name}**\n`;
  });

  embed.setDescription(description);

  return embed;
}


function createNoDataEmbed(username) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Liste des anciens pseudos de ${username}`)
    .setDescription('*Aucune donnée*')
    .setFooter({ text: `Safeness`, iconUrl: "https://cdn.discordapp.com/avatars/1255197122354221056/3d3153b9d2b635b35ae89daeca7ebf1c.webp?size=1024&format=webp&width=0&height=384" });

  return embed;
}
  

async function addPaginationButtons(message, pages) {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('prevPage')
        .setLabel('◀')
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId('nextPage')
        .setLabel('▶')
        .setStyle(1)
    );
  

  await message.edit({ components: [row], embeds: [pages[0]] });

  const filter = (interaction) => interaction.user.id === message.author.id;
  const collector = message.createMessageComponentCollector({ filter, time: 60000 });

  let currentPage = 0;

  collector.on('collect', async (interaction) => {
    if (interaction.customId === 'prevPage') {
      currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
    } else if (interaction.customId === 'nextPage') {
      currentPage = currentPage < pages.length - 1 ? currentPage + 1 : 0;
    }

    await interaction.update({ components: [row], embeds: [pages[currentPage]] });
  });

  collector.on('end', () => {
    row.components.forEach(component => component.setDisabled(true));
    message.edit({ components: [row] });
  });
}
