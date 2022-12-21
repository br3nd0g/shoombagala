const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./userdata.db');

function checkIfClaimed(){
    //take guild, userid, monster. Check if claimed in guild and by user.
    //sql query says select count(userid) from Claims where monster = monster and userid = userid and guildid = guildid
}

function addClaim(){
    //take guild, userid, monster.
    //insert guildid as guildid and so on
}

function getUserClaims(){
    //query all monsters by user in guild
}