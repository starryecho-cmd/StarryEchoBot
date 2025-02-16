const { Highrise, Events, Emotes} = require('highrise.sdk.dev');
const { Facing } = require("highrise.sdk.dev");
const { Reactions } = require("highrise.sdk.dev");
const token = "992058abc50884126ac2e3b999a60d374784acfad2d7b766c52f9998aec2c762";
const room = "67b1e4fc55ebc582ef1166ec";
const bot = new Highrise({
    Events: [
        Events.Messages,
        Events.Joins,
        Events.Emotes,
        Events.Leaves,
        Events.Movements,
        Events.Reactions,
        Events.DirectMessages,
     ],
});

// Log that the bot is ready.

bot.on('ready', (session) => {
    console.log("[READY] Bot is ready!".green + ` Session: ${session}`);
    const outfit = [
        {
          type: 'clothing',
          amount: 1,
          id: 'body-flesh', // Important
          account_bound: false,
          active_palette: 27
        },
      ];
  
      bot.outfit.change(outfit).catch(e => console.error(e));
    bot.player.teleport(bot.info.user.id, 4.5, 0, 1, Facing.FrontLeft)
      .catch(e => console.error("[ERROR] Failed to teleport:", e));
});

//summon command

bot.on("chatCreate", async (user, message) => {
    const args = message.split(" ");
  
    if (args[0] === "!summon" && args[1].startsWith("@")) {
      const targetUsername = args[1].substring(1); // Remove '@' from username
  
      try {
        // Get target user ID
        const targetId = await bot.room.players.id(targetUsername);
        if (!targetId) {
          return bot.whisper.send(user.id, "User not found.");
        }
  
        // Get the position of the command user
        const userPosition = await bot.room.players.position(user.id);
        if (!userPosition) {
          return bot.whisper.send(user.id, "Could not retrieve your position.");
        }
  
        // Teleport the target user to the command user's location
        await bot.player.teleport(targetId, userPosition.x, userPosition.y, userPosition.z, userPosition.facing);
        bot.whisper.send(user.id, `Successfully summoned ${targetUsername}.`);
        bot.whisper.send(targetId, `You have been summoned by ${user.username}.`);
      } catch (e) {
        console.error(e);
        bot.whisper.send(user.id, "An error occurred while summoning.");
      }
    }
  });
 
//Emote event

const activeLoops = new Map(); // Stores looping emotes per user

const emotes = {
  kiss: { id: "emote-kiss", duration: 3 },
  laugh: { id: "emote-laughing", duration: 3 },
  sit: { id: "idle-loop-sitfloor", duration: 10 },
  lust: { id: "emote-lust", duration: 5 },
  curse: { id: "emoji-cursing", duration: 2.5 },
  greedy: { id: "emote-greedy", duration: 4.8 },
  flex: { id: "emoji-flex", duration: 3 },
  gag: { id: "emoji-gagging", duration: 6 },
  celebrate: { id: "emoji-celebrate", duration: 4 },
  macarena: { id: "dance-macarena", duration: 12.5 },
  tiktok8: { id: "dance-tiktok8", duration: 11 },
  blackpink: { id: "dance-blackpink", duration: 7 },
  model: { id: "emote-model", duration: 6.3 },
  tiktok2: { id: "dance-tiktok2", duration: 11 },
  pennywise: { id: "dance-pennywise", duration: 1.5 },
  bow: { id: "emote-bow", duration: 3.3 },
  russian: { id: "dance-russian", duration: 10.3 },
  curtsy: { id: "emote-curtsy", duration: 2.8 },
  snowball: { id: "emote-snowball", duration: 6 },
  hot: { id: "emote-hot", duration: 4.8 },
  snowangel: { id: "emote-snowangel", duration: 6.8 },
  charge: { id: "emote-charging", duration: 8.5 },
  cartdance: { id: "dance-shoppingcart", duration: 8 },
  confused: { id: "emote-confused", duration: 9.3 },
  hype: { id: "idle-enthusiastic", duration: 16.5 },
  psychic: { id: "emote-telekinesis", duration: 11 },
  float: { id: "emote-float", duration: 9.3 },
  teleport: { id: "emote-teleporting", duration: 12.5 },
  swordfight: { id: "emote-swordfight", duration: 6 },
  maniac: { id: "emote-maniac", duration: 5.5 },
  energyball: { id: "emote-energyball", duration: 8.3 },
  snake: { id: "emote-snake", duration: 6 },
  sing: { id: "idle_singing", duration: 11 },
  frog: { id: "emote-frog", duration: 15 },
  pose: { id: "emote-superpose", duration: 4.6 },
  cute: { id: "emote-cute", duration: 7.3 },
  tiktok9: { id: "dance-tiktok9", duration: 13 },
  weird: { id: "dance-weird", duration: 22 },
  tiktok10: { id: "dance-tiktok10", duration: 9 },
  pose7: { id: "emote-pose7", duration: 5.3 },
  pose8: { id: "emote-pose8", duration: 4.6 },
  casualdance: { id: "idle-dance-casual", duration: 9.7 },
  pose1: { id: "emote-pose1", duration: 3 },
  pose3: { id: "emote-pose3", duration: 4.7 },
  pose5: { id: "emote-pose5", duration: 5 },
  cutey: { id: "emote-cutey", duration: 3.5 },
  punkguitar: { id: "emote-punkguitar", duration: 10 },
  zombierun: { id: "emote-zombierun", duration: 10 },
  fashionista: { id: "emote-fashionista", duration: 6 },
  gravity: {id: "emote-gravity", duration: 9.8},
  icecream: { id: "dance-icecream", duration: 15 },
  wrongdance: { id: "dance-wrong", duration: 13 },
  uwu: { id: "idle-uwu", duration: 25 },
  tiktok4: { id: "idle-dance-tiktok4", duration: 16 },
  shy: { id: "emote-shy2", duration: 5 },
  anime: { id: "dance-anime", duration: 7.8 },
};
const emotePages = Math.ceil(Object.keys(emotes).length / 7);

