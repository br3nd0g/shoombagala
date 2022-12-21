const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./userdata.db');

function checkIfClaimed(monster, rarity, guildid){
    
    monster = "Maw"
    rarity = "Common"
    var claimed = false
    var userid;

    const sqlQuery = `SELECT userID FROM Claims WHERE monsterName = '${monster}' AND guildID = '${guildid}' AND Rarity = '${rarity}';    `

    db.all(sqlQuery, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            claimed = True
            userid = row
        });
    });

    return { claimed, userid }
}

function addClaim(){
    //take guild, userid, monster.
    //insert guildid as guildid and so on
}

function getUserClaims(){
    //query all monsters by user in guild
}

module.exports = { checkIfClaimed, addClaim, getUserClaims }