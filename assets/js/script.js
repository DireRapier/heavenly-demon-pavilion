function initPavilion(jsonPath) {
    document.addEventListener('DOMContentLoaded', () => {
        setupMobileMenu();
        fetchData(jsonPath);
        setupMissionForm();
    });
}

function setupMobileMenu() {
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
}

function setupMissionForm() {
    const missionForm = document.getElementById('mission-form');
    if (missionForm) {
        missionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Your mission request has been burned into a jade slip and sent to the Patriarch via Spirit Pigeon.');
            missionForm.reset();
        });
    }
}

function fetchData(jsonPath) {
    const scriptureContainer = document.getElementById('scripture-container');
    const artifactContainer = document.getElementById('artifact-container');
    const updatesContainer = document.getElementById('updates-container');
    const recordsContainer = document.getElementById('records-container');

    if (scriptureContainer || artifactContainer || updatesContainer || recordsContainer) {
        fetch(jsonPath)
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
                if (updatesContainer) {
                    renderUpdates(data, updatesContainer);
                }
                if (recordsContainer) {
                    renderRecords(data.records, recordsContainer, jsonPath);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMsg = document.createElement('p');
                errorMsg.className = 'error-text';
                errorMsg.textContent = 'The archives are currently sealed by a higher power (404).';

                if (scriptureContainer) scriptureContainer.appendChild(errorMsg.cloneNode(true));
                if (artifactContainer) artifactContainer.appendChild(errorMsg.cloneNode(true));
                if (recordsContainer) recordsContainer.appendChild(errorMsg.cloneNode(true));
                if (updatesContainer) {
                    updatesContainer.innerHTML = '';
                    updatesContainer.appendChild(errorMsg.cloneNode(true));
                }
            });
    }
}

function renderScriptures(scriptures, container) {
    container.innerHTML = '';
    scriptures.forEach(scroll => {
        const card = document.createElement('div');
        card.className = 'scroll-card';

        // Make the whole card clickable if readLink exists, or add a specific button
        // Requirement: "Read" button on scroll sets href to readLink

        const meta = document.createElement('div');
        meta.className = 'scroll-meta';
        meta.innerHTML = `<span>${scroll.date}</span><span>${scroll.category}</span>`;

        const title = document.createElement('h3');
        title.textContent = scroll.title;

        const summary = document.createElement('p');
        summary.textContent = scroll.summary;

        const readBtn = document.createElement('a');
        readBtn.href = scroll.readLink;
        readBtn.className = 'btn-seal';
        readBtn.style.marginTop = '1rem';
        readBtn.style.fontSize = '0.8rem';
        readBtn.style.padding = '0.5rem 1rem';
        readBtn.style.textDecoration = 'none';
        readBtn.style.display = 'inline-block';
        readBtn.textContent = 'Read Scroll';

        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(summary);
        card.appendChild(readBtn);

        container.appendChild(card);
    });
}

function renderArtifacts(artifacts, container) {
    container.innerHTML = '';
    artifacts.forEach(artifact => {
        const card = document.createElement('div');
        card.className = 'artifact-card';

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

        const desc = document.createElement('p');
        desc.textContent = artifact.description;

        const materialsDiv = document.createElement('div');
        materialsDiv.className = 'materials';
        artifact.materials.forEach(mat => {
            const tag = document.createElement('span');
            tag.className = 'material-tag';
            tag.textContent = mat;
            materialsDiv.appendChild(tag);
        });

        card.appendChild(header);
        card.appendChild(desc);
        card.appendChild(materialsDiv);

        container.appendChild(card);
    });
}

function renderRecords(records, container, jsonPath) {
    container.innerHTML = '';

    // Determine relative asset path prefix based on jsonPath
    // if jsonPath is './data/data.json', we are at root, assets are at 'assets/'
    // if jsonPath is '../data/data.json', we are in pages/, assets are at '../assets/'
    let assetPrefix = '';
    if (jsonPath.startsWith('../')) {
        assetPrefix = '../';
    }

    records.forEach(record => {
        const card = document.createElement('div');
        card.className = 'artifact-card'; // Reuse style

        const title = document.createElement('h3');
        title.textContent = record.title;
        title.style.color = 'var(--imperial-gold)';
        title.style.marginBottom = '1rem';

        let mediaElement;
        const sourcePath = assetPrefix + record.mediaSource;

        if (record.type === 'audio') {
            mediaElement = document.createElement('audio');
            mediaElement.controls = true;
            mediaElement.src = sourcePath;
            mediaElement.style.width = '100%';
        } else if (record.type === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.src = sourcePath;
            mediaElement.style.width = '100%';
        } else if (record.type === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = sourcePath;
            mediaElement.alt = record.title;
            mediaElement.style.width = '100%';
            mediaElement.style.borderRadius = '4px';
            mediaElement.style.border = '1px solid #333';
        }

        const desc = document.createElement('p');
        desc.textContent = record.desc;
        desc.style.marginTop = '1rem';
        desc.style.fontSize = '0.9rem';
        desc.style.color = '#ccc';

        card.appendChild(title);
        if (mediaElement) card.appendChild(mediaElement);
        card.appendChild(desc);

        container.appendChild(card);
    });
}

function renderUpdates(data, container) {
    container.innerHTML = '';

    const featuredScripture = data.scriptures.find(s => s.featured) || data.scriptures[0];
    const featuredArtifact = data.artifacts.find(a => a.featured) || data.artifacts[0];

    const items = [
        { type: 'Scripture', data: featuredScripture, link: featuredScripture ? featuredScripture.readLink : '#' },
        { type: 'Artifact', data: featuredArtifact, link: 'projects.html' }
    ];

    items.forEach(item => {
        if (!item.data) return;

        const card = document.createElement('div');
        card.className = 'mini-card';
        card.onclick = () => { window.location.href = item.link; };

        const title = document.createElement('h3');
        title.textContent = item.data.title || item.data.name;

        const desc = document.createElement('p');
        desc.textContent = item.data.summary || item.data.description;

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `${item.type} | ${item.data.date || 'Unknown Era'}`;

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(meta);

        container.appendChild(card);
    });
}

function getTierClass(tierString) {
    if (tierString.includes('Heaven')) return 'tier-heaven';
    if (tierString.includes('Earth')) return 'tier-earth';
    return 'tier-mortal';
}
