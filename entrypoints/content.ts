export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    function getStorage(type: string) {
      const list: RowData[] = [];
      const storage = getStorageType(type);
      for (let i = 0; i < storage.length; i++) {
        list.push({
          key: storage.key(i) as string,
          value: storage.getItem(storage.key(i) as string) as string,
        });
      }
      return list;
    }

    function getStorageType(type: string) {
      const storage = type === 'local' ? localStorage : sessionStorage;
      return storage;
    }

    function setStorageValue(type: string, index: number, value: string) {
      const storage = getStorageType(type);
      storage.setItem(storage.key(index) as string, value);
    }

    function setStorageKey(type: string, index: number, key: string) {
      const storage = getStorageType(type);
      const value = storage.getItem(storage.key(index) as string) as string;
      storage.removeItem(storage.key(index) as string);
      storage.setItem(key, value);
    }

    function setStorage(type: string, key: string, value: string) {
      const storage = getStorageType(type);
      storage.setItem(key, value);
    }

    function importStorage(data: OutputFile) {
      data.local.forEach((item: RowData) => {
        setStorage('local', item.key, item.value);
      });
      data.session.forEach((item: RowData) => {
        setStorage('session', item.key, item.value);
      });
    }

    chrome.runtime.onMessage.addListener(function (request: Requset, sender, sendResponse) {
      if (request.method === 'get') {
        sendResponse(getStorage(request.type));
      } else if (request.method === 'setValue') {
        setStorageValue(request.type, request.value.index, request.value.value);
        // sendResponse(getStorage(request.type));
      } else if (request.method === 'setKey') {
        setStorageKey(request.type, request.value.index, request.value.key);
        // sendResponse(getStorage(request.type));
      } else if (request.method === 'remove') {
        const storage = getStorageType(request.type);
        storage.removeItem(request.value);
        // sendResponse(getStorage(request.type));
      } else if (request.method === 'clear') {
        const storage = getStorageType(request.type);
        storage.clear();
        // sendResponse(getStorage(request.type));
      } else if (request.method === 'set') {
        setStorage(request.type, request.value.key, request.value.value);
        // sendResponse(getStorage(request.type));
      } else if (request.method === 'import') {
        const data = request.value;
        importStorage(data);
        // sendResponse(getStorage(request.type));
      } else if (request.method === 'export') {
        const data: OutputFile = {
          fileId: 'localStorageManager',
          local: getStorage('local'),
          session: getStorage('session'),
        };
        sendResponse(data);
      }
    });
  },
});
