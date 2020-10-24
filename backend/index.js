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
const e = require("express");
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
    totalPokemons: "0", //house the total amount of known pokemons
    offset: "0",        //the pokemon ID that will start the list
    size: "9",          //the list size
    next: null,         //store the next list (kindly provided by pokeAPI itself)
    previous: null,     //store the previous list (kindly provided by pokeAPI itself)
    dexList: ["start"]         //list of pokemon class variables. ID from (offset) until (offset + size)
}

//CODE
internalApp.use(cors());
internalApp.use(bodyParser.json());
internalApp.use(bodyParser.urlencoded({ extended:true }));

// async function listFill () {    //async function that will update varList and fill varList.dexList 
//     console.log(`Entrei em listFill, recebendo a seguinte varList inicial:\n${varList}`);
    
//     //caso seja a primeira vez que carrego a página, crie uma lista inicial (IDs 1 até 19)
//     if (dexList[0] === "start") {
//         await axios.get(`${apiUrl}pokemon?limit=${size}&offset=${offset}`).then( answer => {
//             console.log(`Primeira inicialização, recebida lista da API com answer.results.length == ${answer.result.length}`)
//             varList.next = answer.next;
//             varList.previous = answer.previous;
//             answer.result.forEach( (el, index) => {
//                 varList.dexList[index] = await axios.get(el.url) //ainda está errado, vai me dar o JSON completo -> tenho q tratar com a funcao de criar card!!!!
//                 ;
//             })
//             console.log(totalPokemons);
//         })
//         return ;
//     }
// }

// internalApp.get("/dexlist", async (req, res) => {
//     ;
// })

// The get request below searches for a pokemon provided by the front end, responding with a {pokemon} object 
internalApp.get("/newsearch", async (req, res) => {
    try {
        await axios.get(`${apiUrl}pokemon/${req.query.name}/`)
        .then( answer => {
            if (req.query.name !== "") {
                console.log(`API answered with ${req.query.name}'s data.`);
                let name = answer.data.species.name;
                let id = answer.data.id;
                let icon = answer.data.sprites.versions['generation-viii'].icons.front_default;
                let sprite = answer.data.sprites.front_default;
                let types = [];
                answer.data.types.forEach( (el,index) => types[index] = el.type.name )
                res.send(JSON.stringify(new pokemon(name, id, icon, sprite, types)))
            }
            else {
                throw new Error(`It's blank dude, I need you to provide me something!`);
            }
        })
    } catch(error) {
        console.error(error.message);
        res.send(JSON.stringify("oops"));
    }
    
})



internalApp.listen(5000, () => { console.log("Server running on port 5000") });