bot.on("chatCreate", async (user, message) => {
  const args = message.toLowerCase().split(" "); // Convert input to lowercase
  const command = args[0];
  const emoteName = args.slice(1).join(" ");
  if (command === "!assistemote") {
    const assistMessage = `
      List of Commands for User Fun:
      1.!emote <emote_name>
      2.!loop <emote_name>
      3.!stop
      4.!emotelist <page_number>
      Use these commands to have fun with emotes! 🎉
    `;

    bot.message.send(assistMessage).catch(e => console.error(e));
  }
  else if (command === "!emotelist") {
    const page = args[1] ? parseInt(args[1]) : 1;
    
    if (isNaN(page) || page < 1 || page > emotePages) {
      bot.message.send(`Usage: !emotelist <page_number>. Valid page numbers are from 1 to ${emotePages}.`);
      return;
    }

    const emoteKeys = Object.keys(emotes);
    const emotesForPage = emoteKeys.slice((page - 1) * 7, page * 7);
    
    let emoteListMessage = `Emote list (Page ${page}/${emotePages}):\n`;
    emotesForPage.forEach(emote => {
      emoteListMessage += `\`${emote}\` - ${emotes[emote].id}\n`;
    });

    bot.message.send(emoteListMessage).catch(e => console.error(e));
  }
  else if (command === "!emote") {
    if (!emotes[emoteName]) {
      bot.message.send(`Invalid emote name: ${emoteName}`);
      return;
    }

    bot.player.emote(user.id, emotes[emoteName].id)
      .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));

  } else if (command === "!loop") {
    if (!emotes[emoteName]) {
      bot.message.send(`Invalid emote name: ${emoteName}`);
      return;
    }

    // Stop previous loop if already active for the user
    if (activeLoops.has(user.id)) {
      clearInterval(activeLoops.get(user.id));
    }

    // Start looping the emote
    const loopInterval = setInterval(() => {
      bot.player.emote(user.id, emotes[emoteName].id)
        .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
    }, emotes[emoteName].duration * 1000);

    activeLoops.set(user.id, loopInterval);
    bot.message.send(`Looping ${emoteName} for ${user.username}.`);

  } else if (command === "!stop") {
    if (activeLoops.has(user.id)) {
      clearInterval(activeLoops.get(user.id));
      activeLoops.delete(user.id);
      bot.message.send(`Stopped looping emotes for ${user.username}.`);
    } else {
      bot.message.send(`No active emote loop to stop.`);
    }
  }
});

