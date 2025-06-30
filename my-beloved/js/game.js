let game;
let currentStep = 0;
let texto, leo, npc;
let scene;

let esperandoClick = false;
let pasos = [];
let fuenteCargada = false;
let speakerActual = null; // Nuevo: para controlar el hablante

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
  fondo.fillStyle(color, 1);
  fondo.fillRoundedRect(0, 0, textWidth, textHeight + padding * 2, 10);
  fondo.lineStyle(4, 0xffffff, 1);
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

function mostrarOpciones(textoPregunta, opciones) {
  const ancho = scene.scale.width;
  const alto = scene.scale.height;

  const fondo = scene.add.rectangle(ancho / 2, alto / 2 + 100, 300, 120, 0x000000, 0.7).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setRadius(12);

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
      // Elimina los elementos de la opción
      fondo.destroy();
      texto.destroy();
      botones.forEach(b => b.destroy());

      // Ejecuta la acción correspondiente
      opcion.accion();
    });

    botones.push(btn);
  });
}


function escribirTexto(textObject, message, speed = 30, callback, backgroundColor = null) {
  mostrarTextoConFondo(message, speed, callback, backgroundColor);
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
    escribirTexto(texto, lineas[0]);
  });
  for (let i = 1; i < lineas.length - 1; i++) {
    pasos.push(() => {
      escribirTexto(texto, lineas[i]);
    });
  }
  pasos.push(() => {
    leo.setTexture('leo-sonriente');
    escribirTexto(texto, lineas[lineas.length - 1]);
  });
}

function avanzarHistoria() {
  currentStep++;

  switch (currentStep) {
    case 1:
      speakerActual = 'yopi';
      escribirTexto(texto, "¡Leito! Ahí estás...");
      break;
    case 2:
  speakerActual = 'yopi';
  leo.setTexture('leo-feli');
  escribirTexto(texto, "Te estaba buscando");
  pasos.push(() => {
    speakerActual = 'yopi';
    escribirTexto(texto, "¡Te tengo una sorpresa!", 30, () => {
      speakerActual = 'yopi';
      escribirTexto(texto, "¡Mira quién viene ahí...!", 30, () => {
        // Al terminar esta línea del narrador, avanza al siguiente case
        if (pasos.length > 0) pasos.shift()(); // opcional si quieres más pasos
        currentStep++; // avanzar al case 3
        avanzarHistoria(); // llama manualmente al siguiente paso
      });
    });
  });
  break;

case 3:
  dialogoNPC(
    'conejito',
    "¡Hola, Leo!",
    "Brinqué hasta aquí...",
    "Sólo para pasarte un mensaje importante",
    "Es de tu novio Alec...",
    "Me pidió que te recordara lo mucho que te ama"
  );
    pasos.push(() => {
      speakerActual = 'leo';
      escribirTexto(texto, "¡Eso fue muy tierno!");
    });
    if (pasos.length > 0) pasos.shift()();
    break;

    case 4:
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

    case 5:
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
    case 6:
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
    case 7:
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
    case 8:
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
    case 9:
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
    case 10:
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
    case 11:
      speakerActual = 'yopi';
      escribirTexto(texto, "Ah… espera, hay algo más...");
      break;
      
    case 12:
  mostrarNPC('libro', scene.scale.width / 2, scene.scale.height + 100, scene.scale.width / 2);
  scene.tweens.add({
    targets: npc,
    y: scene.scale.height / 2,
    duration: 1000,
    ease: 'Power2',
    onComplete: () => {
      if (leo) leo.setVisible(false);
      speakerActual = 'yopi';
      escribirTexto(texto, "Un librito apareció, y en él está escrito todo lo que te quiero decir.", 30, () => {
        mostrarOpciones("¿Quieres abrir el librito?", [
          {
            texto: "Sí",
            accion: () => {
              currentStep++; // pasa al case 13
              avanzarHistoria();
            }
          },
          {
            texto: "No",
            accion: () => {
              speakerActual = 'yopi';
              escribirTexto(texto, "Tal vez más tarde... pero el mensaje siempre estará ahí para ti");
            }
          }
        ]);
      });
    }
  });
  break;


case 13:
  if (npc) npc.destroy(); // Elimina el librito
  speakerActual = 'yopi';
  escribirTexto(texto, "Querido Leo: Gracias por existir. Gracias por ser tú. Eres lo mejor que me ha pasado y siempre quiero cuidarte.");
  break;


    case 14:
      speakerActual = 'yopi';
      alert('Fin de la demo, por favor ve a darle un besito a Alec ahora mismo !! ♡');
      escribirTexto(texto, "Toca la pantalla para volver a empezar.");
      break;
    case 15:
      location.reload();
      break;
    default:
      break;
  }
}
