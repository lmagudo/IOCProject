

// Esta variable determina que herramienta se está utilizando. Determina que hace el click de raton en el mapa
var herramientaActual = "navegar";
var capasVectorialesSeleccionalbles = [capaEmergencias];

//#region simbología de herramientas...

var sketchSymbolizers = {
    "Point": {
        pointRadius: 4,
        graphicName: "square",
        fillColor: "white",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#333333"
    },
    "Line": {
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeColor: "#666666",
        strokeDashstyle: "dash"
    },
    "Polygon": {
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeColor: "#666666",
        fillColor: "red",
        fillOpacity: 0.3
    }
};





var style_ReglasMedicion = new OpenLayers.Style();

style_ReglasMedicion.addRules([
    new OpenLayers.Rule({ symbolizer: sketchSymbolizers })
]);

var stylemap_HeramientasMedicion = new OpenLayers.StyleMap({ "default": style_ReglasMedicion });


//#endregion


// allow testing of specific renderers via "?renderer=Canvas", etc esto es del control de medicion.
var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

//#region definicion de controles
var infoControl;
var measureControls = {
    medirLinea: new OpenLayers.Control.Measure(
        OpenLayers.Handler.Path, {
            persist: true,
            handlerOptions: {
                layerOptions: {
                    renderers: renderer,
                    styleMap: stylemap_HeramientasMedicion
                }
            }
        }
    ),
    medirArea: new OpenLayers.Control.Measure(
        OpenLayers.Handler.Polygon, {
            persist: true,
            handlerOptions: {
                layerOptions: {
                    renderers: renderer,
                    styleMap: stylemap_HeramientasMedicion
                }
            }
        }
    )
};
var controlMedicion;
var selectorDeElementosControl;
var navegacionControl;
var ctrlZoomVentana;
var navHistoryControl, panel;

var controlInfoCapasVectoriales;

var controlClickfotos;

var videoInventarioControl;

//#endregion


//#region gestor de herramientas

function cambiarHerramienta(accion) {
    activarBlurDeAccionYdesactivarActual(accion);
    console.log(accion);
    switch (accion) {
        case "navegar":
            ocultarElementoDiv("salidaMedicion");
            desactivarControles();
            herramientaActual = "navegar";

            break;
        case "informacion":
            desactivarControles();;
            ocultarElementoDiv("salidaMedicion");
            //activarGetFeatureInfo();
            actulizarCapasPreguntables();
            activarGetFeatureInfo();
            activarGetFeatureVectoriales();
            herramientaActual = "informacion";
            break;
        case "medirArea":
            desactivarControles();;
            measureControls.medirArea.activate();
            mostrarElementoDiv("salidaMedicion");
            herramientaActual = "medirArea";
            break;
        case "medirLinea":
            desactivarControles();
            measureControls.medirLinea.activate();
            mostrarElementoDiv("salidaMedicion");
            herramientaActual = "medirLinea";
            break;
        case "selectorDeElementos":
            herramientaActual = "selectorDeElementos";
            ocultarElementoDiv("salidaMedicion");
            desactivarControles();
            activarSelectorDeElementosControl();

            break;
        case "zoomVentana":
            herramientaActual = "zoomVentana";
            ocultarElementoDiv("salidaMedicion");
            desactivarControles();
            activarZoomVentanaControl();
            break;
        case "gestionEmergencias":
            herramientaActual = "gestionEmergencias";
            ocultarElementoDiv("salidaMedicion");
            desactivarControles();
            actualizarCapaEmergenciasYactivarControl();
            break;
        case "crearPerfil":
            herramientaActual = "crearPerfil";
            ocultarElementoDiv("salidaMedicion");
            desactivarControles();
            activarHerramientaPerfil();
            break;

        case "visorFotoinvenario":
            herramientaActual = "visorFotoinvenario";
            ocultarElementoDiv("salidaMedicion");
            desactivarControles();
            activarHerramientavisorFotoinvenario();
            break;

        default:
            console.log("Accion no conocida");
    }
}

function activarBlurDeAccionYdesactivarActual(accion) {
    console.log("Desactivand blur: " + herramientaActual + "_blur");

    $("#" + herramientaActual + "_blur").removeClass().addClass("blur blurDescativado");


    //parece que en IE no funciona removeClass... parece que esta artimaña funciona...
    var sel = document.getElementById(herramientaActual + "_blur");
    sel.style.display = 'none';
    sel.offsetHeight; // no need to store this anywhere, the reference is enough
    sel.style.display = 'inline';

    console.log("Activando blur: " + accion + "_blur");

    $("#" + accion + "_blur").removeClass().addClass("blur blurActivado");


    sel = document.getElementById(accion + "_blur");
    sel.style.display = 'none';
    sel.offsetHeight; // no need to store this anywhere, the reference is enough
    sel.style.display = 'inline';


}

