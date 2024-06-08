const discord = require("discord.js");

module.exports = {
  info: new discord.SlashCommandBuilder().setName("help"),
  async execute(interaction) {
    const embed = new discord.EmbedBuilder().setTitle("Information");
    embed.setDescription(
      `:information_source: This project was heavily inspired by [Spotle.io](https://spotle.io)
      
      **Debut Album Year**
      The artist's first studio album will turn yellow if you guessed within the range of 5 years
      **Group Size**
      The amount of members in the band
      **Listener Rank**
      Ranking on Spotify by streams, will indicate yellow if it is within a range of 50 placements. Up arrow indicates the mystery artist has a higher placement.
      **Gender**
      Will display as Male, Female or Mixed
      **Genre**
      Genres consist of: Rock, Pop, Hip Hop, Country, Indie, R&B, K-Pop, Latin, Classical, Jazz, Metal, and Electronic
      **Nationality**
      Will indicate yellow if the mystery artist lives in the guessed continent`
    );
    await interaction.reply({ embeds: [embed] });
  },
};
