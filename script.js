const stage = document.getElementById("stage");
const curtainButton = document.getElementById("curtainButton");

if (curtainButton) {
  curtainButton.addEventListener("click", () => {
    stage.classList.add("open");
  });
}

//Hit & stand knoppen functionaliteit
const hitButton = document.querySelector("#hitButton");
const standButton = document.querySelector("#standButton");
const dealButton = document.querySelector("#dealButton");
const dealerCardsEl = document.querySelector("#dealer-cards");
const playerCardsEl = document.querySelector("#player-cards");
const dealerScoreEl = document.querySelector("#dealer-score");
const playerScoreEl = document.querySelector("#player-score");
const messageEl = document.querySelector("#message");
const paintingEl = document.querySelector(".painting");

const suits = ["♠", "♥", "♦", "♣"];
const ranks = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

let deck = [];
let playerHand = [];
let dealerHand = [];
let inGame = false;

// Maak een volledig spel van 52 kaarten, bv. { rank: "K", suit: "♥" }
function createDeck() {
  const newDeck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      newDeck.push({ rank, suit });
    }
  }
  return newDeck;
}

// Schud de kaarten (Fisher-Yates)
function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function drawCard() {
  return deck.pop();
}

function cardValue(card) {
  if (card.rank === "A") return 11;
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  return Number(card.rank);
}

// Een aas telt 11, tenzij je daardoor boven 21 gaat: dan telt hij 1
function handScore(hand) {
  let score = 0;
  let aces = 0;
  for (const card of hand) {
    score += cardValue(card);
    if (card.rank === "A") aces++;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

// Bouw één kaart op met dezelfde HTML-structuur als in index.html
function createCardEl(card, hidden) {
  if (hidden) {
    const back = document.createElement("div");
    back.className = "blackjack-card-back";
    const img = document.createElement("img");
    img.src = "play_card_background.jpg";
    img.alt = "Back of blackjack card";
    back.append(img);
    return back;
  }

  const cardEl = document.createElement("div");
  cardEl.className = "blackjack-card";
  if (card.suit === "♥" || card.suit === "♦") cardEl.classList.add("red");

  const topLeft = document.createElement("div");
  topLeft.className = "card-corner-top-left";
  topLeft.append(card.rank, document.createElement("br"), card.suit);

  const center = document.createElement("div");
  center.className = "card-center-suit";
  center.textContent = card.suit;

  const bottomRight = document.createElement("div");
  bottomRight.className = "card-corner-bottom-right";
  bottomRight.textContent = card.suit;

  cardEl.append(topLeft, center, bottomRight);
  return cardEl;
}

// Zet de kaarten en scores op het scherm.
// Zolang de speler aan de beurt is, ligt de 2e kaart van de dealer dicht.
function render() {
  playerCardsEl.replaceChildren(
    ...playerHand.map((card) => createCardEl(card, false)),
  );
  dealerCardsEl.replaceChildren(
    ...dealerHand.map((card, i) => createCardEl(card, inGame && i === 1)),
  );

  playerScoreEl.textContent = handScore(playerHand);
  dealerScoreEl.textContent = inGame
    ? cardValue(dealerHand[0])
    : handScore(dealerHand);

  hitButton.disabled = !inGame;
  standButton.disabled = !inGame;
  dealButton.disabled = inGame;
}

function showMessage(text) {
  messageEl.textContent = text;
}

function startRound() {
  if (deck.length < 15) deck = shuffle(createDeck());
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  inGame = true;

  if (handScore(playerHand) === 21) {
    stand(); // meteen blackjack: de dealer is direct aan de beurt
    return;
  }
  render();
}

function hit() {
  if (!inGame) return;
  playerHand.push(drawCard());

  // Pas NA het trekken controleren, anders zie je de bust pas bij de volgende klik
  const playerScore = handScore(playerHand);
  if (playerScore > 21) {
    endRound("Twenthy-one was apparently too modest an ambition.");
    return;
  }
  if (playerScore === 21) {
    stand();
    return;
  }
  render();
}

function dealersTurn() {
  while (handScore(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }
}

function winnerIs(playerScore, dealerScore) {
  if (playerScore > 21) {
    return "Dealer wins";
  } else if (dealerScore > 21) {
    return "Player wins";
  } else if (playerScore > dealerScore) {
    return "Player wins";
  } else if (dealerScore > playerScore) {
    return "Dealer wins";
  } else {
    return "Push";
  }
}

function stand() {
  if (!inGame) return;
  dealersTurn();

  const result = winnerIs(handScore(playerHand), handScore(dealerHand));
  if (result === "Player wins") {
    endRound("Beginner's luck, I presume.");
  } else if (result === "Dealer wins") {
    endRound("A most predictable outcome, my dear.");
  } else {
    endRound("Very well. Let us see whether fortune favors a gentleman.");
  }
}

// Blackjack = 21 met precies 2 kaarten
function isBlackjack(hand) {
  return hand.length === 2 && handScore(hand) === 21;
}

// Laat de ogen kort oplichten: de CSS-animatie start zodra .glow erop staat
function glowEyes() {
  paintingEl.classList.remove("glow");
  void paintingEl.offsetWidth; // forceer herstart als de class er net nog stond
  paintingEl.classList.add("glow");
}

function endRound(text) {
  inGame = false;
  showMessage(text);
  render();
  if (isBlackjack(playerHand) || isBlackjack(dealerHand)) glowEyes();
}

paintingEl.addEventListener("animationend", () => {
  paintingEl.classList.remove("glow");
});

if (hitButton) {
  hitButton.addEventListener("click", hit);
}
if (standButton) {
  standButton.addEventListener("click", stand);
}
if (dealButton) {
  dealButton.addEventListener("click", () => {
    showMessage("Shall we begin? Do try to keep up.");
    startRound();
  });
}

// Eerste hand: de welkomsttekst uit index.html blijft staan
startRound();
