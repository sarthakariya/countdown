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
    element.style.width = '0'; 
    element.style.overflow = 'hidden'; 
    element.style.borderRight = blink ? '.15em solid orange' : 'none'; // Set initial caret or no caret
    
    // Force a reflow/re-render to ensure animation restarts from scratch
    // This is crucial for fixing cases where animation doesn't play again
    void element.offsetWidth; 

    const typingDuration = originalText.length * charSpeed; // Calculate duration based on text length and speed
    
    // Define the animation string
    const animationProperty = blink ? 
        `typing ${typingDuration}s steps(${originalText.length}, end) forwards, blinkCaret .75s step-end infinite` :
        `typing ${typingDuration}s steps(${originalText.length}, end) forwards`;

    element.style.animation = animationProperty;

    // Set the actual text content ONLY when the typing animation *starts* to play characters
    // This timing is crucial: it prevents the text from being fully present before animation
    // and ensures it's there after the animation "fills" forward.
    element.textContent = originalText; // Set the full text content immediately

    // Add an event listener to handle the end of the typing animation
    // This is where we remove the blinking caret if it's a 'typed-once' element
    const handleAnimationEnd = () => {
        // Only remove caret/animation if it's meant to be typed once or not blink
        if (isTypedOnce || !blink) {
            element.style.animation = 'none'; // Remove all animation
            element.style.borderRight = 'none'; // Remove caret
        }
        // Remove the event listener to prevent it from firing multiple times if re-animated
        element.removeEventListener('animationend', handleAnimationEnd);
    };
    element.addEventListener('animationend', handleAnimationEnd, { once: true }); // Use {once: true} for safety
}


// --- Function to handle card visibility and typewriter effect ---
function revealCardAndTypewrite(card) {
    // If the card is already marked as revealed, ensure it's visible and clickable, then exit.
    // This prevents re-triggering effects on already visible cards.
    if (card.classList.contains('revealed')) {
        card.style.opacity = 1;
        card.style.pointerEvents = 'auto';
        return; 
    }
    
    // Mark the card as revealed
    card.classList.add('revealed'); 
    
    // Make the card visible with a smooth transition
    card.style.opacity = 1; 
    card.style.pointerEvents = 'auto'; // Enable interactions (e.g., selection)

    // Apply typewriter effect to all elements with '.typewriter-text' class within this card
    card.querySelectorAll('.typewriter-text').forEach(textSpan => {
        // Get the original text, preferring data-originalText if available
        const originalText = textSpan.dataset.originalText || textSpan.textContent;
        // Check if the element should only be typed once (e.g., questions, messages)
        const isTypedOnce = textSpan.classList.contains('typed-once');
        // Apply the typewriter effect with specific speed and blinking behavior
        applyTypewriterEffect(textSpan, originalText, isTypedOnce, 0.04); // Slightly faster for general text
    });

    // Handle the special H1 title separately if it exists
    const h1Title = card.querySelector('.typewriter-text-h1');
    if (h1Title) {
        const originalText = h1Title.dataset.originalText || h1Title.textContent;
        // H1 title should always blink after typing, so 'blink' is true
        applyTypewriterEffect(h1Title, originalText, false, 0.06); // Slower, more impactful for h1
    }
}


// --- Intersection Observer for cards that come into view by scrolling ---
const observerOptions = {
    root: null, // Observe relative to the viewport
    rootMargin: '0px', // No extra margin around the root
    threshold: 0.1 // Trigger when 10% of the element is visible
};

const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { // If the observed element is intersecting the viewport
            revealCardAndTypewrite(entry.target); // Reveal the card and start typewriter
            observer.unobserve(entry.target); // Stop observing once it's revealed
        }
    });
}, observerOptions);


