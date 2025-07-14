let game;
let currentStep = 0;
let texto, leo, npc;
let scene;
let textoTimer = null; // ← este controlará el timer de escritura


let esperandoClick = false;
let pasos = [];
let fuenteCargada = false;
let speakerActual = null;

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

function mostrarTextoConFondo(message, speed = 30, callback = null, backgroundColor = null) {
  const padding = 20;
  const boxWidth = scene.scale.width - 40;

  // Cancelar cualquier timer anterior
  if (textoTimer) {
    textoTimer.remove(false);
    textoTimer = null;
  }

  // Eliminar texto anterior
  if (scene.textoFondo) scene.textoFondo.destroy();
  if (texto) texto.destroy();

  const coloresPorPersonaje = {
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

  const color = backgroundColor !== null
    ? backgroundColor
    : coloresPorPersonaje[speakerActual] || 0x8cb1dc;

  const estiloTexto = {
    fontFamily: '"Press Start 2P"',
    fontSize: '16px',
    color: '#ffffff',
    wordWrap: { width: boxWidth - padding * 2 },
    lineSpacing: 7,
    stroke: '#000000',
    strokeThickness: 3
  };

  texto = scene.add.text(0, 0, '', estiloTexto).setResolution(4);

  const tempText = scene.add.text(0, 0, message, estiloTexto).setWordWrapWidth(boxWidth - padding * 2).setVisible(false);
  const textHeight = tempText.height;
  const textWidth = boxWidth;
  tempText.destroy();

  const fondo = scene.add.graphics();
  fondo.fillStyle(color, 1);
  fondo.fillRoundedRect(0, 0, textWidth, textHeight + padding * 2, 10);
  fondo.lineStyle(4, 0xffffff, 1);
  fondo.strokeRoundedRect(0, 0, textWidth, textHeight + padding * 2, 10);
  fondo.setScrollFactor(0);

  const contenedor = scene.add.container(20, 30, [fondo, texto]);
  texto.setPosition(padding, padding);

  scene.textoFondo = contenedor;

  let i = 0;
  textoTimer = scene.time.addEvent({
    delay: speed,
    callback: () => {
      texto.text += message[i];
      i++;
      if (i === message.length) {
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



function escribirTexto(textObject, message, speed = 30, callback = null, backgroundColor = null) {
  mostrarTextoConFondo(message, speed, callback, backgroundColor);
}

function mostrarOpciones(textoPregunta, opciones) {
  const ancho = scene.scale.width;
  const alto = scene.scale.height;

  const fondo = scene.add.rectangle(ancho / 2, alto / 2 + 100, 300, 120, 0x000000, 0.7)
    .setOrigin(0.5)
    .setStrokeStyle(2, 0xffffff);

  const texto = scene.add.text(ancho / 2, alto / 2 + 60, textoPregunta, {
    fontFamily: '"Press Start 2P"',
    fontSize: 12,
    color: '#ffffff',
    align: 'center',
    wordWrap: { width: 280 },
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5).setResolution(4);

  const botones = [];

  opciones.forEach((opcion, index) => {
    const btn = scene.add.text(ancho / 2 + (index === 0 ? -60 : 60), alto / 2 + 120, opcion.texto, {
      fontFamily: '"Press Start 2P"',
      fontSize: 10,
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: { left: 6, right: 6, top: 4, bottom: 4 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setResolution(4);

    btn.on('pointerdown', () => {
      fondo.destroy();
      texto.destroy();
      botones.forEach(b => b.destroy());
      opcion.accion();
    });

    botones.push(btn);
  });

  scene.children.bringToTop(fondo);
  scene.children.bringToTop(texto);
  botones.forEach(btn => scene.children.bringToTop(btn));
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

function dialogoNPC(key, ...lineas) {
  speakerActual = key;
  pasos.push(() => {
    if (npc) npc.destroy();
    leo.setTexture('leo-serio');
    mostrarNPC(key);
  });

  lineas.forEach((linea, index) => {
    pasos.push(() => {
      if (index === lineas.length - 1) {
        leo.setTexture('leo-sonriente');
      }
      escribirTexto(texto, linea);
    });
  });
}

function avanzarHistoria() {
  currentStep++;

  switch (currentStep) {
    case 1:
      pasos.push(() => {
        speakerActual = 'yopi';
        escribirTexto(texto, "¡Leito! Ahí estás...");
      });
      pasos.push(() => {
        speakerActual = 'yopi';
        leo.setTexture('leo-feli');
        escribirTexto(texto, "Te estaba buscando");
      });
      pasos.push(() => {
        speakerActual = 'yopi';
        escribirTexto(texto, "Tengo algo que mostrarte...");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 2:
      dialogoNPC(
        'conejito',
        "¡Hola, Leo!",
        "Tengo que pasarte un mensaje importante",
        "Es de tu novio Alec...",
        "Me pidió que te recordara lo mucho que te ama"
      );
      pasos.push(() => {
        speakerActual = 'leo';
        escribirTexto(texto, "¡Eso fue muy tierno!");
      });
      pasos.push(() => {
        speakerActual = 'yopi';
        escribirTexto(texto, "¿Viste? Te dije que era una sorpresa.");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 3:
      dialogoNPC(
        'florecita',
        "¡Hola, Leito!",
        "Mis pétalos son tan suaves...",
        "¡Como el amor que te tienen!"
      );
      pasos.push(() => {
        speakerActual = 'leo';
        escribirTexto(texto, "¡Qué bonito!");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 4:
      dialogoNPC(
        'fresita',
        "LEO",
        "¡Tú eres más dulce que yo!",
        "Y eso que soy una fresita..."
      );
      pasos.push(() => {
        speakerActual = 'leo';
        escribirTexto(texto, "Awww");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 5:
      dialogoNPC(
        'gatito',
        "Miau~",
        "Incluso en los días grises...",
        "Tú haces que todo se sienta más cálido"
      );
      pasos.push(() => {
        speakerActual = 'leo';
        escribirTexto(texto, "¡Gracias, minino!");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 6:
      dialogoNPC(
        'estrella',
        "Hola, Leo",
        "Brillas más de lo que crees",
        "Alguien te ve como su luz"
      );
      pasos.push(() => {
        speakerActual = 'leo';
        escribirTexto(texto, "¡Qué palabras tan bonitas!");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 7:
      dialogoNPC(
        'carta',
        "¡Toma esto!",
        "Esta cartita guarda una promesa",
        "...una promesa sembrada en papel,",
        "que florece cada vez que me piensas",
        "¡Puedes reclamarla al terminar!"
      );
      pasos.push(() => {
        speakerActual = 'leo';
        escribirTexto(texto, "¡Sin duda lo haré!");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 8:
      dialogoNPC(
        'caja_chocolates',
        "¡Un regalito!",
        "No solo son dulces",
        "Llevan besitos escondidos...",
        "Pero no le digas a nadie :]"
      );
      pasos.push(() => {
        speakerActual = 'leo';
        escribirTexto(texto, "¡Jajaja, qué dulce!");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 9:
      dialogoNPC(
        'niña_fresita',
        "¡Hola, lindo Leo!",
        "Alguien me dijo que...",
        "¡Eres su persona favorita en todo el mundo!"
      );
      pasos.push(() => {
        speakerActual = 'leo';
        escribirTexto(texto, "Me pregunto quién será...");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 10:
      pasos.push(() => {
        speakerActual = 'yopi';
        escribirTexto(texto, "Ah… espera, hay algo más...");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 11:
      pasos.push(() => {
        if (leo) leo.setVisible(false);
        mostrarNPC('libro', scene.scale.width / 2, scene.scale.height + 100, scene.scale.width / 2);
        scene.tweens.add({
          targets: npc,
          y: scene.scale.height / 2,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
            speakerActual = 'yopi';
            escribirTexto(texto, "Un librito apareció", 30, () => {
              esperarClickYMostrarOpciones();
            });
          }
        });
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 12:
      // vacío, se maneja desde las opciones
      break;

    case 13:
      pasos.push(() => {
        speakerActual = 'yopi';
        escribirTexto(texto, "Toca la pantalla para volver a empezar.");
      });
      if (pasos.length > 0) pasos.shift()();
      break;

    case 14:
      location.reload();
      break;

    default:
      break;
  }
}
