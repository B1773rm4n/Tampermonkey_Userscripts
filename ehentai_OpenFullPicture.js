// ==UserScript==
// @name         Exhentai OpenFullPicture
// @namespace    http://tampermonkey.net/
// @version      2024-08-19
// @description  try to take over the world!
// @author       You
// @match        https://exhentai.org/*
// @match        https://e-hentai.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=exhentai.org
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // If on a gallery page itself
    const URL = document.URL
    const regex = /\/s\/[0-f]{10}\/.*-\d+/g;
    const isMatchURL = URL.match(regex);

    if(isMatchURL) {
       const imageURL = document.getElementById("i3").firstChild.firstChild.src
       window.location.assign(imageURL)
    }




/*

    // If on the overview of galleries
    if(document.URL.includes("advsearch") || document.URL.includes("tag")) {
        console.log("list view")
        // let galleryList = document.getElementsByClassName("glname")
        // this does the same as the commented line above but returns an array
        let galleryList = [...document.querySelectorAll('.glname')]


        galleryList.forEach( function (galleryItem, index) {
            if(galleryItem.innerText.toLowerCase().includes("ai generated") || galleryItem.innerText.toLowerCase().includes("ai-generated")) {
                galleryItem.parentElement.parentElement.style.backgroundColor = "#400"
            }
        })

    }

    */
})();
