"use strict";

document.addEventListener("DOMContentLoaded", function(_e) {
	
	const player = {
		roomId: null,
		username: "",
		main:null
	};


	// mettre les autres fenetres invisible
	document.getElementById("pseudo").focus();
	toggleDisplayOn("logScreen","block");
    // socket ouverte vers le client
    var sock = io.connect();
    
    // utilisateur courant 
    var currentUser = null;
    
    // tous les utilisateurs (utile pour la complétion) 
    var users = [];
	
	// toutes les mains des joueurs 
	var jeu = null;

	// host de la partie
	var host = null;
    
    // tous les caractères spéciaux (utile pour les remplacements et la complétion) 
    var specialChars = {
        ":paper:": "&#128220;",
        ":rock:": "&#129704;",
        ":scissors:": "&#9988;",
        ":lizard:": "&#128013;",
        ":spock:": "&#128406;",
        ":smile:": "&#128578;",
        ":sad:": "&#128577;",
        ":laugh:": "&#128512;",
        ":wink:": "&#128521;",
        ":love:": "&#129392;",
        ":coeur:": "&#10084;",
        ":bisou:": "&#128536;",
        ":peur:": "&#128561;",
        ":whoa:": "&#128562;",
        ":mask:" : "&#128567;"
    }


	

	/****************************************************
	 *
	 *
	 *					SOCKET REÇUS
	 *
	 *
	 * **************************************************/



    // réception du message de bienvenue
    sock.on("bienvenue", function(liste) {    
        if (currentUser) {
            // on change l'affichage du bouton
            document.getElementById("btnConnecter").value = "Se connecter";
            document.getElementById("btnConnecter").disabled = false;
            // on vide les zones de saisie
            document.querySelector("#content main").innerHTML = "";
            document.getElementById("monMessage").value = "";
			toggleDisplayOn("lobby","flex");
            document.getElementById("monMessage").focus();
        }
    });
    
    // réception d'une erreur de connexion
    sock.on("erreur-connexion", function(msg) {
        alert(msg);   
        document.getElementById("btnConnecter").value = "Se connecter";
        document.getElementById("btnConnecter").disabled = false;
    });
    
    // réception d'un message classique
    sock.on("message", function(msg) {
        if (currentUser) {
            afficherMessage(msg);
        }
    });
    // réception de la mise à jour d'une liste
    sock.on("liste", function(liste,hoste) {
        if (currentUser) {
			host=hoste;
            afficherListe(liste,hoste);
        }
    });
	

	sock.on("list rooms", function(roomList){
		if (currentUser){
			afficherRoom(roomList);
			
		}
	});
	
    sock.on("roomId", function(id){
		player.roomId=id;
	});

	sock.on("start", function(deck){
		document.getElementById("load").style.display = "none";
		document.getElementById("jeux").style.display ="flex";
		jeu=deck;
		
		afficherJeu(player.username);

		document.getElementById("content").classList.add("buzz");
        setTimeout(function() {
            document.getElementById("content").classList.remove("buzz");
        }, 500);
	});


	sock.on("defausse",function(defausse,taille){
		afficherDefausse(defausse,taille);
	})

	sock.on("pioche",function(pioche,taille){
		afficherPioche(pioche,taille);
	})
        
    // gestion des déconnexions de la socket --> retour à l'accueil
    sock.on("disconnect", function(reason) {
        currentUser = null;

		toggleDisplayOn("content","block");
												
		document.getElementById("pseudo").focus();
    });



	/***************************************************************************************
	 *
	 *
	 *							Methode gestion affichage
	 *
	 *
	 **************************************************************************************/
    
	/****************************************************
	 *
	 *
	 *						CHOISIR PAGE
	 *
	 *
	 * *************************************************/


	/**
	 *	Met tous les elements invisible a part celui passer en parametre
	 *	@param String		est l'id
	 *	@param String		est l'attribut à mettre
	 */
	function toggleDisplayOn(id,display){
		let childs = document.body.children;
		for(let i = 0 ; i < childs.length ; ++i){
			childs[i].style.display = "none";
		}
		
		if(id !== "logScreen"){document.getElementsByTagName("header")[0].style.display = "flex";}
		document.getElementById(id).style.display = display;
	}

    /**************************************************
	 *
	 *					LOBBY
	 *
	 * ***********************************************/
	function afficherRoom(roomList){
		if(!currentUser) return;
		
		//récupére l'element scroll
		let ul = document.getElementById("scroll");
		//vide ce qu'il y avait avant dedans
		ul.innerHTML = "";

		for(let i = 0 ; i < roomList.length ; ++i){
			let li = document.createElement("li");
			li.innerHTML ="salon " +roomList[i].id+" - "+roomList[i].placePrise+"/"+roomList[i].placeMax;
			li.setAttribute("value",roomList[i].id);
			ul.appendChild(li);
		}
	}




	/**************************************************
	 *
	 *						ROOM
	 *
	 * ***********************************************/

	/***************************
	 *			JEUX
	 * ************************/
	function afficherJeu(username){
		
		afficherNomScore(username);
		afficherMain(username);

	}
	
	function afficherNomScore(username){
		let p = document.querySelector("#plateau #username");
		p.innerHTML = username;
		
		let point = document.getElementById("points");
		
		point.innerHTML = jeu.filter(jeu => jeu.username === username)[0].main.points;

		if(username === player.username){
			p.style.color= "cyan";
		}else{
			p.style.color = "black";
		}
	}

	function afficherDefausse(defausse,taille){
		console.log("defausse");
		console.log(defausse);
		console.log(taille)

		let divDefausse = document.getElementById("defausse");

		let p = document.createElement("p");
		p = afficherCarte(defausse[0],p);

		divDefausse.appendChild(p);

	}

	function afficherPioche(pioche,taille){
		console.log("pioche");
		console.log(pioche);
		
		console.log(taille);
		let divPioche = document.getElementById("pioche");

		let p = document.createElement("p");
		p = afficherCarte(pioche[0],p);

		divPioche.appendChild(p);

	}


	function afficherCarte(carte,td){
		// si la carte est retourner
		if(carte.back){
			td.setAttribute("class","card card--back card--hover-effect");
							
			// premier span
			let span = document.createElement("span");
			span.innerHTML = "Skyjo";
			td.appendChild(span);

			// deuxieme span
			span = document.createElement("span");
			span.innerHTML = "Skyjo";
			td.appendChild(span);


		}else{
			if(carte.value === 6 || carte.value === 9){
				td.setAttribute("class","card card--face card--hover-effect card--underline-value");
			}else{
				td.setAttribute("class","card card--face card--hover-effect");
			}
			td.style.background = carte.color;
			// premier span
			td.appendChild(document.createElement("span"));

			// deuxieme span
			let span = document.createElement("span");
			span.innerHTML = carte.value;
			td.appendChild(span);

			// troisieme span
			span = document.createElement("span");
			span.innerHTML = carte.value;
			td.appendChild(span);

			// quatrieme span
			td.appendChild(document.createElement("span"));

			// cinquieme span
			span = document.createElement("span");
			span.innerHTML = carte.value;
			td.appendChild(span);
		}
		return td;

	}

	function afficherMain(username){
		let tbody = document.querySelector("#plateau table tbody");
		tbody.innerHTML ="";
		jeu.forEach(r =>{
			if(r.username === username){
				r.main.cartes.forEach(lignes =>{
					let tr = document.createElement("tr");
					lignes.forEach(carte =>{
						let td = document.createElement("td");
						if(carte != null){
							td = afficherCarte(carte,td);
						}else{
							td.setAttribute("class","card-remove");
						}
						tr.appendChild(td);
					});
					tbody.appendChild(tr);
				});
			}
		});
	}

	function swipeMain(choice){
		console.log(jeu);

		let localUser = document.getElementById("username").innerHTML;
		console.log("current :"+localUser);

		for(let i = 0 ; i < jeu.length ; ++i){
			if(jeu[i].username === localUser){
				if(choice === "left"){
					if(i === 0){
						afficherJeu(jeu[jeu.length-1].username);
					}else{
						afficherJeu(jeu[i-1].username);
					}
				}else{
					if(i === jeu.length-1){
						afficherJeu(jeu[0].username);
					}else{
						afficherJeu(jeu[i+1].username);
					}
				}
			}
		}
	}

	function updateStartButton(){
		if(player.username === host){
			document.getElementById("btnLancerPartie").style.display = "block"; 
		}else{
			document.getElementById("btnLancerPartie").style.display = "none"; 
		}
	}


	/****************************
	 *			CHAT
	 * *************************/

    /** 
     *  Affichage des messages 
     *  @param  object  msg    { from: auteur, text: texte du message, date: horodatage (ms) }
     */
    function afficherMessage(msg) {
        // si réception du message alors que l'on est déconnecté du service
        if (!currentUser) return;   
        
		

        // affichage des nouveaux messages 
        var bcMessages = document.querySelector("#content main");

        // identification de la classe à appliquer pour l'affichage
        var classe = "";        

        // cas des messages privés 
        if (msg.from != null && msg.to != null && msg.from != 0) {
            classe = "mp";  
            if (msg.from == currentUser) {
                msg.from += " [privé @" + msg.to + "]";   
            }
            else {
                msg.from += " [privé]"
            }
        }
        
        // cas des messages ayant une origine spécifique (soi-même ou le serveur)
        if (msg.from == currentUser) {
            classe = "moi";   
        }
        else if (msg.from == null) {
            classe = "system";
            msg.from = "[admin]";
        }
                
        // affichage de la date format ISO pour avoir les HH:MM:SS finales qu'on extrait ensuite
        var date = getLocalTime(msg.date);
        // remplacement des caractères spéciaux par des émoji
        msg.text = traiterTexte(msg.text);
        // affichage du message
        bcMessages.innerHTML += "<p class='" + classe + "'>" + date + " - " + msg.from + " : " + msg.text + "</p>"; 
        // scroll pour que le texte ajouté soit visible à l'écran
        //document.querySelector("main > p:last-child").scrollIntoView();
    };


	/**
     *  Affichage de la liste de joueurs.
     */
    function afficherListe(newList,host) {
        // affichage en utilisant l'attribut personnalisé data-score
		updateStartButton();
        document.querySelector("#content aside").innerHTML = newList.map(u => "<p"+(u.username === player.username ? " style =\"color:#00ffcd\"":"")+">" + ((u.username === host) ? u.username+ " *":u.username)+ "</p>").join("");
    }

    

    function getLocalTime(date) {
        return (new Date(date)).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }).substring(11);
    }
    
    
    // traitement des emojis
    function traiterTexte(txt) {
        // remplacement de quelques smileys par les :commandes: correspondantes
        txt = txt.replace(/:[-]?\)/g,':smile:');
        txt = txt.replace(/:[-]?[Dd]/g,':laugh:');
        txt = txt.replace(/;[-]?\)/g,':wink:');
        txt = txt.replace(/:[-]?[oO]/g,':whoa:');
        txt = txt.replace(/:[-]?\*/g,':bisou:');
        txt = txt.replace(/<3/g,':coeur:');
        // remplacement des :commandes: par leur caractère spécial associé 
        for (let sp in specialChars) {
            txt = txt.replace(new RegExp(sp, "gi"), specialChars[sp]);   
        }
        return txt;   
    }


	/***************************************************************************************
	 *
	 *
	 *										SOCKET ENVOIE 
	 *
	 *
	 ***************************************************************************************/

    /**********************************************
	 *
	 *					ROOM
	 *
	 *********************************************/

	/**********************
	 *		GERER
	 * *******************/

	/*
	 * creer une room
	 */
	function createRoom(){

		let capacity = document.getElementById("nbPlayer").value;

		toggleDisplayOn("room","flex");
		sock.emit("createRoom",player,capacity);
		// afficher la div load obligatoirement
		document.getElementById("load").style.display = "flex";
		document.getElementById("jeux").style.display = "none";
		
	}
	
	/*
	 * rejoindre une room
	 *
	 * @param id est l'id de la room à rejoindre
	 */
	function rejoindreRoom(id){
		// nettoie le chat 
		document.querySelector("#content main").innerHTML = ""; 
		// afficher la div load obligatoirement
		document.getElementById("load").style.display = "flex";
		document.getElementById("jeux").style.display = "none";
		toggleDisplayOn("room","flex");
		sock.emit("joinRoom",player, id);
	}
    
	/*
	 * quitter la room
	 */
	function quitterRoom() { 
        if (confirm("Quitter la partie en cours ?")) {
            sock.emit("leave",player);
			
			// nettoie le chat 
			document.querySelector("#content main").innerHTML = ""; 
			
			toggleDisplayOn("lobby","flex");
		}
    };

	/*********************
	 *			JEUX
	 * *******************/

	function lancerPartie(){
		
		// lancer la partie
		sock.emit("start",player.username);
	}
    
	/**********************
	 *			CHAT
	 * ********************/

    /**
     *  Envoi d'un message : 
     *      - Récupération du message dans la zone de saisie.
     *      - Identification des cas spéciaux : @pseudo ... ou /chifoumi @pseudo :choix:
     *      - Envoi au serveur via la socket
     */ 
    function envoyerMessage() {
        
        var msg = document.getElementById("monMessage").value.trim();
        if (!msg) return;   

        // Cas des messages privés
        var to = null;
        if (msg.startsWith("@")) {
            var i = msg.indexOf(" ");
            to = msg.substring(1, i);
            msg = msg.substring(i);
        }
        
        // envoi
        sock.emit("message", { to: to, text: msg },player);
        
        // enregistrement de la commande dans l'historique
        historique.ajouter();
        // effacement de la zone de saisie
        document.getElementById("monMessage").value = "";
    }

    
	/*******************************************
	 *
	 *					LOBBY
	 *
	 * ****************************************/
    
	

    /**
     *  Quitter le l'appli et revenir à la page d'accueil.
     */
    function quitter() { 
        if (confirm("Quitter l'application ?")) {
            currentUser = null;
            sock.emit("logout",player);

			toggleDisplayOn("logScreen","block");
		}
    };


	/*********************
	 *		GERER
	 * *******************/

	/** 
     *  Connexion de l'utilisateur au chat.
     */
    function connectLobby() {
        // recupération du pseudo
        var user = document.getElementById("pseudo").value.trim();
        if (! user) return;
        currentUser = user; 
        // ouverture de la connexion
		player.username = user;
        sock.emit("login", user);
		//sock.emit('get rooms');
        document.getElementById("btnConnecter").value = "En attente...";
        document.getElementById("btnConnecter").disabled = true;
    }


	

	/**********************************************************************************
	 *
	 *
	 *
	 *
	 *
	 * *********************************************************************************/



    // Objet singleton gérant l'auto-complétion
    var completion = {
        // le texte de base que l'on souhaite compléter
        text: null,
        // l'indice de la proposition courant de complétion
        index: -1,
        // la liste des propositions de complétion
        props: [],
        // remise à zéro
        reset: function() {
            this.text = null;
            this.index = -1;
        },
        // calcul de la proposition suivante et affichage à l'emplacement choisi
        next: function() {
            if (this.text === null) {
                this.text = document.getElementById("monMessage").value;
                this.props = this.calculePropositions();
                this.text = this.text.substring(0, this.text.lastIndexOf(":"));
                this.index = -1;
                if (this.props.length == 0) {
                    this.text = null;
                    return;
                }
            }
            this.index = (this.index + 1) % this.props.length;
            document.getElementById("monMessage").value = this.text + this.props[this.index];   
        },
        // calcul des propositions de compétion
        calculePropositions: function() {
            var i = this.text.lastIndexOf(":");
            if (i >= 0) { 
                var prefixe = this.text.substr(i);
                return Object.keys(specialChars).filter(e => e.startsWith(prefixe));
            }
            return [];
        }
    };
    
    // Objet singleton gérant l'historique des commandes saisies
    var historique = {
        // contenu de l'historique
        content: [],
        // indice courant lors du parcours
        index: -1,
        // sauvegarde de la saisie en cour
        currentInput: "",
        
         precedent: function() {
            if (this.index >= this.content.length - 1) {
                return;
            }
            // sauvegarde de la saisie en cours
            if (this.index == -1) {
                this.currentInput = document.getElementById("monMessage").value;
            }
            this.index++;
            document.getElementById("monMessage").value = this.content[this.index];
            completion.reset();
        },
        suivant: function() {
            if (this.index == -1){
                return;
            }
            this.index--;
            if (this.index == -1) {
                document.getElementById("monMessage").value = this.currentInput;
            }
            else{
                document.getElementById("monMessage").value = this.content[this.index];
            }
            completion.reset();
        },
        ajouter: function() {
            this.content.splice(0, 0, document.getElementById("monMessage").value);
            this.index = -1;
        }
    }
    
    
    /** 
     *  Mapping des boutons de l'interface avec des fonctions du client.
     */
    document.getElementById("btnConnecter").addEventListener("click", connectLobby);
    document.getElementById("btnQuitterRoom").addEventListener("click", quitterRoom);
    document.getElementById("btnEnvoyerMessage").addEventListener("click", envoyerMessage);
	document.getElementById("btnCreateRoom").addEventListener("click",createRoom);
	document.getElementById("btnLancerPartie").addEventListener("click",lancerPartie);
	document.getElementById("btnLogout").addEventListener("click",quitter);
	document.getElementById("btnLeft").addEventListener("click",function(){swipeMain("left")});
	document.getElementById("btnRight").addEventListener("click",function(){swipeMain("right");});
    
    /**
     *  Ecouteurs clavier
     */
    document.getElementById("pseudo").addEventListener("keydown", function(e) {
        if (e.keyCode == 13) // touche entrée
            connectLobby();
    });
    document.getElementById("monMessage").addEventListener("keydown", function(e) {
        switch (e.keyCode) {
            case 9 : // tabulation
                e.preventDefault();     // empêche de perdre le focus
                completion.next();
                break;
            case 38 :   // fleche haut
                e.preventDefault();     // empêche de faire revenir le curseur au début du texte
                historique.precedent();
                break;
            case 40 :   // fleche bas
                e.preventDefault();     // par principe
                historique.suivant();
                break;
            case 13 :   // touche entrée
                envoyerMessage();
            default: 
                completion.reset();
        }
    });
	document.querySelector("#scroll").addEventListener("dblclick", function(e) {
        if (e.target.tagName == "LI") {
            rejoindreRoom(e.target.value);
        }
    });
    
});
    
