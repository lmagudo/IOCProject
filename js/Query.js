// Script donde está la funcionalidad para realizar las consultas

// Función que se ejecuta al presionar el botón Query. Nos muestra el panel de consultas
function MostrarPaneles() {

    if (dojo.byId("PanelFind").style.display == "none") {
        dojo.byId("PanelFind").style.display = "block";
    }

    else {
        dojo.byId("PanelFind").style.display = "none";
    }        
}

//función que maneja el evento cuando seleccionamos la capa
function layer_selected() {
    //Igualamos a la variable value_layer el valor de la capa seleccionado por el usuario
    var e = dojo.byId("Layer_find");
    value_layer = e.options[e.selectedIndex].value;
    
    //Desabilitamos el combo años para y le sugerimos que vuelvan a elegir un mes poniendo el valor del combo mes en "Choose a month"
    var s = dojo.byId("year_default");
    s.selected = "selected";

    var j = dojo.byId("Year_find");
    j.disabled = true;

    var k = dojo.byId("month_default");
    k.selected = "selected";


    //Dependiendo de la capa seleccionada por el usuario el combo de los parámetros se rellenarán con los parámetros existentes para esa capa
    if (value_layer == "CTD") {
        //Activamos el combo de Parametros
        var p = dojo.byId("Parameter_find");
        p.disabled = false;

        //Activamos el combo de Meses
        var m = dojo.byId("Month_find");
        m.disabled = false;

        //Borramos los parámetros que había, por si existian valores de una selección anterior
        for (i = (p.length - 1); i >= 0; i--) {
            aBorrar = p.options[i];
            aBorrar.parentNode.removeChild(aBorrar);
        }

        //Añadirmos los parametros existentes para la capa seleccionada como valores en el combo de parametros
        var option0 = new Option("BAC", "0");
        var option1 = new Option("Chlorophyll", "1");
        var option2 = new Option("Oxigen", "2");
        var option3 = new Option("Salinity", "3");
        var option4 = new Option("Temperature", "4", "defauldSelected");
        p.options[0] = option0;
        p.options[1] = option1;
        p.options[2] = option2;
        p.options[3] = option3;
        p.options[4] = option4;
    }

    //Realizamso las mismas operacionas que en la primera clausula if
    else if (value_layer == "DRB") {
        var p = dojo.byId("Parameter_find");
        p.disabled = false;

        var m = dojo.byId("Month_find");
        m.disabled = false;

        for (i = (p.length - 1); i >= 0; i--) {
            aBorrar = p.options[i];
            aBorrar.parentNode.removeChild(aBorrar);
        }

        var option0 = new Option("Temperature", "0", "defauldSelected");
        p.options[0] = option0;
    }

    //Realizamso las mismas operacionas que en la primera clausula if
    else if (value_layer == "GLD") {
        var p = dojo.byId("Parameter_find");
        p.disabled = false;

        var m = dojo.byId("Month_find");
        m.disabled = false;

        for (i = (p.length - 1); i >= 0; i--) {
            aBorrar = p.options[i];
            aBorrar.parentNode.removeChild(aBorrar);
        }

        var option0 = new Option("Salinity", "0");
        var option1 = new Option("Temperature", "1", "defauldSelected");
        p.options[0] = option0;
        p.options[1] = option1;
    }
}

//Evento que se dispara al seleccionar un mes
function month_selected() {
    require([
      "esri/tasks/query",
      "esri/tasks/QueryTask"
    ], function (
      Query, QueryTask
      ) {
        var p = dojo.byId("Year_find");
        p.disabled = true;

        var paramSelect = dojo.byId("Parameter_find");
        value_param = paramSelect.options[paramSelect.selectedIndex].value;
        var monthSelect = dojo.byId("Month_find");
        value_month = monthSelect.options[monthSelect.selectedIndex].value;

        var queryTask = new esri.tasks.QueryTask("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/CTD_NOAA_Layers/MapServer/" + value_param);
        var queryParams = new esri.tasks.Query();
        queryParams.outSpatialReference = map.spatialReference;
        queryParams.outFields = ["Year"];
        queryParams.where = "Month = " + value_month;
        queryTask.execute(queryParams, showResultsYear);
    });
}