// --- Initial setup for cards on page load ---
document.addEventListener('DOMContentLoaded', () => {
    const allCards = document.querySelectorAll('.card');
    let initialDelay = 0; // Used to stagger the initial reveal of cards

    // Step 1: Initialize all cards to a hidden state
    allCards.forEach(card => {
        card.style.opacity = 0; // Hide the card visually
        card.style.pointerEvents = 'none'; // Disable interaction with hidden cards
        card.classList.remove('revealed'); // Ensure no lingering 'revealed' class
        
        // IMPORTANT: Pre-populate data-originalText attributes for all typewriter elements
        // This ensures the text is always available even if innerHTML is cleared for animation.
        card.querySelectorAll('.typewriter-text, .typewriter-text-h1').forEach(textElement => {
            if (!textElement.dataset.originalText) { // Only set if not already set (e.g., by updateGreeting/Question)
                textElement.dataset.originalText = textElement.textContent;
            }
        });
    });

    // Step 2: Explicitly handle the very first card
    const firstCard = document.getElementById('greetingCard');
    if (firstCard) {
        revealCardAndTypewrite(firstCard); // Reveal the first card immediately
        initialDelay = 800; // Add a delay for subsequent cards to appear after the first
    }

    // Step 3: Iterate through the remaining cards
    allCards.forEach(card => {
        if (card === firstCard) { // Skip the first card as it's already handled
            return;
        }

        const rect = card.getBoundingClientRect();
        // Determine if the card is visible within the initial viewport on load
        const isVisibleOnLoad = (rect.top < window.innerHeight && rect.bottom > 0);

        if (isVisibleOnLoad) {
            // If visible on load, reveal with a staggered delay for a nicer effect
            setTimeout(() => {
                revealCardAndTypewrite(card);
            }, initialDelay);
            initialDelay += 400; // Increase delay for the next card
        } else {
            // If not visible, set up IntersectionObserver to detect when it scrolls into view
            cardObserver.observe(card);
        }
    });
});


