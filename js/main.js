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
        startExtent = new Extent(-40, -3, -4, 36, new esri.SpatialReference({ wkid: 4326 }));

        map = new Map("map", {
            extent: startExtent,
            center: [-16.4, 23.8],
            basemap: "oceans",
            logo: false,
            infoWindow: mipopup
        });

        //#endregion

        //#region Maxima extensión del mapa        
        dojo.connect(map, "onLoad", function () {
            var navToolbar = new esri.toolbars.Navigation(map);
            //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
            dojo.connect(map, "onExtentChange", function (extent) {
                var buffer = 1; //En mi caso 1 grado
                // set costraint extent to initExtent +buffer
                var constraintExtent = new esri.geometry.Extent(startExtent.xmin - buffer, startExtent.ymin - buffer, startExtent.xmax + buffer, startExtent.ymax + buffer);
                if (!constraintExtent.contains(extent) && !constraintExtent.intersects(extent)) {
                    // zoom back to previous extent
                    navToolbar.zoomToPrevExtent();
                }
            });
        });
        //#endregion

        //#region Maxima extensión del mapa
        //Constreñimos la extensión del mapa a la inicial por medio del evento onextentchange.
        //dojo.connect(map, "onExtentChange", function () {
        //Añado un offset a mi extension inicial para permitir moverme en el mapa un poco mas
        //var maxextent = startExtent.offset(7, 7);
        //Obtengo el centro de mi mapa actual
        //var extent = map.extent.getCenter();
        //Si el centro se encuentra fuera de la extensión maxima recupero la extensión de inicio de mi mapa
        //if (maxextent.contains(extent)) { }
        //else { map.setExtent(startExtent) }
        //});

        //#endregion

        //#region Widgets mapa
        //Home Button Dijit
        home = new HomeButton({
            map: map
        }, "HomeButton");
        home.startup();

        //Basemap Dijit
        //basemapGallery = new BasemapGallery({
        //showArcGISBasemaps: true,
        //map: map
        //}, "basemapGallery");
        // basemapGallery.startup();

        //basemapGallery.on("error", function (msg) {
        //console.log("basemap gallery error:  ", msg);
        //});

        toggle = new BasemapToggle({
            map: map,
            basemap: "satellite"
        }, "BasemapToggle");
        toggle.startup();

        //Overview Dijit
        overviewMapDijit = new OverviewMap({
            map: map,
            visible: false
        });

        overviewMapDijit.startup();

        //#endregion

        //#region Layers



        mangroves = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/mangrove_2010/MapServer", {
            id: "mangroves"
        });

        coldcoral = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/coldcoral/MapServer", {
            id: "coldcoral"
        });

        LME = new ArcGISDynamicMapServiceLayer("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/LME_Reg/MapServer", {
            opacity: 0.3,
            id: "LME"
        });

        LME.setVisibleLayers([0]);

        marineEcoregions = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/MEOW_v2/MapServer", {
            opacity: 0.3,
            visible: false,
            id: "marineEcoregions"
        });

        pelagicProvinces = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/pelagic_provinces3/MapServer", {
            opacity: 0.3,
            visible: false,
            id: "pelagicProvinces"
        });

        SeaSurfaceTemperature2003_2007 = new ArcGISTiledMapServiceLayer("http://downloads.wdpa.org/ArcGIS/rest/services/ocean_data_viewer/sea_surface_temp_yr_all/MapServer", {
            id: "SeaSurfaceTemperature2003_2007"
        });


        mygraphiclayer = new GraphicsLayer(), {
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

        wmsLayer = new WMSLayer("http://gmis.jrc.ec.europa.eu/webservices/4km/wms/pathfinder?request=GetMap&transparent=true&format=image%2Fpng&bgcolor=ffffff&version=1.3.0&layers=GMIS_P_SST_01_1995&styles=default%2Cdefault&exceptions=application%2Fvnd.ogc.se_xml&bbox=-55.90683593748923%2C3.10000305598094%2C23.106835937489773%2C44.168863495058055&srs=EPSG%3A4326&width=899&height=526");
        wmsLayer.hasAttributionData = true;
        console.log(wmsLayer);
        var prueba = wmsLayer.getAttributionData();
        console.log(prueba);


        legendLayers = [];
        legendLayers.push({ layer: mangroves, title: "Mangroves" });
        legendLayers.push({ layer: coldcoral, title: "Cold Coral" });
        legendLayers.push({ layer: LME, title: "Large Marine Ecosystems" });
        legendLayers.push({ layer: marineEcoregions, title: "Marine Ecoregions" });
        legendLayers.push({ layer: pelagicProvinces, title: "Pelagic Provinces" });
        legendLayers.push({ layer: mygraphiclayer, title: "Query Layer" });


        //add the legend
        legend = new Legend({
            map: map,
            layerInfos: legendLayers
        }, "legendDiv");
        legend.startup();
        console.log(legend);

        map.addLayers([mangroves, coldcoral, LME, marineEcoregions, pelagicProvinces, mygraphiclayer]);
        //map.addLayer(wmsLayer);
        console.log(LME);


        //#endregion

        //#region Show Coordinates
        map.on("load", function () {
            //after map loads, connect to listen to mouse move & drag events
            map.on("mouse-move", showCoordinates);
            map.on("mouse-drag", showCoordinates);
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

    

//función que utilizo para mostrar u ocultar las capas en la leyenda mediante checkbox
function updateLayerVisibility(evt) {
    var clayer = map.getLayer(evt);
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