function cargarControlesDeMapaIniciales() {

    //primero los controles de medicion, que estn en un objeto
    for (var key in measureControls) {
        console.log("Activando eventos de medicion");
        controlMedicion = measureControls[key];
        if (key == "medirArea" || key == "medirLinea") {
            controlMedicion.events.on({
                "measure": handleMeasurementsDone,
                "measurepartial": handleMeasurementsPartial,

            });
        }

        controlMedicion.setImmediate(true);
        map.addControl(controlMedicion);
    }

    //control de navegacion....
    navegacionControl = new OpenLayers.Control.Navigation();
    navegacionControl.displayClass = "navegacionControlClass";
    map.addControl(navegacionControl);

    //control de getfeatureinfo de capas wms
    infoControl = new OpenLayers.Control.WMSGetFeatureInfo({
        url: ancashmapfile,
        title: 'Control getfeatureinfo',
        infoFormat: 'application/vnd.ogc.gml',
        layers: [],
        eventListeners: {
            getfeatureinfo: function (event) {
                console.log("clickGetfeature");
                mandarFeaturesACapaVectorial(event);
                mostarTablaResultadosYAddTabs(event)
            },
            nogetfeatureinfo: function (event) {
            }
        }
    });
    infoControl.displayClass = "infoControlClass"
    map.addControl(infoControl);

    //control de getfetureinfo de capas wfs no existe. es getfeature es específico por capas...

    //control de selectorElementos para exportacion tambien es especifico...

    //control de zoom de ventana

    ctrlZoomVentana = new OpenLayers.Control.ZoomBox();
    map.addControl(ctrlZoomVentana);

    //contol de historico de zooms

    navHistoryControl = new OpenLayers.Control.NavigationHistory();
    // parent control must be added to the map
    map.addControl(navHistoryControl);
    panel = new OpenLayers.Control.Panel(
                   { div: document.getElementById("navHistoryDiv") }
               );;

    panel.addControls([navHistoryControl.previous, navHistoryControl.next])

    map.addControl(panel);


    /// control de capa fotos;

    controlClickfotos = new OpenLayers.Control.SelectFeature(
                    capaFotos,
                    {
                        clickout: false,
                        toggle: false,
                        multiple: false,
                        hover: false,
                        toggleKey: "ctrlKey", // ctrl key removes from selection
                        multipleKey: "shiftKey", // shift key adds to selection
                        box: false
                    }
                );

    controlClickfotos.events.on({
        'featurehighlighted': mostrarFotoClick
    });
    map.addControl(controlClickfotos);
    controlClickfotos.activate();


    /// control de video inventario

    //OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
    //    defaultHandlerOptions: {
    //        'single': true,
    //        'double': false,
    //        'pixelTolerance': 0,
    //        'stopSingle': false,
    //        'stopDouble': false
    //    },

    //    initialize: function (options) {
    //        this.handlerOptions = OpenLayers.Util.extend(
    //            {}, this.defaultHandlerOptions
    //        );
    //        OpenLayers.Control.prototype.initialize.apply(
    //            this, arguments
    //        );
    //        this.handler = new OpenLayers.Handler.Click(
    //            this, {
    //                'click': this.trigger
    //            }, this.handlerOptions
    //        );
    //    },

    //    trigger: fotoInventarioClick

    //});


    //videoInventarioControl = new OpenLayers.Control.Click();
    //map.addControl(videoInventarioControl);





}

/// Se desactivan controles excepto navegar, panzoom y escala
function desactivarControles() {

    //Excepto los que no se desactivan...
    for (var i = 0 ; i < map.controls.length; i++) {
        if (map.controls[i].CLASS_NAME == "OpenLayers.Control.PanZoomBar" || map.controls[i].CLASS_NAME == "OpenLayers.Control.ScaleLine" || map.controls[i].CLASS_NAME ==
            "OpenLayers.Control.Navigation" || map.controls[i].CLASS_NAME == "OpenLayers.Control.NavigationHistory" || map.controls[i].CLASS_NAME == "OpenLayers.Control.Button" || map.controls[i].CLASS_NAME == "OpenLayers.Control.Panel")
        { }
        else {
            map.controls[i].deactivate();
        }

    }
    // Por alguna razon el getfeature no se desactiva correctamente, esto lo soluciona...
    navegacionControl.deactivate();
    navegacionControl.activate();

}

//#endregion

//#region getfeatureinfo

function actulizarCapasPreguntables() {

    var capasPreguntablesNoVectoriales = [];

    for (var i = 0; i < ColeccionCapas.Capas.length; i++) {
        if (ColeccionCapas.Capas[i].preguntable && !ColeccionCapas.Capas[i].esvectorial) {
            capasPreguntablesNoVectoriales.push(obtenerCapaPorNombre(ColeccionCapas.Capas[i].nombre));
        }
    }
    infoControl.layers = capasPreguntablesNoVectoriales;

    if (herramientaActual == "informacion") {
        activarGetFeatureVectoriales();
    }
}

function cambiarEstadoPreguntable(preguntable_nombreCapa) {
    var nombreCapa = preguntable_nombreCapa;
    nombreCapa = nombreCapa.substr(12);

    var jqImg = $("[Id='preguntable_" + nombreCapa + "']");

    if (ColeccionCapas.Capas[obtenerNCapaDecoleccion(nombreCapa)].preguntable) {
        ColeccionCapas.Capas[obtenerNCapaDecoleccion(nombreCapa)].preguntable = false;
        jqImg.attr("src", "../img/gis/preguntable_no.png");
        actulizarCapasPreguntables()
    }
    else {
        ColeccionCapas.Capas[obtenerNCapaDecoleccion(nombreCapa)].preguntable = true;
        jqImg.attr("src", "../img/gis/preguntable_si.png");
        actulizarCapasPreguntables();
    }
}

function activarZoomVentanaControl() {
    console.log("Activando ctrlZoomVentana");
    ctrlZoomVentana.activate();
}

function activarGetFeatureInfo() {
    console.log("Activando infoControl");
    infoControl.activate();
}



