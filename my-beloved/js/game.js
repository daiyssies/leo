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
  const leoX = 120;
  const leoY = scene.scale.height - 190;
  leo = scene.add.image(leoX, leoY, 'leo-serio').setScale(0.7);

  const isMobile = window.innerWidth < 600;
  const textoWidth = scene.scale.width - 40;

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

function mostrarTextoConFondo(message, speed = 30, callback = null) {
  const padding = 20;
  const boxWidth = scene.scale.width - 40;
  const isMobile = scene.scale.width < 800;

  if (scene.textoFondo) scene.textoFondo.destroy();
  if (texto) texto.destroy();

  texto = scene.add.text(0, 0, '', {
    fontFamily: '"Press Start 2P"',
    fontSize: 16,
    color: '#ffffff',
    wordWrap: { width: boxWidth - padding * 2 },
    lineSpacing: 7,
    stroke: '#000000',
    strokeThickness: 3
  }).setResolution(4);

  const tempText = scene.add.text(0, 0, message, texto.style).setWordWrapWidth(boxWidth - padding * 2).setVisible(false);
  const textHeight = tempText.height;
  const textWidth = boxWidth;

  const fondo = scene.add.graphics();
  fondo.fillStyle(0x8cb1dc, 1);
  fondo.fillRoundedRect(0, 0, textWidth, textHeight + padding * 2, 10); // ← el 20 es el radio de la esquina
  fondo.lineStyle(4, 0xffffff, 1); // grosor, color, opacidad
fondo.strokeRoundedRect(0, 0, textWidth, textHeight + padding * 2, 10);


  fondo.setScrollFactor(0);

  const contenedor = scene.add.container(20, 30, [fondo, texto]);
  texto.setPosition(padding, padding);

  scene.textoFondo = contenedor;
  tempText.destroy();

  let i = 0;
  let timer = scene.time.addEvent({
    delay: speed,
    callback: () => {
      texto.text += message[i];
      i++;
      if (i === message.length) {
        timer.remove();
        esperandoClick = true;
        scene.input.once('pointerdown', () => {
          esperandoClick = false;
          contenedor.destroy();
          if (callback) callback();
        });
      }
    },
    loop: true
  });
}

function escribirTexto(textObject, message, speed = 30, callback) {
  mostrarTextoConFondo(message, speed, callback);
}

function mostrarNPC(key, x = null, y = null, finalX = null) {
  if (npc) npc.destroy();

  const defaultX = leo.x + 170;
  const defaultY = leo.y + 65;
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
      escribirTexto(texto, "¡Leito! Ahí estás...");
      break;
    case 2:
      leo.setTexture('leo-feli');
      escribirTexto(texto, "Te estaba buscando");
      pasos.push(() => escribirTexto(texto, "¡Te tengo una sorpresa!"));
      break;
    case 3:
      dialogoNPC(
        'conejito',
        "¡Mira quién viene ahí...!",
        "¡Hola, Leo! Brinqué hasta aquí solo para pasarte un mensaje importante.",
        "Es de tu novio Alec",
        "Me pidió que te recordara lo mucho que te ama",
        "¡Eso fue muy tierno!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 4:
      dialogoNPC(
        'florecita',
        "¡Hola, Leito!",
        "Mis pétalos son tan suaves como el amor que te tienen",
        "¡Qué bonito!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 5:
      dialogoNPC(
        'fresita',
        "¡Tú eres más dulce que yo!",
        "Y eso que soy una fresita...",
        "Awww"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 6:
      dialogoNPC(
        'gatito',
        "Miau~",
        "Incluso en los días grises...",
        "Tú haces que todo se sienta más cálido",
        "¡Gracias, minino!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 7:
      dialogoNPC(
        'estrella',
        "Hola, Leo",
        "Brillas más de lo que crees. Alguien te ve como su luz.",
        "¡Qué palabras tan bonitas!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 8:
      dialogoNPC(
        'carta',
        "¡Toma esto!",
        "Esta cartita guarda una promesa",
        "...una promesita sembrada en papel,",
        "que florece cada vez que me piensas",
        "¡Puedes reclamarla al terminar!"
        "¡Me la voy a guardar siempre!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 9:
      dialogoNPC(
        'caja_chocolates',
        "¡Un regalito!",
        "No solo son dulces, llevan besitos escondidos...",
        "Pero no le digas a nadie :]",
        "¡Jajaja, qué dulce!"
      );
      if (pasos.length > 0) pasos.shift()();
      break;
    case 10:
      dialogoNPC(
        'niña_fresita',
        "¡Hola, lindo Leo!",
        "Alguien me dijo que...",
        "¡Que eres su persona favorita en todo el universo!",
        "Me pregunto quién será..."
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
      escribirTexto(texto, "Querido Leo: Gracias por existir. Gracias por ser tú. Eres lo mejor que me ha pasado y siempre quiero cuidarte.");
      break;
    case 14:
      escribirTexto(texto, "Fin de la demo. Toca la pantalla para volver a empezar.");
      break;
    case 15:
      location.reload();
      break;
    default:
      break;
  }
}
