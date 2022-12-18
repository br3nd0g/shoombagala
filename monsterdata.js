const axios = require('axios'); //for webscraping

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

function getMonsterList(){
    var mters = []
    //get monster list
    return mters
}

async function getPhoto(monster, rarity) {
	try {
		const response = await axios.get(
			`https://mysingingmonsters.fandom.com/wiki/${rarity}${monster}`
		)
		console.log(response)
	} catch (error) {
		console.error(error)
	}
}

async function rollMonster(){
    var rar = choose( ["Epic_", "Rare_", ""] )
    var chosMonster = choose(monsterList)

    var photoUrl = getPhoto(chosMonster, rar)

    return rar, chosMonster, photoUrl
}

module.exports = { rollMonster, getMonsterList }