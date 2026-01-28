// Title Cards for Homepage
document.addEventListener('DOMContentLoaded', function() {
    initializeTitleCards();
});

// Placeholder unit data - Template
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
    }
];

function initializeTitleCards() {
    const unitsGrid = document.querySelector('.units-grid');
    if (!unitsGrid) return;

    // Clear existing content
    unitsGrid.innerHTML = '';

    // Create title cards from template data
    placeholderUnits.forEach(unit => {
        const card = createTitleCard(unit);
        unitsGrid.appendChild(card);
    });
}

function createTitleCard(unit) {
    const card = document.createElement('a');
    card.href = unit.link;
    card.className = 'unit-card';
    card.setAttribute('data-id', unit.id);

    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">${unit.title}</h3>
            <span class="card-badge">AWS</span>
        </div>
        <button class="learn-button">Learn More →</button>
    `;

    // Add hover effects
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });

    // Prevent button default on card click
    const button = card.querySelector('.learn-button');
    if (button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    return card;
}
