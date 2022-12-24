require('dotenv').config();
const { Client, Events, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, ActivityType } = require('discord.js');
const { send } = require('process');
const { rollMonster, getMonsterList } = require('./monsterdata')
const { checkIfClaimed, addClaim, getUserClaims, checkRolls, resetClaimsAvailable, checkCanClaim } = require('./userdata')
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


const helpString = makeHelpString()

var monsterList;

//make funcion for sending monster message rather than having it in listener

//DISCORD CLIENT STUFF

async function sendMonster(message){

    const monsterDetails = await rollMonster(monsterList);

    const name = monsterDetails.chosMonster;
    var rarity = monsterDetails.rar;
    const imageURL = monsterDetails.photoUrl;

    //check here if monster has been rolled in guild, and if so, put claimed on footer and who by- also prevent being able to claim it with reaction.(and remove react to claim message! (put the stuff in the .then() as an if))
    const claimCheck = await checkIfClaimed(name, rarity, message.guildId)

    var monsterembed = new EmbedBuilder()
    .setTitle(name)
    .setColor(0x1c6b24)
    .addFields(
        { name: rarity, value: 'React to this message to claim!' }
    )
    .setImage(imageURL)

    if(claimCheck.claimed == true){

        var userWhoClaimed = message.guild.members.cache.find(user => user.id === claimCheck.userid);
        monsterembed = EmbedBuilder.from(monsterembed).setFooter({ text: `Owned by ${userWhoClaimed.displayName}`, iconURL: userWhoClaimed.displayAvatarURL() });
    }

    message.channel.send({ embeds: [monsterembed]}).then((msg) =>{
        if(claimCheck.claimed == false){

            const collector = msg.createReactionCollector({ time: 30000 });

            collector.on('collect', (reaction, user) => {
                handleReaction(collector, user, msg, monsterembed, name, rarity)
            });

        }
    });
}

async function handleReaction(collector, user, msg, embed, monName, monRarity){
    const canUserClaim = await checkCanClaim(user.id, msg.guildId)
    if(canUserClaim === true){
        await addClaim(monName, monRarity, user.id, msg.guildId)
        const editedEmbed = EmbedBuilder.from(embed).setFooter({ text: `Claimed by ${user.tag}`, iconURL: user.displayAvatarURL() });
        msg.edit({ embeds: [editedEmbed] });
        collector.stop()
    }
    else{
        msg.channel.send(`**${user.username}**, you have used your current claim.`)
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activities: [{ name: `My Singing Monsters`, type: ActivityType.Playing }],
        status: 'online'
    });
});

client.on('messageCreate', async (message) => {

    await claimTimerCheck()

    if(message.content.startsWith(commandPrefix)){

        const msgCon = message.content.substring(commandPrefix.length)

        if (msgCon.startsWith("help")){
            message.channel.send(helpString);
        }

        if(msgCon.startsWith("monster")){


            rolls = await checkRolls(message.author.id, message.guildId)

            if (rolls === 0){
                message.channel.send("You have no rolls left.")
            }else{sendMonster(message)}
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
    const bookwormindex = monsterList.indexOf("Boo'qwurm");
    monsterList.splice(bookwormindex, 1);
    const blowtindex = monsterList.indexOf("Blow't");
    monsterList.splice(blowtindex, 1);
    setTimeout(() => {
        //console.log(monsterList);
        client.login(process.env.clToken); }, 2000)
}

startBot()