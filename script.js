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
    element.dataset.originalText = originalText; // Store original text
    element.textContent = ''; // Clear text to re-type
    element.style.width = '0'; // Reset width for typing
    element.style.overflow = 'hidden'; // Ensure overflow hidden during typing

    // Clear any existing animation to ensure it restarts
    element.style.animation = 'none';
    void element.offsetWidth; // Trigger reflow to apply 'none'

    const typingDuration = originalText.length * charSpeed; // Calculate duration based on text length and speed
    const animationProperty = blink ? 
        `typing ${typingDuration}s steps(${originalText.length}, end) forwards, blinkCaret .75s step-end infinite` :
        `typing ${typingDuration}s steps(${originalText.length}, end) forwards`;

    element.style.animation = animationProperty;

    // Set the actual text after a small delay to allow animation reset
    setTimeout(() => {
        element.textContent = originalText;
        if (isTypedOnce || !blink) { // If it's a "typed-once" or non-blinking element
            element.addEventListener('animationend', () => {
                element.style.animation = 'none';
                element.style.borderRight = 'none';
            }, { once: true });
        }
    }, 50); // Small delay to ensure animation applies
}

// --- Function to handle card visibility and typewriter effect ---
function revealCardAndTypewrite(card) {
    if (card.classList.contains('revealed')) {
        card.style.opacity = 1;
        card.style.pointerEvents = 'auto';
        return; // Prevent re-revealing
    }
    
    card.classList.add('revealed'); // Mark as revealed
    card.style.opacity = 1; // Make card visible
    card.style.pointerEvents = 'auto'; // Re-enable interaction

    // Trigger typewriter for all .typewriter-text elements within this card
    card.querySelectorAll('.typewriter-text').forEach(textSpan => {
        const originalText = textSpan.dataset.originalText || textSpan.textContent;
        const isTypedOnce = textSpan.classList.contains('typed-once');
        applyTypewriterEffect(textSpan, originalText, isTypedOnce, 0.04); // Slightly faster for general text
    });

    // For the h1 title (which is not a .typewriter-text span)
    const h1Title = card.querySelector('.typewriter-text-h1');
    if (h1Title) {
        const originalText = h1Title.dataset.originalText || h1Title.textContent;
        applyTypewriterEffect(h1Title, originalText, false, 0.06); // Slower, more impactful for h1
    }
}


// --- Intersection Observer for cards that come into view by scrolling ---
const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1 // 10% of element visible
};

const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            revealCardAndTypewrite(entry.target);
            observer.unobserve(entry.target); // Stop observing once revealed
        }
    });
}, observerOptions);

// --- Initial setup for cards on page load ---
document.addEventListener('DOMContentLoaded', () => {
    const allCards = document.querySelectorAll('.card');
    let initialDelay = 0; // For staggered initial reveals

    // Reset all cards to initial hidden state before observation
    allCards.forEach(card => {
        card.style.opacity = 0;
        card.style.pointerEvents = 'none';
        card.classList.remove('revealed'); // Ensure no previous 'revealed' state
    });

    // Manually handle the first card (greeting/countdown) to ensure it always appears first
    const firstCard = document.getElementById('greetingCard');
    if (firstCard) {
        revealCardAndTypewrite(firstCard);
        initialDelay = 800; // Add an initial delay for subsequent cards if the first one is immediate
    }

    // Now observe the rest of the cards, applying staggered reveal for those initially visible
    allCards.forEach(card => {
        if (card === firstCard) { // Skip the first card if it's already handled
            return;
        }

        const rect = card.getBoundingClientRect();
        // Check if card is immediately visible on load (even partially)
        const isVisibleOnLoad = (rect.top < window.innerHeight && rect.bottom > 0);

        if (isVisibleOnLoad) {
            // Apply initial fade-in and typewriter with a staggered delay
            setTimeout(() => {
                revealCardAndTypewrite(card);
            }, initialDelay);
            initialDelay += 400; // Stagger initial reveal more spaced out
        } else {
            // If not visible, observe it for when it scrolls into view
            cardObserver.observe(card);
        }
    });
});


