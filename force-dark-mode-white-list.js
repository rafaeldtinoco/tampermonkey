// ==UserScript==
// @name         force-dark-mode-white-list
// @namespace    http://tampermonkey.net/
// @version      202312181100
// @description  Google Chrome force-dark-mode white list on selected domains.
// @author       Rafael David Tinoco
// @match        http*://*/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

;(function () {
  'use strict'

  const excludedDomains = ['github.com']

  function isExcludedDomain () {
    const currentDomain = window.location.hostname
    return excludedDomains.find(domain => currentDomain.includes(domain))
  }

  // CSS to be applied
  const css = `
        :root {
            color-scheme: only light;
        }
    `

  if (isExcludedDomain()) {
    GM_addStyle(css)
  }
})()
