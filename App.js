import React, { useRef, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  PanResponder, 
  ImageBackground,
  Image
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import Matter from "matter-js";

// Import custom game components and physics system
import Bird from "./components/Bird";
import Pipe from "./components/Pipe";
import Floor from "./components/Floor";
import Enemy from "./components/Enemy";
import Bullet from "./components/Bullet";
import Snack from "./components/Snack"; 
import Physics from "./physics";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

// Game constants
const PIPE_WIDTH = 75;
const PIPE_HEIGHT = 800; 
const GAP_SIZE = 180;    
const FLOOR_HEIGHT = 110;

// Initialize physics engine and world entities
const createGameWorld = () => {
  const engine = Matter.Engine.create({ enableSleeping: false });
  const world = engine.world;
  world.gravity.y = 0; 

  // Create physical bodies
  const bird = Matter.Bodies.rectangle(WIDTH * 0.25, HEIGHT / 2, 40, 30, { label: "Bird", inertia: Infinity });
  const floor = Matter.Bodies.rectangle(WIDTH / 2, HEIGHT - (FLOOR_HEIGHT / 2), WIDTH, FLOOR_HEIGHT, { isStatic: true, label: "Floor" });

  const getPipeY = (isTop) => {
    const screenCenter = HEIGHT / 2;
    return isTop ? screenCenter - (GAP_SIZE / 2) - (PIPE_HEIGHT / 2) : screenCenter + (GAP_SIZE / 2) + (PIPE_HEIGHT / 2);
  };

  const pipeTop1 = Matter.Bodies.rectangle(WIDTH + 300, getPipeY(true), PIPE_WIDTH, PIPE_HEIGHT, { isStatic: true, label: "PipeTop1" });
  const pipeBottom1 = Matter.Bodies.rectangle(WIDTH + 300, getPipeY(false), PIPE_WIDTH, PIPE_HEIGHT, { isStatic: true, label: "PipeBottom1" });
  const pipeTop2 = Matter.Bodies.rectangle(WIDTH + 650, getPipeY(true), PIPE_WIDTH, PIPE_HEIGHT, { isStatic: true, label: "PipeTop2" });
  const pipeBottom2 = Matter.Bodies.rectangle(WIDTH + 650, getPipeY(false), PIPE_WIDTH, PIPE_HEIGHT, { isStatic: true, label: "PipeBottom2" });

  const enemy = Matter.Bodies.rectangle(WIDTH + 400, 300, 60, 60, { isStatic: true, isSensor: true, label: "Enemy" });
  const snack = Matter.Bodies.rectangle(WIDTH + 900, 250, 40, 40, { isStatic: true, isSensor: true, label: "Snack" });

  const bulletMid = Matter.Bodies.rectangle(-100, -100, 18, 8, { isSensor: true, label: "BulletMid" });
  const bulletTop = Matter.Bodies.rectangle(-100, -100, 18, 8, { isSensor: true, label: "BulletTop" });
  const bulletBot = Matter.Bodies.rectangle(-100, -100, 18, 8, { isSensor: true, label: "BulletBot" });

  Matter.World.add(world, [bird, floor, enemy, snack, pipeTop1, pipeBottom1, pipeTop2, pipeBottom2, bulletMid, bulletTop, bulletBot]);

  return {
    physics: { engine, world, score: 0 },
    bird: { body: bird, size: [70, 50], renderer: Bird }, 
    floor: { body: floor, size: [WIDTH, FLOOR_HEIGHT], renderer: Floor },
    pipeTop1: { body: pipeTop1, size: [PIPE_WIDTH, PIPE_HEIGHT], renderer: Pipe, scored: false },
    pipeBottom1: { body: pipeBottom1, size: [PIPE_WIDTH, PIPE_HEIGHT], renderer: Pipe },
    pipeTop2: { body: pipeTop2, size: [PIPE_WIDTH, PIPE_HEIGHT], renderer: Pipe, scored: false },
    pipeBottom2: { body: pipeBottom2, size: [PIPE_WIDTH, PIPE_HEIGHT], renderer: Pipe },
    enemy: { body: enemy, size: [60, 60], renderer: Enemy, status: "normal" },
    snack: { body: snack, size: [40, 40], renderer: Snack },
    bulletMid: { body: bulletMid, size: [18, 8], renderer: Bullet, active: false },
    bulletTop: { body: bulletTop, size: [18, 8], renderer: Bullet, active: false },
    bulletBot: { body: bulletBot, size: [18, 8], renderer: Bullet, active: false },
  };
};

export default function App() {
  const [gameState, setGameState] = useState("START");
  const [score, setScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const engineRef = useRef(null);
  const shootTimer = useRef(null);
  const lastTouchY = useRef(0);

  // Auto-shoot function
  const startAutoShoot = () => {
    if (gameState !== "RUNNING") return;
    engineRef.current?.dispatch({ type: "shoot" });
    shootTimer.current = setInterval(() => engineRef.current?.dispatch({ type: "shoot" }), 150);
  };

  const stopAutoShoot = () => {
    if (shootTimer.current) { clearInterval(shootTimer.current); shootTimer.current = null; }
  };

  // Handle touch movement
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => { lastTouchY.current = evt.nativeEvent.pageY; },
      onPanResponderMove: (evt) => {
        const dy = (evt.nativeEvent.pageY - lastTouchY.current) * 1.5;
        engineRef.current?.dispatch({ type: "move-bird-relative", dy: dy });
        lastTouchY.current = evt.nativeEvent.pageY;
      },
    })
  ).current;

  return (
    <ImageBackground source={require('./assets/Background.png')} style={styles.container}>
      
      {/* Start Screen */}
      {gameState === "START" && (
        <View style={styles.fullOverlay}>
          <Image source={require('./assets/snack-icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.developer}>INFO-5144 Project</Text>
          <Text style={styles.developer}>Dinh Huy Nguyen</Text>
          <Text style={[styles.developer, { marginBottom: 30 }]}>Jash Unalkat</Text>
          <TouchableOpacity style={styles.mainButton} onPress={() => setGameState("RUNNING")}>
            <Text style={styles.buttonText}>START GAME</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Score Header */}
      <View style={styles.header} pointerEvents="none">
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      {/* Main Game Engine */}
      <GameEngine
        key={gameKey}
        ref={engineRef}
        systems={[Physics]}
        entities={createGameWorld()}
        running={gameState === "RUNNING"}
        onEvent={(e) => {
          if (e.type === "game-over") { setGameState("GAME_OVER"); stopAutoShoot(); }
          if (e.type === "score") setScore(e.score);
        }}
        style={styles.game}
      />

      {/* Gameplay interaction layer */}
      {gameState === "RUNNING" && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={styles.gestureLayer} {...panResponder.panHandlers} />
          <TouchableOpacity 
            style={styles.shootButton} 
            onPressIn={startAutoShoot} 
            onPressOut={stopAutoShoot}
          >
            <Text style={styles.buttonText}>SHOOT</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Over Screen */}
      {gameState === "GAME_OVER" && (
        <View style={styles.fullOverlay}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScore}>Score: {score}</Text>
          <TouchableOpacity 
            style={styles.restartButton} 
            onPress={() => { setScore(0); setGameState("RUNNING"); setGameKey(k => k + 1); }}
          >
            <Text style={styles.buttonText}>RESTART</Text>
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  game: { flex: 1, backgroundColor: 'transparent' },
  header: { position: "absolute", top: 60, width: "100%", alignItems: "center", zIndex: 100 },
  scoreText: { fontSize: 70, color: "white", fontWeight: "bold" },
  gestureLayer: { ...StyleSheet.absoluteFillObject, zIndex: 200 },
  shootButton: { 
    position: 'absolute', bottom: 50, right: 30, backgroundColor: "#ff4d4d", 
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', 
    alignItems: 'center', zIndex: 300, borderWidth: 3, borderColor: 'white' 
  },
  buttonText: { color: "white", fontWeight: "bold" },
  fullOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000 
  },
  logo: { width: 150, height: 150, marginBottom: 20 },
  developer: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  mainButton: { backgroundColor: "#4CAF50", paddingHorizontal: 50, paddingVertical: 20, borderRadius: 40 },
  gameOverText: { fontSize: 45, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  finalScore: { fontSize: 24, color: '#FFA500', marginBottom: 30, fontWeight: 'bold' },
  restartButton: { backgroundColor: "#FFA500", paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 }
});