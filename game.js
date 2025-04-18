// game.js
/* -------------------------------------------------------------------------- */

scene("game", () => {
	setGravity(1400); // Increased gravity for better jump feel
	
	/* --- reset audio --- */
	stop("music"); // Force stop any music
	updateMusic(); // Start fresh instance
	
	/* --- constants --- */
	const ENEMY_SPEED      = 250;
	const FIREBALL_COOLDOWN = 3.0;
	
	const PLAYER_X = 80;
	const PLAYER_Y = height() - 96;
	
	/* --- global flags --- */
	window.gamePaused  = false;
	window.score       = 0;
	
	/* --- backdrop + floor --- */
	add([sprite("background",{width:width(),height:height()}), pos(0,0)]);
	add([rect(width(),48), pos(0,height()-48), area(), body({isStatic:true}), color(112,128,144)]);
	
	/* --- player --- */
	const player = add([
	sprite("knight-idle"),
	pos(PLAYER_X, PLAYER_Y),
	scale(2),
	area(),
	body(),
	"player",
	{ health:3, jumps:0, triple:0, jumpCD:0, atkCD:0 }
	]);
	player.play("idle");
	
	/* --- UI --- */
	const scoreTx   = add([text("Score: 0",{font:"sink",size:40}), pos(10,10)]);
	const tripleTx  = add([text("Triple Jumps: 0",{font:"sink",size:20}), pos(10,90)]);
	const healthTx  = add([text("Health: 3",{font:"sink",size:20}), pos(10,130)]);
	
	/* fireball CD bar */
	add([rect(200,20), pos(10,170), color(90,90,90), outline(2)]);
	const fbBar  = add([rect(200,20), pos(10,170), color(255,120,50)]);
	const fbText = add([text("Fireball: Ready",{font:"sink",size:16}), pos(220,170)]);
	let fireballCD = 0;
	
	/* --- helpers --- */
	const updTriple = () => tripleTx.text=`Triple Jumps: ${player.triple}`;
	const updHealth = () => healthTx.text =`Health: ${player.health}`;
	
	const toast = msg=> add([
	text(msg,{font:"sink",size:24}),
	pos(player.pos.x, player.pos.y-50),
	color(255,255,0), origin("center"),
	lifespan(1.5), move(UP,80)
	]);
	
	/* --- jumping (increased heights) --- */
	function tryJump(){
	if (gamePaused || player.jumpCD>0) return;
	
	if (player.isGrounded()){
	player.jump(600); // Increased from 420
	player.jumps=1; 
	playSfx("jump");
	} else if (player.jumps===1){
	player.jump(500); // Increased from 340
	player.jumps=2; 
	playSfx("jump");
	} else if (player.triple>0){
	player.triple--; 
	updTriple(); 
	player.jump(700); // Increased from 500
	playSfx("jump"); 
	toast("Triple Jump!");
	playSfx("powerup"); // Added powerup sound
	} else return;
	
	player.use(sprite("knight-jump")); 
	player.play("jump");
	player.jumpCD = 0.15;
	}
	
	/* --- attack & fireball --- */
	function doAttack(){
	if (gamePaused || player.atkCD>0) return;
	player.atkCD=0.6; 
	playSfx("attack");
	player.use(sprite("knight-attack")); 
	player.play("attack");
	wait(0.4,()=>{ 
	player.use(sprite(player.isGrounded() ? "knight-idle" : "knight-jump")); 
	player.play(player.isGrounded() ? "idle" : "jump"); 
	});
	}
	
	function shootFireball(){
	if (gamePaused || fireballCD>0) return;
	playSfx("attack");
	fireballCD = FIREBALL_COOLDOWN;
	
	const fb = add([
	sprite("fireball"),
	pos(player.pos.add(30,10)),
	area(),
	move(RIGHT,400),
	offscreen({destroy:true}),
	scale(1.5),
	"fireball",
	]);
	fb.play("spin");
	}
	
	/* --- input bindings --- */
	onKeyPress(["w","space"], tryJump);
	onMousePress(tryJump);
	onKeyPress("a", doAttack);
	onKeyPress("f", shootFireball);
	
	/* --- enemy spawning --- */
    const spawnEnemy = () => {
        if (gamePaused) {
            wait(0.5, spawnEnemy);
            return;
        }

        // Random enemy type selection
        const enemyType = choose([
            "ground",
            "ground",
            "flying",
            "special"  // New enemy type using enemy.png
        ]);

        // Random spawn timing between 0.5-1.5 seconds
        const spawnDelay = rand(0.5, 1.5);

        if (enemyType === "ground") {
            // 50/50 chance between enemy-walk and enemy.png
            const enemyVariant = choose(["enemy-walk", "enemy"]);
            
            const groundEnemy = add([
                sprite(enemyVariant),
                pos(width(), height() - 100),
                scale(rand(1.5, 2.5)),
                move(LEFT, ENEMY_SPEED + rand(-50, 50)),
                area(),
                body(),
                offscreen({ destroy: true }),
                "enemy",
            ]);

            // Only animate if using enemy-walk sprite
            if (enemyVariant === "enemy-walk") {
                groundEnemy.play("walk");
            }

        } else if (enemyType === "special") {
            // Use enemy.png with different properties
            add([
                sprite("enemy"),
                pos(width(), height() - 150),
                scale(rand(1.8, 2.2)),
                move(LEFT, ENEMY_SPEED + rand(-30, 30)),
                area(),
                body(),
                offscreen({ destroy: true }),
                color(rand(150, 255), rand(150, 255), rand(150, 255)), // Random colors
                "enemy",
            ]);
        } else {
            // Flying enemy (dragon)
            add([
                sprite("dragon"),
                pos(width(), rand(height() - 350, height() - 150)),
                scale(rand(0.1, 0.2)),
                move(LEFT, ENEMY_SPEED + rand(-50, 50)),
                area(),
                offscreen({ destroy: true }),
                "enemy",
            ]);
        }

        wait(spawnDelay, spawnEnemy);
    };
    spawnEnemy();
	
	/* --- collisions --- */
	onCollide("player","enemy",(p,e)=>{
	destroy(e); 
	playSfx("collide"); 
	player.health--; 
	updHealth();
	if (player.health<=0){ 
	destroy(player); 
	addKaboom(p.pos); 
	go("gameOver"); 
	}
	});
	
	onCollide("fireball","enemy",(f,e)=>{
	destroy(f); 
	e.use(sprite("enemy-death")); 
	e.play("death"); 
	e.unuse("enemy");
	playSfx("enemy-death"); 
	score+=100; 
	wait(0.5,()=>destroy(e));
	});
	
	/* --- update loop --- */
	onUpdate(()=>{
	if (gamePaused) return;
	
	/* score & triple power‑up */
	score++; 
	scoreTx.text=`Score: ${score}`;
	if (score && score % 1000 === 0){
	player.triple++; 
	updTriple();
	toast("+1 Triple Jump!");
	playSfx("powerup");
	}
	
	/* cooldown timers */
	if (player.jumpCD>0) player.jumpCD-=dt();
	if (player.atkCD >0) player.atkCD -=dt();
	if (fireballCD >0) fireballCD -=dt();
	
	/* fireball bar */
	const pct = clamp(1 - fireballCD / FIREBALL_COOLDOWN, 0, 1);
	fbBar.width = 200 * pct;
	fbText.text = pct >= 1 ? "Fireball: Ready" : `Fireball: ${(fireballCD).toFixed(1)}s`;
	fbText.color = pct >= 1 ? rgb(40,255,40) : rgb(255,255,255);
	
	if (player.isGrounded()) player.jumps = 0;
	});
	
	/* --- pause / resume --- */
	function showPause(){
	stop("music"); // Stop music completely
	gamePaused=true;
	add([rect(width(),height()),color(0,0,0,0.65),z(99),"pauseLayer"]);
	add([text("PAUSED",{size:48,font:"sink"}),pos(width()/2,height()/4),origin("center"),z(100),"pauseElement"]);
	createButton("Resume",vec2(width()/2,height()/2-80),resume,"pauseElement");
	createButton("Menu",vec2(width()/2,height()/2+80),()=>{
	stop("music"); // Additional stop before menu transition
	go("mainMenu");
	},"pauseElement");
	}
	
	function resume(){
	destroyAll("pauseLayer"); 
	destroyAll("pauseElement");
	gamePaused=false; 
	updateMusic(); // Restart music with current settings
	}
	
	onKeyPress("p",()=> gamePaused?resume():showPause());
	add([text("II",{size:32,font:"sink"}),pos(width()-50,30),area(),origin("center")])
	.onClick(()=> gamePaused?resume():showPause());
	});
