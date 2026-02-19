// Title Cards for Homepage - JavaScript functionality for dynamically generating unit cards on the homepage
// DOMContentLoaded event listener - Waits for HTML document to be fully loaded before executing JavaScript, ensures DOM elements are available
document.addEventListener('DOMContentLoaded', function() {
    initializeTitleCards();
});

// Placeholder unit data - Template array containing unit information (id, title, link) for all 7 course units
const placeholderUnits = [
    { 
        id: 1, 
        title: 'Unit 1', 
        link: 'unit1.html'
    },
    { 
        id: 2, 
        title: 'Unit 2', 
        link: 'unit2.html'
    },
    { 
        id: 3, 
        title: 'Unit 3', 
        link: 'unit3.html'
    },
    { 
        id: 4, 
        title: 'Unit 4', 
        link: 'unit4.html'
    },
    { 
        id: 5, 
        title: 'Unit 5', 
        link: 'unit5.html'
    },
    { 
        id: 6, 
        title: 'Unit 6', 
        link: 'unit6.html'
    },
    { 
        id: 7, 
        title: 'Unit 7', 
        link: 'unit7.html'
    }
];

// initializeTitleCards function - Main function that sets up the unit cards on the homepage, finds the units-grid container and populates it with cards
function initializeTitleCards() {
    // Query selector finds the .units-grid container element in the HTML
    const unitsGrid = document.querySelector('.units-grid');
    // Early return if units-grid element doesn't exist (prevents errors on pages without this element)
    if (!unitsGrid) return;

    // Clear existing content - Removes any existing cards before generating new ones (useful for dynamic updates)
    unitsGrid.innerHTML = '';

    // Create title cards from template data - Iterates through placeholderUnits array, creates a card for each unit, and appends it to the grid
    placeholderUnits.forEach(unit => {
        const card = createTitleCard(unit);
        unitsGrid.appendChild(card);
    });
}

// createTitleCard function - Creates a single unit card element with title, badge, and button, returns a clickable anchor element styled as a card
function createTitleCard(unit) {
    // Create anchor element - Makes entire card clickable, links to the unit's HTML page
    const card = document.createElement('a');
    // Set href attribute to unit's link - Enables navigation to unit page when card is clicked
    card.href = unit.link;
    // Add CSS class for styling - Applies unit-card styles from homepage.css
    card.className = 'unit-card';
    // Set data-id attribute - Stores unit ID for potential future use (filtering, tracking, etc.)
    card.setAttribute('data-id', unit.id);

    // Set inner HTML - Creates card structure with header (title and badge) and learn button, uses template literal to insert unit title
    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">${unit.title}</h3>
            <span class="card-badge">AWS</span>
        </div>
        <button class="learn-button">Learn More →</button>
    `;

    // Add hover effects - mouseenter event listener adds transform style to lift card on hover
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
    });

    // mouseleave event listener - Resets transform style when mouse leaves card
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });

    // Prevent button default on card click - Finds the learn button within the card and prevents its click from interfering with card navigation
    const button = card.querySelector('.learn-button');
    // If button exists, add click event listener that stops event propagation
    if (button) {
        // stopPropagation prevents button click from triggering card's anchor click, ensures smooth navigation
        button.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Return the completed card element - Card is ready to be appended to the units grid
    return card;
}
