const sqlite3 = require('sqlite3').verbose();

function selectDbPromise(db, query) {

    return new Promise((resolve, reject) => {

        db.all(query, [], (err, rows) => {

            if(err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

function editDbPromise(db, query) {

    return new Promise((resolve, reject) => {

        db.run(query, [], (err, rows) => {

            if(err) {
                reject(err);
            }
            resolve(rows);
        })
    })
}

async function checkIfClaimed(monster, rarity, guildid){

    let db = new sqlite3.Database('./userdata.db');

    var userid;
    var claimed = false;

    const sqlQuery = `SELECT userID FROM Claims WHERE monsterName = '${monster}' AND guildID = '${guildid}' AND Rarity = '${rarity}';`

    const rows = await selectDbPromise(db, sqlQuery)

    rows.forEach((row) => {
        claimed = true
        userid = row.userID
    });
    if(rows.length === 0){
        //console.log("No Claim on " + monster)
    }

    db.close()

    return { claimed, userid }
}

async function addClaim(monster, rarity, userID, guildID){

    let db = new sqlite3.Database('./userdata.db');

    const sqlQuery = `INSERT INTO Claims (userID, guildID, monsterName, Rarity) VALUES('${userID}', '${guildID}', '${monster}', '${rarity}');`

    await editDbPromise(db, sqlQuery)

    const useClaimQuery = `UPDATE ClaimTimers SET claimsAvailable = 0 WHERE guildID = '${guildID}' AND userID = '${userID}';`

    await editDbPromise(db, useClaimQuery)

    db.close()
}

async function checkRolls(userID, guildID){

    let db = new sqlite3.Database('./userdata.db');

    var rolls;
    const sqlQuery = `SELECT rollsAvailable FROM ClaimTimers WHERE userID = '${userID}' AND guildID = '${guildID}';`

    const rows = await selectDbPromise(db, sqlQuery)

    rows.forEach((row) => {
        rolls = row.rollsAvailable
    });

    //console.log("LENGTH OF ROWS IS " + rows.length)

    if(rows.length === 0){
        const addUserQuery = `INSERT INTO ClaimTimers (userID, guildID) VALUES('${userID}', '${guildID}');`

        await editDbPromise(db, addUserQuery)

        rolls = 9
    }

    if (rolls > 0){
        const sqlUpdateQuery = `UPDATE ClaimTimers SET rollsAvailable = ${rolls -= 1} WHERE userID = '${userID}' AND guildID = '${guildID}';`
        await editDbPromise(db, sqlUpdateQuery)
    }

    db.close()

    //console.log(userID + " can roll " + rolls + " more times")

    return rolls

}

async function resetClaimsAvailable(){
    let db = new sqlite3.Database('./userdata.db');

    const sqlQuery = `UPDATE ClaimTimers SET rollsAvailable = 9, claimsAvailable = 1;`

    await editDbPromise(db, sqlQuery)

    db.close()
}

async function getUserClaims(userID, guildID){

    function ownedMonster(name, rarity) {
        this.name = name;
        this.rarity = rarity;
    }

    let db = new sqlite3.Database('./userdata.db');

    var owned = [];

    const sqlQuery = `SELECT monsterName, Rarity FROM Claims WHERE userID = '${userID}' AND guildID = '${guildID}';`

    const rows = await selectDbPromise(db, sqlQuery)

    rows.forEach((row) => {
        const monsterRecord = new ownedMonster(row.monsterName, row.Rarity)
        owned.push(monsterRecord)
    });

    db.close()

    return owned
}

async function checkCanClaim(userID, guildID){
    let db = new sqlite3.Database('./userdata.db');

    const sqlQuery = `SELECT claimsAvailable FROM ClaimTimers WHERE guildID = '${guildID}' AND userID = '${userID}';`

    const rows = await selectDbPromise(db, sqlQuery)
    var claimsAvailable;
    var canClaim = true

    rows.forEach((row) => {
        claimsAvailable = row.claimsAvailable
    });

    if(claimsAvailable === 0){canClaim = false}

    db.close()

    return canClaim
}

module.exports = { checkIfClaimed, addClaim, getUserClaims, checkRolls, resetClaimsAvailable, checkCanClaim }