// ==UserScript==
// @name         Freelancermap.com highlight
// @namespace    B1773rm4n
// @version      2026-01-30
// @description  Highlight visited freelancermap.com pages
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

    // Retrieve the list of visited URLs from localStorage
    const getVisited = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Save a new URL to the visited list
    const markVisited = (url) => {
        const visited = getVisited();
        if (!visited.includes(url)) {
            visited.push(url);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
        }
    };

    /**
     * Scans the page for project cards and highlights them if visited.
     * It checks both the local storage and the site's native 'viewed-project' class.
     */
    const highlightVisitedCards = () => {
        const visitedList = getVisited();
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const titleLink = card.querySelector('a[data-id="project-card-title"]');
            if (!titleLink) return;

            const projectUrl = titleLink.href;

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
        });
    };

    // Use a MutationObserver to handle dynamic content (AJAX loading, pagination, etc.)
    const observer = new MutationObserver(() => {
        highlightVisitedCards();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Run on initial page load
    highlightVisitedCards();
})();