function mostarTablaResultadosYAddTabs(event, origen) {

    console.log(event);
    //esto lo dejamos para cuando agamos la conexion a la bbdd de verdad...
    if (origen == "vectorial") {
        console.log("origen vectorial");
        var features = []
        features.push(event.feature);
        var esVectorial = true;
        var esEmergencia = false;
    }
    else if (origen == "emergencia") {
        console.log("origen emergencias");
        var esVectorial = false;
        var esEmergencia = true;
        var features = [];
        features.push(event.feature);
    }
    else {
        var esVectorial = false;
        var esEmergencia = false;
        console.log("origen otro");
        var features = event.features;
    }


    var divTablaResultados = "";

    if (!$("#divGetFetureInfoTable").dialog("isOpen")) {

        $("#divGetFetureInfoTable").dialog("open");
    }

    console.log("Hay estas features: " + features.length);
    var mostrarFoto = "";

    //si hay un perfil dibujado......

    if ($("#divGetFetureInfoTable").children("svg").length == 1 || $("#divGetFetureInfoTable").children("div#divFotoInventario").length == 1) {

        var textoInicialTabla = '<div id="infoResultTab">' +
                                '</div>' +
                                 '<div id="divBorrarTabla">' +
                                    '<button onclick="borrarTablaResultadosYcapaSeleccion()">Limpiar Resutltados</button>' +
                                 '</div>';

        $("#divGetFetureInfoTable").html(textoInicialTabla);
    }

    if ($("#encabezadoTabs").children("li").length == 0) {

        console.log("Encabezado de tablas vacio");
        if (features[0]) {

            divTablaResultados += "<ul id='encabezadoTabs'>";
            for (var i = 0; i < features.length; i++) {
                //por cada feature un tab de momento....
                var nombreCapa = sacarNombreCapaDeLayer(features[i].type);
                if (esVectorial) var nombreCapa = event.object.protocol.featureType;
                if (esEmergencia) var nombreCapa = "Emergencias";


                divTablaResultados += "<li><a href='#tabs-" + (i + 1) + "'>(" + (i + 1) + ")" + nombreCapa + "</a></li>";

            }
            divTablaResultados += "</ul>";

            for (var i = 0; i < features.length; i++) {

                // se carga el unfeaturecol para exportacion:
                unfeaturecol.push(features[i]);
                var nombreCapa = sacarNombreCapaDeLayer(features[i].type);
                if (esVectorial) var nombreCapa = sacarNombreCapaDeLayer(event.object.protocol.featureType);
                if (esEmergencia) var nombreCapa = "Emergencias";
                divTablaResultados += "<div id='tabs-" + (i + 1) + "'>"
                var numeroAtributos = Object.size(features[i]) - 1;
                divTablaResultados += "<table class='tablaPopup'>";
                ////Encabezado
                var numInt = 0;
                var campoNumint = 0;
                var arrayTHCamposOrdenados = [];
                for (var j in features[i].attributes) {

                    if (esEmergencia) var nombreCampo = j;
                    else {
                        var nombreCampo = obtenerNombreCampoConFormato(nombreCapa, j)
                    }

                    if (esEmergencia) var miordenCampo = "";
                    else {
                        var miordenCampo = ordenDelCampo(j, nombreCapa);
                    }
                    arrayTHCamposOrdenados.push([miordenCampo, "<TH><b>" + nombreCampo + "</b></tH>"]);

                }
                arrayTHCamposOrdenados.sort(function (a, b) { return a[0] - b[0] });
                console.log(arrayTHCamposOrdenados);
                for (var j = 0; j < arrayTHCamposOrdenados.length; j++) {
                    divTablaResultados += arrayTHCamposOrdenados[j][1];
                }


                divTablaResultados += "<TH><b>Foto</b></tH>";
                ////nueva linea para los valores
                divTablaResultados += "<TH><b>KML</b></tH>";
                divTablaResultados += "<TR>";


                var arrayTDValoresOrdenados = [];
                for (var attribute in features[i].attributes) {
                    var valorSinFormato = features[i].attributes[attribute];
                    if (esEmergencia) var unValorConFormato = valorSinFormato;
                    else {

                        var nombreCampo = attribute;
                        var unValorConFormato = valorConFormato(nombreCapa, nombreCampo, valorSinFormato);
                    }

                    if (esEmergencia) var miordenDelCampo = "";
                    else {
                        var miordenDelCampo = ordenDelCampo(nombreCampo, nombreCapa);
                    }
                    arrayTDValoresOrdenados.push([miordenDelCampo, "<TD>" + unValorConFormato + "</TD>"]);
                }

                arrayTDValoresOrdenados.sort(function (a, b) { return a[0] - b[0] });
                for (var j = 0; j < arrayTDValoresOrdenados.length; j++) {

                    divTablaResultados += arrayTDValoresOrdenados[j][1];
                }


                //Si tiene foto asignado se rellena el campo foto
                console.log("comprobando layer: " + nombreCapa);
                if (!esEmergencia) {
                    if (capaDeDatosCapa(nombreCapa).confoto) {
                        var sicDelaCapa = capaDeDatosCapa(nombreCapa).SIC;
                        console.log("Tiene sic asisgnado :" + sicDelaCapa);
                        var numInt = features[i].data.NumInt;

                        mostrarFoto = "<img class='imagenesbotonera' src='../img/gis/foto.png' id='botonFotosDesdeInfo" + i + "'></img>";

                        divTablaResultados += "<TD id='tdFotos-" + sicDelaCapa + "-" + numInt + "'>" + mostrarFoto + "</TD>";
                        actualizarTDDefotos(sicDelaCapa, numInt);

                    }

                    else { divTablaResultados += "<TD>" + "ND" + "</TD>"; }
                }
                else { divTablaResultados += "<TD>" + "ND" + "</TD>"; }
                var imgExport = "<img class='imagenesbotonera' src='../img/gis/export.png' id='botonExport" + i + "' onclick='iniciarExportDelFeatureNumero(" + i + ")'></img>"
                divTablaResultados += "<TD>" + imgExport + "</TD>";
                divTablaResultados += "</TR>";
                divTablaResultados += "</table>";
                divTablaResultados += "</div>";

            }
            $("#infoResultTab").html(divTablaResultados);
            $("#infoResultTab").tabs();
            $("#infoResultTab").tabs("refresh");
        }
        else {

            console.log("No se han encontrado elementos");
            $("#infoResultTab").html("No se han encontrado elementos");

        }


    }
    else {
        console.log("Encabezado no vacio, adding mas resultados...");
        var numResultadosAnteriores = $("#encabezadoTabs").children("li").length;

        console.log("Antes había estos resultados: " + numResultadosAnteriores);

        if (features[0]) {

            for (var i = 0; i < features.length; i++) {
                //por cada feature un tab de momento....
                var nombreCapa = sacarNombreCapaDeLayer(features[i].type);
                if (esVectorial) var nombreCapa = event.object.protocol.featureType;
                if (esEmergencia) var nombreCapa = "Emergencias";
                divTablaResultados += "<li><a href='#tabs-" + (numResultadosAnteriores + i + 1) + "'>(" + (numResultadosAnteriores + i + 1) + ")" + nombreCapa + "</a></li>";

            }


            $("#encabezadoTabs").append(divTablaResultados);

            //Ahora añadimos los contenidos de las pestañas...
            divTablaResultados = "";

            for (var i = 0; i < features.length; i++) {

                // se carga el unfeaturecol para exportacion:
                unfeaturecol.push(features[i]);
                var nombreCapa = sacarNombreCapaDeLayer(features[i].type);
                if (esVectorial) var nombreCapa = sacarNombreCapaDeLayer(event.object.protocol.featureType);
                if (esEmergencia) var nombreCapa = "Emergencias";
                divTablaResultados += "<div id='tabs-" + (numResultadosAnteriores + i + 1) + "'>"
                var numeroAtributos = Object.size(features[i]) - 1;
                divTablaResultados += "<table class='tablaPopup'>";
                ////Encabezado
                var numInt = 0;
                var campoNumint = 0;
                var arrayTHCamposOrdenados = [];
                for (var j in features[i].attributes) {

                    if (esEmergencia) var nombreCampo = j;
                    else {
                        var nombreCampo = obtenerNombreCampoConFormato(nombreCapa, j)
                    }

                    if (esEmergencia) var miordenCampo = "";
                    else {
                        var miordenCampo = ordenDelCampo(j, nombreCapa);
                    }
                    arrayTHCamposOrdenados.push([miordenCampo, "<TH><b>" + nombreCampo + "</b></tH>"]);

                }
                arrayTHCamposOrdenados.sort(function (a, b) { return a[0] - b[0] });

                for (var j = 0; j < arrayTHCamposOrdenados.length; j++) {
                    divTablaResultados += arrayTHCamposOrdenados[j][1];
                }
                divTablaResultados += "<TH><b>Foto</b></tH>";
                ////nueva linea para los valores
                divTablaResultados += "<TH><b>KML</b></tH>";
                divTablaResultados += "<TR>";
                var arrayTDValoresOrdenados = [];
                for (var attribute in features[i].attributes) {
                    var valorSinFormato = features[i].attributes[attribute];
                    if (esEmergencia) var unValorConFormato = valorSinFormato;
                    else {

                        var nombreCampo = attribute;
                        var unValorConFormato = valorConFormato(nombreCapa, nombreCampo, valorSinFormato);
                    }

                    if (esEmergencia) var miordenDelCampo = "";
                    else {
                        var miordenDelCampo = ordenDelCampo(nombreCampo, nombreCapa);
                    }
                    arrayTDValoresOrdenados.push([miordenDelCampo, "<TD>" + unValorConFormato + "</TD>"]);
                }

                arrayTDValoresOrdenados.sort(function (a, b) { return a[0] - b[0] });
                for (var j = 0; j < arrayTDValoresOrdenados.length; j++) {

                    divTablaResultados += arrayTDValoresOrdenados[j][1];
                }


                //Si tiene foto asignado se rellena el campo foto
                console.log("comprobando layer: " + nombreCapa);

                if (!esEmergencia) {
                    if (capaDeDatosCapa(nombreCapa).confoto) {
                        var sicDelaCapa = capaDeDatosCapa(nombreCapa).SIC;
                        console.log("Tiene sic asisgnado :" + sicDelaCapa);
                        var numInt = features[i].data.NumInt;
                        mostrarFoto = "<img class='imagenesbotonera' src='../img/gis/foto.png' id='botonFotosDesdeInfo" + i + "'></img>";
                        divTablaResultados += "<TD id='tdFotos-" + sicDelaCapa + "-" + numInt + "'>" + mostrarFoto + "</TD>";
                        actualizarTDDefotos(sicDelaCapa, numInt);
                    }

                    else { divTablaResultados += "<TD>" + "ND" + "</TD>"; }
                }
                else { divTablaResultados += "<TD>" + "ND" + "</TD>"; }
                var imgExport = "<img class='imagenesbotonera' src='../img/gis/export.png' id='botonExport" + i + "' onclick='iniciarExportDelFeatureNumero(" + (numResultadosAnteriores + i) + ")'></img>"
                divTablaResultados += "<TD>" + imgExport + "</TD>";
                divTablaResultados += "</TR>";
                divTablaResultados += "</table>";
                divTablaResultados += "</div>";
            }

            $("#infoResultTab").append(divTablaResultados);

            //$("#infoResultTab").tabs();
            $("#infoResultTab").tabs("refresh");

        }


    }

    //sacarDatosTablaSic(34,1);

}


