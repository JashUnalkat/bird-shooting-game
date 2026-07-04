// Import Matter.js physics engine and screen dimensions
import Matter from "matter-js";
import { Dimensions } from "react-native";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

// Game constants
const FLOOR_HEIGHT = 110;
const PIPE_WIDTH = 75;
const PIPE_GAP = 180;
const PIPE_HEIGHT = 800; 
const BULLET_SPEED = 12;
const PIPE_SPEED = 3.5;
const ENEMY_SPEED = 4;

// Helper to generate random numbers within a range
const randomBetween = (min, max) => Math.random() * (max - min) + min;

// Function to reposition pipes when they go off-screen
const resetPipePair = (topBody, bottomBody, newX) => {
  const gapCenterY = randomBetween(250, HEIGHT - FLOOR_HEIGHT - 250);
  const topY = gapCenterY - (PIPE_GAP / 2) - (PIPE_HEIGHT / 2);
  const bottomY = gapCenterY + (PIPE_GAP / 2) + (PIPE_HEIGHT / 2);

  Matter.Body.setPosition(topBody, { x: newX, y: topY });
  Matter.Body.setPosition(bottomBody, { x: newX, y: bottomY });
};

// Function to reposition enemies
const resetEnemy = (enemy) => {
  Matter.Body.setPosition(enemy, { 
    x: WIDTH + randomBetween(300, 600), 
    y: randomBetween(120, HEIGHT - FLOOR_HEIGHT - 120) 
  });
};

// Core physics system function
const Physics = (entities, { events, dispatch, time }) => {
  let engine = entities.physics.engine;

  // Power-up duration management
  if (entities.physics.powerUpActive) {
    entities.physics.powerUpTimer -= time.delta;
    if (entities.physics.powerUpTimer <= 0) {
      entities.physics.powerUpActive = false;
    }
  }

  // Set up collision event listeners
  if (!engine._collisionBound) {
    engine._collisionBound = true;
    Matter.Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach(pair => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        
        // Handle player death collisions
        if (labels.includes("Bird") && (labels.some(l => l.includes("Pipe") || l === "Floor" || l === "Enemy"))) {
          dispatch({ type: "game-over" });
        }

        // Handle power-up collection
        if (labels.includes("Bird") && labels.includes("Snack")) {
          entities.physics.powerUpActive = true;
          entities.physics.powerUpTimer = 5000; 
          Matter.Body.setPosition(entities.snack.body, { x: -900, y: -900 }); 
        }

        // Handle bullet hits on enemies
        if (labels.includes("Enemy") && labels.some(l => l.includes("Bullet"))) {
          const bulletLabel = labels.find(l => l.includes("Bullet"));
          const key = bulletLabel.charAt(0).toLowerCase() + bulletLabel.slice(1);
          if (entities[key] && entities[key].active) {
            entities.physics.score += 2;
            dispatch({ type: "score", score: entities.physics.score });
            resetEnemy(entities.enemy.body);
            entities[key].active = false;
            Matter.Body.setPosition(entities[key].body, { x: -500, y: -500 });
          }
        }
      });
    });
  }

  // Handle game input events
  events.forEach((e) => {
    // Bird movement control
    if (e.type === "move-bird-relative") {
      Matter.Body.setPosition(entities.bird.body, { 
        x: entities.bird.body.position.x, 
        y: entities.bird.body.position.y + e.dy 
      });
    }
    // Shooting mechanism
    if (e.type === "shoot") {
      const keys = entities.physics.powerUpActive ? ["bulletMid", "bulletTop", "bulletBot"] : ["bulletMid"];
      keys.forEach(k => {
        if (entities[k]) {
          Matter.Body.setPosition(entities[k].body, { x: entities.bird.body.position.x + 30, y: entities.bird.body.position.y });
          entities[k].active = true;
        }
      });
    }
  });

  // Advance the physics engine simulation
  Matter.Engine.update(engine, time.delta);

  // Handle active game movements and recycling
  if (!entities.physics.gameOver) {
    // Move active bullets
    ["bulletMid", "bulletTop", "bulletBot"].forEach(k => {
      if (entities[k] && entities[k].active) {
        let yDir = k === "bulletTop" ? -3 : k === "bulletBot" ? 3 : 0;
        Matter.Body.translate(entities[k].body, { x: BULLET_SPEED, y: yDir });
        if (entities[k].body.position.x > WIDTH + 50) entities[k].active = false;
      }
    });

    // Move enemies
    Matter.Body.translate(entities.enemy.body, { x: -ENEMY_SPEED, y: 0 });
    if (entities.enemy.body.position.x < -100) resetEnemy(entities.enemy.body);

    // Move snacks
    Matter.Body.translate(entities.snack.body, { x: -2.5, y: 0 });
    if (entities.snack.body.position.x < -100) {
      Matter.Body.setPosition(entities.snack.body, { x: WIDTH + 1500, y: randomBetween(150, HEIGHT - 250) });
    }

    // Move and recycle pipes
    for (let i = 1; i <= 2; i++) {
      const top = entities[`pipeTop${i}`];
      const bot = entities[`pipeBottom${i}`];
      
      if (top && bot) {
        Matter.Body.translate(top.body, { x: -PIPE_SPEED, y: 0 });
        Matter.Body.translate(bot.body, { x: -PIPE_SPEED, y: 0 });

        // Update score when passing pipes
        if (!top.scored && top.body.position.x < entities.bird.body.position.x) {
          top.scored = true;
          entities.physics.score += 1;
          dispatch({ type: "score", score: entities.physics.score });
        }

        // Recycle pipes once they leave the screen
        if (top.body.position.x < -PIPE_WIDTH) {
          resetPipePair(top.body, bot.body, WIDTH + 350); 
          top.scored = false;
        }
      }
    }
  }

  return entities;
};

// Export the physics system
export default Physics;