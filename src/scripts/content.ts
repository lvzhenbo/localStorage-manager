interface IStorage {
  Key: string;
  value: string;
}

function getStorage(type: string) {
  const list: IStorage[] = [];
  const storage = type === 'local' ? localStorage : sessionStorage;
  for (let i = 0; i < storage.length; i++) {
    list.push({
      Key: storage.key(i) as string,
      value: storage.getItem(storage.key(i) as string) as string,
    });
  }
  return list;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.method === 'get') sendResponse(getStorage(request.type));
});