function obtenerNombreCampoConFormato(nombreCapa, nombreCampo) {
    var campoConFormato = '';
    var campos = capaDeDatosCapa(nombreCapa).Campos;

    for (var i = 0; i < campos.length; i++) {

        if (campos[i].NombreBBDD == nombreCampo) {
            campoConFormato = campos[i].NombreSalida;
        }
    }

    return campoConFormato
}


function ordenDelCampo(nombreCampo, nombreCapa) {
    var ordenCampo = "";
    var campos = capaDeDatosCapa(nombreCapa).Campos;
    for (var i = 0; i < campos.length; i++) {

        if (campos[i].NombreBBDD == nombreCampo) {
            ordenCampo = campos[i].Orden;
        }
    }

    return ordenCampo;
}

function valorConFormato(nombreCapa, nombreCampo, valorSinFormato) {

    console.log("Buscando formato del valor: " + valorSinFormato);
    var unValorConFormato = valorSinFormato;
    var campos = capaDeDatosCapa(nombreCapa).Campos;
    var formatoDestino = "";

    for (var i = 0; i < campos.length; i++) {

        if (campos[i].NombreBBDD == nombreCampo) {
            formatoDestino = campos[i].FormatoValores;
        }
    }


    switch (formatoDestino) {
        case -1:
            console.log("Formato Texto");
            // esto no se cambia...
            break;
        case -2:
            console.log("Formato fecha");
            //TODO
        default:
            console.log("Formato numero");
            unValorConFormato = parseFloat(valorSinFormato).toFixed(formatoDestino);
            break;
    }

    return unValorConFormato;
}

function borrarTablaResultadosYcapaSeleccion() {

    $("#infoResultTab").html("");
    borrarCapaSeleccion();
}



function sacarDatosTablaSic(sic, idSic) {

    console.log("Buscando datos del sic: " + sic + ", elemento: " + idSic);
    var url = "datosTablaSic.ashx";

    url += "?sic=" + sic;
    url += "&idelemento=" + idSic;
    console.log(url);
    $.ajax({
        type: "POST",
        url: url,
        success: success,

    });

    var listaFotos;

    function success(data) {
        console.log(data);
        //generarDivFotos(data)

    }
}


function sacarNombreCapaDeLayer(nombreLayer) {
    for (var i = 0; i < datosCapas.capas.length; i++) {
        var nombreCapa = datosCapas.capas[i].nombre;
        var layers = datosCapas.capas[i].parametros.layers.split(",");
        for (var j = 0; j < layers.length; j++) {
            if (layers[j] == nombreLayer) {
                return nombreCapa;
                break
            }
        }
    }

}

function mandarFeaturesACapaVectorial(event) {
    var coleccionFeatures = event.features;
    //capaSeleccion.removeAllFeatures();
    capaSeleccion.addFeatures(coleccionFeatures);
}


// esto es una funcion para poder contar el numero de propiedades de un objeto
Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        size++;
    }
    return size;
};



//#endregion

//#region getfeatureVectoriales

