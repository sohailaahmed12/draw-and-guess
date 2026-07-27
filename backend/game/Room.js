class Room{
    constructor(roomID){
        this.id=roomID;
        this.players=[];
        this.gamePhase='waiting';
        this.currentDrawerId=null;
        this.currentWord=null;
        this.correctGuessersThisRound=[];
        this.roundNumber=0;
        this.totalRounds=null;
        
    }
    addPlayer(id,name) {
        this.players.push({id,name,score:0});

    }

getNextDrawerId() {
  if (this.currentDrawerId === null) {
    return this.players[0].id;
  } else {
    const index = this.players.findIndex((player) => player.id === this.currentDrawerId);
    const nextDrawerIndex = (index + 1) % this.players.length;
    return this.players[nextDrawerIndex].id;
  }
}

isGameOver() {
  return this.roundNumber === this.totalRounds;
}
startNewRound(words){
    this.currentDrawerId=this.getNextDrawerId();
    const randomWordIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomWordIndex];
    this.currentWord=randomWord;
    this.correctGuessersThisRound=[];
    this.roundNumber++;
    this.gamePhase='drawing';
}

startGame(words){
    this.totalRounds=this.players.length;
    this.startNewRound(words);
}

checkGuess(id, word) {
  if (this.correctGuessersThisRound.includes(id)) {
    return false;
  } else {
    if (word.trim().toLowerCase() === this.currentWord.trim().toLowerCase()) {
      const score = Math.max(5, 500 - 50 * this.correctGuessersThisRound.length);
      const player = this.players.find((p) => p.id === id);
      player.score = player.score + score;
      this.correctGuessersThisRound.push(id);
      return true;
    } else {
      return false;
    }
  }
}

endRound(){
    this.gamePhase='round-end';
}
}
module.exports = Room;