const { rollMonster, getPhoto } = require('./monsterdata')
const { checkIfClaimed, addClaim, getUserClaims, checkCanClaim } = require('./userdata')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

async function sendMonster(message, monsterList){

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
        msg.channel.send(`**${user.username}** has claimed **${monRarity}** **${monName}**`)
    }
    else{
        msg.channel.send(`**${user.username}**, you have used your current claim.`)
    }
}

async function sendUserMonsters(message){

    const ownedMonsters = await getUserClaims(message.author.id, message.guild.id)
    var embedPages = []

    for(var i=0; i < ownedMonsters.length; i++){

        var rarityForURL;
        var pagesIndex = 0;
    
        if(ownedMonsters[i].rarity === "Rare" || ownedMonsters[i].rarity === "Epic"){rarityForURL = ownedMonsters[i].rarity + "_"}else{rarityForURL = ""}

        var ownedEmbed = new EmbedBuilder()
        .setTitle(ownedMonsters[i].name)
        .setColor(0x1c6b24)
        .addFields(
            { name: ownedMonsters[i].rarity, value: '\u200b' }
        )
        .setImage(await getPhoto(ownedMonsters[i].name, rarityForURL))
        .setFooter({ text: `Owned by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

        embedPages.push(ownedEmbed)
    }

    const buttonRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId('left')
        .setEmoji("👈")
        //.setLabel('')
        .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
        .setCustomId('right')
        .setEmoji("👉")
        //.setLabel('')
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({embeds: [embedPages[pagesIndex]], components: [buttonRow] }).then((msg) => {

        const collector = msg.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', (i) => {
            const buttonId = i.customId;

            if(buttonId === "right"){pagesIndex += 1}else if(buttonId === "left"){pagesIndex -= 1}
            if(pagesIndex < 0){pagesIndex = embedPages.length - 1}

            handleButtonPress(msg, collector, pagesIndex, embedPages, buttonRow)
        });

    })
    
}

async function handleButtonPress(message, collector, pagesIndex, embedPages, buttonRow){

    collector.stop()

    message.edit({embeds: [embedPages[pagesIndex]], components: [buttonRow] }).then((msg) => {

        const collector = msg.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', (i) => {
            const buttonId = i.customId;

            if(buttonId === "right"){pagesIndex += 1}else if(buttonId === "left"){pagesIndex -= 1}
            if(pagesIndex < 0){pagesIndex = embedPages.length - 1}

            handleButtonPress(msg, collector, pagesIndex, embedPages, buttonRow)
        });

    })
    
}

module.exports = { sendUserMonsters, sendMonster }