///activa los vectoriales y preguntables y desaciva los vectoriales nopreguntables.
function activarGetFeatureVectoriales() {

    ///En este caso es un control por cada capa preguntable vectorial

    //var nombreCapa = "Alcantarillas";
    var capasVectorialesPreguntables = [];

    for (var i = 0 ; i < ColeccionCapas.Capas.length; i++) {
        if (ColeccionCapas.Capas[i].esvectorial && ColeccionCapas.Capas[i].preguntable) {
            console.log("Activando GetFeature de: " + ColeccionCapas.Capas[i].nombre);
            capasVectorialesPreguntables.push(ColeccionCapas.Capas[i].nombre);
        }

    }

    var capasVectorialesNoPreguntables = [];

    for (var i = 0 ; i < ColeccionCapas.Capas.length; i++) {
        if (ColeccionCapas.Capas[i].esvectorial && !ColeccionCapas.Capas[i].preguntable) {

            var nombreCapa = ColeccionCapas.Capas[i].nombre;

            for (var j = 0; j < map.controls.length; j++) {
                if (map.controls[j].title == "getfeatureControl_" + nombreCapa) {
                    console.log("desactivando getfeatureControl_" + nombreCapa);
                    map.controls[j].deactivate();

                }
            }
        }

    }

    function existeElControl(nombreCapa) {

        var resultado = false;
        for (var i = 0; i < map.controls.length; i++) {
            if (map.controls[i].title == "getfeatureControl_" + nombreCapa) {
                resultado = true;
            }
        }
        return resultado
    }


    for (var i = 0; i < capasVectorialesPreguntables.length; i++) {

        if (!existeElControl(capasVectorialesPreguntables[i])) {

            var nombreCapa = nombrePrimerlayerDelaCapa(capasVectorialesPreguntables[i]);

            console.log(capasVectorialesPreguntables[i]);
            var controlGetfeature = new OpenLayers.Control.GetFeature({
                protocol: OpenLayers.Protocol.WFS({
                    url: ancashmapfile + "&service=wfs",

                    geometryName: "ms:Shape",
                    featureType: nombreCapa,
                    //filterType: "INTERSECTS",
                    //maxFeatures: 5,
                    featurePrefix: "ms",
                    srsName: "EPSG:3857",
                    //featureNS: "http://mapserver.gis.umn.edu/mapserver"
                }),
                box: false,
                hover: false,
                multipleKey: "shiftKey",
                toggleKey: "ctrlKey"
            });
            controlGetfeature.title = "getfeatureControl_" + capasVectorialesPreguntables[i];
            controlGetfeature.events.register("featureselected", this, function (e) {
                console.log("Seleccionado");
                //capaSeleccion.removeAllFeatures();
                console.log(e);
                capaSeleccion.addFeatures([e.feature]);
                mostarTablaResultadosYAddTabs(e, "vectorial")
            });

            map.addControl(controlGetfeature);
            controlGetfeature.activate();
        }
        else {
            console.log("Ya existe, se activa");
            var nombreCapa = capasVectorialesPreguntables[i];

            for (var j = 0; j < map.controls.length; j++) {
                if (map.controls[j].title == "getfeatureControl_" + nombreCapa) {
                    console.log("Activando getfeatureControl_" + nombreCapa);
                    map.controls[j].activate();

                }
            }
        }

    }
}

//#endregion

//#region controlSelector de elementos

function activarSelectorDeElementosControl() {

    console.log("Activando SelectorDeElementosControl");
    actualizarSelectorDeCapasConCapasExportalbles();
    $('#selectorCapaExportacion').dialog("open");
    var capaSeleccionada = $("#capaSeleccionadaSelectorCapaExportacioin").val();

    // como el control depende de la capa seleccionada lo creamos desde aqui...
    pasarSelectorDeElementosControlACapa(capaSeleccionada);
    capaSeleccion.removeAllFeatures();
    selectorDeElementosControl.activate();

}

function actualizarSelectorDeCapasConCapasExportalbles() {

    var capasExportables = [];

    for (var i = 0; i < ColeccionCapas.Capas.length; i++) {
        var capa = ColeccionCapas.Capas[i]
        if (capa.exportable) {
            capasExportables.push(capa.nombre);
        }
    }

    var divCapasSeleccion = "<div style='padding:5px'><label class='labelFormEventos'>Capa:</label>" +
                             "<select id='capaSeleccionadaSelectorCapaExportacioin' onchange='selectorCapaExportacioinChange()'>";

    for (var i = 0; i < capasExportables.length; i++) {

        divCapasSeleccion += "<option>" + capasExportables[i] + "</option>";

    }
    divCapasSeleccion += "</select></div>";
    var imgExport = "<img class='imagenesbotonera' src='../img/gis/export.png' id='botonExportCapaSelecion' onclick='exportarCapaSeleccion()' title='Exportar a KML'></img>";
    var imgBorrarSeleccion = "<img class='imagenesbotonera' src='../img/gis/borrar.png' id='botonBorrarSeleccion' onclick='borrarCapaSeleccion()' title='Borrar selección'></img>";
    divCapasSeleccion += "<div>" + imgExport + imgBorrarSeleccion + "</div>";

    $('#selectorCapaExportacion').html(divCapasSeleccion);

}

function borrarCapaSeleccion() {

    capaSeleccion.removeAllFeatures();
}

function pasarSelectorDeElementosControlACapa(nombreCapa) {

    ///Si existe el control lo quitamos
    for (var x in map.controls) {
        if (map.controls[x].title == "selectorDeElementosControl") {
            console.log("Quitamos el control porque existe");
            map.removeControl(map.controls[x]);
            break
        }
    }

    var nombrelayer = nombrePrimerlayerDelaCapa(nombreCapa);

    selectorDeElementosControl = new OpenLayers.Control.GetFeature({
        protocol: OpenLayers.Protocol.WFS({
            url: ancashmapfile + "&service=wfs",

            geometryName: "ms:Shape",
            featureType: nombrelayer,
            //filterType: "INTERSECTS",
            //maxFeatures: 1000,
            featurePrefix: "ms",
            srsName: "EPSG:3857",
            //featureNS: "http://mapserver.gis.umn.edu/mapserver"
        }),
        box: true,
        hover: false,
        multipleKey: "shiftKey",
        toggleKey: "ctrlKey"
    });

    selectorDeElementosControl.title = "selectorDeElementosControl";

    selectorDeElementosControl.events.register("featureselected", this, function (e) {
        console.log("Seleccionado");
        capaSeleccion.addFeatures([e.feature]);
    });
    selectorDeElementosControl.events.register("featureunselected", this, function (e) {
        capaSeleccion.removeFeatures([e.feature]);
    });
    selectorDeElementosControl.events.register("hoverfeature", this, function (e) {
        console.log("Hover");
        //hover.addFeatures([e.feature]);
    });
    selectorDeElementosControl.events.register("outfeature", this, function (e) {
        //hover.removeFeatures([e.feature]);
    });

    map.addControl(selectorDeElementosControl);

}

