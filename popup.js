(function () {
/* Update the relevant fields with the new data */


function create(valueTab) {
    //$('#name').text('diagram');
    /**/
    //бар
    var valueTab1 =[];
    var dataTab1 = [];
    var dataTab2 = [];
    for (var i = 0; i < valueTab.length; i++) {
        /*valueTab1[i] = parseInt(valueTab[i+1], 10);*/
        valueTab[i+1] = parseInt(valueTab[i+1],10);
        dataTab1.push(valueTab[i]);
        dataTab2.push(valueTab[i+1]);
        i++;
    };
    /*$.each(dataTab1, function(){
        $('#tabledata').append('<p>' + this + '</p>');
    });
   $.each(dataTab2, function(){
        $('#tabledata').append('<p>' + this + '</p>');
    });*/
        window.oninput = function() {
        var idColor = document.getElementById('titleChart').value;
        

    
    var aaaa = [0.1, 0.15, 0.5, 0.86, 0.17, 0.61];
    $('#container').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: idColor
        },
        xAxis: {
            categories: dataTab1
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [/*{
            name: 'Tokyo',
            data: aaaa
        }, */{
            name: 'London',
            data: dataTab2
        }]
    });
}

};

/* Once the DOM is ready... */
window.addEventListener('DOMContentLoaded', function() {
    /* ...query for the active tab... */
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        /* ...and send a request for the DOM info... */
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'Table'},
                /* ...also specifying a callback to be called 
                 *    from the receiving end (content script) */
            create);
    });
});
})();
