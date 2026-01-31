document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Sidebar Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.classList.remove('ri-menu-line');
                icon.classList.add('ri-close-line');
            } else {
                icon.classList.remove('ri-close-line');
                icon.classList.add('ri-menu-line');
            }
        });
    }

    // --- Data Fetching ---
    // Only fetch if we have a container that needs data
    const scriptureContainer = document.getElementById('scripture-container');
    const artifactContainer = document.getElementById('artifact-container');

    if (scriptureContainer || artifactContainer) {
        fetch('data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch sect records');
                }
                return response.json();
            })
            .then(data => {
                if (scriptureContainer) {
                    renderScriptures(data.scriptures, scriptureContainer);
                }
                if (artifactContainer) {
                    renderArtifacts(data.artifacts, artifactContainer);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMsg = document.createElement('p');
                errorMsg.className = 'error-text';
                errorMsg.textContent = 'The archives are currently sealed by a higher power (404).';
                if (scriptureContainer) scriptureContainer.appendChild(errorMsg);
                if (artifactContainer) artifactContainer.appendChild(errorMsg);
            });
    }

    // --- Mission Board Logic ---
    const missionForm = document.getElementById('mission-form');
    if (missionForm) {
        missionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Your mission request has been burned into a jade slip and sent to the Patriarch via Spirit Pigeon.');
            missionForm.reset();
        });
    }
});

function renderScriptures(scriptures, container) {
    container.innerHTML = ''; // Clear loading text
    scriptures.forEach(scroll => {
        const card = document.createElement('div');
        card.className = 'scroll-card';

        const meta = document.createElement('div');
        meta.className = 'scroll-meta';
        meta.innerHTML = `<span>${scroll.date}</span><span>${scroll.category}</span>`;

        const title = document.createElement('h3');
        title.textContent = scroll.title;

        const summary = document.createElement('p');
        summary.textContent = scroll.summary;

        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(summary);

        container.appendChild(card);
    });
}

function renderArtifacts(artifacts, container) {
    container.innerHTML = ''; // Clear loading text
    artifacts.forEach(artifact => {
        const card = document.createElement('div');
        card.className = 'artifact-card';

        // Header with Title and Tier Badge
        const header = document.createElement('div');
        header.className = 'artifact-header';

        const title = document.createElement('h3');
        title.textContent = artifact.name;

        const tier = document.createElement('span');
        const tierClass = getTierClass(artifact.tier);
        tier.className = `tier-badge ${tierClass}`;
        tier.textContent = artifact.tier;

        header.appendChild(title);
        header.appendChild(tier);

        // Description
        const desc = document.createElement('p');
        desc.textContent = artifact.description;

        // Materials (Tech Stack)
        const materialsDiv = document.createElement('div');
        materialsDiv.className = 'materials';
        artifact.materials.forEach(mat => {
            const tag = document.createElement('span');
            tag.className = 'material-tag';
            tag.textContent = mat;
            materialsDiv.appendChild(tag);
        });

        // Assemble
        card.appendChild(header);
        card.appendChild(desc);
        card.appendChild(materialsDiv);

        container.appendChild(card);
    });
}

function getTierClass(tierString) {
    if (tierString.includes('Heaven')) return 'tier-heaven';
    if (tierString.includes('Earth')) return 'tier-earth';
    return 'tier-mortal';
}