function nombrePrimerlayerDelaCapa(nombrecapa) {

    var layers = capaDeDatosCapa(nombrecapa).parametros.layers.split(",");
    var nombrelayer = layers[0];
    return nombrelayer;
}

function selectorCapaExportacioinChange() {

    var capaSeleccionada = $("#capaSeleccionadaSelectorCapaExportacioin").val();
    pasarSelectorDeElementosControlACapa(capaSeleccionada);
    capaSeleccion.removeAllFeatures();
    selectorDeElementosControl.activate();

}

//#endregion

//#region cotrol de medicion

function handleMeasurementsPartial(event) {
    var geometry = event.geometry;
    var units = event.units;
    var order = event.order;
    var measure = event.measure;
    var element = document.getElementById('salidaMedicion');
    var out = "";
    var geometriaAnterior = new OpenLayers.Geometry.LineString();
    if (order == 1) {
        var longitudAnterior = 0;
        var longitudUltimoTramo = 0;
        if (event.geometry.components.length > 2) {

            geometriaAnterior.components = event.geometry.components.slice(0, event.geometry.components.length - 1);
            longitudAnterior = this.getBestLength(geometriaAnterior)[0];
            console.log(longitudAnterior);
            longitudUltimoTramo = measure - longitudAnterior;
        }

        out += "Longitud total: " + measure.toFixed(2) + " " + units + "<br>" +
               "Longitud anterior: " + parseFloat(longitudAnterior).toFixed(2) + " " + units + "<br>" +
               "Longitud tramo: " + parseFloat(longitudUltimoTramo).toFixed(2) + " " + units + "<br>";
    }

    else {
        var perimetro = this.getBestLength(event.geometry);
        out += "Área: " + measure.toFixed(2) + " " + units + "<sup>2</" + "sup><br>" +
            "Perímetro: " + perimetro[0].toFixed(2) + " " + perimetro[1];
    }
    element.innerHTML = out;
}

function handleMeasurementsDone(event) {

    console.log("Done");

}


//#endregion

//#region perfil de elevacion

//#region perfil desde control dibujo

function activarHerramientaPerfil() {
    console.log("Activar herramienta perfil");

    crearYCargarCapaLineaPerfil();
    activarControlDibujo();


}


function crearYCargarCapaLineaPerfil() {

    if (!obtenerCapaPorNombre("LineaPerfil")) {

        capaLineaPerfil = new OpenLayers.Layer.Vector("LineaPerfil");

        capaLineaPerfil.styleMap = stylemap_CapaLineaPerfil;

        map.addLayer(capaLineaPerfil);

        capaLineaPerfil.events.register("featureadded", capaLineaPerfil, nuevografico);

        addCapaTemporalAlGestor("capaLineaPerfil", "LineaPerfil", "Capa Perfil");
    }




}

function activarControlDibujo() {

    var drawControls = {
        line: new OpenLayers.Control.DrawFeature(capaLineaPerfil,
            OpenLayers.Handler.Path),
    };

    for (var key in drawControls) {
        map.addControl(drawControls[key]);
        drawControls[key].activate();
    }
}

