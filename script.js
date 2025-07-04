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
createParticles(70, 1, 4, 6, 6); // More particles, slightly larger

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

// --- Helper function to get a truly random item (different on every reload) ---
function getRandomItem(itemsArray) {
    const randomIndex = Math.floor(Math.random() * itemsArray.length);
    return itemsArray[randomIndex];
}

// --- Helper function to get a daily item (ensures it's the same for the whole day) ---
function getDailyItem(itemsArray) {
    const today = new Date();
    // Calculate day of the year (0-364 or 365)
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = (today - start) + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const index = dayOfYear % itemsArray.length;
    return itemsArray[index];
}


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

    // 3. Handle the special message for Reechita (was daily inspiration)
    displaySpecialMessageForReechita(); // Renamed function call

    // 4. Set up the observer for all content cards
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
    let rainDisplay = 'none';
    let lightningDisplay = 'none';

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
        birdDisplay = 'block';
    } else if (hour >= 7 && hour < 12) { 
        skyGradient = 'linear-gradient(to bottom, #4f7488 0%, #628292 70%, #7e98a7 100%)'; 
        seaGradient = 'linear-gradient(to top, #0f4a7c, #2f5f90)'; 
        celestialColor = '#b8aa3e'; 
        celestialSize = '90px';
        celestialBlurIntensity = '25px'; 
        celestialTop = '20%';
        celestialLeft = '50%';
        particleOpacity = 0.4; 
        birdDisplay = 'block';
        planeDisplay = 'block';
    } else if (hour >= 12 && hour < 17) { 
        skyGradient = 'linear-gradient(to bottom, #3b336b 0%, #292451 60%, #6e8492 100%)'; 
        seaGradient = 'linear-gradient(to top, #00003b, #0f0f4a)'; 
        celestialColor = '#af6f1c'; 
        celestialSize = '85px';
        celestialBlurIntensity = '22px'; 
        celestialTop = '25%';
        celestialLeft = '80%';
        particleOpacity = 0.3; 
        birdDisplay = 'block';
        planeDisplay = 'block';
        if (Math.random() < 0.1) { // 10% chance of rain during the day
            rainDisplay = 'block';
        }
    } else if (hour >= 17 && hour < 19) { 
        skyGradient = 'linear-gradient(to bottom, #993b2c 0%, #993300 50%, #5d0000 100%)'; 
        seaGradient = 'linear-gradient(to top, #2f5a7d, #3b336b)'; 
        celestialColor = '#b8aa3e'; 
        celestialSize = '100px'; 
        celestialBlurIntensity = '30px'; 
        celestialTop = '45%'; 
        celestialLeft = '50%';
        particleOpacity = 0.2; 
        birdDisplay = 'block'; // Birds during evening too
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
        if (Math.random() < 0.05) { // 5% chance of lightning at night
            lightningDisplay = 'block';
        }
    }

    document.documentElement.style.setProperty('--sky-gradient', skyGradient);
    document.documentElement.style.setProperty('--sea-gradient', seaGradient);
    document.documentElement.style.setProperty('--celestial-color', celestialColor);
    document.documentElement.style.setProperty('--celestial-size', celestialSize);
    document.documentElement.style.setProperty('--celestial-blur', celestialBlurIntensity);
    document.documentElement.style.setProperty('--celestial-top', celestialTop);
    document.documentElement.style.setProperty('--celestial-left', celestialLeft);

    // Control visibility of birds, planes, stars, particles, rain, and lightning
    document.querySelectorAll('.bird').forEach(el => el.style.display = birdDisplay);
    document.querySelectorAll('.plane').forEach(el => el.style.display = planeDisplay);
    document.querySelectorAll('.shooting-star').forEach(el => el.style.display = starDisplay);
    document.querySelectorAll('.particle').forEach(el => el.style.setProperty('--particle-opacity', particleOpacity));
    document.documentElement.style.setProperty('--particle-display', particleDisplay); 
    document.documentElement.style.setProperty('--rain-display', rainDisplay);
    document.documentElement.style.setProperty('--lightning-display', lightningDisplay);

    document.documentElement.style.setProperty('--sky-height', '70%');
    document.documentElement.style.setProperty('--sea-height', '30%');
}
setDynamicBackgroundAndElements();
setInterval(setDynamicBackgroundAndElements, 10 * 60 * 1000); // Update every 10 minutes


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
    "What's a small act of kindness you can do today?",
    "What's your go-to song when you need a boost?",
    "What's something new you want to learn?",
    "If you could travel anywhere, where would you go?",
    "What makes you smile the most?",
    "What's your favorite subject in school?",
    "What's a dream you have for the future?",
    "What's one thing that always brightens your day?",
    "If you could spend a day doing anything, what would it be?",
    "What's your favorite book or movie character?",
    "What's a funny memory you have?",
    "What's a goal you're working towards right now?",
    "What's your favorite way to relax?",
    "If you could give one piece of advice to your younger self, what would it be?",
    "What's your favorite season and why?",
    "What's a book or movie that has inspired you?",
    "What's something you're grateful for today?"
];

function displayRandomQuestion() {
    const questionText = getDailyItem(questions); // Use getDailyItem for daily change
    const dailyQuestionElement = document.getElementById('dailyQuestion');
    
    // Apply the reveal effect for the question
    applyTextRevealEffect(dailyQuestionElement, questionText, 0.5); // Starts after 0.5s
}

