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
createParticles(100, 1, 3, 5, 5); // Many small particles for general ambient effect

// --- Helper function to reset and trigger typewriter animation ---
function applyTypewriterEffect(element, originalText, isTypedOnce, charSpeed = 0.05, blink = true) {
    // Store original text in a data attribute for robust access
    element.dataset.originalText = originalText; 
    
    // Clear current text content immediately to prepare for typing animation
    element.textContent = ''; 
    
    // Reset styling for animation to re-trigger
    element.style.width = '0'; // Start with 0 width
    element.style.overflow = 'hidden'; // Hide overflow during typing
    // Set initial caret or no caret based on 'blink' parameter
    element.style.borderRight = blink ? '.15em solid orange' : 'none'; 
    
    // Force a reflow/re-render to ensure animation restarts from scratch
    void element.offsetWidth; 

    const typingDuration = originalText.length * charSpeed; // Calculate duration
    
    // Define the animation string, using 'forwards' to retain final state
    const animationProperty = blink ? 
        `typing ${typingDuration}s steps(${originalText.length}, end) forwards, blinkCaret .75s step-end infinite` :
        `typing ${typingDuration}s steps(${originalText.length}, end) forwards`;

    element.style.animation = animationProperty;

    // IMPORTANT: Set the text content AFTER a very tiny delay.
    // This allows the CSS animation to begin on an "empty" element,
    // and then the text appears *under* the expanding width.
    setTimeout(() => {
        element.textContent = originalText;
    }, 10); // A minimal delay (e.g., 10ms) is often sufficient.

    // Add an event listener to handle the end of the typing animation.
    // This removes the blinking caret and cleans up animation properties.
    const handleAnimationEnd = () => {
        // Only remove caret/animation if it's meant to be typed once or not blink
        if (isTypedOnce || !blink) {
            element.style.animation = 'none'; // Remove all animation properties
            element.style.borderRight = 'none'; // Ensure caret is gone
            element.style.width = 'auto'; // Allow width to be natural after typing
        }
        // Remove the event listener to prevent it from firing multiple times
        element.removeEventListener('animationend', handleAnimationEnd);
    };
    element.addEventListener('animationend', handleAnimationEnd, { once: true }); // Use {once: true} for safety
}


