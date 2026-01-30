// ==UserScript==
// @name         Freelancermap.com highlight
// @namespace    B1773rm4n
// @version      2026-01-30
// @description  Highlight visited and hide unwanted projects on freelancermap.com
// @copyright    WTFPL
// @license      WTFPL
// @source       https://github.com/B1773rm4n/Tampermonkey_Userscripts/blob/main/1337x_OpenInSteam.js
// @author       B1773rm4n
// @match        https://www.freelancermap.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.freelancermap.com
// @grant        none
// @run-at   document-end
// ==/UserScript==

(function() {
    'use strict';

    // Key for storing visited project URLs in browser storage
    const STORAGE_KEY = 'freelancermap_visited_projects';
    const HIDDEN_KEY = 'freelancermap_hidden_projects';
    const KEYWORDS_KEY = 'freelancermap_filter_keywords';

    // Retrieve the list of visited URLs from localStorage
    const getVisited = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const getHidden = () => JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]');
    const getKeywords = () => {
        let kws = JSON.parse(localStorage.getItem(KEYWORDS_KEY));
        if (!kws) {
            kws = ['SAP', 'HANA', 'Tiefbauingenieur'];
            localStorage.setItem(KEYWORDS_KEY, JSON.stringify(kws));
        }
        return kws;
    };

    const saveKeywords = (kws) => localStorage.setItem(KEYWORDS_KEY, JSON.stringify(kws));

    const markHidden = (url) => {
        const hidden = getHidden();
        if (!hidden.includes(url)) {
            hidden.push(url);
            localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
        }
    };

    // Save a new URL to the visited list
    const markVisited = (url) => {
        const visited = getVisited();
        if (!visited.includes(url)) {
            visited.push(url);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
        }
    };

    const shouldHideByKeywords = (card, keywords) => {
        const text = card.innerText.toLowerCase();
        return keywords.some(kw => text.includes(kw.toLowerCase()));
    };

    /**
     * Scans the page for project cards to highlight or hide them.
     */
    const highlightVisitedCards = () => {
        const visitedList = getVisited();
        const keywords = getKeywords();
        const hiddenList = getHidden();
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const titleLink = card.querySelector('a[data-id="project-card-title"]');
            if (!titleLink) return;

            const projectUrl = titleLink.href;

            // Hide if manually hidden or matches keywords
            if (hiddenList.includes(projectUrl) || shouldHideByKeywords(card, keywords)) {
                card.style.display = 'none';
                return;
            }

            // Determine if the project is visited
            const isVisited = visitedList.includes(projectUrl) || card.classList.contains('viewed-project');

            if (isVisited) {
                card.style.setProperty('background-color', 'red', 'important');
            }

            // Attach a click listener to track new visits immediately
            if (!titleLink.dataset.trackerAttached) {
                titleLink.addEventListener('click', () => {
                    markVisited(projectUrl);
                    card.style.setProperty('background-color', 'red', 'important');
                });
                titleLink.dataset.trackerAttached = 'true';
            }

            // Replace Memo Button with a Big X (Hide) Button
            const memoBtn = card.querySelector('[data-id="project-card-memo-list-button"]');
            if (memoBtn && !memoBtn.dataset.xAttached) {
                memoBtn.innerHTML = '<i class="fas fa-times" style="font-size: 1.8rem; color: #d9534f;"></i>';
                memoBtn.title = "Hide this project forever";
                memoBtn.style.border = "2px solid #d9534f";
                
                memoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    markHidden(projectUrl);
                    card.style.display = 'none';
                });
                memoBtn.dataset.xAttached = 'true';
            }
        });
    };

    /**
     * UI for managing keywords
     */
    const showKeywordModal = () => {
        const existing = document.getElementById('fm-keyword-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'fm-keyword-modal';
        modal.style = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 20px; border-radius: 8px; z-index: 10001;
            box-shadow: 0 0 20px rgba(0,0,0,0.5); min-width: 300px; font-family: sans-serif;
        `;

        const overlay = document.createElement('div');
        overlay.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 255, 21, 0.5); z-index: 10000;';
        overlay.onclick = () => { modal.remove(); overlay.remove(); };

        const renderList = () => {
            const kws = getKeywords();
            listContainer.innerHTML = kws.map(kw => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding: 5px; background: #f4f4f4; border-radius: 4px;">
                    <span>${kw}</span>
                    <button class="remove-kw" data-kw="${kw}" style="color: red; border: none; background: none; cursor: pointer; font-weight: bold;">X</button>
                </div>
            `).join('');
            
            listContainer.querySelectorAll('.remove-kw').forEach(btn => {
                btn.onclick = () => {
                    const toRemove = btn.getAttribute('data-kw');
                    saveKeywords(getKeywords().filter(k => k !== toRemove));
                    renderList();
                    highlightVisitedCards();
                };
            });
        };

        modal.innerHTML = `
            <h3 style="margin-top: 0;">Filter Keywords</h3>
            <div id="kw-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;"></div>
            <div style="display: flex; gap: 5px;">
                <input type="text" id="new-kw" placeholder="Add keyword..." style="flex-grow: 1; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
                <button id="add-kw" style="padding: 5px 10px; background: #5200FF; color: white; border: none; border-radius: 4px; cursor: pointer;">Add</button>
            </div>
            <button id="close-modal" style="margin-top: 15px; width: 100%; padding: 8px; border: 1px solid #ccc; background: #eee; cursor: pointer; border-radius: 4px;">Close</button>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const listContainer = modal.querySelector('#kw-list');
        const input = modal.querySelector('#new-kw');
        
        modal.querySelector('#add-kw').onclick = () => {
            const val = input.value.trim();
            if (val) {
                const kws = getKeywords();
                if (!kws.includes(val)) {
                    kws.push(val);
                    saveKeywords(kws);
                    input.value = '';
                    renderList();
                    highlightVisitedCards();
                }
            }
        };

        modal.querySelector('#close-modal').onclick = () => { modal.remove(); overlay.remove(); };
        renderList();
    };

    const injectKeywordButton = () => {
        if (document.getElementById('fm-manage-filters')) return;
        const nav = document.querySelector('.header-nav-bar');
        if (!nav) return;

        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `
            <a id="fm-manage-filters" class="general-header-link-highlighted" style="cursor:pointer; display: flex; align-items: center; gap: 5px; background-color: #00FF15; padding: 5px 10px; border-radius: 4px; color: black !important;">
                <i class="fas fa-filter"></i> Filters
            </a>
        `;
        li.onclick = (e) => {
            e.preventDefault();
            showKeywordModal();
        };
        nav.appendChild(li);
    };

    // Use a MutationObserver to handle dynamic content (AJAX loading, pagination, etc.)
    const observer = new MutationObserver(() => {
        highlightVisitedCards();
        injectKeywordButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Run on initial page load
    highlightVisitedCards();
    injectKeywordButton();
})();