// ==UserScript==
// @name         E-Hentai OpenFullPicture
// @namespace    B1773rm4n
// @version      2026-03-25
// @description  When opening a full picture link, directly open the image
// @copyright    WTFPL
// @license      WTFPL
// @source       https://github.com/B1773rm4n/Tampermonkey_Userscripts/blob/main/ehentai_OpenFullPicture.js
// @author       B1773rm4n
// @match        https://exhentai.org/*
// @match        https://e-hentai.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=e-hentai.org
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    // If on a gallery page itself
    const URL = document.URL
    const regex = /\/s\/[0-f]{10}\/.*-\d+/g;
    const isMatchURL = URL.match(regex);

    if (isMatchURL) {
        const imageURL = document.getElementById("i3").firstChild.firstChild.src
        window.location.assign(imageURL)
    }

})();
