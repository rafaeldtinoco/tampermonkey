// ==UserScript==
// @name         replace-font-sizes
// @namespace    http://tampermonkey.net/
// @version      202312201700
// @description  Replace all fonts sizes by preferred ones.
// @author       Rafael David Tinoco
// @match        http*://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'

  var fixedWidthFonts = [
    'Monospace',
    'Courier',
    'Courier New',
    'Consolas',
    'Monaco',
    'Menlo',
    'Fire Mono',
    'Liberation Mono',
    'Monospace',
    'Noto Mono',
    'Roboto Mono'
  ].map(font => font.toLowerCase())

  var fontShouldBeChanged = [
    'Open Sans',
    'Liberation Sans',
    'Calibri',
    'Cambria',
    'Candara',
    'Constantia',
    'Corbel',
    'Georgia',
    'Segoe UI',
    'Trebuchet MS',
    'Verdana',
    'sans',
    'sans-serif',
    'serif',
    'Avenir',
    'Avenir Next',
    'Comic Sans MS',
    'Comic Sans',
    'Lucida Grande',
    'Lucida Sans',
    'Roboto',
    'Monospace',
    'Noto Mono',
    'Consolas',
    'Courier New',
    'Courier',
    'Monaco',
    'Menlo',
    'Fira Mono',
    'Liberation Mono',
    'Roboto Mono',
    'Arial',
    'Times New Roman',
    'Arial Narrow',
    'Tahoma',
    'Helvetica',
    'Helvetica Neue',
    'San Francisco',
    'Fira Sans',
    'Noto Sans'
  ].map(font => font.toLowerCase())

  // Domains added here won't have default font sizes applied:
  var domainExceptionList = [
    'linkedin.com',
    'uol.com.br'
    // ... add more domains as needed
  ]

  // These sizes will be applied to all domains:
  var defaultFontSettings = {
    minFontSize: 18,
    maxFontSize: 26,
    minFixedWidthFontSize: 18,
    maxFixedWidthFontSize: 18,
    lineHeight: 0,
    fixedWidthLineHeight: 0
  }

  // Domains added here have specific font sizes:
  var domainFontSettings = [
    {
      domain: 'wikipedia.org',
      minFontSize: 19,
      maxFontSize: 19,
      minFixedWidthFontSize: 19,
      maxFixedWidthFontSize: 19,
      lineHeight: 0,
      fixedWidthLineHeight: 0
    },
    {
      domain: 'twitter.com',
      minFontSize: 16,
      maxFontSize: 16,
      minFixedWidthFontSize: 18,
      maxFixedWidthFontSize: 18,
      lineHeight: 1.2,
      fixedWidthLineHeight: 1.2
    },
    {
      domain: 'github.com',
      minFontSize: 17,
      maxFontSize: 24,
      minFixedWidthFontSize: 17,
      maxFixedWidthFontSize: 17,
      lineHeight: 1.2,
      fixedWidthLineHeight: 1.2
    },
    {
      domain: 'mail.google.com',
      minFontSize: 18,
      maxFontSize: 18,
      minFixedWidthFontSize: 18,
      maxFixedWidthFontSize: 18,
      lineHeight: 1.2,
      fixedWidthLineHeight: 1.2
    },
    {
      domain: 'google.com',
      minFontSize: 16,
      maxFontSize: 22,
      minFixedWidthFontSize: 16,
      maxFixedWidthFontSize: 22,
      lineHeight: 0,
      fixedWidthLineHeight: 0
    },
    {
      domain: 'openai.com',
      minFontSize: 18,
      maxFontSize: 18,
      minFixedWidthFontSize: 18,
      maxFixedWidthFontSize: 18,
      lineHeight: 1.4,
      fixedWidthLineHeight: 1.2
    }
  ]

  function adjustFontSize (node) {
    if (node.nodeName === 'BODY' || node.nodeName === 'HTML') {
      return
    }

    let currentDomain = window.location.hostname

    // Nothing to do for these domains.
    if (domainExceptionList.some(domain => currentDomain.includes(domain))) {
      return
    }

    let fontFamily = window.getComputedStyle(node).fontFamily.toLowerCase()
    let fontSize = parseFloat(window.getComputedStyle(node).fontSize)
    let isFixedWidth = fixedWidthFonts.some(font => fontFamily.includes(font))

    // Apply default font sizes if there isn't specific font size settings for this domain.
    let applicableSettings = domainFontSettings.find(setting =>
      currentDomain.includes(setting.domain)
    )
    if (!applicableSettings) {
      applicableSettings = defaultFontSettings
    }

    let shouldBeChanged = fontShouldBeChanged.some(font =>
      fontFamily.includes(font)
    )
    if (!shouldBeChanged) {
      console.log(`Not changing sizes for: ${fontFamily}`)
      return
    }

    let newFontSize = 0
    let newLineHeight = 0

    let {
      minFontSize,
      maxFontSize,
      minFixedWidthFontSize,
      maxFixedWidthFontSize,
      lineHeight,
      fixedWidthLineHeight
    } = applicableSettings

    if (isFixedWidth) {
      if (fontSize < minFixedWidthFontSize) {
        newFontSize = minFixedWidthFontSize
      }
      if (fontSize > maxFixedWidthFontSize) {
        newFontSize = maxFixedWidthFontSize
      }
      if (fixedWidthLineHeight) {
        newLineHeight = fixedWidthLineHeight
      }
    } else {
      if (minFontSize && fontSize < minFontSize) {
        newFontSize = minFontSize
      }
      if (maxFontSize && fontSize > maxFontSize) {
        newFontSize = maxFontSize
      }
      if (lineHeight) {
        newLineHeight = lineHeight
      }
    }

    if (newFontSize) {
      node.style.fontSize = `${newFontSize}px`
    }

    if (newLineHeight) {
      node.style.lineHeight = `${newLineHeight}em`
    }
  }

  function observeDOMChanges () {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            adjustFontSize(node)
            node.querySelectorAll('*').forEach(adjustFontSize)
          }
        })
        if (mutation.type === 'attributes') {
          adjustFontSize(mutation.target)
        }
      })
    })
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true
    })
  }

  window.addEventListener('load', () => {
    document.querySelectorAll('*').forEach(adjustFontSize)
    observeDOMChanges()
  })

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('*').forEach(adjustFontSize)
  })
})()
