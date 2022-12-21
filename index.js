require('dotenv').config();
const { Client, Events, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, ActivityType } = require('discord.js');
const { rollMonster, getMonsterList } = require('./monsterdata')

const client = new Client({ intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
] });

const commandPrefix = ";"

function makeHelpString(){
    const cmds = [["evil", "so evil man it is so evil"], ["monster", "rolls a random monster to claim"]]

    var helpS = "**BOT COMMANDS**\n\n*Prefix is ;*\n\n";

    for (let i = 0; i < cmds.length; i++) {
        helpS += `${cmds[i][0]} - ${cmds[i][1]}\n`;
    }

    return helpS
}

const helpString = makeHelpString()

var monsterList;

//make funcion for sending monster message rather than having it in listener

//DISCORD CLIENT STUFF

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activities: [{ name: `My Singing Monsters`, type: ActivityType.Playing }],
        status: 'online'
    });
});

client.on('messageCreate', async (message) => {

    if(message.content.startsWith(commandPrefix)){

        const msgCon = message.content.substring(commandPrefix.length)

        if (msgCon.startsWith("help")){
            message.channel.send(helpString);
        }

        if(msgCon.startsWith("monster")){

            const monsterDetails = await rollMonster(monsterList);

            const name = monsterDetails.chosMonster;
            var rarity = monsterDetails.rar;
            const imageURL = monsterDetails.photoUrl;

            //check here if monster has been rolled in guild, and if so, put claimed on footer and who by- also prevent being able to claim it with reaction.(and remove react to claim message! (put the stuff in the .then() as an if))


            const monsterembed = new EmbedBuilder()
            .setTitle(name)
            .setColor(0x1c6b24)
            .addFields(
                { name: rarity, value: 'React to this message to claim!' }
            )
            .setImage(imageURL)

            message.channel.send({ embeds: [monsterembed]}).then((msg) =>{

                const collector = msg.createReactionCollector({ time: 30000 });

                collector.on('collect', (reaction, user) => {
                    const editedEmbed = EmbedBuilder.from(monsterembed).setFooter({ text: `Claimed by ${user.tag}`, iconURL: user.displayAvatarURL() });
                    msg.edit({ embeds: [editedEmbed] });
                });
            });
        }
        
        if(msgCon.startsWith("evil")){
            const exampleEmbed = new EmbedBuilder()
            .setColor(0x990000)
            .setTitle('I am the evil villain...')
            .setDescription('I am rapidly approaching')
            .setThumbnail('https://i.gyazo.com/thumb/1200/382c455186c55478486097c02f62bada-png.jpg')
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Dylan?!', value: 'Why is he there?' },
            )
            .setImage('https://cdn.discordapp.com/attachments/834451978083762199/962445314030182450/IMG_20220409_211352_816.jpg')
            .setTimestamp()
            .setFooter({ text: 'WHAT THE FUCK!', iconURL: 'https://toppng.com/uploads/preview/emoji-face-clipart-surprise-shocked-emotico-11563150618bithfjzj4q.png' });

            message.channel.send({ embeds: [exampleEmbed] })
        }
    }
});

async function startBot(){
    monsterList = await getMonsterList()
    setTimeout(() => {
        //console.log(monsterList);
        client.login(process.env.clToken); }, 2000)
}

startBot()