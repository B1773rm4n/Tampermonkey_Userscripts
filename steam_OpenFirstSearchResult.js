// ==UserScript==
// @name         Open first steam search results
// @namespace    http://tampermonkey.net/
// @version      2024-07-13
// @description  try to take over the world!
// @author       You
// @match        https://store.steampowered.com/search/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steampowered.com
// @run-at   document-end
// ==/UserScript==

(function() {
    'use strict';

    const newUrl = document.getElementsByClassName('search_result_row')[0].href
    console.log(newUrl)
    location.replace (newUrl);

    // Your code here...
})();