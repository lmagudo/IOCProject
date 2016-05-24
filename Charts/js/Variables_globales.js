var PropiedadesMapa = new Object();
PropiedadesMapa.VariablesGlobales = ['map', 'startExtent', 'tb', 'bioLayer', 'graphicline', 'graphicarea',
    'graphicpoint', 'gp', 'geometryService', 'arraydatosperfil', 'textoCargando', 'numeroPuntos', 'maxPuntos',
    'timerID', 'cargado', 'tiempo', 'mypoint', 'arrayLocate', 'graphicX', 'longinit', 'latinit', 'longend', 'latend'];

cargarvariablesGlobales();

function cargarvariablesGlobales() {
    $.each(PropiedadesMapa.VariablesGlobales, function (index, value) {
        PropiedadesMapa[value] = undefined;
    });
}

//var map, startExtent, tb, bioLayer;
//var graphicline, graphicarea, graphicpoint;
var mychart = null;
var mychart2 = null;
var mychart3 = null;
var gp, geometryService, arraydatosperfil;
//var textoCargando, numeroPuntos, maxPuntos, timerID, cargado, tiempo;
var mypoint, arrayLocate, graphicX;
var longinit, latinit, longend, latend;