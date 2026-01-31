function initPavilion(jsonPath) {
    document.addEventListener('DOMContentLoaded', () => {
        setupMobileMenu();
        injectSearchOverlay();
        injectTributeModal(); // Inject Tribute UI

        fetchData(jsonPath)
            .then(data => {
                if (data) {
                    setupSearch(data, jsonPath);
                    setupTribute(data); // Setup Tribute logic
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
    const cultivationContainer = document.getElementById('meridian-chart');

    return fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch sect records');
            }
            return response.json();
        })
        .then(data => {
            if (scriptureContainer) renderScriptures(data.scriptures, scriptureContainer);
            if (artifactContainer) renderArtifacts(data.artifacts, artifactContainer);
            if (updatesContainer) renderUpdates(data, updatesContainer);
            if (recordsContainer) renderRecords(data.records, recordsContainer, jsonPath);
            if (cultivationContainer) renderCultivationTree(data, cultivationContainer, jsonPath);
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMsg = document.createElement('p');
            errorMsg.className = 'error-text';
            errorMsg.textContent = 'The archives are currently sealed by a higher power (404).';

            if (scriptureContainer) scriptureContainer.appendChild(errorMsg.cloneNode(true));
            if (artifactContainer) artifactContainer.appendChild(errorMsg.cloneNode(true));
            if (recordsContainer) recordsContainer.appendChild(errorMsg.cloneNode(true));
            if (cultivationContainer) cultivationContainer.appendChild(errorMsg.cloneNode(true));
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
    const searchTriggers = document.querySelectorAll('.search-trigger');
    searchTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearch();
        });
    });

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

    let assetPrefix = '';
    if (jsonPath.startsWith('../')) {
        assetPrefix = '../';
    }

    if (data.scriptures) {
        data.scriptures.forEach(item => {
            if (item.title.toLowerCase().includes(query) || item.summary.toLowerCase().includes(query)) {
                results.push({
                    type: 'Scripture',
                    title: item.title,
                    link: item.readLink,
                    class: 'result-scripture'
                });
            }
        });
    }

    if (data.artifacts) {
        data.artifacts.forEach(item => {
            if (item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) {
                let link = '#';
                if (item.demoUrl && item.demoUrl !== '#') link = item.demoUrl;
                else if (item.downloadUrl) link = item.downloadUrl;

                results.push({
                    type: 'Artifact',
                    title: item.name,
                    link: link,
                    class: 'result-artifact'
                });
            }
        });
    }

    if (data.records) {
        data.records.forEach(item => {
            if (item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)) {
                results.push({
                    type: 'Record',
                    title: item.title,
                    link: assetPrefix + item.mediaSource,
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

/* --- Tribute Altar (Donation) Functionality --- */

function injectTributeModal() {
    if (document.getElementById('tribute-modal')) return;

    const modalHTML = `
        <div id="tribute-modal">
            <div class="tribute-container">
                <i class="ri-close-line tribute-close" onclick="toggleTribute()"></i>
                <div class="tribute-seal">
                    <i class="ri-coin-line"></i>
                </div>
                <div class="tribute-content">
                    <h2>Strengthen the Foundation</h2>
                    <p>The maintenance of this Pavilion requires resources. If these techniques have aided your cultivation, consider offering a tribute to the Patriarch.</p>
                    <div class="tribute-options">
                        <a href="#" id="tribute-kofi" class="btn-tribute" target="_blank">
                            <i class="ri-cup-line"></i> Offer a Cup of Jade Tea
                        </a>
                        <a href="#" id="tribute-paypal" class="btn-tribute" target="_blank">
                            <i class="ri-coin-line"></i> Grant Spirit Stones
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup close on click outside
    document.getElementById('tribute-modal').addEventListener('click', (e) => {
        if (e.target.id === 'tribute-modal') {
            toggleTribute();
        }
    });
}

function toggleTribute() {
    const modal = document.getElementById('tribute-modal');
    if (modal) {
        modal.classList.toggle('active');
    }
}

function setupTribute(data) {
    if (!data.tribute) return;

    const kofiBtn = document.getElementById('tribute-kofi');
    const paypalBtn = document.getElementById('tribute-paypal');

    if (kofiBtn && data.tribute.kofi) {
        kofiBtn.href = data.tribute.kofi;
    }

    if (paypalBtn && data.tribute.paypal) {
        paypalBtn.href = data.tribute.paypal;
    }

    // Bind triggers
    const triggers = document.querySelectorAll('.tribute-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTribute();
        });
    });
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
             const inspectBtn = document.createElement('a');
             inspectBtn.href = artifact.demoUrl;
             inspectBtn.className = 'btn-download btn-inspect';
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

/* --- Cultivation Tree Render Logic --- */
function renderCultivationTree(data, container, jsonPath) {
    container.innerHTML = '';
    const treeData = data.cultivation;
    const artifacts = data.artifacts; // Capture artifacts
    if (!treeData) return;

    // Use a set or map to quickly find nodes by ID
    const nodeMap = new Map(treeData.map(node => [node.id, node]));

    // Find roots (tier 1 nodes)
    const roots = treeData.filter(n => n.tier === 1);

    // Create the tree container
    const treeRootDiv = document.createElement('div');
    treeRootDiv.className = 'tree';

    const rootUl = document.createElement('ul');

    roots.forEach(rootNode => {
        const li = buildTreeBranch(rootNode, nodeMap, artifacts, jsonPath);
        rootUl.appendChild(li);
    });

    treeRootDiv.appendChild(rootUl);
    container.appendChild(treeRootDiv);
}

function buildTreeBranch(node, nodeMap, artifacts, jsonPath) {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = '#';
    a.textContent = node.name;
    a.dataset.id = node.id;

    a.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tree a').forEach(el => el.classList.remove('active'));
        a.classList.add('active');
        showSkillDetails(node, artifacts, jsonPath);
    });

    li.appendChild(a);

    if (node.children && node.children.length > 0) {
        const childUl = document.createElement('ul');
        node.children.forEach(childId => {
            const childNode = nodeMap.get(childId);
            if (childNode) {
                childUl.appendChild(buildTreeBranch(childNode, nodeMap, artifacts, jsonPath));
            }
        });
        if (childUl.hasChildNodes()) {
            li.appendChild(childUl);
        }
    }

    return li;
}

function showSkillDetails(skill, artifacts, jsonPath) {
    const panel = document.getElementById('technique-detail');
    const nameEl = document.getElementById('tech-name');
    const tierEl = document.getElementById('tech-tier');
    const descEl = document.getElementById('tech-desc');
    const projectsEl = document.getElementById('tech-projects');

    let assetPrefix = '';
    if (jsonPath.startsWith('../')) {
        assetPrefix = '../';
    }

    if (panel) {
        nameEl.textContent = skill.name;
        tierEl.textContent = `Tier ${skill.tier}`;
        descEl.textContent = skill.desc;
        projectsEl.innerHTML = '';

        // Find related artifacts based on loose string matching in materials
        const related = artifacts.filter(art => {
            if (!art.materials) return false;
            // Matches if any material includes the first word of the skill name (e.g. "HTML" in "HTML Structure")
            const keyword = skill.name.split(' ')[0].toLowerCase();
            return art.materials.some(mat => mat.toLowerCase().includes(keyword));
        });

        if (related.length > 0) {
            const heading = document.createElement('h4');
            heading.style.color = '#888';
            heading.style.marginTop = '1rem';
            heading.style.fontSize = '0.9rem';
            heading.textContent = 'Technique Applied In:';
            projectsEl.appendChild(heading);

            related.forEach(art => {
                const link = document.createElement('a');
                link.href = assetPrefix + 'projects.html'; // Direct to projects page
                link.className = 'related-project-link';
                link.innerHTML = `<i class="ri-sword-line"></i> ${art.name}`;
                projectsEl.appendChild(link);
            });
        }

        panel.classList.remove('hidden');
    }
}

function getTierClass(tierString) {
    if (tierString.includes('Heaven')) return 'tier-heaven';
    if (tierString.includes('Earth')) return 'tier-earth';
    return 'tier-mortal';
}
