
/// <reference path="jsapi_vsdoc10_v38.js" />

//#region Chart
function showchart() {
    if (document.getElementById("container").style.display == "none") {
        document.getElementById("container").style.display = "block";
    }

    else {
        document.getElementById("container").style.display = "none";
    }

    generateChart();
}

function generateChart() {

    $(function () {

        // Parse the data from an inline table using the Highcharts Data plugin
        var chart = $('#container').highcharts({
            credits: {
                enabled: false
            },

            data: {
                table: 'freq',
                startRow: 1,
                endRow: 5,
                endColumn: 4
            },

            chart: {
                renderTo: 'container',
                polar: true,
                type: 'column',
                events: {
                    load: function () {
                        this.credits.element.onclick = function () {
                            window.open(
                      'http://www.ieo.es/',
                      '_blank'
                    );
                        }
                    }
                }
            },

            title: {
                text: 'Biological Index',
                align: 'center',
                style: {
                    color: '#018FE2',
                    fontSize: '20px',
                    fontWeight: 'bold'
                }
            },
            pane: {
                size: '85%'
            },
            legend: {
                reversed: true,
                align: 'right',
                verticalAlign: 'top',
                x: 10,
                y: 50,
                layout: 'vertical',
                title: {
                    text: 'Biological Index<br/><span style="font-size: 9px; color: #666; font-weight: normal">(Click to change selection)</span>',
                    style: {
                        fontStyle: 'italic'
                    }
                }
            },
            xAxis: {
                min: 0,
                align: 'center'
            },
            yAxis: {
                min: 0,
                endOnTick: false,
                showLastLabel: true,
                labels: {
                    format: '{value}'
                }
            },

            tooltip: {
                formatter: function () {
                    return this.series.name + ': <b>' + this.y + '</b>';
                }
            },
            credits: {
                text: 'source',
                style: {
                    cursor: 'pointer',
                    fontSize: '12px'
                }

            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                    shadow: false,
                    groupPadding: 0,
                    pointPlacement: 'on'
                }
            }
        });
        mychart = chart.highcharts();
    });

    ocultainformpanel();

    //scroll to botton of page
    $("html, body").animate({ scrollTop: $(document).height() }, 1300);
}

//#endregion


//#region Profile