//Math Game
bot.on("chatCreate", async (user, message) => {
    if (message.startsWith("!math")) {
      // Parse the difficulty level
      const difficulty = message.split(" ")[1];
  
      if (!["easy", "moderate", "hard"].includes(difficulty)) {
        bot.message.send("Please specify a valid difficulty: easy, moderate, or hard.");
        return;
      }
  
      // Create random equation based on difficulty
      let equation = '';
      let answer = 0;
  
      // Generate equation based on difficulty
      switch (difficulty) {
        case "easy":
          equation = `${getRandomInt(1, 10)} ${getRandomOperator(["+", "-", "*"])} ${getRandomInt(1, 10)}`;
          answer = eval(equation);
          break;
        case "moderate":
          equation = `${getRandomInt(1, 20)} ${getRandomOperator(["+", "-", "*", "/"])} ${getRandomInt(1, 10)}`;
          answer = eval(equation);
          break;
        case "hard":
          // For hard, make sure to handle parentheses properly
          equation = `${getRandomInt(1, 10)} ${getRandomOperator(["+", "-", "*", "/"])} (${getRandomInt(1, 10)} ${getRandomOperator(["+", "-", "*", "/"])} ${getRandomInt(1, 10)})`;
          answer = eval(equation);
          break;
      }
  
      // Send equation to the user
      bot.message.send(`Solve this equation: ${equation}`);
  
      // Listen for user response
      bot.on("chatCreate", async (userResponse, messageResponse) => {
        // Ignore bot's own message
        if (userResponse.id === bot.info.user.id) return;
  
        if (messageResponse.startsWith("-ans")) {
          // Parse user's answer
          const userAnswer = parseFloat(messageResponse.split("-ans")[1]);
  
          if (!isNaN(userAnswer)) {
            // Round the answer to 2 decimal places
            const correctAnswer = Math.round(answer * 100) / 100;
  
            if (Math.abs(userAnswer - correctAnswer) < 0.01) {
              bot.message.send("Correct! Well done.");
            } else {
              bot.message.send(`Oops! The correct answer was ${correctAnswer}.`);
            }
          } else {
            bot.message.send("Please submit your answer using the format: `!<answer>`.");
          }
        }
      });
    }
  });
  
  // Helper function to get random integer
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Helper function to get random operator
  function getRandomOperator(operators) {
    return operators[Math.floor(Math.random() * operators.length)];
  }
   
//rps game

  bot.on("chatCreate", async (user, message) => {
    if (message.startsWith("!rps")) {
      const userChoice = message.split(" ")[1]; // Get the user's choice
  
      // Validate the user's choice
      if (!['rock', 'paper', 'scissors'].includes(userChoice)) {
        return bot.message.send("Please choose rock, paper, or scissors.");
      }
  
      // Generate the bot's random choice
      const choices = ['rock', 'paper', 'scissors'];
      const botChoice = choices[Math.floor(Math.random() * choices.length)];
  
      // Determine the outcome of the game
      let result;
      if (userChoice === botChoice) {
        result = "It's a tie!";
      } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'scissors' && botChoice === 'paper') ||
        (userChoice === 'paper' && botChoice === 'rock')
      ) {
        result = "You win!";
      } else {
        result = "You lose!";
      }
  
      // Send the bot's choice and the result
      bot.message.send(`You chose ${userChoice}. I chose ${botChoice}. ${result}`);
    }
  });
  bot.on("chatCreate", async (user, message) => {
    if (message.startsWith("!assistgame")) {
      // Extract the game name
      const gameName = message.split(" ")[1];
  
      // Ensure gameName is provided and check if it's valid
      if (!gameName) {
        bot.message.send("Please specify the game you need help with. Example: `!assistgame rps`");
        return;
      }
  
      let assistanceMessagePart1 = "";
      let assistanceMessagePart2 = "";
  
      // Provide brief assistance based on the game name
      switch (gameName.toLowerCase()) {
        case "rps":
          assistanceMessagePart1 = `
            **Rock-Paper-Scissors:**
            1. Type \`!rps\` to start.
            2. Choose: rock, paper, or scissors.
          `;
          assistanceMessagePart2 = `
            3. The bot picks a choice, and the winner is determined by:
               - Rock > Scissors, Scissors > Paper, Paper > Rock.
          `;
          break;
        case "math":
          assistanceMessagePart1 = `
            **Math Game:**
            1. Type \`!math <difficulty>\` (easy, moderate, hard).
            2. Based on difficulty:
               - Easy: +, -, *
               - Moderate: +, -, *, /
               - Hard: +, -, *, /, parentheses
          `;
          assistanceMessagePart2 = `
            3. Solve within the time limit (30s, 60s, 120s).
            4. Submit answer with \`!<answer>\`.
          `;
          break;
        default:
          assistanceMessagePart1 = "I don't recognize that game. Try `!assistgame rps` or `!assistgame math`.";
      }
  
      // Send the first part of the assistance message
      bot.message.send(assistanceMessagePart1).catch(e => console.error(e));
  
      // Send the second part (if applicable)
      if (assistanceMessagePart2) {
        bot.message.send(assistanceMessagePart2).catch(e => console.error(e));
      }
    }
  });
  
  const fs = require('fs');
  const path = require('path');
  
  // Path to the JSON file to store player data
  const playerDataFile = path.join(__dirname, 'playerData.json');
  
  // Function to load the player data from the JSON file
  function loadPlayerData() {
    if (fs.existsSync(playerDataFile)) {
      const rawData = fs.readFileSync(playerDataFile);
      return JSON.parse(rawData);
    }
    return {};
  }
  
  // Function to save the player data to the JSON file
  function savePlayerData(data) {
    fs.writeFileSync(playerDataFile, JSON.stringify(data, null, 2), 'utf8');
  }
  
  // Player movement tracking and saving data
  bot.on("playerMove", (user, position) => {
    const playerData = loadPlayerData();
  
    // Log player movement and save their position
    if ('x' in position) {
      playerData[user.id] = {
        username: user.username,
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
          facing: position.facing,
        },
      };
    } else {
      playerData[user.id] = {
        username: user.username,
        position: {
          entity_id: position.entity_id,
          anchor_ix: position.anchor_ix,
        },
      };
    }
  
    // Save updated player data to the JSON file
    savePlayerData(playerData);
  });
  
  // Player join event
  bot.on('playerJoin', (user, position) => {
    console.log(`[PLAYER JOINED]: ${user.username}:${user.id} - ${JSON.stringify(position)}`);
  
    // Teleport the user to a specific location
    bot.player.teleport(user.id, 7.5, 0, 6.5, Facing.FrontLeft)
      .then(() => {
        // Wait 0.5 seconds before playing emote
        setTimeout(() => {
          bot.player.emote(bot.info.user.id, Emotes.Bow.id)
            .then(() => console.log(`[EMOTE] ${user.username} performed a bow`))
            .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
  
          // Send welcome message
          bot.message.send(`Welcome to the room, ${user.username}!`);
  
          // Update the player's coordinates in playerData.json
          const updatedData = {
            username: user.username,
            userId: user.id,
            position: { x: 7.5, y: 0, z: 6.5 }, // The coordinates to which the player was teleported
            facing: 'FrontLeft'
          };
  
          // Read the current player data from the file
          const playerData = loadPlayerData();
  
          // Add or update the player's data
          playerData[user.id] = updatedData;
  
          // Write the updated player data back to the file
          savePlayerData(playerData);
  
          console.log(`[PLAYER DATA] Updated coordinates for ${user.username}`);
        }, 500);
      })
      .catch(e => console.error(`[ERROR] Failed to teleport:`, e));
  });
  
  // Player leave event
  bot.on("playerLeave", (user) => {
    const playerData = loadPlayerData();
  
    // Remove the player's data when they leave
    if (playerData[user.id]) {
      delete playerData[user.id];
      savePlayerData(playerData);
    }
  
    console.log(`[PLAYER LEFT]: ${user.username}:${user.id}`);
  
    // Send a goodbye message
    bot.message.send(`Goodbye for now! Hope to see you again soon. Your next visit will make my day! 😊🚀`);
  
    // Perform a kiss emote
    bot.player.emote(bot.info.user.id, Emotes.Kiss.id)
      .then(() => console.log(`[EMOTE] ${user.username} performed a kiss`))
      .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
  });

