const axios = require('axios'); //for webscraping
const { JSDOM } = require('jsdom');

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

async function getMonsterList(){
    var mters = []

    try {
		const response = await axios.get(
			`https://mysingingmonsters.fandom.com/wiki/Monsters`
		)

		const htmlDOM = response.data
        const { document } = new JSDOM(htmlDOM).window

        const tables = document.getElementsByTagName("table")

        for (let i = 0; i < tables.length; i++) {
            var tablerows = tables[i]
            .getElementsByTagName('tbody')[0]
            .getElementsByTagName('tr') 

            for (let x = 0; x < tablerows.length; x++) {
                if (tablerows[x].getElementsByTagName('th')[0]){
                    if(tablerows[x].getElementsByTagName('th')[0].firstChild.data.startsWith('Name')){

                        var tabledata = tablerows[x].getElementsByTagName('td')

                        for (let p = 0; p < tabledata.length; p++) {

                            mters.push(tabledata[p].innerHTML.substring(tabledata[p].innerHTML.indexOf(">") + 1, tabledata[p].innerHTML.length - 5))
                        }
                    }
                }
            }
        }
	} catch (error) {
		console.error("NOOOO " + error)
	}

    mters = mters.filter(monster => monster != "");
    //console.log(mters)
    return mters
}

async function getPhoto(monster, rarity) {
	try {
        //console.log(`https://mysingingmonsters.fandom.com/wiki/${rarity}${monster}`)
		const response = await axios.get(
			`https://mysingingmonsters.fandom.com/wiki/${rarity}${monster}`
		)

		const htmlDOM = response.data

        const { document } = new JSDOM(htmlDOM).window

        const photoSrc = document.querySelector('.image').href

        return photoSrc

	} catch (error) {
		console.error("NOOOO " + error)
	}
}

async function rollMonster(mList){

    var rar = choose( ["Epic_", "Rare_", "Rare_", "Rare_", "", "", "", "", ""] )

    var chosMonster = choose(mList)
    //var chosMonster = choose(["Maw", "Noggin", "Furcorn"])

    var photoUrl = await getPhoto(chosMonster, rar)
    if (photoUrl == undefined){
        rar = ""
        photoUrl = await getPhoto(chosMonster, rar)
    }

    if (rar.slice(-1) === "_"){rar = rar.substring(0,rar.length-1)}else{rar = "Common"}

    return { rar, chosMonster, photoUrl }
}

module.exports = { rollMonster, getMonsterList }