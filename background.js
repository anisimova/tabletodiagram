var menus = [chrome.contextMenus.create({"title": "Выбрать", "contexts": ["all"]})];

menus.push(chrome.contextMenus.create({ "title": "Выделить строку",    "parentId": menus[0], "enabled": true, "contexts": ["all"], "onclick": function() { menuClick("selectRow")    }}));
menus.push(chrome.contextMenus.create({ "title": "Выделить столбец", "parentId": menus[0], "enabled": true, "contexts": ["all"], "onclick": function() { menuClick("selectColumn") }}));
menus.push(chrome.contextMenus.create({ "title": "Выделить всю таблицу",  "parentId": menus[0], "enabled": true, "contexts": ["all"], "onclick": function() { menuClick("selectTable")  }}));

function menuClick(cmd) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {menuCommand: cmd},
            function(response) {});
    });
}

chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if ((msg.from === 'content') && (msg.subject === 'showBrowserAction')) {
        /* Enable the page-action for the requesting tab */
        chrome.browserAction.enable(sender.tab.id);
    }
    switch(msg.command) {
        case "updateMenu":
            menus.forEach(function(id) {
                chrome.contextMenus.update(id, {enabled:msg.enabled});
            });
            break;
    };
});