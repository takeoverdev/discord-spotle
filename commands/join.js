const discord = require("discord.js");
const Data = require("../userSchema.js");

module.exports = {
  info: new discord.SlashCommandBuilder().setName("join"),
  async execute(interaction, userData, Data) {
    const userMentioned = interaction.options.get("user");
    const userDataMentioned = await Data.findOne({ userID: userMentioned.user.id });
    if (userMentioned.user === interaction.user) return await interaction.reply(`You can't join yourself`);
    if (!userDataMentioned) return await interaction.reply({ content: "That user doesnt have an active game", ephemeral: false });
    if (!userDataMentioned.game.artist) return await interaction.reply({ content: "That user doesnt have an active game", ephemeral: false });
    if (userDataMentioned.game.channel !== interaction.channelId)
      return await interaction.reply({
        content: "You must be in the channel the game was started in",
        ephemeral: false,
      });
    await Data.updateOne({ userID: interaction.user.id }, { $unset: { game: {} } }); // Unset a field in doc
    const gameData = await Data.findOne({ "game.participants": interaction.user.id });
    if (gameData) {
      gameData.game.participants.splice(gameData.game.participants.indexOf(`${interaction.user.id}`), 1);
      gameData.save().catch((err) => console.log(err));
    }
    userDataMentioned.game.participants.push(`${interaction.user.id}`);
    userDataMentioned.save().catch((err) => console.log(err));
    await interaction.reply(`Joined **${userMentioned.user.username}**'s game`);
  },
};
