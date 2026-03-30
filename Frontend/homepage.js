// Title Cards for Homepage - JavaScript functionality for dynamically generating unit cards on the homepage
// DOMContentLoaded event listener - Waits for HTML document to be fully loaded before executing JavaScript, ensures DOM elements are available
document.addEventListener('DOMContentLoaded', function() {
    initializeTitleCards();
});

// Placeholder unit data - Template array containing unit information (id, title, link) for all 10 course units
const placeholderUnits = [
    { 
        id: 1, 
        title: 'Unit 1', 
        link: 'unit1.html',
        overview: 'Intro to cloud concepts, AWS basics, and core value of cloud computing.'
    },
    { 
        id: 2, 
        title: 'Unit 2', 
        link: 'unit2.html',
        overview: 'Cloud economics, billing models, and tools to estimate and manage costs.'
    },
    { 
        id: 3, 
        title: 'Unit 3', 
        link: 'unit3.html',
        overview: 'AWS global infrastructure: Regions, AZs, edge locations, and resiliency.'
    },
    { 
        id: 4, 
        title: 'Unit 4', 
        link: 'unit4.html',
        overview: 'Compute on AWS (EC2 and related concepts) and choosing the right resources.'
    },
    { 
        id: 5, 
        title: 'Unit 5', 
        link: 'unit5.html',
        overview: 'Networking & content delivery with VPC concepts, routing, and global delivery.'
    },
    { 
        id: 6, 
        title: 'Unit 6', 
        link: 'unit6.html',
        overview: 'Core AWS services and best practices for building secure, reliable solutions.'
    },
    { 
        id: 7, 
        title: 'Unit 7', 
        link: 'unit7.html',
        overview: 'Storage services: EBS, S3, EFS, and Glacier with when to use each type.'
    },
    { 
        id: 8, 
        title: 'Unit 8', 
        link: 'unit8.html',
        overview: 'Database services: RDS, Aurora, DynamoDB, and Redshift for different workloads.'
    },
    { 
        id: 9, 
        title: 'Unit 9', 
        link: 'unit9.html',
        overview: 'Cloud architecture principles using the AWS Well-Architected Framework pillars.'
    },
    { 
        id: 10, 
        title: 'Unit 10', 
        link: 'unit10.html',
        overview: 'Monitoring and scaling: CloudWatch, ELB, and EC2 Auto Scaling working together.'
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

// createTitleCard function - Creates a single unit card element with title, badge, and brief overview, returns a clickable anchor element styled as a card
function createTitleCard(unit) {
    // Create card container - Use a non-anchor wrapper so we can include a real button-like link inside
    const card = document.createElement('div');
    card.className = 'unit-card';
    // Set data-id attribute - Stores unit ID for potential future use (filtering, tracking, etc.)
    card.setAttribute('data-id', unit.id);
    // Store link for click navigation
    card.setAttribute('data-link', unit.link);
    // Accessibility: make the card act like a link
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');

    // Set inner HTML - Creates card structure with header (title and badge), a brief overview, and a real link styled as a button
    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">${unit.title}</h3>
            <span class="card-badge">AWS</span>
        </div>
        <p class="card-overview">${unit.overview ?? ''}</p>
        <a class="card-cta" href="${unit.link}">Open Unit →</a>
    `;

    // Click anywhere on the card navigates (except when clicking the CTA link itself)
    card.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.closest && target.closest('.card-cta')) return;
        window.location.href = unit.link;
    });

    // Keyboard support: Enter/Space navigates like a link
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = unit.link;
        }
    });

    // Return the completed card element - Card is ready to be appended to the units grid
    return card;
}
