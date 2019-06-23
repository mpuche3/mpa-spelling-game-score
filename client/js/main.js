let socket = {};
let word = {};
let DOM = {};
const url = "https://spelling-game-score-mpuche3.c9users.io/pics/";
window.onload = function () {

    socket = (function () {
        try {
            let socket = io.connect(); /*global io*/ 
            socket.on("definition", (obj) => {
                console.log(obj.definition);
                DOM.definition.innerHTML = obj.definition;
            });
            socket.on("words", (obj) => {
                console.log(obj.words);        
                word.words = obj.words;
                DOM.startGame.style.display = "block";
            });
            return socket;
        } catch (error) {
            console.log(error);
        }
    })();
    
    word = {
        words: {},
        num: -1,
        getNewWord: function () {
            this.num += 1;
            if (this.words.length < this.num + 1) this.num = 0;
            this.fileName = this.words[this.num].fileName;
            this.score = this.words[this.num].score;
            this.id = this.fileName.split(".")[0];
            this.url = url + this.fileName;
            this.shuffled = this.shuffle(this.id, 15),
            this.soFar = "";
            this.definition = this.words[this.num].definition;
            if (!this.definition) {
                this.definition = "";
                socket.emit("definition", {"word": this.id});
            }
        },
        shuffle: function(word, len) {
            while (word.length < len ) word += " ";
            var arr = word.split("");
            var x, i, j;
            for (i = arr.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = arr[i];
                arr[i] = arr[j];
                arr[j] = x;
            }
            return arr.join("");
        },
        checkWord: function() {
            if (DOM.word.innerHTML.trim().toUpperCase() === word.id.toUpperCase()) {
                word.deltaScore(+20);
                DOM.word.style.color = "green";
                DOM.lettersContainer.style.display = "none";
                DOM.image.style.display = "block";
                var msg = new SpeechSynthesisUtterance(word.id);
                window.speechSynthesis.speak(msg);
                socket.emit("updateScore", {
                    fileName: word.words[word.num].fileName,
                    score: word.score
                });
            }
        },
        deltaScore: function (num) {
            this.score = Number(this.score) + Number(num);
            DOM.score.innerHTML = "score: " + this.score;
        },
    };

    DOM = (function getDOM () {
        let DOM = {};
        let allDOM = document.getElementsByTagName("*");
        for (let i=0; i<allDOM.length; i++){
            if (allDOM[i].id !== ""){
                DOM[allDOM[i].id] = allDOM[i];
            }
        }
        return DOM;
    })();

    (function addEventListenerToButtonLetters () {
        for (let i=1; i<16; i++) {
            DOM["bttn_" + i].addEventListener("click", function () {
                DOM.word.innerHTML += this.value;
                this.style.visibility = "hidden";
                word.checkWord();
            });
        }
    })();

    DOM.startGame.addEventListener("click", () => {
        word.getNewWord();
        word.deltaScore(0);
        DOM.welcomeScreen.style.display = "none";
        DOM.gameScreen.style.display = "block";
        for (let i=1; i<16; i++) DOM["bttn_" + i].value = word.shuffled[i-1];
        DOM.word.style.color = "black";
        DOM.image.style.display = "none";
        DOM.image.setAttribute ("src", word.url);
        DOM.word.innerHTML = "";
        DOM.word.style.background = "white";
        DOM.lettersContainer.style.display = "block";
        DOM.definition.innerHTML = word.definition;
    });

    DOM.bonusAdd.addEventListener("click", () => {
        word.deltaScore(-5);
        DOM.bonusRefresh.click();
        const n = word.soFar.length;
        const letter = word.id[n];
        word.soFar += letter;
        for (let i=1; i<16; i++) {
            if (DOM["bttn_" + i].value.toUpperCase() === letter.toUpperCase()) {
                if (DOM["bttn_" + i].style.backgroundColor !== "rgb(0, 0, 0)") {
                    DOM["bttn_" + i].style.backgroundColor = "rgb(0, 0, 0)";
                    DOM.word.innerHTML = word.soFar;
                    break;
                }
            }
        }
        word.checkWord();
    });

    DOM.bonusPronounce.addEventListener("click", () => {
        word.deltaScore(-5);
        var msg = new SpeechSynthesisUtterance(word.id); /*global SpeechSynthesisUtterance*/
        window.speechSynthesis.speak(msg);
    });

    DOM.bonusFlash.addEventListener("click", () => {
        word.deltaScore(-5);
        let tmp = DOM.word.innerHTML;
        DOM.word.innerHTML = word.id;
        setTimeout(()=>{DOM.word.innerHTML = tmp;}, 200);
    });

    DOM.bonusImage.addEventListener("click", () => {
        word.deltaScore(-2);
        DOM.image.style.display = "block";
        DOM.lettersContainer.style.display = "none";
        DOM.definition.style.display = "none";
        setTimeout(()=>{
            DOM.image.style.display = "none";
            DOM.lettersContainer.style.display = "block";
            DOM.definition.style.display = "block";
        }, 1500);
    });

    DOM.bonusRefresh.addEventListener("click", () => {
        word.deltaScore(-1);
        DOM.word.innerHTML = word.soFar;
        for (let i=1; i<16; i++) {
            DOM["bttn_" + i].style.visibility = "visible";
        }
    });

    DOM.image.addEventListener("click", () => {
        DOM.startGame.click();
        for (let i=1; i<16; i++) {
            DOM["bttn_" + i].style.visibility = "visible";
            DOM["bttn_" + i].style.backgroundColor = "rgb(200, 200, 200)";
        }
    });
};



