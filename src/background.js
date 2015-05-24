var menus = [chrome.contextMenus.create({"title": "Выбрать", "contexts": ["all"]})];

menus.push(chrome.contextMenus.create({ "title": "Выделить строку",    "parentId": menus[0], "enabled": false, "contexts": ["all"], "onclick": function() { menuClick("selectRow")    }}));
menus.push(chrome.contextMenus.create({ "title": "Выделить столбец", "parentId": menus[0], "enabled": false, "contexts": ["all"], "onclick": function() { menuClick("selectColumn") }}));
menus.push(chrome.contextMenus.create({ "title": "Выделить всю таблицу",  "parentId": menus[0], "enabled": false, "contexts": ["all"], "onclick": function() { menuClick("selectTable")  }}));

// Menu selection - dispatch the message to the content.js
function menuClick(cmd) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {menuCommand: cmd},
            function(response) {});
    });
}

// Content command - handle a message from the content.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message.command) {
        case "updateMenu":
            menus.forEach(function(id) {
                chrome.contextMenus.update(id, {enabled:message.enabled});
            });
            break;
    }
});

