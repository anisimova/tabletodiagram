(function () {

// Settings
    // ---------------------------

    // Minimal scroll speed (scrolls per second). минимальная скорость прокрутки
    var scrollMinSpeed = 30;

    // Maximal scroll speed (scrolls per second). максимальная скорость
    var scrollMaxSpeed = 150;

    // Scroll speed acceleration. увеличение скорости прокрутки
    var scrollAcceleration = 1.01;

    // Scroll amount, in pixels. прокрутка в пикселях
    var scrollAmount = 30;

    // Class for selected cells. класс для выбранных ячеек
    var clsSelected = "selectTable_A";

    // Class for dragged over cells. класс для перетащенных ячеек
    var clsDragover = "selectTable_B";

    var valueTab =[];

// Common tools
    // ---------------------------

 

    // Add a collection to an array. добавить коллекцию? в массив
    var $A = function(a, coll) {
        Array.prototype.forEach.call(coll, function(x) { a.push(x) });
        return a;
    };

    // Split a string into words. разрезать строку по буквам
    var $W = function(str) {
        return (str || "").split(/\s+/);
    };

    // Shortcut for getElementsByClassName.
    var $C = function(cls, where) {
        return $A([], (where || document).getElementsByClassName(cls));
    };

    // Apply a function to an element and each descendant. применить функцию к элементу и каждому потомку
    var walk = function(el, fun) {
        if(el.nodeType != 1)
            return;
        fun(el);
        var cs = el.childNodes;
        for(var i = 0; i < cs.length; i++)
            walk(cs[i], fun);
    };

    // Apply a function to given elements within a parent element. применит функцию к выбранным элементам в родительском элементе?
    var each = function(tag, el, fun) {
        if(!tag.push)
            tag = $W(tag);
        if(el.nodeType != 1)
            return;
        if(tag.indexOf(el.nodeName) >= 0) {
            fun(el);
            return;
        }
        var cs = el.childNodes;
        for(var i = 0; i < cs.length; i++)
            each(tag, cs[i], fun);
    };

    // Remove all given elements. сбросить выделенные элементы
    var removeAll = function(els) {
        els.forEach(function(el) {
            if(el && el.parentNode)
                el.parentNode.removeChild(el);
        });
    };

    // Find closest parent elements with the given tag name (or names). найти соседние родительские элементы с заданным тэг-именем
    var closest = function(el, tags) {
        tags = $W(tags.toLowerCase());
        while(el) {
            if(el.nodeName && tags.indexOf(el.nodeName.toLowerCase()) >= 0)
                return el;
            el = el.parentNode;
        }
        return null;
    };

    // Add a class to the element. добавить класс элементу
    var addClass = function(el, cls) {
        if(el) {
            var c = $W(el.className);
            if(c.indexOf(cls) < 0)
                c.push(cls);
            el.className = c.join(" ");
        }
    };

    // Remove a class from the element. удалить класс у элемента
    var removeClass = function(el, cls) {
        if(el && el.className) {
            var cname = $W(el.className).filter(function(x) {
                return x != cls;
            }).join(" ");
            if(cname.length)
                el.className = cname;
            else
                el.removeAttribute("class");
        }
    };

    // True if the element has a given class. проверка на наличие класса у элемента
    var hasClass = function(el, cls) {
        return el ? $W(el.className).indexOf(cls) >= 0 : false;
    };

    // True if the element can be scrolled. проверка на скроллинг элемента
    var isScrollable = function(el) {
        if(!el || el == document || el == document.body)
            return false;
        var css = document.defaultView.getComputedStyle(el);
        if(!css.overflowX.match(/scroll|auto/) && !css.overflowY.match(/scroll|auto/))
            return false;
        return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    };

    // Closest parent scrollable element. соседние родительские прокручиваемые элементы
    var closestScrollable = function(el) {
        while(el) {
            if(isScrollable(el))
                return el;
            el = el.parentNode;
        }
        return null;
    };

    // Get element's bounds. получение границ элемента
    var bounds = function(el) {
        var r = el.getBoundingClientRect();
        return [r.left, r.top, r.right, r.bottom];
    };

    // True if two rectangles intersect. Пересекаются ли два элемента
    var intersect = function(a, b) {
        return !(a[0] >= b[2] || a[2] <= b[0] || a[1] >= b[3] || a[3] <= b[1])
    };

   
// Selection manipulation
    // ---------------------------

    // Current selection.
    var selection = null;

    // Last handled event.
    var lastEvent = null;

    // True if a cell has a `selected` class.
    var isSelected = function(el) {
        return el ? (el.className || "").indexOf("selectTable") >= 0 : false;
    };

// Scrolling
    // ---------------------------

    // Scroll timer. таймер скроллинга
    var scrollTimer = 0;

    // Periodic scroll checker. периодическая проверка скроллинга?
    var scrollWatch = function() {
        if(!selection) {
            return;
        }

        if(selection.scrollBase) {

            var sx = selection.scrollBase.scrollLeft, sy = selection.scrollBase.scrollTop;
            var w = selection.scrollBase.clientWidth, h = selection.scrollBase.clientHeight;
            var b = bounds(selection.scrollBase);
            var cx = lastEvent.clientX - b[0];
            var cy = lastEvent.clientY - b[1];


            if(cx < scrollAmount) sx -= scrollAmount;
            if(cx > w - scrollAmount) sx += scrollAmount;
            if(cy < scrollAmount) sy -= scrollAmount;
            if(cy > h - scrollAmount) sy += scrollAmount;

            selection.scrollBase.scrollLeft = sx;
            selection.scrollBase.scrollTop = sy;


        } else {

            // scroll window скроллинг окна

            var sx = window.scrollX, sy = window.scrollY;
            var w = window.innerWidth, h = window.innerHeight;
            var cx = lastEvent.clientX;
            var cy = lastEvent.clientY;


            if(cx < scrollAmount) sx -= scrollAmount;
            if(cx > w - scrollAmount) sx += scrollAmount;
            if(cy < scrollAmount) sy -= scrollAmount;
            if(cy > h - scrollAmount) sy += scrollAmount;

            if(sx != window.scrollX || sy != window.scrollY) {
                window.scrollTo(sx, sy);
            }
        }

        selection.scrollSpeed *= scrollAcceleration;
        if(selection.scrollSpeed > scrollMaxSpeed)
            selection.scrollSpeed = scrollMaxSpeed;

        scrollTimer = setTimeout(scrollWatch, 1000 / selection.scrollSpeed);
    };

    // Reset the scroll speed. сброс скорости прокрутки
    var scrollReset = function() {
        if(!selection) {
            return;
        }
        selection.scrollSpeed = scrollMinSpeed;
    };

// Selection tools.
    // ---------------------------

    // Start selecting cells. начало выделения ячеек
    var selectionInit = function(e) {

        if(!e || closest(e.target, "A INPUT BUTTON")) {
            return false;
        }

        var td = closest(e.target, "TH TD"),
            table = closest(td, "TABLE");

        if(!table) {
            return false;
        }

        window.getSelection().removeAllRanges();

        if(selection && selection.table != table) {
            selectionReset();
        }

        if(!e.shiftKey) {
            selection = null;
        }

        scrollReset();

        if(selection) {
            selection.anchor = td;
            return true;
        }

        selection = {
            anchor: td,
            table: table,
            x: e.clientX,
            y: e.clientY
        };

        var t = closestScrollable(selection.anchor.parentNode);
        if(t && t != document.documentElement) {
            selection.scrollBase = t;
            selection.x += selection.scrollBase.scrollLeft;
            selection.y += selection.scrollBase.scrollTop;
        } else {
            selection.scrollBase = null;
            selection.x += window.scrollX;
            selection.y += window.scrollY;
        }

        return true;
    };

    // Update current selection. Обновление текущего выделения
    var selectionUpdate = function(e) {
        var cx = e.clientX;
        var cy = e.clientY;

        var ax = selection.x;
        var ay = selection.y;

        if(selection.scrollBase) {
            ax -= selection.scrollBase.scrollLeft;
            ay -= selection.scrollBase.scrollTop;
        } else {
            ax -= window.scrollX;
            ay -= window.scrollY;

        }

        var rect = [
            Math.min(cx, ax),
            Math.min(cy, ay),
            Math.max(cx, ax),
            Math.max(cy, ay)
        ];

        $C(clsDragover, selection.table).forEach(function(td) {
            removeClass(td, clsDragover);
        });

        each("TD TH", selection.table, function(td) {
            if(intersect(bounds(td), rect))
                addClass(td, clsDragover);
        });

        if(!selection.selectAnchor) {
            removeClass(selection.anchor, clsDragover);
        }
    };

    // Reset the selection and event handlers. Сброс выделения и обработчиков событий
    var selectionReset = function() {
        $C(clsSelected).forEach(function(td) { removeClass(td, clsSelected) });
        $C(clsDragover).forEach(function(td) { removeClass(td, clsDragover) });

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        selection = null;
        //clear array
        valueTab =[];
        //alert('array clear'+ valueTab);
    };

// Command helpers
    // ---------------------------

    //Add selected cells to array
    var takeTable = function(){
        $('.selectTable_A').each(function(){ 
            valueTab.push( $(this).text()); 
        });
        alert('2 element '+ valueTab[1]);
    }

    // Select a row, a column or a whole table. Брать строку, столбец или всю таблицу
    var doSelect = function(command, toggle) {
        var tds = [], sel = bounds(selection.anchor);

        each("TD TH", selection.table, function(td) {
            var b = bounds(td), ok = false;
            switch(command) {
                case "selectRow":    ok = sel[1] == b[1]; break;
                case "selectColumn": ok = sel[0] == b[0]; break;
                case "selectTable":  ok = true; break;
            }
            if(ok)
                tds.push(td);
        });

        var isSelected = tds.every(function(td) { return hasClass(td, clsSelected) });

        if(toggle && isSelected) {
            tds.forEach(function(td) { removeClass(td, clsSelected) });
        } else {
            tds.forEach(function(td) { addClass(td, clsSelected) });
        }

        takeTable();
 

    };


// Event handlers
    // ---------------------------

    // Menu event handler (from the background script). Меню обработчиков события 
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if(!selectionInit(lastEvent)) {
            selectionReset();
            return;
        }
        switch(message.menuCommand) {
            case "selectRow":
            case "selectColumn":
            case "selectTable":
                doSelect(message.menuCommand, true);
                break;
        }
        sendResponse({});
    });

    // `mouseDown` - init selection. нажать кнопку мыши
    var onMouseDown = function(e) {
        lastEvent = e;

        if(e.which != 1) {
            return;
        }
        if(!e.altKey) {
            selectionReset();
            return;
        }

        if(!selectionInit(e)) {
            selectionReset();
            return;
        }

        selection.selectAnchor = true;
        if(hasClass(selection.anchor, clsSelected)) {
            removeClass(selection.anchor, clsSelected);
            selection.selectAnchor = false;
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        scrollWatch();
        selectionUpdate(e);
        e.preventDefault();
        e.stopPropagation();
    };

    // `mouseMove` - update selection. двигать мышь
    var onMouseMove = function(e) {
        lastEvent = e;

        if(!e.altKey || e.which != 1 || !selection) {
            return;
        }
        selection.scrollSpeed = scrollMinSpeed;
        selectionUpdate(e);
        e.preventDefault();
        e.stopPropagation();
    };

    // `mouseUp` - stop selecting. отпустить кнопку
    var onMouseUp = function(e) {
        clearTimeout(scrollTimer);

        if(selection)
            $C(clsDragover, selection.table).forEach(function(td) {
                removeClass(td, clsDragover);
                addClass(td, clsSelected);
            });

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    // `doubleClick` - select columns and rows. двойной клик
    var onDblClick = function(e) {
        if(!selection) {
            return;
        }
        var ctrl = (navigator.userAgent.indexOf("Macintosh") > 0) ? e.metaKey : e.ctrlKey;
        doSelect(ctrl ? "selectRow" : "selectColumn", true);
        e.preventDefault();
        e.stopPropagation();
    };



    // `contextMenu` - enable/disable extension-specific commands. показать/скрыть команды
    var onContextMenu = function(e) {
        lastEvent = e;
        var td = closest(e.target, "TH TD");
        var table = closest(td, "TABLE");

        if(!table) {
            chrome.runtime.sendMessage({command:"updateMenu", enabled:false});
            return;
        }
        chrome.runtime.sendMessage({command:"updateMenu", enabled:true});
    };

// main()
    // ---------------------------

    document.body.addEventListener("mousedown", onMouseDown, true);
    document.body.addEventListener("dblclick", onDblClick);
    document.body.addEventListener("contextmenu", onContextMenu);

})();

