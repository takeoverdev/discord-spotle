// const discord = require("discord.js");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [
  {
    name: "custom",
    description: "Start a custom game of Spotle",
    options: [
      {
        name: "artist",
        description: "Select an artist",
        type: 3,
        required: true,
      },
      {
        name: "rounds",
        description: "How many rounds?",
        type: 4,
        required: false,
      },
    ],
  },
  {
    name: "join",
    description: "Join someone's game of Spotle",
    options: [
      {
        name: "user",
        description: "Mention a user",
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "guess",
    description: "Guess an answer to the game you're in",
    options: [
      {
        name: "artist",
        description: "Select an artist",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "clear",
    description: "Clear your Spotle game",
  },
  {
    name: "public",
    description: "Participate in the public game",
  },
  {
    name: "help",
    description: "Displays information about the bot",
  },
];

const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started to refresh slash commands");
    // const data = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD), {
    // body: commands,
    // });
    const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Successfully refreshed slash commands");
  } catch (err) {
    console.log(err);
  }
})();
