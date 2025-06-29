let game;
let currentStep = 0;
let texto, leo, npc;
let scene;

let esperandoClick = false;
let pasos = [];

let fuenteCargada = false;

// Cargar fuente
document.fonts.load('10pt "Press Start 2P"').then(() => {
  fuenteCargada = true;
  console.log('Fuente lista para usarse');
});

document.getElementById('start-button').addEventListener('click', () => {
  if (!fuenteCargada) {
    alert('Esperando que la fuente se cargue, por favor intenta en un momento...');
    return;
  }
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  startGame();
});

function startGame() {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  const config = {
    type: Phaser.AUTO,
    width: canvasWidth,
    height: canvasHeight,
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

  this.load.image('leo-serio', 'js/assets/character/leo_serio.png');
  this.load.image('leo-feli', 'js/assets/character/leo_feli.png');
  this.load.image('leo-sonriente', 'js/assets/character/leo_sonriente.png');

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
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;

  scene.add.image(centerX, centerY, 'background');
  const leoX = 150;
  const leoY = scene.scale.height - 150;
  leo = scene.add.image(leoX, leoY, 'leo-serio').setScale(0.7);

  const isMobile = window.innerWidth < 600;
  const textoWidth = scene.scale.width - 40;
  const fontSize = isMobile ? '25px' : '16px';

  texto = scene.add.text(20, 20, '', {
    fontFamily: '"Press Start 2P"',
    fontSize: fontSize,
    color: '#6b4d9d',
    wordWrap: { width: textoWidth },
    lineSpacing: 8
  }).setResolution(1);

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

function mostrarNPC(key, x = null, y = null, finalX = null) {
  if (npc) npc.destroy();

  // Si no vienen coordenadas, ubicamos NPC a la derecha de Leo con espacio
  const defaultX = leo.x + 150;
  const defaultY = leo.y;
  const targetX = finalX !== null ? finalX : defaultX;

  npc = scene.add.image(x !== null ? x : scene.scale.width + 100, y !== null ? y : defaultY, key).setScale(0.3);
  scene.tweens.add({
    targets: npc,
    x: targetX,
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
      texto.setFontSize(18);
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
      mostrarNPC('libro', scene.scale.width / 2, scene.scale.height + 100, scene.scale.width / 2);
      scene.tweens.add({
        targets: npc,
        y: scene.scale.height / 2,
        duration: 1000,
        ease: 'Power2'
      });
      escribirTexto(texto, "Un librito apareció, y en él está escrito todo lo que te quiero decir.");
      break;
    case 13:
      texto.setFontSize(10);
      escribirTexto(texto, "Querido Leo: Gracias por existir. Gracias por ser tú. Eres lo mejor que me ha pasado y siempre quiero cuidarte 💖.");
      break;
    case 14:
      texto.setFontSize(10);
      escribirTexto(texto, "🎁 Fin de la demo. Toca la pantalla para volver a empezar.");
      break;
    case 15:
      location.reload();
      break;
    default:
      break;
  }
}
