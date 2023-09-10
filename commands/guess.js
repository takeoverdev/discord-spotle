const discord = require("discord.js");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_TOKEN);
const artists = require("../artists.json");
const Data = require("../userSchema.js");
const continents = require("../continents.json");
const { getAverageColor } = require("fast-average-color-node");

function getContinent(country) {
  if (continents.africa.includes(country.toUpperCase())) {
    return "Africa";
  }
  if (continents.asia.includes(country.toUpperCase())) {
    return "Asia";
  }
  if (continents.europe.includes(country.toUpperCase())) {
    return "Europe";
  }
  if (continents.north_america.includes(country.toUpperCase())) {
    return "North America";
  }
  if (continents.oceania.includes(country.toUpperCase())) {
    return "Oceania";
  }
  if (continents.south_america.includes(country.toUpperCase())) {
    return "South America";
  }
}
function check(category, guess, correct) {
  guess = String(guess);
  correct = String(correct);
  if (category == "debut") {
    if (guess == correct) return "<:correct:1149314439594639410>";
    let range = 5;
    if (Number(correct) >= Number(guess) - range && Number(correct) <= Number(guess) + range) {
      // check range
      return "<:soclose:1149314435542941716>";
    }
    return "<:incorrect:1149314437182914570>";
  }
  if (category == "size") {
    if (guess == correct) return "<:correct:1149314439594639410>";
    return "<:incorrect:1149314437182914570>";
  }
  if (category == "rank") {
    if (guess == correct) return "<:correct:1149314439594639410>";
    let range = 50;
    if (Number(correct) >= Number(guess) - range && Number(correct) <= Number(guess) + range) {
      return "<:soclose:1149314435542941716>";
    }
    return "<:incorrect:1149314437182914570>";
  }
  if (category == "rankHigherLower") {
    if (guess > correct) {
      return "↑";
    } else if (guess < correct) {
      return "↓";
    } else {
      return "";
    }
  }
  if (category == "gender") {
    if (guess == correct) return "<:correct:1149314439594639410>";
    return "<:incorrect:1149314437182914570>";
  }
  if (category == "genre") {
    if (guess == correct) return "<:correct:1149314439594639410>";
    return "<:incorrect:1149314437182914570>";
  }
  if (category == "country") {
    if (guess == correct) return "<:correct:1149314439594639410>";
    if (getContinent(guess) == getContinent(correct)) return "<:soclose:1149314435542941716>";
    return "<:incorrect:1149314437182914570>";
  }
}

