// --- Particle background effect (for subtle sky glow / stars) ---
function createParticles(count, minSize, maxSize, animationDuration, animationDelay) {
    const body = document.body;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * (maxSize - minSize) + minSize;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.animationDelay = `${Math.random() * animationDelay}s`;
        particle.style.animationDuration = `${Math.random() * animationDuration + 5}s`;
        body.appendChild(particle);
    }
}
createParticles(50, 1, 3, 5, 5); // Reduced particle count from 100 to 50 for simplicity.

// --- Helper function for fade-in/scale-up text animation ---
function applyTextRevealEffect(element, originalText, delay = 0) {
    element.textContent = originalText;
    element.style.opacity = 0;
    element.style.transform = 'scale(0.9)';
    element.style.animation = `fadeInScale 0.8s ease-out forwards`;
    element.style.animationDelay = `${delay}s`;
}


// --- Function to handle card visibility and text reveal effect ---
function revealCardAndTypewrite(card) {
    if (card.classList.contains('revealed')) {
        card.style.opacity = 1;
        card.style.pointerEvents = 'auto';
        return; 
    }
    
    card.classList.add('revealed'); 
    card.style.opacity = 1; 
    card.style.pointerEvents = 'auto'; 

    let textDelay = 0; 

    // Apply text reveal effect to all elements with '.text-reveal-animation' class within THIS card
    card.querySelectorAll('.text-reveal-animation').forEach(textSpan => {
        const originalText = textSpan.dataset.originalText || textSpan.textContent;
        applyTextRevealEffect(textSpan, originalText, textDelay);
        textDelay += 0.2; 
    });
}


// --- Intersection Observer for cards that come into view by scrolling ---
const observerOptions = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.1 
};

const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { 
            revealCardAndTypewrite(entry.target); 
            observer.unobserve(entry.target); 
        }
    });
}, observerOptions);


// --- Initial setup for elements on page load ---
document.addEventListener('DOMContentLoaded', () => {
    // Hide all cards initially and pre-populate text content
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = 0; 
        card.style.pointerEvents = 'none'; 
        card.classList.remove('revealed'); 
        
        card.querySelectorAll('.text-reveal-animation').forEach(textElement => {
            if (!textElement.dataset.originalText || textElement.dataset.originalText === '') { 
                textElement.dataset.originalText = textElement.textContent || '';
            }
        });
    });

    // 1. Handle the standalone greeting text animation immediately
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        greetingElement.classList.add('text-reveal-animation-standalone');
        if (!greetingElement.dataset.originalText) {
            greetingElement.dataset.originalText = greetingElement.textContent || '';
        }
        updateGreeting(); // This will trigger its animation
    }

    // 2. Handle the daily question text animation immediately
    displayRandomQuestion();

    // 3. Set up the observer for the actual cards (excluding the greeting which is now separate)
    const allContentCards = document.querySelectorAll('.card'); 
    let initialCardDelay = 500; 

    allContentCards.forEach(card => {
        cardObserver.observe(card);
        const rect = card.getBoundingClientRect();
        const isVisibleOnLoad = (rect.top < window.innerHeight && rect.bottom > 0);
        if (isVisibleOnLoad) {
            setTimeout(() => {
                revealCardAndTypewrite(card);
            }, initialCardDelay);
            initialCardDelay += 400; 
        }
    });
});


