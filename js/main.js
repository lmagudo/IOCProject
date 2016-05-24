(function ($) {

    require([
      "esri/urlUtils",
      "esri/map",
      "esri/dijit/HomeButton",
      "esri/dijit/BasemapToggle",
      "esri/dijit/OverviewMap",
      "esri/dijit/Legend",
      "esri/geometry/Extent",
      "esri/layers/ArcGISTiledMapServiceLayer",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "esri/layers/DynamicMapServiceLayer",
      "esri/layers/GraphicsLayer",
      "esri/layers/WMSLayerInfo",
      "esri/layers/WMSLayer",
      "esri/tasks/FindTask",
      "esri/tasks/FindParameters",
      "esri/dijit/PopupMobile",
      "esri/geometry/webMercatorUtils",
      "dijit/form/CheckBox",
      "dojo/_base/array",
      "dojo/dom-construct",
      "dojo/dom",
      "dojo/on",
      "dojo/query",
      "dojo/io-query",
      "dojo/_base/declare",
      "esri/config",
      "dojo/parser",
      "esri/toolbars/navigation",
      "dijit/layout/BorderContainer",
      "dijit/layout/ContentPane",
      "dijit/layout/TabContainer",
      "dijit/layout/AccordionContainer",
      "dijit/TitlePane",
      "dojo/domReady!"
    ], function (
      urlUtils, Map, HomeButton, BasemapToggle, OverviewMap, Legend, Extent, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, DynamicMapServiceLayer, GraphicsLayer, WMSLayerInfo, WMSLayer, FindTask, FindParameters, PopupMobile, webMercatorUtils, CheckBox, array, domConstruct, dom, on, query, ioquery, declare, esriConfig, parser
    ) {
        //Codigo para activar la utilización de la página proxy
        esriConfig.defaults.io.proxyUrl = "../proxy.php";

        //esriConfig.defaults.io.proxyUrl = "../PHP/proxy.php";

        //urlUtils.addProxyRule({
        //    urlPrefix: "http://barreto.md.ieo.es/arcgis/rest/services/UNESCO",
        //    proxyUrl: "http://www.lmagudo.com/IOC/PHP/proxy.php"
        //});
        parser.parse();

        //Variable que contiene mi popup
        mipopup = new PopupMobile({ marginTop: 5000 }, domConstruct.create("div"));


        //#region Map
        //Variable con la extensión inicial del mapa 
        PropiedadesMapa.startExtent = new Extent(-40, -3, -4, 36, new esri.SpatialReference({ wkid: 4326 }));

        PropiedadesMapa.map = new Map("map", {
            extent: PropiedadesMapa.startExtent,
            center: [-16.4, 23.8],
            basemap: "oceans",
            logo: false,
            infoWindow: mipopup
        });

        //#endregion

        //#region Maxima extensión del mapa        
        dojo.connect(PropiedadesMapa.map, "onLoad", function () {
            var navToolbar = new esri.toolbars.Navigation(PropiedadesMapa.map);
            //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
            dojo.connect(PropiedadesMapa.map, "onExtentChange", function (extent) {
                var buffer = 1; //En mi caso 1 grado
                // set costraint extent to initExtent +buffer
                var constraintExtent = new esri.geometry.Extent(PropiedadesMapa.startExtent.xmin - buffer, PropiedadesMapa.startExtent.ymin - buffer, PropiedadesMapa.startExtent.xmax + buffer, PropiedadesMapa.startExtent.ymax + buffer);
                if (!constraintExtent.contains(extent) && !constraintExtent.intersects(extent)) {
                    // zoom back to previous extent
                    navToolbar.zoomToPrevExtent();
                }
            });
        });
        //#endregion

        //#region Maxima extensión del mapa
        //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
        //dojo.connect(PropiedadesMapa.map, "onExtentChange", function () {
        //Añado un offset a mi extension inicial para permitir moverme en el mapa un poco mas
        //var maxextent = PropiedadesMapa.startExtent.offset(7, 7);
        //Obtengo el centro de mi mapa actual
        //var extent = PropiedadesMapa.map.extent.getCenter();
        //Si el centro se encuentra fuera de la extensión maxima recupero la extensión de inicio de mi mapa
        //if (maxextent.contains(extent)) { }
        //else { PropiedadesMapa.map.setExtent(PropiedadesMapa.startExtent) }
        //});

        //#endregion

        //#region Widgets mapa
        //Home Button Dijit
        PropiedadesMapa.home = new HomeButton({
            map: PropiedadesMapa.map
        }, "HomeButton");
        PropiedadesMapa.home.startup();

        PropiedadesMapa.toggle = new BasemapToggle({
            map: PropiedadesMapa.map,
            basemap: "satellite"
        }, "BasemapToggle");
        PropiedadesMapa.toggle.startup();

        var initloadBaseMap = PropiedadesMapa.toggle.on("load", loadBaseMap);
        PropiedadesMapa.toggle.on("toggle", toogleBaseMap);

        //Incorporo las imagenes al selector de mapa base
        function loadBaseMap() {
            ($('.basemapTitle').attr("title") == 'Imágenes') ? $('.basemapImage').css('background-image', 'url(http://js.arcgis.com/3.13/esri/images/basemap/satellite.jpg)') : $('.basemapImage').css('background-image', 'url(http://js.arcgis.com/3.13/esri/images/basemap/oceans.jpg)');
            initloadBaseMap.remove();
        }
        function toogleBaseMap(evt) {
            setTimeout(function () {
                (evt.previousBasemap == 'oceans') ? $('.basemapImage').css('background-image', 'url(http://js.arcgis.com/3.13/esri/images/basemap/oceans.jpg)') : $('.basemapImage').css('background-image', 'url(http://js.arcgis.com/3.13/esri/images/basemap/satellite.jpg)');
            }, 300);

        }

        //Overview Dijit
        PropiedadesMapa.overviewMapDijit = new OverviewMap({
            map: PropiedadesMapa.map,
            visible: false
        });

        PropiedadesMapa.overviewMapDijit.startup();

        //#endregion

        //#region Layers

        //mangroves = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/mangrove_2010/MapServer", {
        //    id: "mangroves"
        //});

        //coldcoral = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/coldcoral/MapServer", {
        //    id: "coldcoral"
        //});

        //marineEcoregions = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/MEOW_v2/MapServer", {
        //    opacity: 0.3,
        //    visible: false,
        //    id: "marineEcoregions"
        //});

        //pelagicProvinces = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/pelagic_provinces3/MapServer", {
        //    opacity: 0.3,
        //    visible: false,
        //    id: "pelagicProvinces"
        //});

        //SeaSurfaceTemperature2003_2007 = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/sea_surface_temp_yr_all/MapServer", {
        //    id: "SeaSurfaceTemperature2003_2007"
        //});

        LME = new ArcGISDynamicMapServiceLayer("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/LME_Reg/MapServer", {
            opacity: 0.3,
            id: "LME"
        });

        LME.setVisibleLayers([0]);


        PropiedadesMapa.mygraphiclayer = new GraphicsLayer(), {
            id: "mygraphiclayer"
        }

        //#region wmsLayers
        //        declare("my.nexradWMSLayer", DynamicMapServiceLayer, {
        //            constructor: function () {
        //                this.initialExtent = this.fullExtent = new Extent({
        //                    xmin: -180,
        //                    ymin: -90,
        //                    xmax: 180,
        //                    ymax: 90,
        //                    spatialReference: {
        //                        wkid: 4326
        //                    }
        //                });
        //                this.spatialReference = new esri.SpatialReference({
        //                    wkid: 4326
        //                });
        //                this.loaded = true;
        //                this.onLoad(this);
        //            },

        //            getImageUrl: function (extent, width, height, callback) {
        //                console.log(extent);
        //                var params = {
        //                    request: "GetMap",
        //                    transparent: true,
        //                    format: "image/png",
        //                    transparent: "true",
        //                    bgcolor: "ffffff",
        //                    version: "1.3.0",
        //                    layers: "GMIS_P_SST_09_1981",
        //                    styles: "default,default",
        //                    exceptions: "application/vnd.ogc.se_xml",
        //                    //changing values
        //                    bbox: extent.xmin/100000 + "," + extent.ymin/100000 + "," + extent.xmax/100000 + "," + extent.ymax/100000,
        //                    srs: "EPSG:" + extent.spatialReference.wkid,
        //                    width: width,
        //                    height: height
        //                };
        //                callback("http://gmis.jrc.ec.europa.eu/webservices/4km/wms/pathfinder?" + ioquery.objectToQuery(params));
        //            }
        //        })

        //        wmsLayer = new my.nexradWMSLayer();
        //        wmsLayer.setOpacity(.75);


        //        console.log(wmsLayer);
        //#endregion

        //wmsLayer = new WMSLayer("http://gmis.jrc.ec.europa.eu/webservices/4km/wms/pathfinder?request=GetMap&transparent=true&format=image%2Fpng&bgcolor=ffffff&version=1.3.0&layers=GMIS_P_SST_01_1995&styles=default%2Cdefault&exceptions=application%2Fvnd.ogc.se_xml&bbox=-55.90683593748923%2C3.10000305598094%2C23.106835937489773%2C44.168863495058055&srs=EPSG%3A4326&width=899&height=526");
        //wmsLayer.hasAttributionData = true;
        //console.log(wmsLayer);
        //var prueba = wmsLayer.getAttributionData();
        //console.log(prueba);


        PropiedadesMapa.legendLayers = [];
        //PropiedadesMapa.legendLayers.push({ layer: mangroves, title: "Mangroves" });
        //PropiedadesMapa.legendLayers.push({ layer: coldcoral, title: "Cold Coral" });        
        //PropiedadesMapa.legendLayers.push({ layer: marineEcoregions, title: "Marine Ecoregions" });
        //PropiedadesMapa.legendLayers.push({ layer: pelagicProvinces, title: "Pelagic Provinces" });
        PropiedadesMapa.legendLayers.push({ layer: LME, title: "Large Marine Ecosystems" });
        PropiedadesMapa.legendLayers.push({ layer: PropiedadesMapa.mygraphiclayer, title: "Query Layer" });


        //add the legend
        PropiedadesMapa.legend = new Legend({
            map: PropiedadesMapa.map,
            layerInfos: PropiedadesMapa.legendLayers
        }, "legendDiv");
        PropiedadesMapa.legend.startup();

        //map.addLayers([mangroves, coldcoral, LME, marineEcoregions, pelagicProvinces, PropiedadesMapa.mygraphiclayer]);
        PropiedadesMapa.map.addLayers([LME, PropiedadesMapa.mygraphiclayer]);
        //map.addLayer(wmsLayer);


        //#endregion

        //#region Show Coordinates
        PropiedadesMapa.map.on("load", function () {
            //after map loads, connect to listen to mouse move & drag events
            PropiedadesMapa.map.on("mouse-move", showCoordinates);
            PropiedadesMapa.map.on("mouse-drag", showCoordinates);
        });

        function showCoordinates(evt) {
            //the map is in web mercator but display coordinates in geographic (lat, long)
            var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);

            var long;
            var lat;

            if (mp.x < 0) {
                long = "W";
            }
            else {
                long = "E";
            }

            if (mp.y < 0) {
                lat = "S";
            }
            else {
                lat = "N";
            }

            //display mouse coordinates
            dom.byId("infocoord").innerHTML = Math.abs(mp.x.toFixed(3)) + "º " + long + ", " + Math.abs(mp.y.toFixed(3)) + "º " + lat;

        }

        //#endregion

    });

})(jQuery);

//función que utilizo para mostrar u ocultar las capas en la leyenda mediante checkbox
function updateLayerVisibility(evt) {
    var clayer = PropiedadesMapa.map.getLayer(evt);
    clayer.setVisibility(!clayer.visible);
    this.checked = clayer.visible;
}

//función que utilizo para abrir una ventana nueva con la url que le paso como parámetro de entrada
function abrirVentana(url) {

    window.open(url, "_blank");
}

function Popup(id) {
    if (dojo.byId(id).style.display == "none") {
        dojo.byId(id).style.display = "block";
    }

    else {
        dojo.byId(id).style.display = "none";
    }
}

function showlegend() {

    if (dojo.byId("leftPane").style.display == "none") {
        dojo.byId("leftPane").style.display = "block";
    }

    else {
        dojo.byId("leftPane").style.display = "none";
    }
}