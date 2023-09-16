const discord = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGO_CONNECTION_TOKEN);
const client = require("../client.js").clientOn;

module.exports = {
  info: new discord.SlashCommandBuilder().setName("set-presence"),
  async execute(interaction) {
    if (interaction.user.id !== process.env.DEV_USER) return;
    // return console.log(client);
    client.user.setPresence({
      activities: [{ name: `${interaction.options.get("value").value}`, type: discord.ActivityType.Listening }],
    });
    await interaction.reply("Set presence to " + interaction.options.get("value").value);
  },
};
