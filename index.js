
//I should probably find a way to hide this
let PRIVATE_KEY = "6e8c81140cf26bea43c9feeccd70e3d759b6edf7";
let PUBLIC_KEY = "1fed845063d20c661e374633d49e3bc0";



//updates the characterIndexingList varible located in characterObject.js once information has been recieved and stored
function editCharacterIndexListing(startLetter){
    characterIndexingList = characterIndexingList.replace(`characterIndexDisabled" id="${startLetter}" disabled`, `characterIndex" id="${startLetter}"`);
}

//runs A-Z in the alphbet to retrieve all heros at the start of the application
function fillCharacterObject(){

     Object.keys(characterGroupObject).map(function(key){	 
        runMarvelApi(key);
    });

}


//creates the page of all hero cards by their first names and stores those pages in the characterGroupObject
//characterGroupObject is found in characterObject.js
function createCharacterObject(data, startLetter){
   let card = data.data.results.map(result => createCards(result));
   let cardList = card.join("");
   characterGroupObject[startLetter] = cardList;
}





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
        let cardName = data.data.results[0].name;
        let cardUrl = data.data.results[0].thumbnail.path;
        let cardExt = data.data.results[0].thumbnail.extension;
        let cardImg = `${cardUrl}.${cardExt}`;
        console.log(cardName);
        console.log(cardImg);
        runSuperHeroApi(cardName, cardImg);

    }).fail(showErr);
}


//runs at the beginning to gain all characters from marvel api
//loads all characters at once, runs A then B ..... then Z.
function runMarvelApi(startLetter){
    let ts = new Date().getTime();
    let hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY).toString();

    var url = 'http://gateway.marvel.com:80/v1/public/characters';

    let query = {
        ts: ts,
        apikey: PUBLIC_KEY,
        hash: hash,
        nameStartsWith: startLetter ,
        limit: 99
    }

    $.getJSON(url, query, function(data){

        //updates the information in A-Z characterIndex and what is being shown to the user
        $(`#${startLetter}`).prop('disabled', false);
        $(`#${startLetter}`).removeClass( "characterIndexDisabled" ).addClass( "characterIndex" );
        editCharacterIndexListing(startLetter);
        createCharacterObject(data, startLetter);
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

//when a letter is selected display all hero cards with that letter
function displayResults(letterIndex){
    let cards = characterGroupObject[letterIndex];
    $('#results').html(cards);
}

//creates the cards for each character that will be shown in the modal.
function createCards(character){
   return `<button class="card">\
                <img class="characterThumbnail" src="${character.thumbnail.path}.${character.thumbnail.extension}">\
                <p>${character.name}</p>\
            </button>`;
}

//handles the A-Z index when the user uses their keyboard to select a letter
function handleKeyDown(){
    $('html').keydown(event => {
        console.log("keyboard ran");
        let keyboardPressed = event.key;
        displayResults(keyboardPressed.toUpperCase());
        handleCardClick();
    });
}

//handles the A-Z index when the user uses the tab or mouse to click on a letter
function handleCharacterIndex(){
    $("#results").on("click", ".characterIndex", function(event) {
        event.stopPropagation();
        let selectedIndex = event.currentTarget;
        let selectedLetter = $(selectedIndex).text();
        displayResults(selectedLetter);
        handleCardClick();
    });
}

//when a card is clicked, retrieve the name and img of hero, then run the super hero api
function handleCardClick(){
    $('.card').click(event => {
        event.stopPropagation();
        let selectedCard = event.currentTarget;
        let cardName = $(selectedCard).text();
        let cardImg = $(selectedCard).find('img').prop('src');
        displayWaitMess(cardName);
        //used same convention from the modal guide on W3 schools
        document.getElementById('myModal').style.display = "none";
        runSuperHeroApi(cardName, cardImg);
    });
}

//displays a wait message while the card information in being fetched
function displayWaitMess(cardName){
    let waitMes = `<div class="errorMessageSection">
                    <div class="sorryTitleSection">
                        <p class="sorryTitle">Patience<p>
                    </div>
                    <p class="sorryDescription">Information on <span class="importantOpeningStatement">${cardName}</span> will appear
                    <span class="importantOpeningStatement">shortly!</span></p>
                    </div>`;
    $('#characterPage').html(waitMes);
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
function displaySuperHeroApiError(cardName, cardImg){
    let errorMes = `<div class="errorMessageSection">
                    <h3 class="errorName">${cardName}</h3>
                    <img class = "characterThumbnail" src="${cardImg}">
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

//displays the A-Z index in the modal
//characterIndexingList is found in characterObject.js
function displayCharacterIndex(){
    console.log("displayCharacterIndex ran");
    $('#results').html(characterIndexingList);
    handleCharacterIndex();

}

//controls the modal that pops up
//also this code came from the W3 schools tutorial
function handleModal(){
    // Get the modal
    let modal = document.getElementById('myModal');
    // Get the button that opens the modal
    let btn = document.getElementById("myBtn");
    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];
    // When the user clicks on the button, open the modal 
    btn.onclick = function() {
        displayCharacterIndex();
        console.log("modal ran");
        modal.style.display = "block";
    }
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

//displays the opening remarks
//openRemarks is a variable that is found in characterObject.js
function displayOpeningRemarks(){
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


//starts the Application
function startMarvelApi(){
    handleKeyDown();
    fillCharacterObject();
    displayOpeningRemarks();
    handleCardClick();
    handleModal();
    handleSearchCharacter();
}


$(startMarvelApi);












