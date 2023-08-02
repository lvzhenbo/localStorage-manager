/// <reference types="@types/chrome" />

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// chrome.tabs.onActivated.addListener((activeInfo) => {
//   console.log(activeInfo);
//   chrome.scripting.executeScript({
//     target: { tabId: activeInfo.tabId },
//     files: ['src/scripts/content.ts.js'],
//   });
//   chrome.tabs.get(activeInfo.tabId, (tab) => {
//     console.log(tab);
//   });
// });
