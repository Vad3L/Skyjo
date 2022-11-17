const Jeu = require("./jeu.js")
const Main = require("./main.js")

class Room {
    constructor(id, capacite) {
        this.id = id;
        this.placePrise = 0;
        this.placeMax = capacite;
        this.players = [];
        this.host = null;
        this.run = false;
        this.cartes = null;
    }
    
    createJeu() {
        this.cartes = new Jeu();
        this.players.forEach(p => {
            p.main = new Main(this.cartes);
        });
        console.log(this.players);
    }

    getNbJoueur() {
        return this.joueurs.length;
    }

    addPlayer(player) {      
        this.players.push(player);
        this.placePrise++;
    }

    deletePlayer(playerDelete) {
        this.players = this.players.filter(p => p.username !== playerDelete);
        this.placePrise--;
        if(playerDelete === this.host) {
            this.players.forEach(p => {
                this.setHost(p.username);
                return;
            });
        }
    }

    getPlayers() {
        return this.players;
    }

    setHost(username) {
        this.host = username;
    }

    isFull() {
        return this.placeMax == this.placePrise;
    }
}

module.exports = Room;