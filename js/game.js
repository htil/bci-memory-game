const cards = document.querySelectorAll('.memory-card');
var audio = new Audio('music/music.mp3');
audio.loop = true;

let name = "";
let hasFlippedCard = false;
let lockBoard = true; // false
let firstCard, secondCard;
let moves = [];
let matchesMade = 0;
let startTime = null;
let duration = 0;

let numMatches = 0;
let numSelected = 0;

function flipCard() {
    if (lockBoard) return;
    if (this == firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.card === secondCard.dataset.card;
    var timeStamp = Date(); 

    numSelected += 1;
    if (isMatch) {
        numMatches += 1;
        moves.push(timeStamp + ": [MATCH] " + name + " matched " + firstCard.dataset.card + " with " + secondCard.dataset.card);
    }
    else {
        moves.push(timeStamp + ": [ERROR]"  + name + " selected " + firstCard.dataset.card + " and " + secondCard.dataset.card);
    }

    isMatch ? disableCards() : unflipCards();

    if (numMatches === 10) {
        stopGame();
        saveResults();
    }
}

function saveResults() {
    document.getElementById("name").style.display = "none";
    document.getElementById("matches").style.display = "inline-block";
    document.getElementById("matches").innerHTML = "<strong>Matches: </strong>" + numMatches;
    document.getElementById("selected").style.display = "inline-block";
    document.getElementById("selected").innerHTML = "<strong>Selections: </strong>" + numSelected;
    document.getElementById('results-container').removeAttribute('hidden');
    resizeBoard();

    duration = (new Date() - startTime) / 1000;

    db.collection("users").add({
        name: name,
        moves: moves,
        duration: duration,
        date: new Date().toString()
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });

}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard()
    }, 1500);

}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

(function shuffle() {
    cards.forEach(card => {
      let ramdomPos = Math.floor(Math.random() * 12);
      card.style.order = ramdomPos;
    });
})();

function manualResetBoard() {
    document.getElementById("countdown").innerHTML = "05:00";
    resetBoard();
    cards.forEach(card => {
        card.classList.remove('flip');
        card.addEventListener('click', flipCard);
        
        setTimeout(()=> {
            let ramdomPos = Math.floor(Math.random() * 12);
            card.style.order = ramdomPos;
        }, 300);
    });
}

function manualShuffle() {
    cards.forEach(card => {
        let ramdomPos = Math.floor(Math.random() * 12);
        card.style.order = ramdomPos;
    });
}

var countdownTimer;

function startGame() {
    if (!document.getElementById('name').value.length) {
        alert("Please enter your name or ID to begin!");
        return;
    }
    else {
        name = document.getElementById('name').value;
        document.getElementById('name').setAttribute("disabled", true);
    }

    lockBoard = false;
    startTime = new Date();
    document.getElementById('countdown').removeAttribute('hidden');
    document.getElementById('results-container').setAttribute('hidden', true);
    document.getElementById('start-button').setAttribute('hidden', true);
    resizeBoard();
    audio.play();

    var timeRemaining = 299;
    countdownTimer = setInterval(function() {
        if (timeRemaining < 0){
          stopGame();
          saveResults();
        } else {
            minutes = Math.floor(timeRemaining / 60);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = timeRemaining % 60;
            seconds = seconds < 10 ? "0" + seconds : seconds;
          document.getElementById("countdown").innerHTML = minutes + ":" + seconds;
        }
        timeRemaining -= 1;
    }, 1000);
}

function stopGame() {
    clearInterval(countdownTimer);
    audio.pause();
}

cards.forEach(card => card.addEventListener('click', flipCard));

window.onload = resizeBoard;
window.onresize = resizeBoard;

function resizeBoard() {
    let navBar = document.querySelector('.navbar');
    let resultsContainer = document.querySelector('.results-container');
    let results = document.querySelector('.results');
    let directions = document.querySelector('.directions');
    let gameBoard = document.querySelector('.memory-game');
    
    const NAVHEIGHT = navBar.clientHeight + resultsContainer.clientHeight + directions.clientHeight;
    const PADDING = 35;
    width = window.innerWidth;
    height = window.innerHeight - NAVHEIGHT;
    
    gameBoardSize = Math.min(width - PADDING, height - PADDING);
    gameBoard.style.width = gameBoardSize + "px";
    gameBoard.style.height = gameBoardSize + "px";
    gameBoard.style.marginTop = (height - gameBoardSize)/2 + "px";
    results.style.width = gameBoardSize + "px";
}

function removeBoard() {
    let gameBoard = document.querySelector('.memory-game');
    gameBoard.style.width = "0px";
    gameBoard.style.height = "0px";
}

const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    
    a.href= URL.createObjectURL(file);
    a.download = filename;
    a.click();
  
    URL.revokeObjectURL(a.href);
};