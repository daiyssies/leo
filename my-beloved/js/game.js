let game;
let scene;
let texto, leo, npc;
let pasos = [];
let esperandoClick = false;
let currentStep = 0;
let fuenteCargada = false;
let speakerActual = null;
let textoTimer = null;

// 🎨 Carga de fuente
document.fonts.load('10pt "Press Start 2P"').then(() => {
  fuenteCargada = true;
  console.log('Fuente cargada');
});

// 🎮 Inicia el juego al presionar el botón
document.getElementById('start-button').addEventListener('click', () => {
  if (!fuenteCargada) {
    alert('La fuente aún se está cargando. Intenta en un momento...');
    return;
  }
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  startGame();
});

function startGame() {
  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
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
    'conejito', 'florecita', 'fresita', 'gatito',
    'estrella', 'carta', 'caja_chocolates', 'niña_fresita', 'libro'
  ];

  npcs.forEach(name => {
    this.load.image(name, `js/assets/${name}.png`);
  });
}

function create() {
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;

  scene.add.image(centerX, centerY, 'background');
  leo = scene.add.image(120, scene.scale.height - 190, 'leo-serio').setScale(0.7);

  scene.input.on('pointerdown', () => {
    if (!esperandoClick) return;
    esperandoClick = false;

    if (pasos.length > 0) {
      const paso = pasos.shift();
      paso();
    }
  });

  iniciarHistoria();
}

function mostrarTextoConFondo(mensaje, velocidad = 30, callback = null, backgroundColor = null) {
  const padding = 20;
  const boxWidth = scene.scale.width - 40;

  if (textoTimer) {
    textoTimer.remove(false);
    textoTimer = null;
  }

  if (scene.textoFondo) scene.textoFondo.destroy();
  if (texto) texto.destroy();

  const colores = {
    leo: 0xc3e3fd,
    conejito: 0xffd4d4,
    florecita: 0xffe8a3,
    fresita: 0xffb0c1,
    gatito: 0xc2d4ff,
    estrella: 0xfde68a,
    carta: 0xd4c4ff,
    caja_chocolates: 0xd0b49f,
    niña_fresita: 0xfdc3c3,
    libro: 0xd0f0c0,
    yopi: 0xfdf4ff
  };

  const color = backgroundColor ?? colores[speakerActual] ?? 0x8cb1dc;

  texto = scene.add.text(0, 0, '', {
    fontFamily: '"Press Start 2P"',
    fontSize: '16px',
    color: '#ffffff',
    wordWrap: { width: boxWidth - padding * 2 },
    lineSpacing: 7,
    stroke: '#000000',
    strokeThickness: 3
  }).setResolution(4);

  const tempText = scene.add.text(0, 0, mensaje, texto.style).setVisible(false);
  const textHeight = tempText.height;
  tempText.destroy();

  const fondo = scene.add.graphics();
  fondo.fillStyle(color, 1);
  fondo.fillRoundedRect(0, 0, boxWidth, textHeight + padding * 2, 10);
  fondo.lineStyle(4, 0xffffff, 1);
  fondo.strokeRoundedRect(0, 0, boxWidth, textHeight + padding * 2, 10);

  const contenedor = scene.add.container(20, 30, [fondo, texto]);
  texto.setPosition(padding, padding);

  scene.textoFondo = contenedor;

  let i = 0;
  textoTimer = scene.time.addEvent({
    delay: velocidad,
    callback: () => {
      texto.text += mensaje[i];
      i++;
      if (i === mensaje.length) {
        textoTimer.remove();
        textoTimer = null;
        esperandoClick = true;
        scene.input.once('pointerdown', () => {
          esperandoClick = false;
          contenedor.destroy();
          if (callback) callback();
          else if (pasos.length > 0) pasos.shift()();
        });
      }
    },
    loop: true
  });
}

function mostrarTextoDe(nombre, mensaje) {
  speakerActual = nombre;
  pasos.push(() => mostrarTextoConFondo(mensaje));
}

function mostrarNPC(nombre, x = null, y = null) {
  if (npc) npc.destroy();
  const finalX = leo.x + 170;
  const finalY = leo.y + 65;

  npc = scene.add.image(x ?? scene.scale.width + 100, y ?? finalY, nombre).setScale(0.3);
  scene.tweens.add({
    targets: npc,
    x: finalX,
    duration: 1000,
    ease: 'Power2'
  });
}

function crearPasosDialogo(personaje, ...lineas) {
  pasos.push(() => {
    if (npc) npc.destroy();
    speakerActual = personaje;
    leo.setTexture('leo-serio');
    mostrarNPC(personaje);
  });

  lineas.forEach((linea, i) => {
    pasos.push(() => {
      if (i === lineas.length - 1) {
        leo.setTexture('leo-sonriente');
      }
      mostrarTextoConFondo(linea);
    });
  });
}


function iniciarHistoria() {
  pasos = [];

  // Paso 1: Yopi aparece
  speakerActual = 'yopi';
  pasos.push(() => {
    leo.setTexture('leo-feli');
    mostrarTextoConFondo("¡Leito! Ahí estás...");
  });

  pasos.push(() => {
    mostrarTextoConFondo("Te estaba buscando.");
  });

  // Paso 2: Conejito aparece
  crearPasosDialogo(
    'conejito',
    "¡Hola, Leo!",
    "Tengo que pasarte un mensaje importante...",
    "Es de tu novio Alec...",
    "Me pidió que te recordara lo mucho que te ama."
  );

  mostrarTextoDe('leo', "¡Eso fue muy tierno!");

  // Paso 3: Yopi dice sorpresa
  mostrarTextoDe('yopi', "¡Te tengo una sorpresa!");

  // Luego puedes seguir agregando más pasos con `crearPasosDialogo()` y `mostrarTextoDe()`.

  if (pasos.length > 0) pasos.shift()();
}
