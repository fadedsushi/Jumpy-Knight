// main.js

loadSprite("dragon",        "sprites/dragon.gif");
loadSprite("background",    "sprites/background.png");
loadSprite("knight",        "sprites/knight.png");
loadSprite("enemy",         "sprites/enemy.png");
loadSprite("knight-idle",   "sprites/knight-idle.png",   { sliceX:4, anims:{ idle:{from:0,to:3,speed:5,loop:true} } });
loadSprite("knight-run",    "sprites/knight-run.png",    { sliceX:6, anims:{ run:{ from:0,to:5,speed:10,loop:true} } });
loadSprite("knight-jump",   "sprites/knight-jump.png",   { sliceX:4, anims:{ jump:{from:0,to:3,speed:8, loop:false} } });
loadSprite("knight-attack", "sprites/knight-attack.png", { sliceX:4, anims:{ attack:{from:0,to:3,speed:12,loop:false} } });
loadSprite("enemy-walk",    "sprites/enemy-walk.png",    { sliceX:4, anims:{ walk:{   from:0,to:3,speed:6, loop:true} } });
loadSprite("enemy-death",   "sprites/enemy-death.png",   { sliceX:5, anims:{ death:{from:0,to:4,speed:8, loop:false} } });
loadSprite("fireball",      "sprites/fireball.png",      { sliceX:4, anims:{ spin:{  from:0,to:3,speed:10,loop:true} } });
loadSprite("logo",          "sprites/logo.png");
loadSprite("menu-bg",       "sprites/menu-bg.png");

["jump", "collide", "attack", "powerup", "enemy-death", "click"]
  .forEach(s => loadSound(s, `sounds/${s}.wav`));
loadSound("music", "sounds/music.mp3");

window.score        = 0;
window.highScore    = 0;
window.gamePaused   = false;
window.audioSettings = {
  musicVolume:  0.5,
  sfxVolume:    0.7,
  musicEnabled: true,
  sfxEnabled:   true,
};

// Track if music is currently playing
window.musicPlaying = false;

window.updateMusic = () => {
  // First, stop any existing music
  if (window.musicPlaying) {
    stop("music");
    window.musicPlaying = false;
  }

  // Only start music if it's enabled
  if (window.audioSettings.musicEnabled) {
    play("music", {
      loop: true,
      volume: window.audioSettings.musicVolume,
    });
    window.musicPlaying = true;
  }
};

window.playSfx = (name) => {
  if (window.audioSettings.sfxEnabled) {
    play(name, { volume: window.audioSettings.sfxVolume });
  }
};

window.createButton = (txt, p, cb) => {
  const bg = add([
    rect(220, 60, { radius: 8 }),
    pos(p),
    color(50, 70, 90),
    outline(3, rgb(20, 30, 40)),
    origin("center"),
    area(),
    z(110),
    "pauseElement",
  ]);
  const lbl = add([
    text(txt, { size: 24, font: "sink" }),
    pos(p),
    origin("center"),
    color(255, 220, 100),
    z(111),
    "pauseElement",
  ]);
  bg.onUpdate(() => {
    if (bg.isHovering()) {
      bg.color = rgb(70, 90, 110);
      lbl.color = rgb(255, 240, 160);
    } else {
      bg.color = rgb(50, 70, 90);
      lbl.color = rgb(255, 220, 100);
    }
  });
  bg.onClick(() => {
    window.playSfx("click");
    cb();
  });
  return { bg, lbl, destroy() { destroy(bg); destroy(lbl); } };
};

scene("loading", () => {
  add([ rect(width(), height()), color(0, 0, 0) ]);
  add([ sprite("logo", { width: width() * 0.3 }), pos(width()/2, height()/3), origin("center") ]);
  add([
    text("Loading...", { size: 32, font: "sink" }),
    pos(width()/2, height()/2 - 20),
    origin("center"),
    color(255,255,255),
  ]);

  const barBg = add([ rect(400,30,{radius:6}), pos(width()/2, height()/2+20), origin("center"), color(30,30,30) ]);
  const bar   = add([ rect(0,30,{radius:6}), pos(width()/2-200, height()/2+20), origin("left"), color(200,80,30) ]);

  let elapsed = 0, total = 2;
  onUpdate(() => {
    elapsed = Math.min(total, elapsed + dt());
    bar.width = (elapsed/total)*400;
  });

  wait(total + 0.2, () => {
    updateMusic();
    go("mainMenu");
  });
});

go("loading");
