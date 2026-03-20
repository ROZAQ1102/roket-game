let angka, nyawa, skor, waktu, highScore, level
let timer

let benarSound = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3")
let salahSound = new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3")

startGame()

function startGame() {
    level = 1
    nyawa = 13
    skor = 0
    waktu = 15

    highScore = localStorage.getItem("highScore") || 0

    generateAngka()
    updateInfo()
    startTimer()
}

function generateAngka() {
    angka = Math.floor(Math.random() * (level * 10)) + 1
}

function cek() {
    let input = Number(document.getElementById("inputAngka").value)

    if (!input) {
        alert("Masukkan angka dulu!")
        return
    }

    if (nyawa <= 0 || waktu <= 0) {
        document.getElementById("hasil").innerText = "💀 Game Over!"
        return
    }

    if (input === angka) {
        skor++
        level++
        benarSound.play()
        confetti()

        if (skor > highScore) {
            highScore = skor
            localStorage.setItem("highScore", highScore)
        }

        document.getElementById("hasil").innerText = "🎉 Benar!"
        document.body.style.backgroundColor = "#4caf50"

        waktu = 15
        generateAngka()

    } else {
        nyawa--
        salahSound.play()

        document.getElementById("hasil").innerText =
            input > angka ? "📉 Terlalu besar!" : "📈 Terlalu kecil!"

        document.body.style.backgroundColor = "#e74c3c"

        let box = document.querySelector(".game-box")
        box.classList.add("shake")
        setTimeout(() => box.classList.remove("shake"), 300)
    }

    updateInfo()
}

function updateInfo() {
    document.getElementById("info").innerText =
        "❤️ Nyawa: " + nyawa +
        " | ⭐ Skor: " + skor +
        " | 🏆 High Score: " + highScore +
        " | 🧠 Level: " + level +
        " | ⏱️ Waktu: " + waktu

    // ⏱️ Timer bar
    let persen = (waktu / 15) * 100
    document.getElementById("timeFill").style.width = persen + "%"
}

function startTimer() {
    clearInterval(timer)

    timer = setInterval(() => {
        waktu--
        updateInfo()

        if (waktu <= 0) {
            clearInterval(timer)
            document.getElementById("hasil").innerText = "⏰ Waktu habis!"
        }
    }, 1000)
}

function resetGame() {
    clearInterval(timer)
    startGame()
    document.getElementById("hasil").innerText = ""
    document.body.style.backgroundColor = ""
}
// ⬇️ PALING BAWAH
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;