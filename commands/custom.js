const discord = require("discord.js");
const artists = require("../artists.json");

module.exports = {
  info: new discord.SlashCommandBuilder().setName("custom"),
  async execute(interaction, userData, Data) {
    let rounds;
    if (!interaction.options.get("rounds")) {
      rounds = 10;
    } else {
      rounds = interaction.options.get("rounds").value;
    }

    if (!artists.find((ele) => ele.artist.toLowerCase() == interaction.options.get("artist").value.toLowerCase()))
      return await interaction.reply({
        content: "The artist must be in Spotify's Top 1000 and written exactly as displayed on Spotify",
      });

    if (Number(rounds) < 1 || Number(rounds) > 1000) return await interaction.reply("Enter a valid amount of rounds between 1-1000");

    const embed = new discord.EmbedBuilder();
    embed.setTitle("New Game");

    const gameData = await Data.findOne({ "game.participants": interaction.user.id });
    if (gameData) {
      gameData.game.participants.splice(gameData.game.participants.indexOf(`${interaction.user.id}`), 1);
      gameData.save().catch((err) => console.log(err));
    }

    if (artists.find((ele) => ele.artist.toLowerCase() == interaction.options.get("artist").value.toLowerCase())) {
      let artist = artists.find((ele) => ele.artist.toLowerCase() == interaction.options.get("artist").value.toLowerCase());
      embed.setDescription(`**${artist.artist}** with **${rounds}** rounds`);
      embed.setThumbnail(artist.image_uri);
      embed.addFields(
        { name: "Debut Album", value: `${artist.debut_album_year}`, inline: true },
        { name: "Group Size", value: `${artist.group_size}`, inline: true },
        { name: "Listener Rank", value: `#${artists.indexOf(artist) + 1}`, inline: true },
        {
          name: "Gender",
          value: `${artist.gender == "m" ? "Male" : artist.gender == "f" ? "Female" : "Mixed"}`,
          inline: true,
        },
        { name: "Genre", value: artist.genre, inline: true },
        { name: "Nationality", value: `:flag_${artist.country}:`, inline: true }
      );
      userData.game = {
        artist: `${artist.artist}`,
        rounds: rounds,
        roundsUsed: 0,
        channel: `${interaction.channelId}`,
        participants: [interaction.user.id],
      };
      userData.save().catch((err) => console.log(err));
    }
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    let embedAlert = new discord.EmbedBuilder().setTitle("New Game").setDescription(`<@${interaction.user.id}> started a new Spotle game with **${rounds}** rounds.`).setColor("#1ED760");
    try {
      await interaction.followUp({ embeds: [embedAlert] });
    } catch (err) {}
  },
};
