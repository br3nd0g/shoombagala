require('dotenv').config();
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Events, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const { getMonsterList } = require('./monsterdata')
const { checkRolls, resetClaimsAvailable } = require('./userdata')
const { sendUserMonsters, sendMonster } = require('./discinteraction')
fs = require('fs');


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

async function claimTimerCheck(){

    var dateObj = new Date();
    var hours = dateObj.getHours(); 
    var data;

    try {
        data = await fs.readFileSync('./lastReset.txt', 'utf8');
    } catch (err) {
        console.error(err);
    }
    
    if (hours.toString() !== data){

        await resetClaimsAvailable()

        try {
            await fs.writeFileSync('./lastReset.txt', hours.toString());
        } catch (err) {
            console.error(err);
        }
    }
}

async function removeVolatileMonsters(monsters){
    var indexToRmv = monsters.indexOf("Boo'qwurm");
    monsters.splice(indexToRmv, 1);
    indexToRmv = monsters.indexOf("Blow't");
    monsters.splice(indexToRmv, 1);
    indexToRmv = monsters.indexOf("G'day");
    monsters.splice(indexToRmv, 1);
}


const helpString = makeHelpString()

var monsterList;

//DISCORD CLIENT STUFF

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activities: [{ name: `My Singing Monsters`, type: ActivityType.Playing }],
        status: 'online'
    });
});

client.on('clickButton', (button) => {
    console.log(button)
});

client.on('messageCreate', async (message) => {

    if(message.content.startsWith(commandPrefix)){

        await claimTimerCheck()

        const msgCon = message.content.substring(commandPrefix.length)

        if (msgCon.toLowerCase().startsWith("help")){
            message.channel.send(helpString);
        }

        if(msgCon.toLowerCase().startsWith("monster")){


            rolls = await checkRolls(message.author.id, message.guildId)

            if (rolls === 0){
                message.channel.send("You have no rolls left.")
            }else{sendMonster(message, monsterList)}
        }

        if(msgCon.toLowerCase().startsWith("island")){
            sendUserMonsters(message)
        }
        
        if(msgCon.toLowerCase().startsWith("evil")){
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
    await removeVolatileMonsters(monsterList)
    setTimeout(() => {
        //console.log(monsterList);
        client.login(process.env.clToken); }, 2000)
}

startBot()