module.exports = {
  info: new discord.SlashCommandBuilder().setName("guess"),
  async execute(interaction) {
    const userData = await Data.findOne({ userID: interaction.user.id });
    const gameData = await Data.findOne({ "game.participants": interaction.user.id });
    if (!gameData) return interaction.reply(`You aren't in a game`);
    let artistGuess = artists.find(
      (ele) => ele.artist.toLowerCase() == interaction.options.get("artist").value.toLowerCase()
    );
    if (gameData.game.channel !== interaction.channelId && gameData.userID !== "Public")
      return interaction.reply("You must be in the channel the game was started in");
    if (!artistGuess)
      return interaction.reply("The artist must be in Spotify's Top 1000 and written exactly as displayed on Spotify");
    let correctArtist = artists.find((ele) => ele.artist.toLowerCase() == gameData.game.artist.toLowerCase());
    let embed = new discord.EmbedBuilder();
    embed.addFields(
      {
        name: `${check("debut", artistGuess.debut_album_year, correctArtist.debut_album_year)} Debut Album`,
        value: `${artistGuess.debut_album_year}`,
        inline: true,
      },
      {
        name: `${check("size", artistGuess.group_size, correctArtist.group_size)} Group Size`,
        value: `${artistGuess.group_size}`,
        inline: true,
      },
      {
        name: `${check(
          "rank",
          artists.findIndex((ele) => ele == artistGuess) + 1,
          artists.findIndex((ele) => ele == correctArtist) + 1
        )} Listener Rank`,
        value: `#${artists.indexOf(artistGuess) + 1} ${check(
          "rankHigherLower",
          artists.findIndex((ele) => ele == artistGuess) + 1,
          artists.findIndex((ele) => ele == correctArtist) + 1
        )}`,
        inline: true,
      },
      {
        name: `${check("gender", artistGuess.gender, correctArtist.gender)} Gender`,
        value: `${artistGuess.gender == "m" ? "Male" : artistGuess.gender == "f" ? "Female" : "Mixed"}`,
        inline: true,
      },
      {
        name: `${check("genre", artistGuess.genre, correctArtist.genre)} Genre`,
        value: `${artistGuess.genre}`,
        inline: true,
      },
      {
        name: `${check("country", artistGuess.country, correctArtist.country)} Nationality`,
        value: `:flag_${artistGuess.country}:`,
        inline: true,
      }
    );
    embed.setThumbnail(`${artistGuess.image_uri}`);
    let avgColor = await getAverageColor(artistGuess.image_uri, {
      ignoredColor: [
        [255, 255, 255, 255],
        [0, 0, 0, 255],
      ],
    });
    embed.setColor(avgColor.hex);

    // Public
    if (gameData.userID === "Public") {
      if (!gameData.game.participantInfo.find((ele) => ele.userID === interaction.user.id)) {
        gameData.game.participantInfo.push({ userID: interaction.user.id, roundsUsed: 0, won: false });
      }
      if (
        gameData.game.participantInfo.find((ele) => ele.userID === interaction.user.id).roundsUsed >=
        gameData.game.rounds
      ) {
        return await interaction.reply("You have used all your rounds for today's challenge :(");
      }
      gameData.game.participantInfo.find((ele) => ele.userID === interaction.user.id).roundsUsed++;
      userData.totalGuesses++;

      embed.setTitle(
        `Guess ${gameData.game.participantInfo.find((ele) => ele.userID === interaction.user.id).roundsUsed}/${
          gameData.game.rounds
        }`
      );
      embed.setDescription(`You guessed **${artistGuess.artist}**`);
      embed.setFooter({ text: `Public mode` });
      if (artistGuess === correctArtist) {
        embed.setTitle(
          `Guess ${gameData.game.participantInfo.find((ele) => ele.userID === interaction.user.id).roundsUsed}/${
            gameData.game.rounds
          } WINNER!!`
        );
        gameData.game.participants.splice(gameData.game.participants.indexOf(`${interaction.user.id}`), 1);
        gameData.game.participantInfo.find((ele) => ele.userID === interaction.user.id).won = true;
        userData.publicWins++;
      } else {
        if (
          gameData.game.rounds - 1 <=
          gameData.game.participantInfo.find((ele) => ele.userID === interaction.user.id).roundsUsed
        ) {
          embed.setTitle("Game Over :(");
          embed.setDescription(
            `You guessed **${artistGuess.artist}**\nCorrect artist was **${correctArtist.artist}**\nBetter luck next time!`
          );
          gameData.game.participants.splice(gameData.game.participants.indexOf(`${interaction.user.id}`), 1);
        }
      }
      gameData.save().catch((err) => console.log(err));
      userData.save().catch((err) => console.log(err));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Custom game
    embed.setTitle(`Guess ${gameData.game.roundsUsed + 1}/${gameData.game.rounds}`);
    embed.setDescription(`${interaction.user.username} guessed **${artistGuess.artist}**`);
    if (gameData.userID !== userData.userID) userData.totalGuesses++;
    if (artistGuess === correctArtist) {
      embed.setTitle(`Guess ${gameData.game.roundsUsed + 1}/${gameData.game.rounds} WINNER!!`);
      await Data.updateOne({ userID: gameData.userID }, { $unset: { game: {} } }); // Unset a field in doc
      if (gameData.userID !== userData.userID) userData.customWins++;
    } else {
      if (gameData.game.rounds - 1 <= gameData.game.roundsUsed) {
        embed.setTitle("Game Over :(");
        embed.setDescription(
          `${interaction.user.username} guessed **${artistGuess.artist}**\nCorrect artist was **${correctArtist.artist}**\nBetter luck next time!`
        );
        await Data.updateOne({ userID: gameData.userID }, { $unset: { game: {} } }); // Unset a field in doc
      } else {
        gameData.game.roundsUsed++;
        gameData.save().catch((err) => console.log(err));
      }
    }
    if (gameData.userID !== userData.userID) userData.save().catch((err) => console.log(err));
    embed.setFooter({ text: `${gameData.username}'s game` });
    await interaction.reply({
      embeds: [embed],
    });
  },
};
