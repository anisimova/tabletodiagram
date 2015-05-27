(function () {
/* Update the relevant fields with the new data */


function create(valueTab) {
    //$('#name').text('diagram');
    $.each(valueTab, function(){
        $('#tabledata').append('<p>' + this + '</p>');
    });
//линии - не работает?!
    var lineChartData = {
            labels : ["January","February","March","April","May","June","July"],
            datasets : [
                {
                    label: "My First dataset",
                    fillColor : "rgba(220,220,220,0.2)",
                    strokeColor : "rgba(220,220,220,1)",
                    pointColor : "rgba(220,220,220,1)",
                    pointStrokeColor : "#f00",
                    pointHighlightFill : "#a00",
                    pointHighlightStroke : "rgba(220,220,220,1)",
                    data : [30,50,22,10,90,35,0]
                },
                {
                    label: "My Second dataset",
                    fillColor : "rgba(151,187,205,0.2)",
                    strokeColor : "rgba(151,187,205,1)",
                    pointColor : "rgba(151,187,205,1)",
                    pointStrokeColor : "#0f0",
                    pointHighlightFill : "#0a0",
                    pointHighlightStroke : "rgba(151,187,205,1)",
                    data : [60,90,10,25,15,75,0]
                }
            ]

    };
    
    var ctx = document.getElementById("chart").getContext("2d");
    window.myLine = new Chart(ctx).Line(lineChartData, {responsive: true});
    
//просто канвас - работает
    /*var c = document.getElementById("chart");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0,0,150,75);*/
//pie-работает
    /*var pieData = [
                    {
                        value: 300,
                        color:"#F7464A",
                        highlight: "#FF5A5E",
                        label: "Red"
                    },
                    {
                        value: 50,
                        color: "#46BFBD",
                        highlight: "#5AD3D1",
                        label: "Green"
                    },
                    {
                        value: 100,
                        color: "#FDB45C",
                        highlight: "#FFC870",
                        label: "Yellow"
                    },
                    {
                        value: 40,
                        color: "#949FB1",
                        highlight: "#A8B3C5",
                        label: "Grey"
                    },
                    {
                        value: 120,
                        color: "#4D5360",
                        highlight: "#616774",
                        label: "Dark Grey"
                    }

    ];
    var ctx = document.getElementById("chart").getContext("2d");
    window.myPie = new Chart(ctx).Pie(pieData);
    */
//бублик - работает
    /*var doughnutData = [
                    {
                        value: 300,
                        color:"#F7464A",
                        highlight: "#FF5A5E",
                        label: "Red"
                    },
                    {
                        value: 50,
                        color: "#46BFBD",
                        highlight: "#5AD3D1",
                        label: "Green"
                    },
                    {
                        value: 100,
                        color: "#FDB45C",
                        highlight: "#FFC870",
                        label: "Yellow"
                    },
                    {
                        value: 40,
                        color: "#949FB1",
                        highlight: "#A8B3C5",
                        label: "Grey"
                    },
                    {
                        value: 120,
                        color: "#4D5360",
                        highlight: "#616774",
                        label: "Dark Grey"
                    }

    ];
    var ctx = document.getElementById("chart").getContext("2d");
    window.myDoughnut = new Chart(ctx).Doughnut(doughnutData, {responsive : true});
    */


}

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
