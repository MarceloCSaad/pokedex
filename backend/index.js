/* Let's build a Pokedex. Start by creating the basic project skeleton:
    #1 Step: Create the /frontend folder with a index.html file
    #2 Step: Create the backend folder with this index.js file
    #3 Step: Instal some basic dependencies we will be using:
        npm i nodemon  -----> Just a script monitor that restarts your server whenever you update (save) your code
        npm i express  -----> Express is the main depedency Node has to create and comunicate with servers, APIs, etc.
        npm i body-parser  -> A dependency used to parse (translate) several types of data on your http request's body
        npm i cors  --------> Dependency that regulates the exchange of information between applications and origins
    #4 Step: Generate our package.json ---> npm init -y
    #5 Step (optional): Create a nodemon script (start: "nodemon") on our package.json so we can use the bash command: npm start
*/
//Let's begin!




//Variables
const axios = require("axios");
const express = require("express");
const internalApp = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const apiUrl = "https://pokeapi.co/api/v2/";
class pokemon {
    constructor (name, id, icon, sprite, types) {
        this.name = name;
        this.id = id;
        this.icon = icon;
        this.sprite = sprite;
        this.types = types;
    }
};
const varList = {
    totalPokemons: 0, //house the total amount of known pokemons
    offset: 0,        //the pokemon ID that will start the list
    size: 18,          //the list size
    next: 18,         //store the next list (kindly provided by pokeAPI itself)
    previous: 0,     //store the previous list (kindly provided by pokeAPI itself)
    cardDeck: []         //Array of pokemon class Cards
}
internalApp.use(cors());
internalApp.use(bodyParser.json());
internalApp.use(bodyParser.urlencoded({ extended:true }));




// FUNCTIONS
async function createCard (req, res, needStringfy) {
    // Receive a pkmn request, searche pokeAPI, create a card, strigfy [if true], sends either object or JSON
    try {
        await axios.get(`${apiUrl}pokemon/${req}/`)
        .then( answer => {
            if (req !== "") {
                console.log(`API answered with ${req}'s data.`);
                let name = answer.data.species.name;
                let id = answer.data.id;
                let icon = answer.data.sprites.versions['generation-viii'].icons.front_default;
                let sprite = answer.data.sprites.front_default;
                let types = [];
                answer.data.types.forEach( (el,index) => types[index] = el.type.name )
                if (needStringfy === true) {
                    res.send(JSON.stringify(new pokemon(name, id, icon, sprite, types)))
                }
                else { return new pokemon(name, id, icon, sprite, types) }
            } else { throw new Error(`It's blank dude, I need you to provide me something!`); }
        })
    } catch(error) {
        console.error(error.message);
        if (needStringfy === true) { res.send(JSON.stringify("oops")); }
    }
}


async function listFill (ID) {
    //Get a pkmn ID, define offsets based on ID, update varList with the new deck information 
    console.log(`Entrei em listFill, recebendo o seguinte ID: ${ID}`);
    try {
        await axios.get(`${apiUrl}pokemon?limit=${varList.size}&offset=${ID - ID%varList.size}`)
        .then( answer => {
            console.log(`Successfull get in "${apiUrl}pokemon?limit=${varList.size}&offset=${ID}"`)
            varList.offset = ID - ID%varList.size;
            varList.totalPokemons = answer.data.count;
            varList.next = varList.offset + varList.size;
            varList.previous = varList.offset - varList.size;
            if (varList.previous < 1) varList.previous = 0;
            answer.data.results.forEach((el, index) => {
                varList.cardDeck[index] = el.name
            })
            console.log(`listFill finalizado, varList foi atualizada:`)
            console.log(varList);
        })
    }
    catch (e) { console.log(e.message) }
    finally { return varList }
}

internalApp.get("/carddeck", async (req, res) => {
    await listFill (parseInt(req.query.id))
    .then (res.send(JSON.stringify(varList)))
});


internalApp.get("/newsearch", (req, res) => createCard (req.query.name, res, true));

internalApp.listen(5000, () => { console.log("Server running on port 5000")});