// --- Special Messages for Reechita (Indirect "I love you") ---
const sarthakLoveMessages = [
    "My world feels a little brighter when you're around. ✨",
    "Thinking of you often brings a smile to my face. 😊",
    "You have a way of making everything feel special. 💖",
    "Hope your day is as wonderful as you make mine. 🌟",
    "Your presence always brings a sense of warmth. 🔥",
    "I appreciate all the small, amazing things about you. 💫",
    "Looking forward to our next conversation, always. 💬",
    "Even a simple moment feels better when shared with you. 👩‍❤️‍👨",
    "You're an amazing person, and I hope you know that. 👑",
    "Here's to all the beautiful moments, past and future. 🎉",
    "You bring so much light into the lives around you. 💡",
    "Just a little reminder that you're truly special. ✨",
    "Wishing you a day filled with all the happiness you deserve. 😄",
    "You make the ordinary feel extraordinary. 🌈",
    "There's something uniquely wonderful about you. ❤️",
    "Hope you're having a day as lovely as your presence is. 🌸",
    "You inspire me in more ways than you know. 🚀",
    "Every moment becomes a cherished memory with you. 📸",
    "My favorite adventures involve you. 🗺️",
    "Your kindness is a gift to everyone around you. 🎁"
];

function displaySpecialMessageForReechita() { // Renamed function
    const messageText = getRandomItem(sarthakLoveMessages); // Use getRandomItem for different message on each reload
    const dailyInspirationElement = document.getElementById('dailyInspirationText'); // Keep existing ID
    
    // Apply the reveal effect for the message
    applyTextRevealEffect(dailyInspirationElement, messageText, 0.7); // Starts after 0.7s
}

// --- Rain Effect Generation ---
function createRainDrops(container, count) {
    for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.classList.add('rain-drop');
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDuration = `${Math.random() * 0.8 + 0.4}s`; // Faster drops
        drop.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(drop);
    }
}
const rainContainer = document.querySelector('.rain-container');
createRainDrops(rainContainer, 100); // Create 100 rain drops

// --- Interactive Sun/Moon Click Effect ---
const sunMoon = document.querySelector('.sun-moon');
sunMoon.addEventListener('click', () => {
    // A simple animation on click - scale up and down quickly
    sunMoon.style.transition = 'none'; // Disable smooth transition temporarily
    sunMoon.style.transform = 'scale(1.1)';
    setTimeout(() => {
        sunMoon.style.transform = 'scale(1)';
        sunMoon.style.transition = 'all 2s ease-in-out'; // Re-enable transition
    }, 150);

    // Optional: Play a subtle sound or show a temporary text bubble
    console.log("Sun/Moon clicked!"); 
});


// --- Countdown Timer Logic ---
const countdownElement = document.getElementById('countdown');

// Sample Indian Holidays (add more 'YYYY-MM-DD' strings as needed)
const indianHolidays = [
    "2025-07-06", // Example: Guru Purnima
    "2025-07-15", // Example: Muharram
    // Add more holidays here as 'YYYY-MM-DD' strings.
    // Example: "2025-08-15" for Independence Day
    // Make sure to update this list each year as holiday dates can change!
];

function isHoliday(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return indianHolidays.includes(dateString);
}

function getNextSchoolTime() {
    let nextSchoolDate = new Date();
    nextSchoolDate.setHours(11);
    nextSchoolDate.setMinutes(30);
    nextSchoolDate.setSeconds(0);
    nextSchoolDate.setMilliseconds(0);

    // If current time is past 11:30 AM for today, start looking from tomorrow
    const now = new Date();
    if (now.getHours() > 11 || (now.getHours() === 11 && now.getMinutes() >= 30)) {
        nextSchoolDate.setDate(nextSchoolDate.getDate() + 1);
    }
    
    // Loop to find the next valid school day
    while (true) {
        const dayOfWeek = nextSchoolDate.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday(nextSchoolDate)) {
            nextSchoolDate.setDate(nextSchoolDate.getDate() + 1); // Move to next day
            nextSchoolDate.setHours(11); // Reset hour/minute/second to 11:30:00 for the new day
            nextSchoolDate.setMinutes(30);
            nextSchoolDate.setSeconds(0);
            nextSchoolDate.setMilliseconds(0);
        } else {
            break; // Found a school day!
        }
    }
    return nextSchoolDate;
}

function updateCountdown() {
    const targetDate = getNextSchoolTime(); // Dynamically get the next school time
    const now = new Date().getTime();
    let distance = targetDate.getTime() - now;

    if (distance < 0) {
        // School time has passed for today
        let textRevealSpan = countdownElement.querySelector('.text-reveal-animation');
        if (!textRevealSpan) { 
            textRevealSpan = document.createElement('span');
            textRevealSpan.classList.add('text-reveal-animation');
            countdownElement.innerHTML = ''; 
            countdownElement.appendChild(textRevealSpan);
        }
        applyTextRevealEffect(textRevealSpan, "School is currently on! 🎉", 0); 
        
        // After a brief display, re-calculate for the *next* valid school time (which would be tomorrow or later)
        // This prevents immediate re-calculation causing flicker and ensures new target is for the next session
        setTimeout(() => {
            updateCountdown(); // Re-run to update the target to the next school day
        }, 5000); // Wait 5 seconds before showing countdown to next school day
        return; 
    } else {
        // Calculate total hours, minutes, seconds from the remaining distance
        const totalSeconds = Math.floor(distance / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);

        const remainingSeconds = totalSeconds % 60;
        const remainingMinutes = totalMinutes % 60;

        countdownElement.innerHTML =
            `<span class="number" style="--delay: 0s;">${totalHours}h </span>` +
            `<span class="number" style="--delay: 0.1s;">${remainingMinutes < 10 ? "0" + remainingMinutes : remainingMinutes}m </span>` +
            `<span class="number" style="--delay: 0.2s;">${remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds}s</span>`;
    }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // Initial call to display countdown immediately
