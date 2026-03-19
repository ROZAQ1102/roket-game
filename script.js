// ================== SETUP ==================
const rocket = document.getElementById("rocket");
const slider = document.getElementById("slider");
const pumpVal = document.getElementById("pumpVal");
const info = document.getElementById("info");
const scoreText = document.getElementById("score");

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 400;

let target = 120;
let level = "easy";
let tiltX = 0;
let gyroActive = false;

// ================== SLIDER ==================
slider.oninput = () => {
  pumpVal.innerText = slider.value;
};

// ================== MENU ==================
function startGame(selected) {
  level = selected;

  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";

  if (level === "easy") target = 80;
  if (level === "hard") target = 140;
  if (level === "super") target = 200;

  document.getElementById("targetText").innerText = target;
  document.getElementById("levelText").innerText =
    "Level: " + level.toUpperCase();
}

function backMenu() {
  document.getElementById("menu").style.display = "block";
  document.getElementById("game").style.display = "none";
  rocket.style.transform = "translate(-50%, 0)";
}

// ================== GYRO TOGGLE ==================
function toggleGyro() {
  const btn = document.getElementById("gyroBtn");

  if (!gyroActive) {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then(res => {
          if (res === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
            gyroActive = true;
            btn.innerText = "📱 Matikan Kontrol HP";
          }
        });
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
      gyroActive = true;
      btn.innerText = "📱 Matikan Kontrol HP";
    }
  } else {
    window.removeEventListener("deviceorientation", handleOrientation);
    gyroActive = false;
    btn.innerText = "📱 Aktifkan Kontrol HP";

    rocket.style.transform = "translate(-50%, 0)";
  }
}

function handleOrientation(e) {
  if (!gyroActive) return;

  let gamma = e.gamma;
  tiltX += (gamma - tiltX) * 0.1; // smooth

  tiltX = Math.max(-30, Math.min(30, tiltX));

  rocket.style.transform =
    `translate(-50%, 0) rotate(${tiltX}deg)`;
}

// ================== RANDOM ==================
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// ================== PHYSICS ==================
function physics(p) {
  let pressure = p * 4;
  let wind = 0;
  let efficiency = 1;

  if (level === "easy") {
    wind = random(-10, 10);
    efficiency = random(0.9, 1.1);
  }

  if (level === "hard") {
    wind = random(-25, 25);
    efficiency = random(0.7, 1.2);
  }

  if (level === "super") {
    wind = random(-50, 50);
    efficiency = random(0.5, 1.5);
  }

  let baseHeight = (pressure * pressure) / (pressure + 60);
  let height = baseHeight * efficiency + wind;

  return {
    pressure,
    height: Math.max(0, height),
    wind: wind.toFixed(1),
    efficiency: efficiency.toFixed(2)
  };
}

// ================== PARTIKEL ==================
function particles() {
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(
      canvas.width / 2 + (Math.random() * 40 - 20),
      350,
      2,
      10
    );
  }
}

// ================== LEDAKAN ==================
function explosion() {
  let particlesArr = [];
  const sound = document.getElementById("boomSound");

  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }

  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  for (let i = 0; i < 80; i++) {
    particlesArr.push({
      x: canvas.width / 2,
      y: 200,
      vx: Math.random() * 8 - 4,
      vy: Math.random() * -8,
      life: 60
    });
  }

  let shakeInterval = setInterval(() => {
    let shake = 10;
    document.body.style.transform =
      `translate(${Math.random()*shake-shake/2}px, ${Math.random()*shake-shake/2}px)`;
  }, 50);

  let boom = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesArr.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      ctx.fillStyle = "orange";
      ctx.fillRect(p.x, p.y, 5, 5);
    });

    particlesArr = particlesArr.filter(p => p.life > 0);

    if (particlesArr.length === 0) {
      clearInterval(boom);
      clearInterval(shakeInterval);
      document.body.style.transform = "none";
    }
  }, 30);
}

// ================== SLOW MOTION ==================
function slowMotion() {
  document.body.style.transition = "all 0.5s";
  document.body.style.transform = "scale(1.05)";

  rocket.style.transition = "transform 4s ease-out";
  rocket.style.filter = "drop-shadow(0 0 20px yellow)";

  setTimeout(() => {
    document.body.style.transform = "scale(1)";
    rocket.style.transition = "transform 2s ease-out";
    rocket.style.filter = "none";
  }, 2000);
}

// ================== AI ==================
function aiSuggest() {
  let best = 0;
  let bestScore = Infinity;

  for (let p = 1; p <= 100; p++) {
    let total = 0;
    let tries = level === "super" ? 15 : 5;

    for (let i = 0; i < tries; i++) {
      total += physics(p).height;
    }

    let avg = total / tries;
    let diff = Math.abs(target - avg);

    if (diff < bestScore) {
      bestScore = diff;
      best = p;
    }
  }

  slider.value = best;
  pumpVal.innerText = best;

  info.innerText = `🤖 AI pilih: ${best}`;
}

// ================== LAUNCH ==================
function launch() {
  let pump = parseInt(slider.value);
  let result = physics(pump);

  rocket.style.transition = "transform 2s ease-out";
  rocket.style.transform =
    `translate(-50%, -${result.height}px) rotate(${tiltX}deg)`;

  info.innerText =
`Tekanan: ${result.pressure}
Tinggi: ${result.height.toFixed(1)} m
Angin: ${result.wind}
Efisiensi: ${result.efficiency}`;

  let i = 0;
  let part = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles();
    i++;
    if (i > 10) clearInterval(part);
  }, 50);

  let diff = Math.abs(target - result.height);

  let tolerance = 30;
  if (level === "easy") tolerance = 30;
  if (level === "hard") tolerance = 15;
  if (level === "super") tolerance = 3;

  if (diff <= tolerance) {

    if (level === "super") {
      scoreText.innerText = "👑 PERFECT GODLIKE!!";
    } else {
      scoreText.innerText = "🎯 PERFECT!";
    }

    slowMotion();

  } else if (diff <= tolerance * 2 && level !== "super") {
    scoreText.innerText = "👍 Dekat!";
  } else {
    scoreText.innerText = "💥 BOOM! Gagal total!";
    explosion();

    rocket.style.opacity = "0";
    setTimeout(() => {
      rocket.style.opacity = "1";
      rocket.style.transform = "translate(-50%, 0)";
    }, 1200);
  }
}