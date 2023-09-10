const discord = require("discord.js");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_TOKEN);
const client = require("../client.js").clientOn;

module.exports = {
  info: new discord.SlashCommandBuilder().setName("set-presence"),
  async execute(interaction) {
    if (interaction.user.id !== "290040029588357121") return;
    // return console.log(client);
    client.user.setPresence({
      activities: [{ name: `${interaction.options.get("value").value}`, type: discord.ActivityType.Listening }],
    });
    await interaction.reply("Set presence to " + interaction.options.get("value").value);
  },
};
