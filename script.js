"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

// The prototype for all animals: 
const Animal = {
    name: "",
    desc: "-unknown animal-",
    type: "",
    age: 0,
    star: false,
    winner: false,
};

const settings = {
    filter: "all",
    sortBy: "name",
    sortDir: "asc"
};


function start( ) {
    console.log("ready");
    
    registerButtons();

    loadJSON();
}
function registerButtons(){
    document.querySelectorAll("[data-action='filter']").forEach(button => button.addEventListener("click", selectFilter));
     document
       .querySelectorAll("[data-action='sort']")
       .forEach((button) => button.addEventListener("click", selectSort));

}

async function loadJSON() {
    const response = await fetch("animals.json");
    const jsonData = await response.json();
    
    // when loaded, prepare data objects
    prepareObjects( jsonData );
}
function prepareObjects( jsonData ) {
    allAnimals = jsonData.map( prepareObject );
    buildList();
}
function prepareObject( jsonObject ) {
    const animal = Object.create(Animal);
    
    const texts = jsonObject.fullname.split(" ");
    animal.name = texts[0];
    animal.desc = texts[2];
    animal.type = texts[3];
    animal.age = jsonObject.age;

    return animal;
}

function selectFilter(event){
 const filter = event.target.dataset.filter;
 console.log(`user selected ${filter}`)
 setFilter (filter);
}
function setFilter(filter){
    settings.filterBy = filter;
    buildList();
}
function filterList(filteredList){
    //let filteredList = allAnimals
   if (settings.filterBy === "cat") {
     //create a filtered list of only cats
     filteredList = allAnimals.filter(isCat);
   } else if (settings.filterBy === "dog") {
     //create a filtered list of only dogs
     filteredList = allAnimals.filter(isDog);
   } 
    return filteredList;
}
function isCat(animal){
    return animal.type === "cat";
}
function isDog(animal) {
  return animal.type === "dog";
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  //find tge old sortBy element
    const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sort_by");
    //indicate active sort
  event.target.classList.add("sort_by");
  
  //toggle the direction
  if(sortDir === "asc"){
    event.target.dataset.sortDirection = "desc";
  }else{
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`user selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}
function setSort(sortBy, sortDir){
    settings.sortBy = sortBy;
    settings.sortDir = sortDir;
   buildList();
}
function sortList(sortedList){
    //let sortedList = allAnimals;

    let direction = 1;

    if(settings.sortDir === "desc"){
        direction = -1;
    }else{
        settings.direction = 1;
    }

   sortedList = sortedList.sort(sortByProperty);
   
    function sortByProperty(animalA, animalB) {
        //console.log(sortBy)
      if (animalA[settings.sortBy] < animalB[settings.sortBy]) {
        return -1 * direction;
      } else {
        return 1 * direction;
      }
    }
    return sortedList;
}

function buildList(){
    const currentList = filterList(allAnimals);
    const sortedList = sortList(currentList);

    displayList(sortedList);
}

function displayList(animals) {
    // clear the list
    document.querySelector("#list tbody").innerHTML = "";

    // build a new list
    animals.forEach( displayAnimal );
}

function displayAnimal( animal ) {
    // create clone
    const clone = document.querySelector("template#animal").content.cloneNode(true);

    // set clone data
    clone.querySelector("[data-field=name]").textContent = animal.name;
    clone.querySelector("[data-field=desc]").textContent = animal.desc;
    clone.querySelector("[data-field=type]").textContent = animal.type;
    clone.querySelector("[data-field=age]").textContent = animal.age;

    if(animal.star === true){
        clone.querySelector("[data-field=star]").textContent = "⭐";
    }else{
       clone.querySelector("[data-field=star]").textContent = "☆";
    }

    clone.querySelector("[data-field=star]").addEventListener("click", clickStar);
    
    function clickStar(){
        if (animal.star === true ){
            animal.star = false;
        }else{
            animal.star = true;
        }
        buildList();
    }
    //winners
    clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;
    clone.querySelector("[data-field=winner]").addEventListener("click", clickWinner);
    function clickWinner(){
        if (animal.winner === true){
            animal.winner = false;
        }else{
            tryToMakeAWinner(animal);
        }
        buildList();
       }
      // append clone to list
      document.querySelector("#list tbody").appendChild(clone);
}

function tryToMakeAWinner(selectedAnimal){

    const winners = allAnimals.filter(animal => animal.winner);
    const numberOfWinners = winners.length;
    const other = winners.filter(animal => animal.type === selectedAnimal.type).shift();
   //if ther is another of same type
   if(other !== undefined){
    console.log("there can be only one winner of each type");
    removeOther(other);
   }else if (numberOfWinners >= 2){
    console.log("there can be only be two winners type");
    removeAorB(winners[0], winners[1]);
   }else{
    makeWinner(selectedAnimal);
   }
    



     function removeOther(other){
        // ask the user to ignore or remoce other
        document.querySelector("#warningbox").classList.remove("hide");
        document.querySelector(".closebutton").addEventListener("click", closeDialog);
        document.querySelector("#removeother").addEventListener("click", clickRemoveOther);
        
        //show name on remove button
        document.querySelector("[data-field=otherWinner]").textContent =
          other.name;
        
        // if ignore - do nothing
        function closeDialog(){
         document.querySelector("#warningbox").classList.add("hide");
         document.querySelector(".closebutton").removeEventListener("click", closeDialog);
         document.querySelector("#removeother").removeEventListener("click", clickRemoveOther);
        }
        // if remove other:
        function clickRemoveOther() {
            removeWinner(other);
            makeWinner(selectedAnimal);
            buildList();
            closeDialog();
        }
      
     }
     function removeAorB(winnerA, winnerB){
            //ask the user to ignore or remove a or b
            document.querySelector("#warningbox2").classList.remove("hide");
            document.querySelector(".closebutton").addEventListener("click", closeDialog);
            document.querySelector("#remove_a").addEventListener("click", clickRemoveA);
            document.querySelector("#remove_b").addEventListener("click", clickRemoveB);
            
            // show names on remove a or b button
            document.querySelector("[data-field=winnerA]").textContent = winnerA.name
            document.querySelector("[data-field=winnerB]").textContent =
              winnerB.name;
            
            //if ignore - do nothing
            function closeDialog(){
                 document.querySelector("#warningbox2").classList.add("hide");
                 document.querySelector(".closebutton").removeEventListener("click", closeDialog);
                 document.querySelector("#remove_a").removeEventListener("click", clickRemoveA);
                 document.querySelector("#remove_b").removeEventListener("click", clickRemoveB);
            }
            // if remove a
            function clickRemoveA(){
            removeWinner(winnerA);
            makeWinner(selectedAnimal);
            buildList();
            closeDialog();
            }
           
            //else if - removeB
            function clickRemoveB(){
            removeWinner(winnerB);
            makeWinner(selectedAnimal);
            buildList();
            closeDialog();
            }
          

     }
     function removeWinner(winnerAnimal){
        winnerAnimal.winner = false;
     }
     function makeWinner(animal){
        animal.winner = true;
     }

}