// --- Dynamic Background (Sky, Sea, Sun/Moon, and Animated Elements) ---
function setDynamicBackgroundAndElements() {
    const now = new Date();
    const hour = now.getHours();
    let skyGradient, seaGradient, celestialColor, celestialSize, celestialBlur, celestialTop, celestialLeft;
    let birdDisplay = 'block', planeDisplay = 'block', starDisplay = 'none';
    let birdColor = '#333', planeColor = '#ccc';
    let particleDisplay = 'block'; // Particles (haze/stars) always on
    let particleOpacity = 0.8; // More opaque during day (haze), less at night (stars)
    
    // Time periods and corresponding styles for realism
    // Colors are chosen to blend smoothly and evoke realistic atmosphere
    if (hour >= 5 && hour < 7) { // Early Morning / Sunrise (5 AM - 6:59 AM)
        skyGradient = 'linear-gradient(to bottom, #FFDAB9 0%, #FFB6C1 50%, #B0E0E6 100%)'; // Peach to Light Pink to Powder Blue (for horizon)
        seaGradient = 'linear-gradient(to top, #4682B4, #6495ED)'; // SteelBlue to CornflowerBlue (deepens slightly from horizon)
        celestialColor = '#FF8C00'; // DarkOrange (Sun)
        celestialSize = '90px';
        celestialBlur = '30px';
        celestialTop = '30%'; // Lower in the sky
        celestialLeft = '20%';
        planeColor = '#eee';
        birdColor = '#555';
        particleOpacity = 0.6; // Haze
    } else if (hour >= 7 && hour < 12) { // Morning / Day (7 AM - 11:59 AM)
        skyGradient = 'linear-gradient(to bottom, #87CEEB 0%, #ADD8E6 70%, #E0FFFF 100%)'; // SkyBlue to LightBlue to Light Cyan (brightest near horizon)
        seaGradient = 'linear-gradient(to top, #1E90FF, #4169E1)'; // DodgerBlue to RoyalBlue (bright, clear sea)
        celestialColor = '#FFD700'; // Gold (Sun)
        celestialSize = '100px';
        celestialBlur = '40px'; // Stronger glow
        celestialTop = '15%';
        celestialLeft = '50%';
        planeColor = '#fff';
        birdColor = '#333';
        particleOpacity = 0.7; // Brighter haze
    } else if (hour >= 12 && hour < 17) { // Afternoon (12 PM - 4:59 PM)
        skyGradient = 'linear-gradient(to bottom, #6A5ACD 0%, #483D8B 60%, #ADD8E6 100%)'; // SlateBlue to DarkSlateBlue to LightBlue (deeper sky, bright horizon)
        seaGradient = 'linear-gradient(to top, #000080, #191970)'; // Navy to MidnightBlue (deep, intense sea)
        celestialColor = '#FFA500'; // Orange (Sun)
        celestialSize = '95px';
        celestialBlur = '35px';
        celestialTop = '20%';
        celestialLeft = '80%';
        planeColor = '#ccc';
        birdColor = '#444';
        particleOpacity = 0.6; // Afternoon haze
    } else if (hour >= 17 && hour < 19) { // Sunset (5 PM - 6:59 PM)
        skyGradient = 'linear-gradient(to bottom, #FF6347 0%, #FF4500 50%, #8B0000 100%)'; // Tomato to OrangeRed to DarkRed (dramatic sunset hues)
        seaGradient = 'linear-gradient(to top, #4169E1, #6A5ACD)'; // RoyalBlue to SlateBlue (reflecting sunset)
        celestialColor = '#FFD700'; // Gold (Sun)
        celestialSize = '110px'; // Largest at sunset
        celestialBlur = '50px'; // Max glow
        celestialTop = '40%'; // Closest to horizon
        celestialLeft = '50%';
        planeColor = '#aaa';
        birdColor = '#222';
        particleOpacity = 0.5; // Fading haze
    } else { // Night (7 PM - 4:59 AM)
        skyGradient = 'linear-gradient(to bottom, #000022 0%, #000044 50%, #000066 100%)'; // Very dark blue to deep blue (for stars)
        seaGradient = 'linear-gradient(to top, #000022, #000044)'; // Very dark sea
        celestialColor = '#E0E0E0'; // White (Moon)
        celestialSize = '70px';
        celestialBlur = '20px';
        celestialTop = '10%';
        celestialLeft = '70%';
        
        starDisplay = 'block'; // Show shooting stars at night
        birdDisplay = 'none'; // Hide birds at night
        planeDisplay = 'none'; // Hide planes at night
        particleOpacity = 0.1; // Dimmer particles (stars)
    }

    document.documentElement.style.setProperty('--sky-gradient', skyGradient);
    document.documentElement.style.setProperty('--sea-gradient', seaGradient);
    document.documentElement.style.setProperty('--celestial-color', celestialColor);
    document.documentElement.style.setProperty('--celestial-size', celestialSize);
    document.documentElement.style.setProperty('--celestial-blur', celestialBlur);
    document.documentElement.style.setProperty('--celestial-top', celestialTop);
    document.documentElement.style.setProperty('--celestial-left', celestialLeft);

    // Set display for animated elements based on time of day
    document.querySelectorAll('.bird').forEach(el => el.style.display = birdDisplay);
    document.querySelectorAll('.plane').forEach(el => el.style.display = planeDisplay);
    document.querySelectorAll('.shooting-star').forEach(el => el.style.display = starDisplay);
    document.querySelectorAll('.particle').forEach(el => el.style.setProperty('--particle-opacity', particleOpacity));
    document.documentElement.style.setProperty('--particle-display', particleDisplay); // Control particle visibility

    document.documentElement.style.setProperty('--bird-color', birdColor);
    document.documentElement.style.setProperty('--plane-color', planeColor);

    // These heights remain fixed for the fixed background elements
    document.documentElement.style.setProperty('--sky-height', '70%');
    document.documentElement.style.setProperty('--sea-height', '30%');
}
setDynamicBackgroundAndElements();
// Update the background every 10 minutes (or change to 60 * 60 * 1000 for hourly)
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
    const typedTextSpan = greetingElement.querySelector('.typewriter-text') || document.createElement('span');
    if (!typedTextSpan.parentElement) { // If it's a new span, append it
        typedTextSpan.classList.add('typewriter-text');
        greetingElement.innerHTML = '';
        greetingElement.appendChild(typedTextSpan);
    }
    applyTypewriterEffect(typedTextSpan, baseGreeting, false, 0.05, true); // Always blinks
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
    
    const typedTextSpan = dailyQuestionElement.querySelector('.typewriter-text') || document.createElement('span');
    if (!typedTextSpan.parentElement) {
        typedTextSpan.classList.add('typewriter-text', 'typed-once');
        dailyQuestionElement.innerHTML = '';
        dailyQuestionElement.appendChild(typedTextSpan);
    }
    applyTypewriterEffect(typedTextSpan, questionText, true, 0.04, false); // Doesn't blink after typing
}
displayRandomQuestion(); // Display a question on load

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
        const typedTextSpan = countdownElement.querySelector('.typed-once');
        if (!typedTextSpan || typedTextSpan.dataset.originalText !== "It's time! School has started! 🎉") {
            const newTypedSpan = document.createElement('span');
            newTypedSpan.classList.add('typewriter-text', 'typed-once');
            countdownElement.innerHTML = ''; // Clear previous content
            countdownElement.appendChild(newTypedSpan);
            applyTypewriterEffect(newTypedSpan, "It's time! School has started! 🎉", true, 0.05, false);
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
updateCountdown(); // Call immediately to avoid initial empty state
