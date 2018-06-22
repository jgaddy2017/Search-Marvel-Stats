
//I should probably find a way to hide this
let PRIVATE_KEY = "6e8c81140cf26bea43c9feeccd70e3d759b6edf7";
let PUBLIC_KEY = "1fed845063d20c661e374633d49e3bc0";



function searchMarvelApi(characterName){
    let ts = new Date().getTime();
    let hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY).toString();

    var url = 'http://gateway.marvel.com:80/v1/public/characters';

    let query = {
        ts: ts,
        apikey: PUBLIC_KEY,
        hash: hash,
        nameStartsWith: characterName,
        limit: 1
    }
    $.getJSON(url, query, function(data){
        if(data.data.results.length === 0){
            noCharacterFound();
        }
        else{
            let cardName = data.data.results[0].name;
            let cardUrl = data.data.results[0].thumbnail.path;
            let cardExt = data.data.results[0].thumbnail.extension;
            let cardImg = `${cardUrl}.${cardExt}`;
            console.log(cardName);
            console.log(cardImg);
            runSuperHeroApi(cardName, cardImg);
        }
    }).fail(showErr);
}



//creates an error message if something is wrong with retrieving data from marvel api
function showErr(err){
    const errMsg = `<div class="sorryTitleSection">
                        <p class="sorryTitle">Sorry<p>
                    </div>
                    <p class="sorryDescription">There was an <span class="importantOpeningStatement">error</span> retrieving data!</p>
                    <p class="sorryDescription">Something went <span class="importantOpeningStatement">Wrong</span> 
                    trying to connect to the <span class="importantOpeningStatement">Marvel API</span></p>
                    <p class="sorryDescription">Try checking your <span class="importantOpeningStatement">internet connection</span> 
                    and <span class="importantOpeningStatement">refreshing</span> the page</p>`;
    $('#characterPage').html(errMsg);
}

function noCharacterFound(){
    const nothing = "<p>nothing found</p>";
    $('#characterPage').html(nothing);
}



//runs when a hero is clicked in the modal
//the url also contains the proxy server url along with the endpoint for the super hero API (CORS error)
function runSuperHeroApi(cardName, cardImg){
    //retrieves the exact name 
    //iron man (Something) => iron man
    cardName = cardName.split(' (')[0];
    cardName = cardName.trim();
    
    $.ajax({
        dataType: 'json',
        type: 'GET',
        crossDomain: true,
        url: `https://sleepy-plateau-97577.herokuapp.com/http://www.superheroapi.com/api.php/2423459621001222/search/${cardName}`,
        success: function(data) {
            console.log(data);
            try {
                //when retrieving the data, there would be some extra heros, this gets the exact one you clicked on.
                //Ex search thor and it would return lex luTHOR 
                data.results.forEach(function(result){
                    if(result.name.toLowerCase() == cardName.toLowerCase()){
                        displayCharacterInfo(result, cardName, cardImg);
                    }
                });
            }
            catch(err){
                let characterLoadError = displaySuperHeroApiError(cardName, cardImg);
                $('#characterPage').html(characterLoadError);
            }
        }

      });
    }





//displays error message if something when wrong when a hero card was clicked
function displaySuperHeroApiError(cardName){
    let errorMes = `<div class="errorMessageSection">
                    <h3 class="errorName">${cardName}</h3>
                    <div class="sorryTitleSection">
                        <p class="sorryTitle">Sorry<p>
                    </div>
                    <p class="sorryDescription">There was an <span class="importantOpeningStatement">error</span> retrieving data!</p>
                    <p class="sorryDescription">There is a possibility the Super Hero API does not have information on this hero. Hopefully they will update their API
                    <span class="importantOpeningStatement"> SOON!!!</span></p>
                    </div>`;
    return errorMes;
}

//displays the character information after you click on a hero card in the modal
function displayCharacterInfo(data, characterName, characterImg){
    console.log(data);
    let character = `<h3 class = "displayCharacterName">${characterName}</h3>
                    <img class = "displayCharacterImage" src="${characterImg}">
                    <div class="row">
                    <div class="col-4 characterSection">
                        <h3 class="characterSectionTitle">Power Stats</h3>
                        <p class="characterSectionItems"><span class="sectionDescription">Intelligence: </span>${data.powerstats.intelligence}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Strength: </span>${data.powerstats.strength}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Speed: </span>${data.powerstats.speed}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Durability: </span>${data.powerstats.durability}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Power: </span>${data.powerstats.power}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Combat: </span>${data.powerstats.combat}</p>
                    </div>
                    <div class="col-4 characterSection">
                        <h3 class="characterSectionTitle">Appearance</h3>
                        <p class="characterSectionItems"><span class="sectionDescription">Gender: </span>${data.appearance.gender}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Race: </span>${data.appearance.race}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Height: </span>${data.appearance.height[0]}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Weight: </span>${data.appearance.weight[0]}</p>
                    </div>
                    <div class="col-4 characterSection">
                        <h3 class="characterSectionTitle">Biography</h3>
                        <p class="characterSectionItems"><span class="sectionDescription">Full Name: </span>${data.biography['full-name']}<p>
                        <p class="characterSectionItems"><span class="sectionDescription">Alignment: </span>${data.biography.alignment}<p>
                        <p class="characterSectionItems"><span class="sectionDescription">Place of Birth: </span>${data.biography['place-of-birth']}</p>
                        <p class="characterSectionItems"><span class="sectionDescription">Alter Egos: </span>${data.biography['alter-egos']}</p>
                    </di>
                    </div>`;
    $('#characterPage').html(character);
}


//displays the opening remarks
//openRemarks is a variable that is found in characterObject.js
function displayOpeningRemarks(){

let openingRemarks = `<p class="openingStatements">Thank you for visiting my <span class="importantOpeningStatement">Marvel API Application!</span><p>
                        <p class="openingStatements">An interesting <span class="importantOpeningStatement">list of characters</span> to begin with would include:</p>
                        <p class="importantOpeningStatement">Deadpool</p>
                        <p class="importantOpeningStatement">Thanos</p>
                        <p class="importantOpeningStatement">Iron Man</p>`;
                        //<img src="showMarvelApp.gif" class="gifInstruction moblePhone" alt="showing marvel application">`;
    $('#characterPage').html(openingRemarks);

}

function handleSearchCharacter(){
    $('#searchButton').on('click', function(event){
        let characterName = $('#inputCharacter').val();
        console.log("handleSearchCharacter");
        console.log(characterName);
        searchMarvelApi(characterName);
    });
}

function handlehomeButtton(){
    $('#homeButton').on('click', function(event){
        displayOpeningRemarks();
    });
}


//starts the Application
function startMarvelApi(){
    displayOpeningRemarks();
    handleSearchCharacter();
    handlehomeButtton();
}


$(startMarvelApi);












