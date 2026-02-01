// ==UserScript==
// @name         1337x open in Steam
// @namespace    http://tampermonkey.net/
// @version      2024-07-14
// @description  try to take over the world!
// @author       You
// @match        https://1337x.to/torrent/*
// @match        https://x1337x.cc/torrent/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=1337x.to
// @grant        none
// @run-at   document-end
// ==/UserScript==

(function () {
    'use strict';

    const gameNameRaw = document.getElementsByTagName("h1")[0].innerText
    console.log(gameNameRaw)

    let gameName
    // remove brackets
    gameName = gameNameRaw.split('[')[0]
    gameName = gameName.split('(')[0]
    gameName = gameName.split('<')[0]

    // remove certain keywords
    gameName = gameName.split('Update')[0]
    gameName = gameName.split('Hotfix')[0]
    gameName = gameName.split('Deluxe')[0]
    gameName = gameName.split('Edition')[0]
    gameName = gameName.split('Directors')[0]


    // remove ripper names
    gameName = gameName.split('The Codex')[0]
    gameName = gameName.split('TENOKE')[0]
    gameName = gameName.split('SKIDROW')[0]
    gameName = gameName.split('Unleashed')[0]
    gameName = gameName.split('Rune')[0]
    gameName = gameName.split('RUNE')[0]
    gameName = gameName.split('TiNYiSO')[0]
    gameName = gameName.split('Razor1911')[0]

    // remove special cases
    gameName = gameName.replace(/v.?\d.*/gi, ''); // version number like v1.2345
    gameName = gameName.replace(/[^a-zA-Z0-9 ]/g, ''); // remove special characters

    gameName = gameName.trim()

    console.log(gameName)

    document.getElementsByTagName("h1")[0].innerHTML = "<a href=\"https://store.steampowered.com/search/?term=" + gameName + "\">" + gameNameRaw + "<\a>"

})();