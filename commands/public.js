const discord = require("discord.js");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_TOKEN);
const Data = require("../userSchema.js");

module.exports = {
  info: new discord.SlashCommandBuilder().setName("public"),
  async execute(interaction) {
    const publicData = await Data.findOne({ userID: "Public" });
    if (!publicData.game.artist) return interaction.reply("Error whilst attempting to join");
    await Data.updateOne({ userID: interaction.user.id }, { $unset: { game: {} } }); // Unset a field in doc
    const gameData = await Data.findOne({ "game.participants": interaction.user.id });
    if (gameData) {
      gameData.game.participants.splice(gameData.game.participants.indexOf(`${interaction.user.id}`), 1);
      gameData.save().catch((err) => console.log(err));
    }
    if (!publicData.game.participantInfo.find((ele) => ele.userID === interaction.user.id)) {
      publicData.game.participantInfo.push({ userID: interaction.user.id, roundsUsed: 0, won: false });
    }
    if (publicData.game.participantInfo.find((ele) => ele.userID === interaction.user.id).won === true) {
      const day = 60 * 60 * 24;
      let daysSinceUnix = Math.ceil(Date.now() / 1000 / day);
      console.log(daysSinceUnix);
      return await interaction.reply({
        content: `You beat today's challenge in **${
          publicData.game.participantInfo.find((ele) => ele.userID === interaction.user.id).roundsUsed
        }** rounds\nResets <t:${daysSinceUnix * day}:R>`,
        ephemeral: true,
      });
    }
    publicData.game.participants.push(interaction.user.id);
    publicData.save().catch((err) => console.log(err));
    await interaction.reply("Now participating in today's public game");
  },
};