// --- Dynamic Background (Sky, Sea, Sun/Moon, and Animated Elements) ---
function setDynamicBackgroundAndElements() {
    const now = new Date();
    const hour = now.getHours(); // Get current hour (0-23)
    let skyGradient, seaGradient, celestialColor, celestialSize, celestialBlur, celestialTop, celestialLeft;
    let birdDisplay = 'block', planeDisplay = 'block', starDisplay = 'none';
    let birdColor = '#333', planeColor = '#ccc';
    let particleDisplay = 'block'; 
    let particleOpacity = 0.8; 
    
    // Determine background and element styles based on time of day
    if (hour >= 5 && hour < 7) { // Early Morning / Sunrise (5 AM - 6:59 AM)
        skyGradient = 'linear-gradient(to bottom, #FFDAB9 0%, #FFB6C1 50%, #B0E0E6 100%)'; 
        seaGradient = 'linear-gradient(to top, #4682B4, #6495ED)'; 
        celestialColor = '#FF8C00'; 
        celestialSize = '90px';
        celestialBlur = '30px';
        celestialTop = '30%'; 
        celestialLeft = '20%';
        planeColor = '#eee';
        birdColor = '#555';
        particleOpacity = 0.6; // Morning haze
    } else if (hour >= 7 && hour < 12) { // Morning / Day (7 AM - 11:59 AM)
        skyGradient = 'linear-gradient(to bottom, #87CEEB 0%, #ADD8E6 70%, #E0FFFF 100%)'; 
        seaGradient = 'linear-gradient(to top, #1E90FF, #4169E1)'; 
        celestialColor = '#FFD700'; 
        celestialSize = '100px';
        celestialBlur = '40px'; 
        celestialTop = '15%';
        celestialLeft = '50%';
        planeColor = '#fff';
        birdColor = '#333';
        particleOpacity = 0.7; // Daytime haze
    } else if (hour >= 12 && hour < 17) { // Afternoon (12 PM - 4:59 PM)
        skyGradient = 'linear-gradient(to bottom, #6A5ACD 0%, #483D8B 60%, #ADD8E6 100%)'; 
        seaGradient = 'linear-gradient(to top, #000080, #191970)'; 
        celestialColor = '#FFA500'; 
        celestialSize = '95px';
        celestialBlur = '35px';
        celestialTop = '20%';
        celestialLeft = '80%';
        planeColor = '#ccc';
        birdColor = '#444';
        particleOpacity = 0.6; // Afternoon haze
    } else if (hour >= 17 && hour < 19) { // Sunset (5 PM - 6:59 PM)
        skyGradient = 'linear-gradient(to bottom, #FF6347 0%, #FF4500 50%, #8B0000 100%)'; 
        seaGradient = 'linear-gradient(to top, #4169E1, #6A5ACD)'; 
        celestialColor = '#FFD700'; 
        celestialSize = '110px'; 
        celestialBlur = '50px'; 
        celestialTop = '40%'; 
        celestialLeft = '50%';
        planeColor = '#aaa';
        birdColor = '#222';
        particleOpacity = 0.5; // Fading haze
    } else { // Night (7 PM - 4:59 AM)
        skyGradient = 'linear-gradient(to bottom, #000022 0%, #000044 50%, #000066 100%)'; 
        seaGradient = 'linear-gradient(to top, #000022, #000044)'; 
        celestialColor = '#E0E0E0'; 
        celestialSize = '70px';
        celestialBlur = '20px';
        celestialTop = '10%';
        celestialLeft = '70%';
        
        starDisplay = 'block'; 
        birdDisplay = 'none'; 
        planeDisplay = 'none'; 
        particleOpacity = 0.1; // Dimmer particles (stars)
    }

    // Apply computed styles to CSS variables
    document.documentElement.style.setProperty('--sky-gradient', skyGradient);
    document.documentElement.style.setProperty('--sea-gradient', seaGradient);
    document.documentElement.style.setProperty('--celestial-color', celestialColor);
    document.documentElement.style.setProperty('--celestial-size', celestialSize);
    document.documentElement.style.setProperty('--celestial-blur', celestialBlur);
    document.documentElement.style.setProperty('--celestial-top', celestialTop);
    document.documentElement.style.setProperty('--celestial-left', celestialLeft);

    document.querySelectorAll('.bird').forEach(el => el.style.display = birdDisplay);
    document.querySelectorAll('.plane').forEach(el => el.style.display = planeDisplay);
    document.querySelectorAll('.shooting-star').forEach(el => el.style.display = starDisplay);
    document.querySelectorAll('.particle').forEach(el => el.style.setProperty('--particle-opacity', particleOpacity));
    document.documentElement.style.setProperty('--particle-display', particleDisplay); 

    document.documentElement.style.setProperty('--bird-color', birdColor);
    document.documentElement.style.setProperty('--plane-color', planeColor);

    document.documentElement.style.setProperty('--sky-height', '70%');
    document.documentElement.style.setProperty('--sea-height', '30%');
}
setDynamicBackgroundAndElements();
// Update the background every 10 minutes (you can change to 60 * 60 * 1000 for hourly)
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
    // Find existing span or create new one for typewriter effect
    let typedTextSpan = greetingElement.querySelector('.typewriter-text');
    if (!typedTextSpan) { 
        typedTextSpan = document.createElement('span');
        typedTextSpan.classList.add('typewriter-text');
        greetingElement.innerHTML = ''; // Clear previous content if creating new span
        greetingElement.appendChild(typedTextSpan);
    }
    // Apply the typewriter effect
    applyTypewriterEffect(typedTextSpan, baseGreeting, false, 0.05, true); 
}
updateGreeting(); // Call on load to set initial greeting

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
        // Special case for 'It's time!' to be typed
        let typedTextSpan = countdownElement.querySelector('.typewriter-text.typed-once');
        if (!typedTextSpan) { // If the typed span doesn't exist yet
            typedTextSpan = document.createElement('span');
            typedTextSpan.classList.add('typewriter-text', 'typed-once');
            countdownElement.innerHTML = ''; 
            countdownElement.appendChild(typedTextSpan);
            applyTypewriterEffect(typedTextSpan, "It's time! School has started! 🎉", true, 0.05, false);
        } else if (typedTextSpan.dataset.originalText !== "It's time! School has started! 🎉") {
            // Re-apply if the text changed (shouldn't happen here, but for robustness)
            applyTypewriterEffect(typedTextSpan, "It's time! School has started! 🎉", true, 0.05, false);
        }
        clearInterval(countdownInterval); // Stop updating once past the target date
    } else {
        // If countdown is active, display numbers directly
        countdownElement.innerHTML =
            `<span class="number" style="--delay: 0s;">${days > 0 ? days + "d " : ""}</span>` +
            `<span class="number" style="--delay: 0.1s;">${hours < 10 ? "0" + hours : hours}h </span>` +
            `<span class="number" style="--delay: 0.2s;">${minutes < 10 ? "0" + minutes : minutes}m </span>` +
            `<span class="number" style="--delay: 0.3s;">${seconds < 10 ? "0" + seconds : seconds}s</span>`;
    }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // Call immediately on load to prevent initial empty countdown
