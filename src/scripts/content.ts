/// <reference types="@types/chrome" />

interface IStorage {
  key: string;
  value: string;
}

function getStorage(type: string) {
  const list: IStorage[] = [];
  const storage = type === 'local' ? localStorage : sessionStorage;
  for (let i = 0; i < storage.length; i++) {
    list.push({
      key: storage.key(i) as string,
      value: storage.getItem(storage.key(i) as string) as string,
    });
  }
  return list;
}

function setStorageValue(type: string, index: number, value: string) {
  const storage = type === 'local' ? localStorage : sessionStorage;
  storage.setItem(storage.key(index) as string, value);
}

function setStorageKey(type: string, index: number, key: string) {
  const storage = type === 'local' ? localStorage : sessionStorage;
  const value = storage.getItem(storage.key(index) as string) as string;
  storage.removeItem(storage.key(index) as string);
  storage.setItem(key, value);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.method === 'get') {
    sendResponse(getStorage(request.type));
  } else if (request.method === 'setValue') {
    setStorageValue(request.type, request.value.index, request.value.value);
    // sendResponse(getStorage(request.type));
  } else if (request.method === 'setKey') {
    setStorageKey(request.type, request.value.index, request.value.key);
    // sendResponse(getStorage(request.type));
  } else if (request.method === 'remove') {
    const storage = request.type === 'local' ? localStorage : sessionStorage;
    storage.removeItem(request.value);
    // sendResponse(getStorage(request.type));
  } else if (request.method === 'clear') {
    const storage = request.type === 'local' ? localStorage : sessionStorage;
    storage.clear();
    // sendResponse(getStorage(request.type));
  } else if (request.method === 'set') {
    const storage = request.type === 'local' ? localStorage : sessionStorage;
    storage.setItem(request.value.key, request.value.value);
    // sendResponse(getStorage(request.type));
  }
});