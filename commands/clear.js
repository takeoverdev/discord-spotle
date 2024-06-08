const discord = require("discord.js");

module.exports = {
  info: new discord.SlashCommandBuilder().setName("clear"),
  async execute(interaction, userData, Data) {
    const gameData = await Data.findOne({ "game.participants": interaction.user.id });
    if (gameData) {
      gameData.game.participants.splice(gameData.game.participants.indexOf(`${interaction.user.id}`), 1);
      gameData.save().catch((err) => console.log(err));
    }
    await Data.updateOne({ userID: interaction.user.id }, { $unset: { game: {} } }); // Unset a field in doc
    await interaction.reply("Game cleared");
  },
};
