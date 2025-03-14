function show(id) {
    if(document.getElementById) {
        var div = document.getElementById(id);
        div.style.display = (div.style.display=='block'?'none':'block'); // Es wird überprüft, ob der aktuelle display-Wert des div-Elements 'block' ist. Wenn div.style.display gleich 'block' ist, wird der Wert auf 'none' gesetzt.
        //Wenn div.style.display nicht 'block' ist (also 'none' oder leer), wird der Wert auf 'block' gesetzt. Dies macht das Element sichtbar. 
    }
}

function hide(id) {
    if(document.getElementById) {
        var div = document.getElementById(id);
        div.style.display = (div.style.display=='block'?'none':'none'); // Es wird überprüft, ob der aktuelle display-Wert des div-Elements 'block' ist. Wenn div.style.display gleich 'block' ist, wird der Wert auf 'none' gesetzt.
        //Wenn div.style.display nicht 'block' ist (also 'none' oder leer), wird der Wert auf 'none' gesetzt. Dies macht das Element unsichtbar. 
    }
}

function selectBackground(imageUrl){
    hide('map-selection-Contents')
    localStorage.setItem('selectedBackground', imageUrl);
    show('player-name-choice')
}

function selectPlayername() {
    var player1 = document.getElementById('player1');
    var player2 = document.getElementById('player2');
    localStorage.setItem('player1', player1.value);
    localStorage.setItem('player2', player2.value);
    window.location = 'html/game.html' 
}