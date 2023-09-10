// const discord = require("discord.js");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [
  {
    name: "set-presence",
    description: "Alter the bot's presence",
    options: [
      {
        name: "value",
        description: "value",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "test-command",
    description: "Test Response",
    // options: [
    //   {
    //     name: "value",
    //     description: "value",
    //     type: 3,
    //     required: true,
    //   },
    // ],
  },
];

const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started to refresh slash commands");
    const data = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD), {
      body: commands,
    });
    // const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    // body: commands,
    // });
    console.log("Successfully refreshed slash commands");
  } catch (err) {
    console.log(err);
  }
})();