function showProfile(arrayParaPerfil) {

    if (document.getElementById("container2").style.display == "none") {
        document.getElementById("container2").style.display = "block";
    }

    else {
        document.getElementById("container2").style.display = "none";
    }

    console.log(graphicline.geometry);
    var line = graphicline.geometry;
    var arrayLocate = [];
    for (var i = 0; i < arrayParaPerfil.datos.length; i++) {
        var arraytemp = [];
        var position = arrayParaPerfil.datos[i].Distancia;
        LRSLocatePoint(line, position);
        arrayLocate.push({ Distance: position, Point: mypoint });
    }

    var linepaths = line.paths[0];

    var myspatialReference = line.spatialReference;

    var pointinit = new esri.geometry.Point(linepaths[0], myspatialReference);
    var pointend = new esri.geometry.Point(linepaths[linepaths.length - 1], myspatialReference);
    var geopointinit = esri.geometry.webMercatorToGeographic(pointinit);
    var geopointend = esri.geometry.webMercatorToGeographic(pointend);
    var longinit, latinit, longend, latend;

    if (geopointinit.x >= 0) {
        longinit = "E";
    }

    else {
        longinit = "W";
    }

    if (geopointinit.y >= 0) {
        latinit = "N";
    }

    else {
        latinit = "S";
    }

    if (geopointend.x >= 0) {
        longend = "E";
    }

    else {
        longend = "W";
    }

    if (geopointend.y >= 0) {
        latend = "N";
    }

    else {
        latend = "S";
    }

    arraydatosperfil = [];
    var arraypoint = [];
    var arraycoordy = [];

    for (var i = 0; i < arrayParaPerfil.datos.length; i++) {

        arraypoint.push(arrayParaPerfil.datos[i].Distancia);

        if (arrayParaPerfil.datos[i].Altura > 33) {
            arraypoint.push(null);
        }

        else {
            arraypoint.push(arrayParaPerfil.datos[i].Altura);
            arraycoordy.push(arrayParaPerfil.datos[i].Altura);
        }

        arraydatosperfil.push(arraypoint);
        arraypoint = [];
    }


    //Ordeno el array arraycoordy de menor a mayor
    function ordAscModif(a, b) {
        if (a < b) return -1;
        if (a > b) return 1;
        if (a = b) return 0;
    }

    arraycoordy.sort(ordAscModif);

    //Cojo el valor menor del array para utilizarlo como límite en el eje y de mi gráfico
    var miny = arraycoordy[0];


    $(function () {
        var chart = $('#container2').highcharts({
            chart: {
                type: 'area',
                events: {
                    load: function () {
                        this.credits.element.onclick = function () {
                            window.open(
                      'http://www.ieo.es/',
                      '_blank'
                    );
                        }
                    }
                }
            },
            title: {
                text: 'Oceanographic Parameter Profile',
                align: 'center',
                style: {
                    color: '#018FE2',
                    fontSize: '20px',
                    fontWeight: 'bold'
                }
            },

            xAxis: {
                allowDecimals: false,
                labels: {
                    formatter: function () {
                        return this.value /1000 + " km" ; // clean, unformatted number for year
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Temperature'
                },
                labels: {
                    formatter: function () {
                        return this.value + ' ºC';
                    }
                },
                min: miny
                
            },
            tooltip: {
                headerFormat: '',
                pointFormat: '{series.name} <b>{point.y:,.2f} ºC</b>'
            },
            credits: {
                text: 'source',
                style: {
                    cursor: 'pointer',
                    fontSize: '12px'
                }

            },
            plotOptions: {
                area: {
                    //pointStart: 0,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                },

                series: {
                    point: {
                        events: {
                            mouseOver: function () {
                                for (var i = 0; i < arrayLocate.length; i++) {
                                    if (arrayLocate[i].Distance == this.x) {
                                        DrawPoint(arrayLocate[i].Point);
                                    }
                                }
                            }
                        }
                    },
                    events: {
                        mouseOut: function () {
                            map.graphics.remove(graphicX);
                        }
                    }
                }
            },

            subtitle: {
                text: 'Profile From: ' + Math.abs(geopointinit.x.toFixed(3)) + 'º' + longinit + "    " + Math.abs(geopointinit.y.toFixed(3)) + 'º' + latinit + "  -  " + 'To: ' + Math.abs(geopointend.x.toFixed(3)) + 'º' + longend + "    " + Math.abs(geopointend.y.toFixed(3)) + 'º' + latend
            },

            series: [{
                name: 'Temperature',
                data: arraydatosperfil,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                }
            }]
        });

        mychart2 = chart.highcharts();
    });

    ocultainformpanel();

    //scroll to botton of page
    $("html, body").animate({ scrollTop: $(document).height() }, 1300);

}

//#endregion


//#region Time Series
function showTimeSeries(geometry) {

    if (document.getElementById("container3").style.display == "none") {
        document.getElementById("container3").style.display = "block";
    }

    else {
        document.getElementById("container3").style.display = "none";
    }

    generateTimeSeries(geometry);
}


function generateTimeSeries(position) {
    console.log(position);
    var geoposition = esri.geometry.webMercatorToGeographic(position);

    var longpos, latpos;

    if (geoposition.x >= 0) {
        longpos = "E";
    }

    else {
        longpos = "W";
    }

    if (geoposition.y >= 0) {
        latpos = "N";
    }

    else {
        latpos = "S";
    }

    $(function () {
        //Los datos son milisegundos de UNIX time stamp, explicación aquí http://stackoverflow.com/questions/17941598/highstock-highcharts-timestamp-values
        $.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {

            // Create the chart
            var chart = $('#container3').highcharts('StockChart', {


                rangeSelector: {
                    inputEnabled: $('#container3').width() > 480,
                    selected: 1
                },

                title: {
                    text: 'Time Series',
                    align: 'center',
                    style: {
                        color: '#018FE2',
                        fontSize: '20px',
                        fontWeight: 'bold'
                    }
                },

                chart: {
                    events: {
                        load: function () {
                            this.credits.element.onclick = function () {
                                window.open(
                      'http://www.ieo.es/',
                      '_blank'
                    );
                            }
                        }
                    }
                },

                credits: {
                    text: 'source',
                    style: {
                        cursor: 'pointer',
                        fontSize: '12px'
                    }

                },

                subtitle: {
                    text: 'Position: ' + Math.abs(geoposition.x.toFixed(3)) + 'º' + longpos + "    " + Math.abs(geoposition.y.toFixed(3)) + 'º' + latpos
                },

                series: [{
                    name: 'Oceanographic Parameter Value',
                    data: data,
                    type: 'area',
                    threshold: null,
                    tooltip: {
                        valueDecimals: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }]
            });

            mychart3 = chart.highcharts();
        });

    });

    ocultainformpanel();

    //scroll to botton of page
    $("html, body").animate({ scrollTop: $(document).height() }, 1300);
}

//#endregion