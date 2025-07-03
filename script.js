// --- Particle background effect (for subtle sky glow) ---
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

// --- Intersection Observer for revealing cards and triggering typewriter ---
const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1 // 10% of element visible
};

const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target;
            card.style.opacity = 1; // Make card visible
            card.style.pointerEvents = 'auto'; // Re-enable interaction if disabled
            
            // Trigger typewriter for all .typewriter-text elements within this card
            card.querySelectorAll('.typewriter-text').forEach(textSpan => {
                const originalText = textSpan.textContent;
                textSpan.textContent = ''; // Clear text to re-type
                textSpan.style.width = '0'; // Reset width for typing
                
                // Add class to remove blinking caret after typing is done
                const isTypedOnce = textSpan.classList.contains('typed-once');
                if (isTypedOnce) {
                    textSpan.style.animation = `typing ${originalText.length * 0.05}s steps(${originalText.length}, end) forwards`;
                } else {
                    textSpan.style.animation = `typing ${originalText.length * 0.05}s steps(${originalText.length}, end) forwards, blinkCaret .75s step-end infinite`;
                }

                // Set the actual text after a small delay to allow animation reset
                setTimeout(() => {
                    textSpan.textContent = originalText;
                    if (isTypedOnce) {
                        // If it's a "typed-once" element, remove animation after completion
                        textSpan.addEventListener('animationend', () => {
                            textSpan.style.animation = 'none';
                            textSpan.style.borderRight = 'none';
                        }, { once: true });
                    }
                }, 50); // Small delay
            });

            // For the h1 title (which is not a .typewriter-text span)
            const h1Title = card.querySelector('.typewriter-text-h1');
            if (h1Title) {
                const originalText = h1Title.textContent;
                h1Title.textContent = '';
                h1Title.style.width = '0';
                h1Title.style.overflow = 'hidden';
                h1Title.style.borderRight = '.15em solid orange'; // Add caret for h1
                h1Title.style.animation = `typing ${originalText.length * 0.08}s steps(${originalText.length}, end) forwards, blinkCaret .75s step-end infinite`;
                
                setTimeout(() => {
                    h1Title.textContent = originalText;
                    h1Title.addEventListener('animationend', () => {
                        h1Title.style.borderRight = 'none'; // Remove caret for h1 after typing
                    }, { once: true });
                }, 50);
            }


            observer.unobserve(card); // Stop observing once animated
        }
    });
}, observerOptions);

// Observe each card
document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = 0; // Hide all cards initially
    card.style.pointerEvents = 'none'; // Disable interactions until visible
    cardObserver.observe(card);
});

