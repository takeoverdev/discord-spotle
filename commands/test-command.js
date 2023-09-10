const discord = require("discord.js");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_TOKEN);
const client = require("../client.js").clientOn;

module.exports = {
  info: new discord.SlashCommandBuilder().setName("test-command"),
  async execute(interaction) {
    if (interaction.user.id !== "290040029588357121") return;
    console.log(interaction);
    await interaction.reply("Success");
  },
};
