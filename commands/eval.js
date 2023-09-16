const discord = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGO_CONNECTION_TOKEN);
const client = require("../client.js").clientOn;

module.exports = {
  info: new discord.SlashCommandBuilder().setName("eval"),
  async execute(interaction) {
    if (interaction.user.id !== process.env.DEV_USER) return;
    try {
      await eval(interaction.options.get("code").value);
      await interaction.reply({ content: "success", ephemeral: true });
    } catch (err) {
      await interaction.reply("Evaluation error:\n" + err);
    }
  },
};