// --- Dynamic Background (Sky, Sea, Sun/Moon, and Animated Elements) ---
function setDynamicBackgroundAndElements() {
    const now = new Date();
    const hour = now.getHours();
    let skyGradient, seaGradient, celestialColor, celestialSize, celestialBlur, celestialTop, celestialLeft;
    let birdDisplay = 'block', planeDisplay = 'block', starDisplay = 'none';
    let birdColor = '#333', planeColor = '#ccc';
    let particleOpacity = 0.8; // More particles for general glow during day
    
    // Time periods and corresponding styles
    if (hour >= 5 && hour < 7) { // Early Morning / Sunrise (5 AM - 6:59 AM)
        skyGradient = 'linear-gradient(to bottom, #FFDAB9, #FFB6C1, #87CEEB)'; // Peach, LightPink, SkyBlue
        seaGradient = 'linear-gradient(to right, #4682B4, #6495ED)'; // SteelBlue, CornflowerBlue
        celestialColor = '#FF8C00'; // DarkOrange (Sun)
        celestialSize = '80px';
        celestialBlur = '25px';
        celestialTop = '25%';
        celestialLeft = '20%';
        planeColor = '#eee';
    } else if (hour >= 7 && hour < 12) { // Morning / Day (7 AM - 11:59 AM)
        skyGradient = 'linear-gradient(to bottom, #87CEEB, #ADD8E6, #B0E0E6)'; // SkyBlue, LightBlue, PowderBlue
        seaGradient = 'linear-gradient(to right, #1E90FF, #4169E1)'; // DodgerBlue, RoyalBlue
        celestialColor = '#FFD700'; // Gold (Sun)
        celestialSize = '90px';
        celestialBlur = '30px';
        celestialTop = '15%';
        celestialLeft = '50%';
        planeColor = '#fff';
    } else if (hour >= 12 && hour < 17) { // Afternoon (12 PM - 4:59 PM)
        skyGradient = 'linear-gradient(to bottom, #6A5ACD, #483D8B, #191970)'; // SlateBlue, DarkSlateBlue, MidnightBlue
        seaGradient = 'linear-gradient(to right, #000080, #191970)'; // Navy, MidnightBlue
        celestialColor = '#FFA500'; // Orange (Sun)
        celestialSize = '85px';
        celestialBlur = '28px';
        celestialTop = '20%';
        celestialLeft = '80%';
        planeColor = '#ccc';
    } else if (hour >= 17 && hour < 19) { // Sunset (5 PM - 6:59 PM)
        skyGradient = 'linear-gradient(to bottom, #FF6347, #FF4500, #8B0000)'; // Tomato, OrangeRed, DarkRed
        seaGradient = 'linear-gradient(to right, #4169E1, #6A5ACD)'; // RoyalBlue, SlateBlue
        celestialColor = '#FFD700'; // Gold (Sun)
        celestialSize = '100px';
        celestialBlur = '40px';
        celestialTop = '40%';
        celestialLeft = '50%';
        planeColor = '#aaa';
    } else { // Night (7 PM - 4:59 AM)
        skyGradient = 'linear-gradient(to bottom, #000033, #000066, #191970)'; // Darker blues for night
        seaGradient = 'linear-gradient(to right, #000033, #000066)'; // Very dark blue for night sea
        celestialColor = '#E0E0E0'; // White (Moon)
        celestialSize = '70px';
        celestialBlur = '15px';
        celestialTop = '10%';
        celestialLeft = '70%';
        
        starDisplay = 'block'; // Show shooting stars at night
        birdDisplay = 'none'; // Hide birds at night
        planeDisplay = 'none'; // Hide planes at night
        particleOpacity = 0.1; // Less visible particles at night
        birdColor = '#000'; // Birds can be darker against brighter sky
    }

    document.documentElement.style.setProperty('--sky-gradient', skyGradient);
    document.documentElement.style.setProperty('--sea-gradient', seaGradient);
    document.documentElement.style.setProperty('--celestial-color', celestialColor);
    document.documentElement.style.setProperty('--celestial-size', celestialSize);
    document.documentElement.style.setProperty('--celestial-blur', celestialBlur);
    document.documentElement.style.setProperty('--celestial-top', celestialTop);
    document.documentElement.style.setProperty('--celestial-left', celestialLeft);

    // Set display for animated elements
    document.querySelectorAll('.bird').forEach(el => el.style.display = birdDisplay);
    document.querySelectorAll('.plane').forEach(el => el.style.display = planeDisplay);
    document.querySelectorAll('.shooting-star').forEach(el => el.style.display = starDisplay);
    document.querySelectorAll('.particle').forEach(el => el.style.setProperty('--particle-opacity', particleOpacity));
    
    document.documentElement.style.setProperty('--bird-color', birdColor);
    document.documentElement.style.setProperty('--plane-color', planeColor);

    // These heights remain fixed for the fixed background elements
    document.documentElement.style.setProperty('--sky-height', '70%');
    document.documentElement.style.setProperty('--sea-height', '30%');
}
setDynamicBackgroundAndElements();
setInterval(setDynamicBackgroundAndElements, 60 * 60 * 1000); // Update every hour

// --- Greeting for Reechita (re-triggers typing every reload/update) ---
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
    // Create a span to hold the text and apply typewriter effect
    const typedTextSpan = document.createElement('span');
    typedTextSpan.classList.add('typewriter-text');
    typedTextSpan.textContent = baseGreeting;
    
    greetingElement.innerHTML = ''; // Clear previous content
    greetingElement.appendChild(typedTextSpan);
    
    // Manually trigger reflow to restart animation if needed
    void typedTextSpan.offsetWidth;
    typedTextSpan.style.animation = `typing ${baseGreeting.length * 0.05}s steps(${baseGreeting.length}, end) forwards, blinkCaret .75s step-end infinite`;
}
updateGreeting();

// --- Rotating Questions (re-triggers typing every reload) ---
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
    
    // Create a span to hold the text and apply typewriter effect
    const typedTextSpan = document.createElement('span');
    typedTextSpan.classList.add('typewriter-text', 'typed-once');
    typedTextSpan.textContent = questionText;
    
    dailyQuestionElement.innerHTML = ''; // Clear previous content
    dailyQuestionElement.appendChild(typedTextSpan);

    // Manually trigger reflow and set animation
    void typedTextSpan.offsetWidth;
    typedTextSpan.style.animation = `typing ${questionText.length * 0.05}s steps(${questionText.length}, end) forwards`;
    typedTextSpan.addEventListener('animationend', () => {
        typedTextSpan.style.borderRight = 'none'; // Remove caret after typing
    }, { once: true });
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
        if (!countdownElement.querySelector('.typed-once')) { // Only type if not already typed
            const typedTextSpan = document.createElement('span');
            typedTextSpan.classList.add('typewriter-text', 'typed-once');
            typedTextSpan.textContent = "It's time! School has started! 🎉";
            countdownElement.innerHTML = '';
            countdownElement.appendChild(typedTextSpan);
            void typedTextSpan.offsetWidth;
            typedTextSpan.style.animation = `typing ${typedTextSpan.textContent.length * 0.05}s steps(${typedTextSpan.textContent.length}, end) forwards`;
            typedTextSpan.addEventListener('animationend', () => {
                typedTextSpan.style.borderRight = 'none';
            }, { once: true });
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
