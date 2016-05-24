// Script donde van guardadas las variables globales
var PropiedadesMapa = new Object();
PropiedadesMapa.VariablesGlobales = ['map', 'startExtent', 'legend', 'home', 'basemapGallery', 'toggle',
    'overviewMapDijit', 'legendLayers', 'mygraphiclayer', 'LME', 'textoCargando', 'numeroPuntos', 'maxPuntos',
    'timerID', 'cargado', 'tiempo', 'value_layer', 'value_param', 'value_param', 'value_year', 'value_month'];

cargarvariablesGlobales();

function cargarvariablesGlobales(){
    $.each(PropiedadesMapa.VariablesGlobales, function(index, value){
        PropiedadesMapa[value] = undefined;
    });
}
PropiedadesMapa.LayersToClear = ["csvLayer"]
//var map, startExtent, legend;
//var home, basemapGallery, toggle, overviewMapDijit, legendLayers;
//var mangroves, coldcoral, marineEcoregions, pelagicProvinces, SeaSurfaceTemperature2003_2007, mygraphiclayer;
//var textoCargando, numeroPuntos, maxPuntos, timerID, cargado, tiempo;
//var value_layer, value_param, value_year, value_month;