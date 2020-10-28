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
const Pokemon = require("./models/Pokemon")
const axios = require("axios");
const express = require("express");
const internalApp = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const apiUrl = "https://pokeapi.co/api/v2/";

const deckProperties = {
    totalPokemons: 0, //house the total amount of known pokemons
    next: "",         //store the next list (kindly provided by pokeAPI itself)
    previous: "",     //store the previous list (kindly provided by pokeAPI itself)
    listOfCards: []         //Array of pokemon class Cards
}
internalApp.use(cors());
internalApp.use(bodyParser.json());
internalApp.use(bodyParser.urlencoded({ extended:true }));


// ************* FUNCTIONS
function createCard (pokeman) {
    //filters pokeAPI's data into the card data
    let name = pokeman.species.name;
    let id = pokeman.id;
    let icon = pokeman.sprites.versions['generation-viii'].icons.front_default;
    let sprite = pokeman.sprites.front_default;
    let types = [];
    pokeman.types.forEach( (el,index) => types[index] = el.type.name )
    return new Pokemon(name, id, icon, sprite, types)
}


async function listFill (offset, range) {
    //Get a pkmn ID, define offsets based on ID, update deckProperties with the new deck information 
    console.log(`listFill called, offset = {${offset}} and range = {${range}}`);
    try {
        await axios.get(`${apiUrl}pokemon?limit=${range}&offset=${offset}`)
        .then( answer => {
            console.log(`Successfull get in "${apiUrl}pokemon?limit=${range}&offset=${offset}"`)
            deckProperties.totalPokemons = answer.data.count;
            deckProperties.next = answer.data.next;
            deckProperties.previous = answer.data.previous;
            answer.data.results.forEach((el, index) => {
                deckProperties.listOfCards[index] = el.name
            })
            console.log(`listFill completed, deckProperties confirms ${deckProperties.totalPokemons} known pokémons... ${deckProperties.listOfCards.length} new cards will be included to the deck!`)
            return deckProperties;
        })
    }
    catch (e) {
        console.log(`${e.message} ==> Returning "oops" error`);
        return "oops";
    }
}

internalApp.get("/carddeck", async (req, res) => {
    //When front end requests a new card deck, first create the reference List
    console.log('New request from the frontend => "Give me a new card deck" ===> calling listFill')
    await listFill (parseInt(req.query.offset), parseInt(req.query.range))
    .then ( answer => {
        if (answer === "oops") {
            res.send(JSON.stringify("oops"))
        }
        else {
            promises = [];
            for (let i = 0; i < deckProperties.listOfCards.length; i++) {
                promises.push(axios.get(`${apiUrl}pokemon/${deckProperties.listOfCards[i]}/`).then((pokeman) => createCard(pokeman.data)));
            }
            Promise.all(promises)   //once all promisses are fullfilled, return the deck of cards + next deck link
            .then( results => {
                console.log(`Sending a new deck list to frontend! First Card is ${results[0].name}, last card is ${results[results.length-1].name} !!`)
                res.send( JSON.stringify( [results] ))
            })
        }
    })
})


internalApp.get("/newsearch", async (req, res) => {
    //Frontend requested a specific Card => get data from pokeAPI, create and return a card (or "oops" error) 
    let success = true;
    let newCard = [];
    if (req.query.name === "") {
        console.log('Received a blank pokémon, returning an "oops" error to the frontend')
        res.send(JSON.stringify("oops"))
    }
    else {
        try {
            await axios.get(`${apiUrl}pokemon/${req.query.name}/`)
            .then( pokeman => {
                newCard = createCard( pokeman.data );
            })
        } catch(error) {
            console.error(error.message)
            success = false;
        }
        finally {
            if (success === true) {
                console.log(`Completed a new search and created a new ${newCard.name} card. Sending to frontend now.`)
                res.send(JSON.stringify(newCard))
            }
            else { res.send(JSON.stringify("oops")) }
        }
    }
})

internalApp.listen(5000, () => { console.log("Server running on port 5000")});