// Function to load the player data from the JSON file
function loadPlayerData() {
  if (fs.existsSync(playerDataFile)) {
    const rawData = fs.readFileSync(playerDataFile);
    return JSON.parse(rawData);
  }
  return {};
}

// Listen to chat messages
bot.on("chatCreate", (user, message) => {
  // If the message is "!goto @username"
  if (message.startsWith("!goto @")) {
    // Extract the target username from the message
    const targetUsername = message.split(" ")[1].replace('@', '');
    
    // Load player data to check if the target player exists
    const playerData = loadPlayerData();

    // Find the target player by username (case insensitive)
    const targetPlayer = Object.values(playerData).find(player => player.username.toLowerCase() === targetUsername.toLowerCase());

    // Ensure that the user is not trying to teleport to the bot
    if (targetPlayer.username === bot.info.user.username || targetPlayer.username === "WaiterHome") {
        bot.message.send(`${user.username} cannot teleport to the bot.`);
        return;
    }

    if (!targetPlayer) {
      // If the player is not found in the data
      bot.message.send(`Player @${targetUsername} not found!`);
      return;
    }

    // Retrieve target player's coordinates
    const { x, y, z } = targetPlayer.position;

    // Perform teleportation to the target player's coordinates
    bot.player.teleport(user.id, x, y, z, Facing.FrontLeft)
      .then(() => {
        bot.message.send(`${user.username} have been teleported to ${targetUsername}'s location!`);
      })
      .catch(e => {
        console.error(`[ERROR] Failed to teleport:`, e);
        bot.message.send(`Failed to teleport to ${targetUsername}.`);
      });
  }
});
bot.on("chatCreate", async (user, message) => {
    if (message === "!assist") {
      bot.message.send(
        "📌Commands Overview:\n" +
        "🔹 `!help` - help for the Waiter Bot\n" +
        "🔹 `!assistemote` - Learn about emote assist\n" +
        "🔹 `!assistgames` - Get help with math games and Rock-Paper-Scissors (RPS)\n" +
        "🔹 `!goto @username` - Teleport to user\n"
      );
    }
});
bot.login(token,room);
