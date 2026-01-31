function initPavilion(jsonPath) {
    document.addEventListener('DOMContentLoaded', () => {
        setupMobileMenu();
        injectSearchOverlay(); // Inject UI first

        fetchData(jsonPath)
            .then(data => {
                if (data) {
                    setupSearch(data, jsonPath); // Pass data and path to search logic
                }
            });

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

    // Always fetch data for Search, even if containers don't exist
    return fetch(jsonPath)
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
            return data; // Return data for chaining
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
            return null;
        });
}

/* --- Search Functionality --- */

function injectSearchOverlay() {
    if (document.getElementById('search-overlay')) return;

    const overlayHTML = `
        <div id="search-overlay">
            <i class="ri-close-line close-search" onclick="toggleSearch()"></i>
            <input type="text" id="search-input" placeholder="Invoke a technique name..." autocomplete="off">
            <div id="search-results"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
}

function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
        overlay.classList.toggle('active');
        if (overlay.classList.contains('active')) {
            document.getElementById('search-input').focus();
        } else {
             document.getElementById('search-input').value = '';
             document.getElementById('search-results').innerHTML = '';
        }
    }
}

function setupSearch(data, jsonPath) {
    // 1. Hook up the Nav Trigger(s) - handled via event delegation or direct selection if possible
    // Note: The HTML must have .search-trigger class on the LI or A

    // We need to wait for DOM updates if we were injecting nav items, but we are editing HTML directly.
    // However, the elements exist now.
    const searchTriggers = document.querySelectorAll('.search-trigger');
    searchTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearch();
        });
    });

    // 2. Input Logic
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');

    if (searchInput && resultsContainer) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length === 0) {
                resultsContainer.innerHTML = '';
                return;
            }

            performSearch(query, data, resultsContainer, jsonPath);
        });
    }
}

function performSearch(query, data, container, jsonPath) {
    container.innerHTML = '';
    const results = [];

    // Determine asset prefix based on jsonPath location
    let assetPrefix = '';
    if (jsonPath.startsWith('../')) {
        assetPrefix = '../';
    }

    // Search Scriptures
    if (data.scriptures) {
        data.scriptures.forEach(item => {
            if (item.title.toLowerCase().includes(query) || item.summary.toLowerCase().includes(query)) {
                results.push({
                    type: 'Scripture',
                    title: item.title,
                    desc: item.summary, // optional to show
                    link: item.readLink, // Assuming readLink is relative to where we are?
                                         // If readLink is "scriptures/post.html", from root it works.
                                         // From subfolder, we might need prefix.
                                         // Usually readLink in JSON is relative to root.
                    class: 'result-scripture'
                });
            }
        });
    }

    // Search Artifacts
    if (data.artifacts) {
        data.artifacts.forEach(item => {
            if (item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) {
                // Determine link priority: Demo > Download > #
                let link = '#';
                if (item.demoUrl && item.demoUrl !== '#') link = item.demoUrl;
                else if (item.downloadUrl) link = item.downloadUrl;

                results.push({
                    type: 'Artifact',
                    title: item.name,
                    desc: item.description,
                    link: link,
                    class: 'result-artifact'
                });
            }
        });
    }

    // Search Records
    if (data.records) {
        data.records.forEach(item => {
            if (item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)) {
                results.push({
                    type: 'Record',
                    title: item.title,
                    desc: item.desc,
                    link: assetPrefix + item.mediaSource, // Raw asset link
                    class: 'result-record'
                });
            }
        });
    }

    if (results.length === 0) {
        container.innerHTML = '<div style="color:#666; text-align:center;">The void yields nothing...</div>';
    } else {
        results.forEach(res => {
            const el = document.createElement('a');
            el.className = 'result-item';
            el.href = res.link;

            // Adjust link if it's not absolute and we are in subfolder (except for records which we handled)
            // Actually, if we are in 'scriptures/' and link is 'projects.html', we need '../projects.html'.
            // The JSON links are likely "projects.html" or "scriptures/post-01.html".
            // If we are deep, we need to prepend ../

            if (!res.link.startsWith('http') && !res.link.startsWith('#') && !res.link.startsWith('../') && assetPrefix) {
               el.href = assetPrefix + res.link;
            }

            el.innerHTML = `
                <div class="${res.class}">[${res.type}] ${res.title}</div>
            `;
            container.appendChild(el);
        });
    }
}

/* --- Render Functions --- */

function renderScriptures(scriptures, container) {
    container.innerHTML = '';
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

        const readBtn = document.createElement('a');
        readBtn.href = scroll.readLink;
        readBtn.className = 'btn-seal btn-read-more';
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

        // Manual/Static resource distinction
        if (artifact.downloadUrl) {
            card.classList.add('border-silver');
        }

        const header = document.createElement('div');
        header.className = 'artifact-header';

        const titleContainer = document.createElement('div');
        titleContainer.className = 'artifact-title-container';

        const title = document.createElement('h3');
        title.textContent = artifact.name;
        titleContainer.appendChild(title);

        // Visual Badge for File Type
        if (artifact.fileType) {
            const fileBadge = document.createElement('span');
            fileBadge.className = 'file-type-badge';
            fileBadge.textContent = `[${artifact.fileType}]`;
            titleContainer.appendChild(fileBadge);
        }

        const tier = document.createElement('span');
        const tierClass = getTierClass(artifact.tier);
        tier.className = `tier-badge ${tierClass}`;
        tier.textContent = artifact.tier;

        header.appendChild(titleContainer);
        header.appendChild(tier);

        const desc = document.createElement('p');
        desc.textContent = artifact.description;

        const materialsDiv = document.createElement('div');
        materialsDiv.className = 'materials';
        if (artifact.materials) {
            artifact.materials.forEach(mat => {
                const tag = document.createElement('span');
                tag.className = 'material-tag';
                tag.textContent = mat;
                materialsDiv.appendChild(tag);
            });
        }

        card.appendChild(header);
        card.appendChild(desc);
        card.appendChild(materialsDiv);

        // Actions: Download or Inspect (or both)
        const actionContainer = document.createElement('div');
        actionContainer.className = 'artifact-actions';

        if (artifact.downloadUrl) {
            const downloadBtn = document.createElement('a');
            downloadBtn.href = artifact.downloadUrl;
            downloadBtn.setAttribute('download', '');
            downloadBtn.className = 'btn-download';
            downloadBtn.innerHTML = '<i class="ri-download-cloud-2-line"></i> Claim Treasure';
            actionContainer.appendChild(downloadBtn);
        }

        if (artifact.demoUrl && artifact.demoUrl !== '#') {
             // Optional: Standard inspect button if it's also a web app
             const inspectBtn = document.createElement('a');
             inspectBtn.href = artifact.demoUrl;
             inspectBtn.className = 'btn-download btn-inspect'; // Reuse style or make a gold one
             inspectBtn.innerHTML = '<i class="ri-eye-line"></i> Inspect';
             actionContainer.appendChild(inspectBtn);
        }

        if (actionContainer.hasChildNodes()) {
            card.appendChild(actionContainer);
        }

        container.appendChild(card);
    });
}

function renderRecords(records, container, jsonPath) {
    container.innerHTML = '';

    let assetPrefix = '';
    if (jsonPath.startsWith('../')) {
        assetPrefix = '../';
    }

    records.forEach(record => {
        const card = document.createElement('div');
        card.className = 'artifact-card';

        const title = document.createElement('h3');
        title.textContent = record.title;
        title.className = 'record-title';

        let mediaElement;
        const sourcePath = assetPrefix + record.mediaSource;

        if (record.type === 'audio') {
            mediaElement = document.createElement('audio');
            mediaElement.controls = true;
            mediaElement.src = sourcePath;
            mediaElement.className = 'record-media';
        } else if (record.type === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.src = sourcePath;
            mediaElement.className = 'record-media';
        } else if (record.type === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = sourcePath;
            mediaElement.alt = record.title;
            mediaElement.className = 'record-media record-image';
        }

        const desc = document.createElement('p');
        desc.textContent = record.desc;
        desc.className = 'record-desc';

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