function nuevografico(feature) {

    if (feature.feature.geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {

        console.log("Habia estas features: " + capaLineaPerfil.features.length);
        var numfeatures = capaLineaPerfil.features.length;
        if (numfeatures > 1) {
            for (var i = 0 ; i < numfeatures - 1; i++) {
                console.log("destruyo");
                capaLineaPerfil.features[0].destroy();
            }
        }
        var geometria = feature.feature.geometry;
        generarGraficoPerfil(geometria);

    }


}

function generarGraficoPerfil(geometria) {

    console.log("A generar");
    console.log(geometria);
    obtenerDatosPerfilYCrearlo(geometria, 100);
}



function obtenerDatosPerfilYCrearlo(geometria, maxfeatures) {

    var datosElevacion = [];

    var projDesde = map.getProjection();
    var projHasta = new OpenLayers.Projection("EPSG:4326");
    var longitudGeometria = geometria.getLength();
    var listaPosiciones = [0];

    for (var i = 0; i < maxfeatures - 1; i++) {

        listaPosiciones.push(i / maxfeatures * longitudGeometria);
    }

    //console.log(listaPosiciones);

    var listaPuntos = [];

    for (var i = 0; i < listaPosiciones.length; i++) {
        var punto = LRSLocatePoint(geometria, listaPosiciones[i]);
        listaPuntos.push(punto);
    }
    var listaPuntosLatLong = [];
    for (var i = 0; i < listaPuntos.length; i++) {

        var punto = listaPuntos[i].clone();

        punto.transform(projDesde, projHasta);

        var x = punto.x;
        var y = punto.y;

        listaPuntosLatLong.push(new google.maps.LatLng(punto.y, punto.x));

    }
    var positionalRequest = {
        'locations': listaPuntosLatLong
    }

    //console.log(positionalRequest);

    elevator = new google.maps.ElevationService();

    var arrayDistaciaZ = [];
    var arrayParaPerfil;
    elevator.getElevationForLocations(positionalRequest, function (results, status) {
        if (status == google.maps.ElevationStatus.OK) {

            // Retrieve the first result
            if (results[0]) {
                for (var i = 0; i < results.length; i++) {

                    arrayDistaciaZ.push({ "Distancia": i * longitudGeometria / maxfeatures, "Altura": results[i].elevation });

                }
                arrayParaPerfil = {
                    "symbol": "Perfil",
                    "datos": arrayDistaciaZ
                };
                //console.log(arrayParaPerfil);

                if (!$("#divGetFetureInfoTable").dialog("isOpen")) {

                    $("#divGetFetureInfoTable").dialog("open");
                }
                crearPerfil(arrayParaPerfil, "divGetFetureInfoTable");

            } else {
                alert("No results found");
            }
        } else {
            alert("Elevation service failed due to: " + status);
        }
    });



}

function LRSLocatePoint(line, position) {
    var curPos = 0;
    var point = false;
    for (var i = 0; i < line.components.length; i++) {
        lastPos = curPos;

        curPos += line.components[i].distanceTo(line.components[i + 1]);
        if (curPos > position) {

            var posicionRelativa = (position - lastPos) / (curPos - lastPos);
            point = LRSLocatePointOnSegment(
                       line.components[i],
						line.components[i + 1],
						posicionRelativa
            		);
            break;
        }
    }
    return point;
}


function LRSLocatePointOnSegment(point1, point2, position) {
    var point = false;
    if (position >= 0 && position <= 1) {
        x1 = point1.x;
        y1 = point1.y;
        x2 = point2.x;
        y2 = point2.y;
        x = x1 + (x2 - x1) * position;
        y = y1 + (y2 - y1) * position;
        point = new OpenLayers.Geometry.Point(x, y);
    }
    return point;
}

//#endregion


//#region perfil desde evento


function eventoAPerfil() {
    console.log("Pefil desde evento");

    if (capaEventos.features[0] && capaEventos.features[0].geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {

        var geometria = capaEventos.features[0].geometry
        console.log("A generar perifl");
        if (!obtenerCapaPorNombre("LineaPerfil")) {

            capaLineaPerfil = new OpenLayers.Layer.Vector("LineaPerfil");

            capaLineaPerfil.styleMap = stylemap_CapaLineaPerfil;

            map.addLayer(capaLineaPerfil);

            capaLineaPerfil.events.register("featureadded", capaLineaPerfil, nuevografico);

            addCapaTemporalAlGestor("capaLineaPerfil", "LineaPerfil", "Capa Perfil");
        }
        capaLineaPerfil.removeAllFeatures();
        capaLineaPerfil.addFeatures(capaEventos.features);
        capaEventos.removeAllFeatures();
        generarGraficoPerfil(geometria);
    }
    else {


        alert("No existen eventos de tipo línea generados");

    }

}


//#endregion



//#endregion


//#region fotoinventario

var ordenFotoActual = 1;
var carreteraFotoActual = "PE3N";
var fotoIEstaEjecutandose = false;
var debecointinuar = false;

function activarHerramientavisorFotoinvenario() {

    if (typeof (obtenerCapaPorNombre("FotoInventario")) == "undefined") {
        addCapaFotoinventario();

    }


    var videoControl = new OpenLayers.Control.WMSGetFeatureInfo({
        url: ancashmapfile,
        title: 'Identify features by clicking',
        layers: [capaFotoInventario],
        infoFormat: 'application/vnd.ogc.gml',
        hover: false,
        handlerOptions:
            {
                "click": { delay: 100 },
                "hover": { delay: 1 }
            },

        queryVisible: true
    });

    videoControl.events.register("getfeatureinfo", this, fotoInventarioHover);

    map.addControl(videoControl);
    videoControl.activate();
}

function fotoInventarioHover(event) {
   
    if (event.features.length > 0) {
        if (fotoIEstaEjecutandose) {
            fotoIEstaEjecutandose = false;
            debecointinuar = true;
        }
        //console.log(event);
        console.log(event.features[0].attributes.ogr_fid + " " + event.features[0].attributes.Via + " " + parseInt(event.features[0].attributes.Num));
        capaSeleccion.removeAllFeatures();
        capaSeleccion.addFeatures([event.features[0]]);

        var idfoto = event.features[0].attributes.ogr_fid;
        var carretera = event.features[0].attributes.Via;
        var orden = parseInt(event.features[0].attributes.Num);
        var progresiva = event.features[0].attributes.PROG_INI_T;


        
        mostrarFotoFotoInventario(idfoto, carretera, orden, progresiva);
        dibujarPosicionVideoEnSlider(carretera, orden);
        actualizarDatosFotactual(carretera, orden);
    }

}

function addCapaFotoinventario() {
    capaFotoInventario = new OpenLayers.Layer.WMS("FotoInventario", ancashmapfile, { layers: "Videoinventario", transparent: true });
    map.addLayer(capaFotoInventario);
}

function mostrarFotoFotoInventario(idFoto, carretera, orden, PK) {


    if (!$("#divGetFetureInfoTable").dialog("isOpen")) {
        $("#divGetFetureInfoTable").dialog("open");
    }

    if ($("#divFotoInventario").length > 0) {

        $("#carreteraInventario").val(carretera);
        $("#PKFotoInventario").val(PK);

        if (debecointinuar) {
            fotoIEstaEjecutandose = true;
            debecointinuar = false;
        }
        $("#imagenFotoInventario").attr("src", "../user/showFotoFotoInventario.ashx?idfoto=" + idFoto);

        actualizarDatosFotactual(carretera, orden);
       

    }

    else {
        var fotoinventarioDiv = "<div id='divFotoInventario'>" +
                                    "<div id='divFotoInventrioIzquierda'>" +
                                        "<div id='divSelectorCarreterasFotoInventario'>" +
                                             "<label><b>Carretera:</b></label>" +
                                            "<select id='carreteraInventario' onchange='selectorCarreteraFotoinventarioChange()'>" +
                                                "<option>PE3NA</option>" +
                                                "<option>PE3N</option>" +
                                            "</select>" +

                                        "</div>" +
                                        "<div class='fotoNav'><img id='atrs-1' class='iconoavance' src='../img/gis/atras1.png' onclick='moverfoto(this.id)'></img></div>" +
                                        "<div class='fotoNav'><img id='atrs-5' class='iconoavance' src='../img/gis/atras2.png' onclick='moverfoto(this.id)'></img></div>" +
                                        "<div class='fotoNav'><img id='atrs-9' class='iconoavance' src='../img/gis/atras3.png' onclick='moverfoto(this.id)'></img></div>" +
                                    "</div>" +
                                    "<div id='divImagenFotoInventario'><img id='imagenFotoInventario' src='../user/showFotoFotoInventario.ashx?idfoto=" + idFoto + "'></img></div>" +
                                    "<div id='divFotoInventrioDerecha'>" +
                                        "<div id='divPKFotoInventario'>" +
                                            "<p><label><b>PK:</b></label> <input type='text' id='PKFotoInventario' value=''></p> " +
                                            "<div id='fotoInventarioSlider'></div>" +
                                        "</div>" +
                                        "<div class='fotoNav'><img id='alan-1' class='iconoavance' src='../img/gis/avance1.png' onclick='moverfoto(this.id)'></img></div>" +
                                        "<div class='fotoNav'><img id='alan-5' class='iconoavance' src='../img/gis/avance2.png' onclick='moverfoto(this.id)'></img></div>" +
                                        "<div class='fotoNav'><img id='alan-9' class='iconoavance' src='../img/gis/avance3.png' onclick='moverfoto(this.id)'></img></div>" +
                                        "<div class='fotoNav'><img id='play_alante' class='iconoavance' src='../img/gis/play.png' onclick='playFotoInventario(this.id)'></div>" +
                                    "</div>" +
                                "</div>";

        $("#divGetFetureInfoTable").html(fotoinventarioDiv);
        $("#carreteraInventario").val(carretera);
        $("#PKFotoInventario").val(PK);


        $("#fotoInventarioSlider").slider({
            orientation: "horizontal",
            range: "min",
            max: 100,
            value: 0,
           
        });

        $("#fotoInventarioSlider").slider({
            stop: actualizarPosicionDesdeSlider,
            slide: sliderChangeEvent
        });

        actualizarDatosFotactual(carretera, orden);
        $("#imagenFotoInventario").load(function () {
            console.log("Foto loaded");
            if (fotoIEstaEjecutandose) {
                setTimeout(mostrarFotoDelFotoInvetarioByCarreteraOrden(carreteraFotoActual, ordenFotoActual + 1),300);
            }
        });

    }
    
}

function sliderChangeEvent(evt)
{
    
    if (fotoIEstaEjecutandose) {
        fotoIEstaEjecutandose = false;
        debecointinuar = true;
    }
}

function actualizarPosicionDesdeSlider(evt)
{
    
    var posicionSlider = $("#fotoInventarioSlider").slider("value");
    var orden = ordenDesdePosicionSlider(carreteraFotoActual, posicionSlider);
    
    if (debecointinuar)
    {
        debecointinuar = false;
        fotoIEstaEjecutandose = true;
    }
    mostrarFotoDelFotoInvetarioByCarreteraOrden(carreteraFotoActual, orden);
}

function ordenDesdePosicionSlider(carretera,posicion)
{
    var numerofotos = 0;
    var orden = 1;
    switch(carretera)
    {
        case "PE3N":
            numerofotos = 51159;
            break;

        case "PE3NA":
            numerofotos = 20889;
            break;

    }

    console.log("posicion: " + posicion);
    orden = (posicion / 100) * numerofotos;

    
    orden = parseInt(orden.toFixed(0));
   
    console.log("orden: " + orden);
    return orden;

}

function actualizarDatosFotactual(carretera, orden) {

    carreteraFotoActual = carretera;
    ordenFotoActual = orden;
}

function moverfoto(dire_num) {
    var direccion = dire_num.substr(0, 4);
    var numeroAvance = parseInt(dire_num.substr(dire_num.length - 1, dire_num.length));
    console.log(direccion + " " + numeroAvance);
    var orden = 0;

    if (direccion == "alan") {
        orden = ordenFotoActual + numeroAvance;
    }

    else {
        orden = ordenFotoActual - numeroAvance;
    }

    mostrarFotoDelFotoInvetarioByCarreteraOrden(carreteraFotoActual, orden);
}

function mostrarFotoDelFotoInvetarioByCarreteraOrdenv0(carretera, orden) {
    
    var url = "obtenerIdFotoInventario.ashx";
    url += "?carretera=" + carretera;
    url += "&orden=" + orden;

    $.ajax({
        type: "POST",
        url: url,
        success: success,

    });
    function success(data) {
        data = JSON.parse(data);
        console.log(data);
        var idfoto = data.idFoto;
        var PK = data.PK;
        dibujarPosicionVideoYBorraAnteriores(data.coords);
        dibujarPosicionVideoEnSlider(carretera, orden);
        console.log(idfoto);
        console.log("idfoto:" + idfoto);
        console.log("ordenfoto: " + ordenFotoActual);
        d = new Date();

        $("#imagenFotoInventario").attr("src", "../user/showFotoFotoInventario.ashx?idfoto=" + idfoto +"&datetime="+d.getTime() );
      
        $("#PKFotoInventario").val(PK);
        actualizarDatosFotactual(carretera, orden);
       

    }

}


function mostrarFotoDelFotoInvetarioByCarreteraOrden(carretera, orden) {

    //obtenermos datos de la sigiente foto  
    var url = "obtenerIdFotoInventario.ashx";
    url += "?carretera=" + carretera;
    url += "&orden=" + orden;

    $.ajax({
        type: "POST",
        url: url,
        success: success,

    });
    function success(data) {
        data = JSON.parse(data);
        var PK = data.PK;
        dibujarPosicionVideoYBorraAnteriores(data.coords);
        $("#PKFotoInventario").val(PK);
    }



    dibujarPosicionVideoEnSlider(carretera, orden);
    d = new Date();
    //$("#imagenFotoInventario").attr("src", "../user/showFotoFotoInventario.ashx?carretera=" + carretera + "&orden=" + orden + "&datetime=" + d.getTime());
    $("#imagenFotoInventario").attr("src", "../user/showFotoFotoInventario.ashx?carretera=" + carretera + "&orden=" + orden);
    actualizarDatosFotactual(carretera, orden);


}

function dibujarPosicionVideoEnSlider(carretera, orden)
{
    var numerofotos = 0;

    switch(carretera)
    {
        case "PE3N":
            numerofotos = 51159;
            break;

        case "PE3NA":
            numerofotos = 20889;
            break;

    }
    //console.log(numerofotos);
    var posicionFoto = ((orden / numerofotos)*100).toFixed(0);
    //console.log(posicionFoto);

    $("#fotoInventarioSlider").slider("value", posicionFoto);

    
}

function playFotoInventario(play_direccion) {
    var direccion = play_direccion.substr(5, play_direccion.length);
    console.log(direccion);
    if (!fotoIEstaEjecutandose && direccion == "alante") {
        $("#play_alante").attr("src", "../img/gis/pause.png");
        fotoIEstaEjecutandose = true;
        mostrarFotoDelFotoInvetarioByCarreteraOrden(carreteraFotoActual, ordenFotoActual + 1);
        //playAlante();
    }

    else {
        $("#play_alante").attr("src", "../img/gis/play.png");

        fotoIEstaEjecutandose = false;
    }


}

function dibujarPosicionVideoYBorraAnteriores(coords) {
    var coordXY = coords.split(";");

    capaSeleccion.removeAllFeatures();
    //var punto = new OpenLayers.Geometry.Point(coordXY[0], coordXY[1]);

    console.log(coordXY[0]);
    console.log(coordXY[1]);

    var punto = new OpenLayers.Geometry.Point(coordXY[0].replace(",", "."), coordXY[1].replace(",", ".")).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjection());

    var pointFeature = new OpenLayers.Feature.Vector(punto, null);
    capaSeleccion.addFeatures([pointFeature]);
    capaSeleccion.refresh();

}

//#endregion



