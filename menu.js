/* menu.js */

// — MAIN MENU —
scene("mainMenu", () => {
  destroyAll();

  // Only update music if it's not already playing or if it's disabled
  if (!window.musicPlaying && window.audioSettings.musicEnabled) {
    updateMusic();
  }

  // Background + overlay
  add([
    sprite("menu-bg", { width: width(), height: height() }),
    pos(0, 0),
    origin("topleft"),
  ]);
  add([
    rect(width(), height()),
    color(0, 0, 0, 0.5),
  ]);

  // Logo
  add([
    sprite("logo", { width: width() * 0.4 }),
    pos(width() / 2, height() * 0.2),
    origin("center"),
  ]);

  // Title
  add([
    text("Jumpy Knight", { size: 48, font: "sink" }),
    pos(width() / 2, height() * 0.35),
    origin("center"),
    color(255, 220, 100),
    outline(2),
  ]);

  // Buttons
  createButton("Play Game",    vec2(width()/2, height()*0.55), () => go("game"));
  createButton("Instructions", vec2(width()/2, height()*0.65), () => go("instructions"));
  createButton("Settings",     vec2(width()/2, height()*0.75), () => go("settings"));

  // High Score
  add([
    text(`High Score: ${window.highScore}`, { size: 20, font: "sink" }),
    pos(width() / 2, height() * 0.85),
    origin("center"),
    color(255, 255, 255),
  ]);
});

// — INSTRUCTIONS —
scene("instructions", () => {
  destroyAll();

  // Fullscreen background
  add([
    sprite("background", { width: width(), height: height() }),
    pos(0, 0),
    origin("topleft"),
  ]);
  add([
    rect(width(), height()),
    color(0, 0, 0, 0.6),
  ]);

  // Panel
  add([
    rect(width() * 0.8, height() * 0.8, { radius: 12 }),
    pos(width() * 0.1, height() * 0.1),
    color(30, 30, 60, 0.95),
  ]);

  // Header
  add([
    text("How to Play", { size: 36, font: "sink" }),
    pos(width() / 2, height() * 0.15),
    origin("center"),
    color(240, 240, 200),
    outline(2),
  ]);

  // Updated Instruction lines with new triple jump mechanics
  const lines = [
    "SPACE / CLICK : Jump (Double & Triple)",
    "LEFT/RIGHT    : Move the knight",
    "A             : Sword Attack",
    "F             : Fireball (Cooldown)",
    "P             : Pause / Resume",
    "",
    "GAMEPLAY:",
    "• Jump or attack enemies to survive",
    "• Double-jump is always available in mid-air",
    "• Earn a Triple Jump every 1000 pts",
    "• Sword kills = 50 pts, Fireball = 100 pts",
    "• 3 Health points – game over at 0",
    "• Game gets harder as your score increases"
  ];
  let y = height() * 0.25;
  for (let l of lines) {
    add([
      text(l, { size: 22, font: "sink", width: width() * 0.7 }),
      pos(width() / 2, y),
      origin("center"),
      color(220, 220, 255),
    ]);
    y += 30;
  }

  // Back button
  createButton("Back to Menu", vec2(width()/2, height()*0.9), () => go("mainMenu"));
});

