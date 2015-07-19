require([
      "esri/urlUtils",
      "esri/map",
      "esri/geometry/Extent",
      "esri/layers/ArcGISTiledMapServiceLayer",
      "esri/arcgis/utils",
      "esri/toolbars/draw",
      "esri/geometry/webMercatorUtils",
      "dojo/dom",
      "dojo/dom-construct",
      "dojo/parser",
      "dojo/_base/array",
      "dojo/_base/declare",
      "dijit/layout/AccordionContainer",
      "dijit/layout/BorderContainer",
      "dijit/layout/ContentPane",
      "dojo/domReady!"
    ],
      function (
        urlUtils, Map, Extent, ArcGISTiledMapServiceLayer, utils, Draw, webMercatorUtils, dom, domConstruct, parser, arrayUtils, declare
      ) {
          parser.parse();

          //Codigo para activar la utilización de la página proxy
          esriConfig.defaults.io.proxyUrl = "../proxy.php";
          //esriConfig.defaults.io.proxyUrl = "../PHP/proxy.php";
          //          urlUtils.addProxyRule({
          //              urlPrefix: "http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/",
          //              proxyUrl: "http://www.lmagudo.com/IOC/PHP/proxy.php"
          //          });

          //#region Map and Layers

          //Variable con la extensión inicial del mapa 
          startExtent = new Extent(-23, 16, -10, 21.5, new esri.SpatialReference({ wkid: 4326 }));
          
          map = new Map("map", {
              extent: startExtent,
              //center: [-16.4, 23.8],
              basemap: "oceans",
              logo: false
          });

          EcoAfrik_Hshade = new ArcGISTiledMapServiceLayer("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/Ecoafrik_Hillshade/MapServer", {
              id: "EcoAfrik_Hshade"
          });

          map.addLayer(EcoAfrik_Hshade);

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

          ocultainformpanel();

      });

      //#region Geoprocesamiento
      function drawpolygon(cod) {

          if (dojo.byId("FirstPanel").style.display == "block") {
              dojo.byId("FirstPanel").style.display = "none";
              dojo.byId("NewSelect").style.display = "block";
          }

          else {
              dojo.byId("FirstPanel").style.display = "none";
              dojo.byId("NewSelect").style.display = "block";
          }
          
          codigo = cod;
          tb = new esri.toolbars.Draw(map);
          tb.on("draw-end", DrawResults);
          tb.activate(esri.toolbars.Draw.POLYGON);
      }

      function DrawResults(evt) {
          require([
            "esri/Color",
            "esri/graphic",
            "esri/graphicsUtils",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleFillSymbol",
            "esri/tasks/Geoprocessor",
            "esri/tasks/FeatureSet"
          ],
            function (Color, Graphic, graphicsUtils, SimpleLineSymbol, SimpleFillSymbol, Geoprocessor, FeatureSet) {

                timerID = setTimeout("fTimer()", 500);

                tb.deactivate();

                // add the drawn graphic to the map
                var geometry = evt.geometry;
                var symbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255]), 2),
                new Color([0, 0, 255, 0.5]));

                graphicarea = new Graphic(geometry, symbol);
                map.graphics.add(graphicarea);
                map.graphics.setOpacity(0.5);

                var features = [];
                features.push(graphicarea);
                var featureSet = new FeatureSet();
                featureSet.features = features;

                var e = dojo.byId("NumClases");
                numclases = parseInt(e.options[e.selectedIndex].value);

                if (codigo == 1) {
                    tiposcale = "habitats_FScale";
                    gp = new Geoprocessor("http://localhost:6080/arcgis/rest/services/PFM/GeoHabitatsFine/GPServer/GeoHabitas%20Fine%20Scale");
                    gp.setOutputSpatialReference({ wkid: 102100 });
                    var params = {
                        "Geoprocessing_Extension": featureSet,
                        "Number_of_classes": numclases
                    };
                    gp.submitJob(params, completeCallback, statusCallback);
                }

                else if (codigo == 2) {
                    tiposcale = "habitats_BScale";
                    gp = new Geoprocessor("http://localhost:6080/arcgis/rest/services/PFM/GeoHabitatsBroad/GPServer/GeoHabitats%20Broad%20Scale");
                    gp.setOutputSpatialReference({ wkid: 102100 });
                    var params = {
                        "Geoprocessing_Extension": featureSet,
                        "Number_of_classes": numclases
                    };
                    gp.submitJob(params, completeCallback, statusCallback);
                }

                function completeCallback(jobInfo) {

                    gp.getResultData(jobInfo.jobId, tiposcale, displayResult);
                }


                function statusCallback(jobInfo) {

                    console.log(jobInfo.jobStatus);
                }

                function displayResult(result, messages) {

                    ocultainformpanel();
                    map.graphics.clear();
                    console.log(result);
                    var features = result.value.features;
                    for (var f = 0, fl = features.length; f < fl; f++) {
                        var feature = features[f];
                        if (feature.attributes.gridcode == 1) {
                            var polySymbolRed = new SimpleFillSymbol();
                            polySymbolRed.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1));
                            polySymbolRed.setColor(new Color([255, 0, 0, 0.7]));
                            feature.setSymbol(polySymbolRed);
                        }
                        else if (feature.attributes.gridcode == 2) {
                            var polySymbolGreen = new SimpleFillSymbol();
                            polySymbolGreen.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1));
                            polySymbolGreen.setColor(new Color([0, 255, 0, 0.7]));
                            feature.setSymbol(polySymbolGreen);
                        }
                        else if (feature.attributes.gridcode == 3) {
                            var polySymbolBlue = new SimpleFillSymbol();
                            polySymbolBlue.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1));
                            polySymbolBlue.setColor(new Color([0, 0, 255, 0.7]));
                            feature.setSymbol(polySymbolBlue);
                        }
                        else if (feature.attributes.gridcode == 4) {
                            var polySymbolYellow = new SimpleFillSymbol();
                            polySymbolYellow.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1));
                            polySymbolYellow.setColor(new Color([253, 245, 12, 0.7]));
                            feature.setSymbol(polySymbolYellow);
                        }
                        else if (feature.attributes.gridcode == 5) {
                            var polySymbolPurple = new SimpleFillSymbol();
                            polySymbolPurple.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1));
                            polySymbolPurple.setColor(new Color([151, 33, 197, 0.7]));
                            feature.setSymbol(polySymbolPurple);
                        }
                        else if (feature.attributes.gridcode == 6) {
                            var polySymbolOrange = new SimpleFillSymbol();
                            polySymbolOrange.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1));
                            polySymbolOrange.setColor(new Color([253, 149, 12, 0.7]));
                            feature.setSymbol(polySymbolOrange);
                        }
                        map.graphics.add(feature);
                    }

                    // get the extent for the drive time polygon graphics and
                    // zoom to the extent of the drive time polygons
                    map.graphics.setOpacity(0.5);
                    map.setExtent(graphicsUtils.graphicsExtent(map.graphics.graphics), true);

                    if (dojo.byId("ExportButton").style.display == "block") {
                        dojo.byId("ExportButton").style.display = "none";
                    }

                    else {
                        dojo.byId("ExportButton").style.display = "none";
                        dojo.byId("ExportButton").style.display = "block";
                    }
                }

            });
        }

        //#endregion

      //#region New Select
      function OpenFirstPanel() {
          if (dojo.byId("FirstPanel").style.display == "none") {
              dojo.byId("FirstPanel").style.display = "block";
              dojo.byId("NewSelect").style.display = "none";
              dojo.byId("ExportButton").style.display = "none";
          }

          else {
              dojo.byId("FirstPanel").style.display = "block";
              dojo.byId("NewSelect").style.display = "none";
              dojo.byId("ExportButton").style.display = "none";
          }

          map.graphics.clear();
      }
      //#endregion

      //#region Export Panel
      function OpenExportPanel() {
          if (dojo.byId("ExportPanel").style.display == "none") {
              dojo.byId("ExportPanel").style.display = "block";
          }

          else {
              dojo.byId("ExportPanel").style.display = "none";
          }
      }
      //#endregion