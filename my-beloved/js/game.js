let game;
let currentStep = 0;
let texto, leo, npc;
let scene;

let esperandoClick = false;
let pasos = [];

document.fonts.load('25pt "Press Start 2P"').then(startGame);

document.getElementById('start-button').addEventListener('click', () => {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  startGame();
});

function startGame() {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    render: {
      pixelArt: true,
      roundPixels: true
    },
    scene: {
      preload,
      create
    }
  };
  game = new Phaser.Game(config);
}

function preload() {
  scene = this;
  this.load.image('background', 'js/assets/fondo.png');

  // Leo
  this.load.image('leo-serio', 'js/assets/character/leo_serio.png');
  this.load.image('leo-feli', 'js/assets/character/leo_feli.png');
  this.load.image('leo-sonriente', 'js/assets/character/leo_sonriente.png');

  // NPCs
  const npcs = [
    'conejito',
    'florecita',
    'fresita',
    'gatito',
    'estrella',
    'carta',
    'caja_chocolates',
    'niña_fresita',
    'libro'
  ];

  npcs.forEach(name => {
    this.load.image(name, `js/assets/${name}.png`);
  });
}

function create() {
  scene.add.image(400, 300, 'background');
  leo = scene.add.image(400, 400, 'leo-serio').setScale(0.7);

  // Escala adaptativa para móviles
  const isMobile = window.innerWidth < 600;
const fontSize = isMobile ? '32px' : '22px';
const wrapWidth = isMobile ? 500 : 700;

texto = scene.add.text(50, 50, '', {
  fontFamily: '"VT323"',
  fontSize: isMobile ? '48px' : '28px',
  color: '#6b4d9d',
  wordWrap: { width: wrapWidth }
}).setResolution(2);

  scene.input.on('pointerdown', () => {
    if (!esperandoClick) return;
    esperandoClick = false;

    if (pasos.length > 0) {
      const paso = pasos.shift();
      paso();
    } else {
      avanzarHistoria();
    }
  });

  avanzarHistoria();
}

function escribirTexto(textObject, message, speed = 30, callback) {
  textObject.setText('');
  let i = 0;
  let timer = scene.time.addEvent({
    delay: speed,
    callback: () => {
      textObject.text += message[i];
      i++;
      if (i === message.length) {
        timer.remove();
        esperandoClick = true;
        if (callback) callback();
      }
    },
    loop: true
  });
}

function mostrarNPC(key, x = 800, y = 485, finalX = 600) {
  if (npc) npc.destroy();
  npc = scene.add.image(x, y, key).setScale(0.3);
  scene.tweens.add({
    targets: npc,
    x: finalX,
    duration: 1000,
    ease: 'Power2'
  });
}

function dialogoNPC(key, saludo, mensaje, reaccion) {
  pasos.push(() => {
    if (npc) npc.destroy();
    leo.setTexture('leo-serio');
    mostrarNPC(key);
    escribirTexto(texto, saludo);
  });
  pasos.push(() => {
    escribirTexto(texto, mensaje);
  });
  pasos.push(() => {
    leo.setTexture('leo-sonriente');
    escribirTexto(texto, reaccion);
  });
}

function avanzarHistoria() {
  currentStep++;

  switch (currentStep) {
    case 1:
      escribirTexto(texto, "¡Leito! Ahí estás...");
      break;
    case 2:
      leo.setTexture('leo-feli');
      escribirTexto(texto, "Te estaba buscando, ¡te tengo una sorpresa!");
      break;
    case 3:
      dialogoNPC(
        'conejito',
        "¡Mira quién viene ahí...!",
        "¡Hola Leo! Brinqué hasta aquí solo para decirte que eres muy amado 💕.",
        "¡Eso fue muy tierno!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 4:
      dialogoNPC(
        'florecita',
        "¡Hola Leo! 🌼",
        "Este pétalo es suave como el cariño que te tienen... y perfumadito como tú.",
        "¡Qué bonito detalle!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 5:
      dialogoNPC(
        'fresita',
        "¡Tú eres más dulce que yo!",
        "Así que vine a darte un abrazo invisible 🍓✨.",
        "Awww 🥺💗"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 6:
      dialogoNPC(
        'gatito',
        "Miau~",
        "Incluso en los días grises, tú haces que todo se sienta más cálido 🐾.",
        "¡Gracias, minino!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 7:
      dialogoNPC(
        'estrella',
        "Hola Leo ✨",
        "Brillas más de lo que crees. Alguien te ve como su luz.",
        "¡Qué palabras tan bonitas!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 8:
      dialogoNPC(
        'carta',
        "¡Toma esto!",
        "Esta cartita guarda una promesa: la de nunca soltarte el corazón 💌.",
        "¡Me la voy a guardar siempre!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 9:
      dialogoNPC(
        'caja_chocolates',
        "¡Un regalito~!",
        "No solo son dulces, llevan besitos escondidos... pero no le digas a nadie 🍫😘.",
        "¡Jajaja, qué dulce!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 10:
      dialogoNPC(
        'niña_fresita',
        "¡Hola Leo!",
        "Alguien me dijo que eres su persona favorita en todo el universo 💗.",
        "¡Eso me llena el corazón!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 11:
      escribirTexto(texto, "Ah… espera, hay algo más...");
      break;
    case 12:
      mostrarNPC('libro', 400, 700, 400);
      scene.tweens.add({
        targets: npc,
        y: 350,
        duration: 1000,
        ease: 'Power2'
      });
      escribirTexto(texto, "Un librito apareció, y en él está escrito todo lo que te quiero decir.");
      break;
    case 13:
      escribirTexto(texto, "Querido Leo: Gracias por existir. Gracias por ser tú. Eres lo mejor que me ha pasado y siempre quiero cuidarte 💖.");
      break;
    case 14:
      texto.setFontSize(10);
      escribirTexto(texto, "🎁 Fin de la demo. Toca la pantalla para volver a empezar.");
      break;
    case 15:
      location.reload(); // reiniciar la historia
      break;
    default:
      break;
  }
}