// --- Function to handle card visibility and typewriter effect ---
function revealCardAndTypewrite(card) {
    if (card.classList.contains('revealed')) {
        card.style.opacity = 1;
        card.style.pointerEvents = 'auto';
        return; 
    }
    
    card.classList.add('revealed'); 
    card.style.opacity = 1; 
    card.style.pointerEvents = 'auto'; 

    card.querySelectorAll('.typewriter-text').forEach(textSpan => {
        const originalText = textSpan.dataset.originalText || textSpan.textContent;
        const isTypedOnce = textSpan.classList.contains('typed-once');
        applyTypewriterEffect(textSpan, originalText, isTypedOnce, 0.04); 
    });

    const h1Title = card.querySelector('.typewriter-text-h1');
    if (h1Title) {
        const originalText = h1Title.dataset.originalText || h1Title.textContent;
        applyTypewriterEffect(h1Title, originalText, false, 0.06); 
    }
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


// --- Initial setup for cards on page load ---
document.addEventListener('DOMContentLoaded', () => {
    const allCards = document.querySelectorAll('.card');
    let initialDelay = 0; 

    allCards.forEach(card => {
        card.style.opacity = 0; 
        card.style.pointerEvents = 'none'; 
        card.classList.remove('revealed'); 
        
        // IMPORTANT: Pre-populate data-originalText attributes for all typewriter elements
        card.querySelectorAll('.typewriter-text, .typewriter-text-h1').forEach(textElement => {
            // Only set if not already set or if it's currently empty (e.g., from previous failed attempt)
            if (!textElement.dataset.originalText || textElement.dataset.originalText === '') { 
                textElement.dataset.originalText = textElement.textContent || ''; // Ensure it's not null/undefined
            }
        });
    });

    const firstCard = document.getElementById('greetingCard');
    if (firstCard) {
        revealCardAndTypewrite(firstCard); 
        initialDelay = 800; 
    }

    allCards.forEach(card => {
        if (card === firstCard) { 
            return;
        }

        const rect = card.getBoundingClientRect();
        const isVisibleOnLoad = (rect.top < window.innerHeight && rect.bottom > 0);

        if (isVisibleOnLoad) {
            setTimeout(() => {
                revealCardAndTypewrite(card);
            }, initialDelay);
            initialDelay += 400; 
        } else {
            cardObserver.observe(card);
        }
    });
});


// --- Dynamic Background (Sky, Sea, Sun/Moon, and Animated Elements) ---
function setDynamicBackgroundAndElements() {
    const now = new Date();
    const hour = now.getHours(); 
    let skyGradient, seaGradient, celestialColor, celestialSize, celestialBlur, celestialTop, celestialLeft;
    let birdDisplay = 'none', planeDisplay = 'none', starDisplay = 'none'; // Permanently hide birds and planes
    let particleDisplay = 'block'; 
    let particleOpacity; 
    let celestialBlurIntensity; // Variable to control blur based on dimness

    // Dimmed color palettes
    if (hour >= 5 && hour < 7) { // Early Morning / Sunrise (5 AM - 6:59 AM) - Dimmed warm tones
        skyGradient = 'linear-gradient(to bottom, #7a5d4e 0%, #6b4d53 50%, #5e707d 100%)'; 
        seaGradient = 'linear-gradient(to top, #2e4a5c, #3f5a7d)'; 
        celestialColor = '#e07b27'; // Dimmer orange/red sun
        celestialSize = '80px';
        celestialBlurIntensity = '20px'; // Less intense blur
        celestialTop = '35%'; 
        celestialLeft = '20%';
        particleOpacity = 0.3; // Dimmer haze
    } else if (hour >= 7 && hour < 12) { // Morning / Day (7 AM - 11:59 AM) - Dimmed bright blues
        skyGradient = 'linear-gradient(to bottom, #4f7488 0%, #628292 70%, #7e98a7 100%)'; 
        seaGradient = 'linear-gradient(to top, #0f4a7c, #2f5f90)'; 
        celestialColor = '#b8aa3e'; // Dimmer gold sun
        celestialSize = '90px';
        celestialBlurIntensity = '25px'; // Less intense blur
        celestialTop = '20%';
        celestialLeft = '50%';
        particleOpacity = 0.4; // Dimmer haze
    } else if (hour >= 12 && hour < 17) { // Afternoon (12 PM - 4:59 PM) - Dimmed deep blues/purples
        skyGradient = 'linear-gradient(to bottom, #3b336b 0%, #292451 60%, #6e8492 100%)'; 
        seaGradient = 'linear-gradient(to top, #00003b, #0f0f4a)'; 
        celestialColor = '#af6f1c'; // Dimmer orange sun
        celestialSize = '85px';
        celestialBlurIntensity = '22px'; // Less intense blur
        celestialTop = '25%';
        celestialLeft = '80%';
        particleOpacity = 0.3; // Dimmer haze
    } else if (hour >= 17 && hour < 19) { // Sunset (5 PM - 6:59 PM) - Dimmed dramatic tones
        skyGradient = 'linear-gradient(to bottom, #993b2c 0%, #993300 50%, #5d0000 100%)'; 
        seaGradient = 'linear-gradient(to top, #2f5a7d, #3b336b)'; 
        celestialColor = '#b8aa3e'; // Dimmer gold sun
        celestialSize = '100px'; 
        celestialBlurIntensity = '30px'; // Still some glow but dimmer
        celestialTop = '45%'; 
        celestialLeft = '50%';
        particleOpacity = 0.2; // Very dim haze
    } else { // Night (7 PM - 4:59 AM) - Deepest dimness, only stars visible
        skyGradient = 'linear-gradient(to bottom, #000010 0%, #000020 50%, #000030 100%)'; 
        seaGradient = 'linear-gradient(to top, #000010, #000020)'; 
        celestialColor = '#a0a0a0'; // Dimmer white moon
        celestialSize = '60px';
        celestialBlurIntensity = '10px'; // Minimal moon glow
        celestialTop = '15%';
        celestialLeft = '70%';
        
        starDisplay = 'block'; // Show shooting stars at night
        particleOpacity = 0.05; // Very dim particles (stars)
    }

    document.documentElement.style.setProperty('--sky-gradient', skyGradient);
    document.documentElement.style.setProperty('--sea-gradient', seaGradient);
    document.documentElement.style.setProperty('--celestial-color', celestialColor);
    document.documentElement.style.setProperty('--celestial-size', celestialSize);
    document.documentElement.style.setProperty('--celestial-blur', celestialBlurIntensity); // Apply new blur intensity
    document.documentElement.style.setProperty('--celestial-top', celestialTop);
    document.documentElement.style.setProperty('--celestial-left', celestialLeft);

    // Hide birds and planes explicitly
    document.querySelectorAll('.bird').forEach(el => el.style.display = birdDisplay);
    document.querySelectorAll('.plane').forEach(el => el.style.display = planeDisplay);
    document.querySelectorAll('.shooting-star').forEach(el => el.style.display = starDisplay);
    document.querySelectorAll('.particle').forEach(el => el.style.setProperty('--particle-opacity', particleOpacity));
    document.documentElement.style.setProperty('--particle-display', particleDisplay); 

    // These heights remain fixed for the fixed background elements
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
    let typedTextSpan = greetingElement.querySelector('.typewriter-text');
    if (!typedTextSpan) { 
        typedTextSpan = document.createElement('span');
        typedTextSpan.classList.add('typewriter-text');
        greetingElement.innerHTML = ''; 
        greetingElement.appendChild(typedTextSpan);
    }
    applyTypewriterEffect(typedTextSpan, baseGreeting, false, 0.05, true); 
}
updateGreeting(); 

// --- Rotating Questions Logic ---
const questions = [
    "What's one thing you're looking forward to today?",
    "If you could have any superpower, what would it be?",
    "What's your favorite memory with her so far?",
    "What's a small act of kindness you can do today?",
    "What's your go-to song when you need a boost?",
    "What's something new you want to learn?",
    "If you could travel anywhere, where would you go?",
    "What makes you smile the most?",
    "What's your favorite thing about being in school?",
    "What's a dream you have for the future?",
    "What's one thing you appreciate about her?",
    "If you could spend a day doing anything, what would it be?",
    "What's your favorite subject in school?",
    "What's a funny memory you have?",
    "What's a goal you're working towards right now?",
    "What's your favorite way to relax?",
    "If you could give one piece of advice to your past self, what would it be?",
    "What's your favorite season and why?",
    "What's a book or movie that has inspired you?",
    "What's something you're grateful for today?"
];

function displayRandomQuestion() {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const questionText = questions[randomIndex];
    const dailyQuestionElement = document.getElementById('dailyQuestion');
    
    let typedTextSpan = dailyQuestionElement.querySelector('.typewriter-text');
    if (!typedTextSpan) {
        typedTextSpan = document.createElement('span');
        typedTextSpan.classList.add('typewriter-text', 'typed-once');
        dailyQuestionElement.innerHTML = ''; 
        dailyQuestionElement.appendChild(typedTextSpan);
    }
    applyTypewriterEffect(typedTextSpan, questionText, true, 0.04, false); 
}
displayRandomQuestion(); 

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
        let typedTextSpan = countdownElement.querySelector('.typewriter-text.typed-once');
        if (!typedTextSpan) { 
            typedTextSpan = document.createElement('span');
            typedTextSpan.classList.add('typewriter-text', 'typed-once');
            countdownElement.innerHTML = ''; 
            countdownElement.appendChild(typedTextSpan);
            applyTypewriterEffect(typedTextSpan, "It's time! School has started! 🎉", true, 0.05, false);
        } else if (typedTextSpan.dataset.originalText !== "It's time! School has started! 🎉") {
            applyTypewriterEffect(typedTextSpan, "It's time! School has started! 🎉", true, 0.05, false);
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