function showResultsYear(results) {

    console.log(results);
    //Compruebo si el resultado está vacio, y si es así muestro un mensaje para que se vuelva a seleccionar un mes
    if (results.features.length == 0) {
        //Desabilitamos el combo años para y le sugerimos que vuelvan a elegir un mes poniendo el valor del combo mes en "Choose a month"
        var s = dojo.byId("year_default");
        s.selected = "selected";

        var j = dojo.byId("Year_find");
        j.disabled = true;

        var k = dojo.byId("month_default");
        k.selected = "selected";

        alert("There is not features for this month, please select another month");
    }

    //Si el resultado no está vacio, relleno el combo de años con el resultado de la query
    else {
        Array.prototype.unique = function (a) {
            return function () { return this.filter(a) }
        }(function (a, b, c) {
            return c.indexOf(a, b + 1) < 0
        });
        var arrayYears = [];
        for (i = 0; i < results.features.length; i++) {
            var Year = results.features[i].attributes.Year;
            arrayYears.push(Year);
        }

        var arrayYearsUnique = (arrayYears.unique());

        var p = dojo.byId("Year_find");
        p.disabled = false;

        //Borrar la lista
        var selectParentNode = p.parentNode;
        var newSelectObj = p.cloneNode(false); // Make a shallow copy
        selectParentNode.replaceChild(newSelectObj, p);
        //Añado la opción de mensaje al usuario para informarle que seleccione algún elemento
        var choosoption = document.createElement("option");
        choosoption.text = "Choose a Year";
        choosoption.id = "year_default";
        choosoption.value = "";
        newSelectObj.options.add(choosoption);

        for (i = 0; i < arrayYearsUnique.length; i++) {
            var newoption = document.createElement("option");
            newoption.text = arrayYearsUnique[i].toString();
            newoption.value = arrayYearsUnique[i].toString();
            newSelectObj.options.add(newoption);
        }
    }

}

//Evento que se dispara cuando presionamos el botón Find
function FindFeatures() {

    //Iniciamos pantalla inform panel
    console.log(numeroPuntos);
    textoCargando = "Looking for features"
    timerID = setTimeout("fTimer()", 500);

    //Creamos las vabiables con los valores de capa, parámetro, año y mes seleccionado por el usuario
    var layerSelect = dojo.byId("Layer_find");
    value_layer = layerSelect.options[layerSelect.selectedIndex].value;
    var paramSelect = dojo.byId("Parameter_find");
    value_param = paramSelect.options[paramSelect.selectedIndex].value;
    value_year = dojo.byId("Year_find").value
    var monthSelect = dojo.byId("Month_find");
    value_month = monthSelect.options[monthSelect.selectedIndex].value;

    //Dependiendo del valor de capa seleccionado por el usuario usaremos diferentes servicios de mapas para hacer una query, en cada
    //clausla if generamos los parámetros adecuados para hacer la query y la ejecutamos. La función que maneja el evento de la query
    //cuando se ejecuta correctamente es la función showResults
    if (value_layer == "CTD") {
        var queryTask = new esri.tasks.QueryTask("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/CTD_NOAA_Layers/MapServer/" + value_param);
        var queryParams = new esri.tasks.Query();
        queryParams.outSpatialReference = map.spatialReference;
        queryParams.returnGeometry = true;
        queryParams.outFields = ["*"];
        queryParams.where = "Year = " + value_year + "AND Month = " + value_month;

        queryTask.execute(queryParams, showResults);
    }

    else if (value_layer == "DRB") {
        var queryTask = new esri.tasks.QueryTask("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/DRB_NOAA_Layers/MapServer/" + value_param);
        var queryParams = new esri.tasks.Query();
        queryParams.outSpatialReference = map.spatialReference;
        queryParams.returnGeometry = true;
        queryParams.outFields = ["*"];
        queryParams.where = "Year = " + value_year + "AND Month = " + value_month;

        queryTask.execute(queryParams, showResults);

    }

    else if (value_layer == "GLD") {
        console.log(value_year, value_month);
        var queryTask = new esri.tasks.QueryTask("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/GLD_NOAA_Layers/MapServer/" + value_param);
        console.log(queryTask);
        var queryParams = new esri.tasks.Query();
        queryParams.outSpatialReference = map.spatialReference;
        queryParams.returnGeometry = true;
        queryParams.outFields = ["*"];
        queryParams.where = "Year = " + value_year + "AND Month = " + value_month;

        queryTask.execute(queryParams, showResults);
    }

    
    
}

//Función que genera el simbolo (un markersymbol) que se usara para mostrar al usuario, como parametros de entrada utiliza un icono
//y el color que queramos
function createSymbol(path, color) {
    var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
    markerSymbol.setPath(path);
    markerSymbol.setColor(new dojo.Color(color));
    markerSymbol.setOutline(null);
    return markerSymbol;
};

