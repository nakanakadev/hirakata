let isReverseMode = false; 
let hiraganaData = []; 
let currentCharacter = null; 
let currentRomanization = null;

async function loadHiraganaData() {
    try {
        const response = await fetch('../data/hiragana.json');
        const data = await response.json();
        hiraganaData = data.hiragana;
        loadNewCharacter();
    } catch (error) {
        // Error cargando datos
    }
}

function getRandomCharacter() {
    const randomIndex = Math.floor(Math.random() * hiraganaData.length);
    return hiraganaData[randomIndex];
}

function updateUI() {
    const characterElement = document.getElementById("character");
    const answerInput = document.getElementById("answer");
    const toggleButton = document.getElementById("toggle-mode");
    const toggleSpans = toggleButton.querySelectorAll('span span');

    if (isReverseMode) {
        // Modo Reverse: Mostrar la romanización y pedir el carácter
        characterElement.textContent = currentRomanization;
        answerInput.placeholder = "Escribe el carácter en japonés";
        
        // Destacar modo activo: A está activo (romano → japonés)
        if (toggleSpans.length >= 3) {
            toggleSpans[0].style.opacity = '0.5'; // あ desactivado
            toggleSpans[2].style.opacity = '1';   // A activo
            toggleSpans[2].style.textShadow = '0 0 8px rgba(255,255,255,0.8)';
            toggleSpans[0].style.textShadow = 'none';
        }
    } else {
        // Modo Normal: Mostrar el carácter y pedir la romanización
        characterElement.textContent = currentCharacter;
        answerInput.placeholder = "Escribe la romanización";
        
        // Destacar modo activo: あ está activo (japonés → romano)
        if (toggleSpans.length >= 3) {
            toggleSpans[0].style.opacity = '1';   // あ activo
            toggleSpans[2].style.opacity = '0.5'; // A desactivado
            toggleSpans[0].style.textShadow = '0 0 8px rgba(255,255,255,0.8)';
            toggleSpans[2].style.textShadow = 'none';
        }
    }
}

// Funciones para manejar popups
function showPopup(isCorrect, userAnswer = '', correctAnswer = '', character = '') {
    const overlay = document.getElementById('popup-overlay');
    const content = document.getElementById('popup-content');
    const icon = document.getElementById('popup-icon');
    const emoji = document.getElementById('popup-emoji');
    const title = document.getElementById('popup-title');
    const message = document.getElementById('popup-message');
    const correction = document.getElementById('popup-correction');
    const popupCharacter = document.getElementById('popup-character');
    const popupReading = document.getElementById('popup-reading');
    const stars = document.getElementById('stars-container');

    // Reset clases
    content.className = 'popup-content';
    icon.className = 'popup-icon';
    title.className = 'popup-title';

    if (isCorrect) {
        // Respuesta correcta
        content.classList.add('popup-correct');
        icon.classList.add('correct');
        title.classList.add('correct');
        
        emoji.textContent = '🎉';
        title.textContent = '¡Excelente!';
        message.textContent = '¡Respuesta correcta! Sigues mejorando tu japonés.';
        
        // Mostrar estrellas brillantes
        stars.style.display = 'block';
        setTimeout(() => {
            stars.style.display = 'none';
        }, 3000);
        
        // Ocultar corrección
        correction.style.display = 'none';
    } else {
        // Respuesta incorrecta
        content.classList.add('popup-incorrect');
        icon.classList.add('incorrect');
        title.classList.add('incorrect');
        
        emoji.textContent = '💪';
        title.textContent = '¡Sigue intentando!';
        message.textContent = 'No te preocupes, la práctica hace al maestro.';
        
        // Mostrar corrección
        correction.style.display = 'block';
        popupCharacter.textContent = character;
        popupReading.textContent = correctAnswer;
        
        // Ocultar estrellas
        stars.style.display = 'none';
    }

    // Mostrar popup
    overlay.classList.add('active');
}

function hidePopup() {
    const overlay = document.getElementById('popup-overlay');
    overlay.classList.remove('active');
    
    // Cargar nuevo carácter después de cerrar el popup
    setTimeout(() => {
        loadNewCharacter();
    }, 300);
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim();

    if (isReverseMode) {
        // Modo Reverse: Comparar con el carácter en japonés
        if (userAnswer === currentCharacter) {
            showPopup(true);
        } else {
            showPopup(false, userAnswer, currentRomanization, currentCharacter);
        }
    } else {
        // Modo Normal: Comparar con la romanización
        if (userAnswer === currentRomanization) {
            showPopup(true);
        } else {
            showPopup(false, userAnswer, currentRomanization, currentCharacter);
        }
    }

    document.getElementById("answer").value = "";
}

function loadNewCharacter() {
    const randomChar = getRandomCharacter();
    currentCharacter = randomChar.character;
    currentRomanization = randomChar.romanization;
    updateUI();
}

document.getElementById("toggle-mode").addEventListener("click", () => {
    isReverseMode = !isReverseMode;
    updateUI();
});

document.getElementById("check").addEventListener("click", checkAnswer);

// Event listeners para el popup
document.getElementById("popup-close").addEventListener("click", hidePopup);
document.getElementById("popup-overlay").addEventListener("click", (e) => {
    if (e.target.id === 'popup-overlay') {
        hidePopup();
    }
});

// Permitir cerrar con Enter en el input
document.getElementById("answer").addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

loadHiraganaData();