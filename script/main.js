document.getElementById('info').textContent = navigator.userAgent;
document.getElementById('url').textContent = window.location.href;

let finestraJoc = null;

let nomJugador = '';

let puntuacioActual = 0;

let canal = new BroadcastChannel('joc_de_les_parelles');

let botonComenzarPartida = document.getElementById('començar-partida');

botonComenzarPartida.addEventListener('click', iniciarPartida);


function actualitzaEstatPartida(estado) {
    if (estado === undefined) {
        estado = 'No hi ha cap partida en joc';
    }

    var estatPartidaElement = document.getElementById('estat-partida');

    if (estado === 'en joc') {
        var texto = 'NOM: ' + nomJugador + ', PUNTS: ' + puntuacioActual + ', ESTAT PARTIDA: ' + estado;
        estatPartidaElement.textContent = texto;
    } else {
        estatPartidaElement.textContent = estado;
    }
}


function iniciarPartida() {
    nomJugador = document.getElementById('nom-jugador').value;

    if (nomJugador === '') {
        alert('Introdueix un nom per començar la partida.');
    } else {
        document.cookie = 'nomJugador=' + nomJugador + '; path=/';

        if (!finestraJoc || finestraJoc.closed) {
            
            finestraJoc = window.open('joc.html', 'Joc de les Parelles', 'width=800,height=600');
            canal.postMessage({ tipus: 'iniciar', nomJugador: nomJugador });
            sessionStorage.setItem('estatPartida', 'jugant');
            actualitzaEstatPartida('en joc');

        } else {
            alert('Ja hi ha una partida en joc.');
        }
    }
}

// actualiza la puntuacio de la partida
canal.onmessage = function(event) {
    if (event.data.tipus === 'actualitzarPuntuacio') {
        puntuacioActual = event.data.puntuacio;
        actualitzaEstatPartida('en joc');
    }

    if (event.data.tipus === 'finalitzarPartida') {
        let estatfinal = `NOM: ${event.data.nomJugador}, PUNTS: ${event.data.puntuacio}, ESTAT PARTIDA: partida finalitzada`;
        actualitzaEstatPartida(estatfinal);
    }
};

document.getElementById('borrar-partida').addEventListener('click', resetPartida);

function resetPartida() {
    if (finestraJoc && !finestraJoc.closed) {
        finestraJoc.close();
    }
    sessionStorage.removeItem('estatPartida');
    puntuacioActual = 0;
    actualitzaEstatPartida(); 
}

let cookies = document.cookie; 
let nomJugadorCookie = '';

let cookiesArray = cookies.split('; ');


for (let i = 0; i < cookiesArray.length; i++) {
  let cookie = cookiesArray[i]; 
  if (cookie.indexOf('nomJugador=') === 0) { 
    nomJugadorCookie = cookie.substring('nomJugador='.length); 
    break; 
  }
}

let elementoNombreJugador = document.getElementById('nom-jugador-mostrar');

elementoNombreJugador.textContent = 'Jugador: ' + nomJugadorCookie;

// cambia el fons segons el navegador
let colorFons = '';

if (navigator.userAgent.includes('Chrome')) {
  colorFons = 'green';
} else {
  if (navigator.userAgent.includes('Firefox')) {
    colorFons = 'orange';
  } 
}

document.body.style.backgroundColor = colorFons;

sessionStorage.setItem('colorFons', colorFons);

let elementoPuntuacionMaxima = document.getElementById('puntuacio-maxima');

let puntuacionMaxima = sessionStorage.getItem('puntuacioMaxima') || 0;

elementoPuntuacionMaxima.textContent = puntuacionMaxima;

window.addEventListener('beforeunload', () => {
    canal.postMessage({ tipus: 'acabarPartida', puntuacio: puntuacioActual });
    sessionStorage.removeItem('estatPartida');
});

// mostra les instruccions 
document.getElementById('instruccions').addEventListener('click', () => {
    let instruccions = window.open('', 'Instruccions', 'width=400,height=400');
    instruccions.document.write(`
        <h2>Instruccions del joc</h2>
        <p>Aquest és un joc de memòria</p>
        <button onclick="window.close()">Tancar</button>
    `);
});

if (sessionStorage.getItem('estatPartida')) {
    actualitzaEstatPartida('en joc');
}