//Función que se ejecuta con el array de resultados obtenidos con la query
function showResults(results) {
    console.log(results);

    //Variable con el icono y el color que vamos a utilizar para mostrar al usuario
    //var icon = "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z";
    //var iconColor = "#c99aab";

    //Igualamos la variable pointSymbol al markersymbol que me devuelve la función createSymbol
    //pointSymbol = createSymbol(icon, iconColor);
        
    var e = dojo.byId("Layer_find");
    var value_layer = e.options[e.selectedIndex].value;
    var pointSymbol;
    var pointSymbol_CTD = new esri.symbol.PictureMarkerSymbol({
        "angle": 0,
        "xoffset": 0,
        "yoffset": 10,
        "type": "esriPMS",
        "url": "http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png",
        "contentType": "image/png",
        "width": 24,
        "height":24
    });

    var pointSymbol_DRB = new esri.symbol.PictureMarkerSymbol({
        "angle": 0,
        "xoffset": 0,
        "yoffset": 10,
        "type": "esriPMS",
        "url": "http://static.arcgis.com/images/Symbols/Shapes/GreenPin1LargeB.png",
        "contentType": "image/png",
        "width": 24,
        "height": 24
    });

    var pointSymbol_GLD = new esri.symbol.PictureMarkerSymbol({
        "angle": 0,
        "xoffset": 0,
        "yoffset": 10,
        "type": "esriPMS",
        "url": "http://static.arcgis.com/images/Symbols/Shapes/PurplePin1LargeB.png",
        "contentType": "image/png",
        "width": 24,
        "height": 24
    });

    if (value_layer == "CTD") {
        pointSymbol = pointSymbol_CTD;
    }

    else if (value_layer == "DRB") {
        pointSymbol = pointSymbol_DRB;
    }

    else if (value_layer == "GLD") {
        pointSymbol = pointSymbol_GLD;
    }

    //Creo un array en el que almaceno los nombres de los campos para meterlos en el popup de cada entidad
    var fieldarray = [];
    //Creo un string que sera el que pase al Json del popup a la propidad content
    var mycontent = "";
    //recorro los nombres de cada entidad resultado
    dojo.forEach(results.fields, function (field) {
        //Igualo a la variable myfield el nombre de cada campo
        var myfield = field.name;
        //me salto el campo OBJECTID porque no quiero añadirlo al template de mi popup
        if (myfield != "OBJECTID") {
            //Añado los valores de campo al array fieldarray con el formato adecuado para generar el string que luego añadire al template
            fieldarray.push(myfield + ": ${" + myfield + "}<br/>");
        }
    });

    //Recorro el array con los nombres del array y genero el string que es el tipo de variable que va ha aceptar el template
    for (i = 0; i < fieldarray.length;i++ ) {
        mycontent = mycontent + fieldarray[i];
    }


    //Posible simbolo
    //var pointSymbol = new esri.symbols.PictureMarkerSymbol({ "angle": 0, "xoffset": 0, "yoffset": 10, "type": "esriPMS", "url": "http://static.arcgis.com/images/Symbols/Shapes/PurplePin1LargeB.png", "imageData": "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDNjc2MDJCQUQzM0IxMUUwQUU5NUVFMEYwMTY0NzUwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDNjc2MDJCQkQzM0IxMUUwQUU5NUVFMEYwMTY0NzUwNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkM2NzYwMkI4RDMzQjExRTBBRTk1RUUwRjAxNjQ3NTA1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkM2NzYwMkI5RDMzQjExRTBBRTk1RUUwRjAxNjQ3NTA1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQg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", "contentType": "image/png", "width": 24, "height": 24 });
    //Recorro cada resultado de la query y genero el template del popup
    dojo.forEach(results.features, function (feature) {
        var myfeature = feature;
        var geometria = myfeature.geometry;
        var atributos = myfeature.attributes;
        if (myfeature.attributes.Month == dojo.byId("Month_find").value) {
            console.log(myfeature.attributes.Month);
            var miPos = {
                "geometry": geometria,
                "attributes": atributos,
                "infoTemplate": {
                    "title": value_layer,
                    "content": mycontent

                }
            };
            //Creo un objeto gráfico con el template anterior
            var gra = new esri.Graphic(miPos);
            //Añado el nuevo gráfico a mi capa gráfica con el simbolo.
            //map.graphics.add(gra.setSymbol(pointSymbol));
            mygraphiclayer.add(gra.setSymbol(pointSymbol));
        }
    });
    console.log(mygraphiclayer);

    //#region Código para hacer zoom al resultado de la consulta
    var features = results.features;

    //creo un objeto extent con las entidades resultado
    var extent = esri.graphicsExtent(features);
    if (!extent && features.length == 1) {
        // esri.getExtent returns null for a single point, so we'll build the extent by hand
        var point = features[0];
        extent = new esri.geometry.Extent(point.x - 1, point.y - 1, point.x + 1, point.y + 1, point.SpatialReference);
    }

    if (extent) {
        // assumes the esri map object is stored in the globally-scoped variable 'map'
        map.setExtent(extent)
    }

    ocultainformpanel();

    //#endregion
//    mygraphiclayer = new esri.layers.GraphicsLayer();
//    mygraphiclayer = map.graphics;
//    map.addLayer(mygraphiclayer);
//    legendLayers.push({ layer: mygraphiclayer, title: "prueba" });

//    legend.refresh();
//    console.log(legend);
}

//Función que se ejecuta al presionar el botón clear. Limpiamos la capa gráfica.
function ClearFeatures() {
    //map.graphics.clear();
    mygraphiclayer.clear();
}