const discord = require("discord.js");
const fs = require("fs");
const cron = require("node-cron");
const artists = require("./artists.json");
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_TOKEN);
const Data = require("./userSchema.js");

module.exports.cronSchedule = cron.schedule(
  "0 0 0 * * *",
  async () => {
    const atRandom = Math.ceil(Math.random() * 200);
    const selectedArtist = artists[atRandom];
    console.log(Date.now(), "TODAY'S Selected artist", selectedArtist.artist, atRandom);
    let publicData = await Data.findOne({ userID: "Public" });
    publicData.game = { artist: `${selectedArtist.artist}`, rounds: 10, participants: [], participantInfo: [] };
    publicData.save().catch((err) => console.log(err));
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);

const client = new discord.Client({
  intents: [
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildMessages,
    // discord.GatewayIntentBits.GuildMembers,
    // discord.GatewayIntentBits.MessageContent,
  ],
});

client.commands = new discord.Collection();

fs.readdir("./commands", (err, files) => {
  if (err) console.log(err);
  files.forEach((file) => {
    let command = require(`./commands/${file}`);
    console.log(file, "loaded!");
    client.commands.set(command.info.name, command);
  });
});

module.exports.clientOn = client.on("ready", () => {
  console.log(`🟢 Running ${client.user.username} in ${client.guilds.cache.size} servers`);
  cron.schedule("0 0 * * * *", () => {
    const atRandom = Math.ceil(Math.random() * artists.length);
    const selectedArtist = artists[atRandom];
    client.user.setPresence({
      activities: [{ name: `${selectedArtist.artist}`, type: discord.ActivityType.Listening }],
    });
  });
});

client.on("guildCreate", (guild) => {
  let embed = new discord.EmbedBuilder();
  embed.setTitle("Joined Server");
  embed.addFields({ name: "Name", value: `${guild.name}` }, { name: "ID", value: `${guild.id}` });
  if (guild.iconURL()) embed.setThumbnail(`${guild.iconURL()}`);
  embed.setColor("#1ED760");
  embed.setDescription(`<t:${Math.round(Date.now() / 1000)}:R>`);
  client.channels.cache.get(`${process.env.DEV_CHANNEL}`).send({ embeds: [embed] });
});

client.on("guildDelete", (guild) => {
  let embed = new discord.EmbedBuilder();
  embed.setTitle("Left Server");
  embed.addFields({ name: "Name", value: `${guild.name}` }, { name: "ID", value: `${guild.id}` });
  if (guild.iconURL()) embed.setThumbnail(`${guild.iconURL()}`);
  embed.setColor("#FF1418");
  embed.setDescription(`<t:${Math.round(Date.now() / 1000)}:R>`);
  client.channels.cache.get(`${process.env.DEV_CHANNEL}`).send({ embeds: [embed] });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.user.bot) return;

  let userData = await Data.findOne({ userID: interaction.user.id }).catch((err) => console.log(err));
  if (!userData) {
    var newData = new Data({
      userID: interaction.user.id,
      username: interaction.user.username,
      timestamp: Date.now(),
      publicWins: 0,
      customWins: 0,
      totalGuesses: 0,
    });
    newData.save().catch((err) => console.log(err));
    userData = newData;
  }

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    return console.log("No command with " + interaction.commandName + " found");
  }
  try {
    await command.execute(interaction);
  } catch (err) {
    console.log(err);
  }
});

client.login(process.env.TOKEN);