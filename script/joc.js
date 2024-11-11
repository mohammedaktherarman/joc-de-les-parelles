document.getElementById('instruccions').addEventListener('click', () => {
    let instruccions = window.open('', 'Instruccions', 'width=400,height=400');
    instruccions.document.write(`
        <h2>Instruccions del joc</h2>
        <p>Aquest és un joc de memòria</p>
        <button onclick="window.close()">Tancar</button>
    `);
});

let canal = new BroadcastChannel('joc_de_les_parelles');

let cookies = document.cookie; 
let nomJugador = ''; 

let cookiesArray = cookies.split('; ');

for (let i = 0; i < cookiesArray.length; i++) {
  let cookie = cookiesArray[i]; 
  if (cookie.indexOf('nomJugador=') === 0) { 
    nomJugador = cookie.substring('nomJugador='.length); 
    break; 
  }
}

let elementoNombreJugador = document.getElementById('nom-jugador-mostrar');

elementoNombreJugador.textContent = nomJugador;


let puntuacio = 0;
let puntuacioMaxima = localStorage.getItem('puntuacioMaxima');
if (puntuacioMaxima === null) {
  puntuacioMaxima = 0; 
}

let nomPuntuacioMaxima = localStorage.getItem('nomPuntuacioMaxima');
if (nomPuntuacioMaxima === null) {
  nomPuntuacioMaxima = '';
}

document.getElementById('puntuacio-maxima').textContent = `NOM: ${nomPuntuacioMaxima}, PUNTS: ${puntuacioMaxima}`;
document.getElementById('puntuacio-actual').textContent = puntuacio;

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

// creacio de la tabla de joc
let tauler = document.getElementById('tauler-joc');

let cartes = [];

for (let i = 0; i < 10; i++) {
  cartes.push(i);
  cartes.push(i);
}

for (let i = cartes.length - 1; i > 0; i--) {
  let j = Math.floor(Math.random() * (i + 1));
  let temp = cartes[i];
  cartes[i] = cartes[j];
  cartes[j] = temp;
}

let primeraCarta = null;

for (let i = 0; i < cartes.length; i++) {
  let carta = document.createElement('button');
  carta.textContent = '';
  carta.setAttribute('data-num', cartes[i]);
  carta.setAttribute('data-index', i);
  carta.addEventListener('click', function() {
    revelarCarta(carta);
  });
  tauler.appendChild(carta);
}

function revelarCarta(carta) {
  carta.textContent = carta.getAttribute('data-num');

  if (primeraCarta === null) {
    primeraCarta = carta;
  } else {
    if (primeraCarta.getAttribute('data-num') === carta.getAttribute('data-num') && primeraCarta !== carta) {
      puntuacio += 10;
      primeraCarta.disabled = carta.disabled = true;
      primeraCarta = null;
    } else {
      puntuacio = Math.max(0, puntuacio - 3);
      let carta1 = primeraCarta;
      let carta2 = carta;
      setTimeout(function() {
        carta1.textContent = '';
        carta2.textContent = '';
        primeraCarta = null;
      }, 500);
    }
    actualizarPuntuacio();
  }
}

function actualizarPuntuacio() {
    document.getElementById('puntuacio-actual').textContent = puntuacio;
    canal.postMessage({ tipus: 'actualitzarPuntuacio', puntuacio: puntuacio });

    if (puntuacio > puntuacioMaxima) {
        puntuacioMaxima = puntuacio;
        nomPuntuacioMaxima = nomJugador;
        localStorage.setItem('puntuacioMaxima', puntuacioMaxima);
        localStorage.setItem('nomPuntuacioMaxima', nomJugador);
        document.getElementById('puntuacio-maxima').textContent = `NOM: ${nomPuntuacioMaxima}, PUNTS: ${puntuacioMaxima}`;
    }

    if ([...tauler.querySelectorAll('button')].every(btn => btn.disabled)) {
        canal.postMessage({ tipus: 'acabarPartida', puntuacio: puntuacio });

        canal.postMessage({ 
            tipus: 'finalitzarPartida', 
            nomJugador: nomJugador,
            puntuacio: puntuacio 
        });

        // redirrecio quan finalitza el joc
        window.location.assign("jocfinalitzat.html");
    }
}