// --- Dynamic Background (Sky, Sea, Sun/Moon, and Animated Elements) ---
function setDynamicBackgroundAndElements() {
    const now = new Date();
    const hour = now.getHours(); 
    let skyGradient, seaGradient, celestialColor, celestialSize, celestialBlur, celestialTop, celestialLeft;
    let birdDisplay = 'none', planeDisplay = 'none', starDisplay = 'none'; 
    let particleDisplay = 'block'; 
    let particleOpacity; 
    let celestialBlurIntensity; 

    // Dimmed color palettes - these remain consistent with previous request
    if (hour >= 5 && hour < 7) { 
        skyGradient = 'linear-gradient(to bottom, #7a5d4e 0%, #6b4d53 50%, #5e707d 100%)'; 
        seaGradient = 'linear-gradient(to top, #2e4a5c, #3f5a7d)'; 
        celestialColor = '#e07b27'; 
        celestialSize = '80px';
        celestialBlurIntensity = '20px'; 
        celestialTop = '35%'; 
        celestialLeft = '20%';
        particleOpacity = 0.3; 
    } else if (hour >= 7 && hour < 12) { 
        skyGradient = 'linear-gradient(to bottom, #4f7488 0%, #628292 70%, #7e98a7 100%)'; 
        seaGradient = 'linear-gradient(to top, #0f4a7c, #2f5f90)'; 
        celestialColor = '#b8aa3e'; 
        celestialSize = '90px';
        celestialBlurIntensity = '25px'; 
        celestialTop = '20%';
        celestialLeft = '50%';
        particleOpacity = 0.4; 
    } else if (hour >= 12 && hour < 17) { 
        skyGradient = 'linear-gradient(to bottom, #3b336b 0%, #292451 60%, #6e8492 100%)'; 
        seaGradient = 'linear-gradient(to top, #00003b, #0f0f4a)'; 
        celestialColor = '#af6f1c'; 
        celestialSize = '85px';
        celestialBlurIntensity = '22px'; 
        celestialTop = '25%';
        celestialLeft = '80%';
        particleOpacity = 0.3; 
    } else if (hour >= 17 && hour < 19) { 
        skyGradient = 'linear-gradient(to bottom, #993b2c 0%, #993300 50%, #5d0000 100%)'; 
        seaGradient = 'linear-gradient(to top, #2f5a7d, #3b336b)'; 
        celestialColor = '#b8aa3e'; 
        celestialSize = '100px'; 
        celestialBlurIntensity = '30px'; 
        celestialTop = '45%'; 
        celestialLeft = '50%';
        particleOpacity = 0.2; 
    } else { 
        skyGradient = 'linear-gradient(to bottom, #000010 0%, #000020 50%, #000030 100%)'; 
        seaGradient = 'linear-gradient(to top, #000010, #000020)'; 
        celestialColor = '#a0a0a0'; 
        celestialSize = '60px';
        celestialBlurIntensity = '10px';
        celestialTop = '15%';
        celestialLeft = '70%';
        
        starDisplay = 'block'; 
        particleOpacity = 0.05; 
    }

    document.documentElement.style.setProperty('--sky-gradient', skyGradient);
    document.documentElement.style.setProperty('--sea-gradient', seaGradient);
    document.documentElement.style.setProperty('--celestial-color', celestialColor);
    document.documentElement.style.setProperty('--celestial-size', celestialSize);
    document.documentElement.style.setProperty('--celestial-blur', celestialBlurIntensity);
    document.documentElement.style.setProperty('--celestial-top', celestialTop);
    document.documentElement.style.setProperty('--celestial-left', celestialLeft);

    document.querySelectorAll('.bird').forEach(el => el.style.display = birdDisplay);
    document.querySelectorAll('.plane').forEach(el => el.style.display = planeDisplay);
    document.querySelectorAll('.shooting-star').forEach(el => el.style.display = starDisplay);
    document.querySelectorAll('.particle').forEach(el => el.style.setProperty('--particle-opacity', particleOpacity));
    document.documentElement.style.setProperty('--particle-display', particleDisplay); 

    document.documentElement.style.setProperty('--sky-height', '70%');
    document.documentElement.style.setProperty('--sea-height', '30%');
}
setDynamicBackgroundAndElements();
setInterval(setDynamicBackgroundAndElements, 10 * 60 * 1000); 

// --- Greeting Logic ---
function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let baseGreeting;

    if (hour >= 5 && hour < 12) {
        baseGreeting = "Good Morning, Reechita! ☀️";
    } else if (hour >= 12 && hour < 18) {
        baseGreeting = "Good Afternoon, Reechita! 🌤️";
    } else {
        baseGreeting = "Good Evening, Reechita! 🌙";
    }
    
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        // Apply the reveal effect to the standalone greeting with a small delay
        applyTextRevealEffect(greetingElement, baseGreeting, 0.3); // Starts after 0.3s
    }
}

// --- Rotating Questions Logic ---
const questions = [
    "What's one thing you're looking forward to today?",
    "If you could have any superpower, what would it be?",
    "What's a fun fact you learned recently?", // Neutralized
    "What's a small act of kindness you can do today?",
    "What's your go-to song when you need a boost?",
    "What's something new you want to learn?",
    "If you could travel anywhere, where would you go?",
    "What makes you smile the most?",
    "What's your favorite subject in school?",
    "What's a dream you have for the future?",
    "What's one thing that always brightens your day?", // Neutralized
    "If you could spend a day doing anything, what would it be?",
    "What's your favorite book or movie character?", // Neutralized
    "What's a funny memory you have?",
    "What's a goal you're working towards right now?",
    "What's your favorite way to relax?",
    "If you could give one piece of advice to your younger self, what would it be?",
    "What's your favorite season and why?",
    "What's a book or movie that has inspired you?",
    "What's something you're grateful for today?"
];

function displayRandomQuestion() {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const questionText = questions[randomIndex];
    const dailyQuestionElement = document.getElementById('dailyQuestion');
    
    // Apply the reveal effect for the question
    applyTextRevealEffect(dailyQuestionElement, questionText, 0.5); // Starts after 0.5s
}

// --- Countdown Timer Logic ---
const targetDate = new Date("July 4, 2025 11:30:00 GMT+0530"); // Target: July 4th, 2025 11:30 AM IST
const countdownElement = document.getElementById('countdown');

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (distance < 0) {
        let textRevealSpan = countdownElement.querySelector('.text-reveal-animation');
        if (!textRevealSpan) { 
            textRevealSpan = document.createElement('span');
            textRevealSpan.classList.add('text-reveal-animation');
            countdownElement.innerHTML = ''; 
            countdownElement.appendChild(textRevealSpan);
            applyTextRevealEffect(textRevealSpan, "It's time! School has started! 🎉", 0);
        } else if (textRevealSpan.textContent !== "It's time! School has started! 🎉") {
            applyTextRevealEffect(textRevealSpan, "It's time! School has started! 🎉", 0);
        }
        clearInterval(countdownInterval); 
    } else {
        countdownElement.innerHTML =
            `<span class="number" style="--delay: 0s;">${days > 0 ? days + "d " : ""}</span>` +
            `<span class="number" style="--delay: 0.1s;">${hours < 10 ? "0" + hours : hours}h </span>` +
            `<span class="number" style="--delay: 0.2s;">${minutes < 10 ? "0" + minutes : minutes}m </span>` +
            `<span class="number" style="--delay: 0.3s;">${seconds < 10 ? "0" + seconds : seconds}s</span>`;
    }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();