// — SETTINGS —
scene("settings", () => {
  destroyAll();

  // Dark background
  add([
    rect(width(), height()),
    color(30, 30, 40),
  ]);

  // Title
  add([
    text("Settings", { size: 36, font: "sink" }),
    pos(width() / 2, 80),
    origin("center"),
    color(255, 255, 255),
    outline(2),
  ]);

  // Music Volume
  add([
    text("Music Volume", { size: 24, font: "sink" }),
    pos(width() / 2, 160),
    origin("center"),
    color(255, 255, 255),
  ]);
  const mv = add([
    text(`${Math.round(window.audioSettings.musicVolume * 100)}%`, { size: 28, font: "sink" }),
    pos(width() / 2, 200),
    origin("center"),
    color(255, 255, 255),
  ]);
  const mm = add([
    text("-", { size: 40, font: "sink" }),
    pos(width() / 2 - 80, 200),
    origin("center"),
    area(),
    color(255, 100, 100),
  ]);
  const mp = add([
    text("+", { size: 40, font: "sink" }),
    pos(width() / 2 + 80, 200),
    origin("center"),
    area(),
    color(100, 255, 100),
  ]);
  mm.onClick(() => {
    window.audioSettings.musicVolume = Math.max(0, window.audioSettings.musicVolume - 0.1);
    mv.text = `${Math.round(window.audioSettings.musicVolume * 100)}%`;
    // Update music with new volume if it's playing
    if (window.musicPlaying && window.audioSettings.musicEnabled) {
      updateMusic(); // Restart with new volume
    }
    playSfx("click");
  });
  mp.onClick(() => {
    window.audioSettings.musicVolume = Math.min(1, window.audioSettings.musicVolume + 0.1);
    mv.text = `${Math.round(window.audioSettings.musicVolume * 100)}%`;
    // Update music with new volume if it's playing
    if (window.musicPlaying && window.audioSettings.musicEnabled) {
      updateMusic(); // Restart with new volume
    }
    playSfx("click");
  });

  // SFX Volume
  add([
    text("SFX Volume", { size: 24, font: "sink" }),
    pos(width() / 2, 280),
    origin("center"),
    color(255, 255, 255),
  ]);
  const sv = add([
    text(`${Math.round(window.audioSettings.sfxVolume * 100)}%`, { size: 28, font: "sink" }),
    pos(width() / 2, 320),
    origin("center"),
    color(255, 255, 255),
  ]);
  const sm = add([
    text("-", { size: 40, font: "sink" }),
    pos(width() / 2 - 80, 320),
    origin("center"),
    area(),
    color(255, 100, 100),
  ]);
  const sp = add([
    text("+", { size: 40, font: "sink" }),
    pos(width() / 2 + 80, 320),
    origin("center"),
    area(),
    color(100, 255, 100),
  ]);
  sm.onClick(() => {
    window.audioSettings.sfxVolume = Math.max(0, window.audioSettings.sfxVolume - 0.1);
    sv.text = `${Math.round(window.audioSettings.sfxVolume * 100)}%`;
    playSfx("click");
  });
  sp.onClick(() => {
    window.audioSettings.sfxVolume = Math.min(1, window.audioSettings.sfxVolume + 0.1);
    sv.text = `${Math.round(window.audioSettings.sfxVolume * 100)}%`;
    playSfx("click");
  });

  // Test SFX button
  createButton("Test SFX", vec2(width()/2, 380), () => playSfx("attack"));

  // Toggle Music
  const mt = add([
    text(window.audioSettings.musicEnabled ? "Music: ON" : "Music: OFF", { size: 20, font: "sink" }),
    pos(width() / 2, 440),
    origin("center"),
    color(window.audioSettings.musicEnabled ? rgb(0, 255, 100) : rgb(255, 100, 100)),
  ]);
  createButton("Toggle Music", vec2(width()/2, 480), () => {
    window.audioSettings.musicEnabled = !window.audioSettings.musicEnabled;
    mt.text = window.audioSettings.musicEnabled ? "Music: ON" : "Music: OFF";
    mt.color = window.audioSettings.musicEnabled ? rgb(0,255,100) : rgb(255,100,100);

    // Update music based on new setting
    if (window.audioSettings.musicEnabled) {
      if (!window.musicPlaying) {
        updateMusic();
      }
    } else if (window.musicPlaying) {
      stop("music");
      window.musicPlaying = false;
    }

    playSfx("click");
  });

  // Toggle SFX
  const st = add([
    text(window.audioSettings.sfxEnabled ? "SFX: ON" : "SFX: OFF", { size: 20, font: "sink" }),
    pos(width() / 2, 540),
    origin("center"),
    color(window.audioSettings.sfxEnabled ? rgb(0,255,100) : rgb(255,100,100)),
  ]);
  createButton("Toggle SFX", vec2(width()/2, 580), () => {
    window.audioSettings.sfxEnabled = !window.audioSettings.sfxEnabled;
    st.text = window.audioSettings.sfxEnabled ? "SFX: ON" : "SFX: OFF";
    st.color = window.audioSettings.sfxEnabled ? rgb(0,255,100) : rgb(255,100,100);
    playSfx("click");
  });

  // Back to Menu
  createButton("Back to Menu", vec2(width()/2, height()-80), () => go("mainMenu"));
});

// — GAME OVER SCENE —
scene("gameOver", () => {
  destroyAll();
  if (window.score > window.highScore) {
    window.highScore = window.score;
  }

  add([ sprite("background",{ width:width(), height:height() }), pos(0,0), origin("topleft") ]);
  add([ rect(width(),height()), color(0,0,0,0.5) ]);

  add([ text("Game Over!", { size:60, font:"sink" }), pos(width()/2, height()/3), origin("center"), color(255,50,50), outline(4) ]);
  add([ text(`Score: ${window.score}`, { size:40, font:"sink" }), pos(width()/2, height()/2 - 20), origin("center"), color(255,255,255) ]);
  add([ text(`High Score: ${window.highScore}`, { size:32, font:"sink" }), pos(width()/2, height()/2 + 40), origin("center"), color(255,215,0) ]);

  createButton("Play Again", vec2(width()/2, height()/2 + 100), () => go("game"));
  createButton("Main Menu",  vec2(width()/2, height()/2 + 180), () => go("mainMenu"));
});
