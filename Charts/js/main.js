/// <reference path="jsapi_vsdoc10_v38.js" />

require([
      "esri/urlUtils",
      "esri/map",
      "esri/geometry/Extent",
      "esri/layers/FeatureLayer",
      "esri/arcgis/utils",
      "esri/tasks/query",
      "esri/toolbars/draw",
      "esri/geometry/webMercatorUtils",
      "dojo/dom",
      "dojo/dom-construct",
      "dojo/parser",
      "dojo/_base/array",
      "dojo/io-query",
      "dojo/_base/declare",
      "dijit/layout/AccordionContainer",
      "dijit/layout/BorderContainer",
      "dijit/layout/ContentPane",
      "dojo/domReady!"
    ],
      function (
        urlUtils, Map, Extent, FeatureLayer, utils, Query, Draw, webMercatorUtils, dom, domConstruct, parser, arrayUtils, ioquery, declare
      ) {
          parser.parse();

          //Codigo para activar la utilización de la página proxy
          esriConfig.defaults.io.proxyUrl = "../proxy.php";
          //esriConfig.defaults.io.proxyUrl = "../PHP/proxy.php";
          //urlUtils.addProxyRule({
          //    urlPrefix: "http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/",
          //    proxyUrl: "http://www.lmagudo.com/IOC/PHP/proxy.php"
          //});

          //#region Map and Layers

          //Variable con la extensión inicial del mapa 
          startExtent = new Extent(-40, -3, -4, 36, new esri.SpatialReference({ wkid: 4326 }));

          map = new Map("map", {
              extent: startExtent,
              center: [-16.4, 23.8],
              basemap: "oceans",
              logo: false
          });

          bioLayer = new FeatureLayer("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/Prueba_Biological_Index/MapServer/0", {
              outFields: ["Trofic_Index", "Biomass", "Richness", "Abundance"]
          });

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


      //#region Chart
      function drawpolygon() {
          tb = new esri.toolbars.Draw(map);
          tb.on("draw-end", DrawResults);
          tb.activate(esri.toolbars.Draw.POLYGON);
      }

      function DrawResults(evt) {
          require([
            "esri/Color",
            "esri/graphic",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleFillSymbol"
          ],
            function (Color, Graphic, SimpleLineSymbol, SimpleFillSymbol) {

              timerID = setTimeout("fTimer()", 500);

              tb.deactivate();

              if (dojo.byId("buttondraw").style.display == "block") {
                  dojo.byId("buttondraw").style.display = "none";
                  dojo.byId("buttonNewDraw").style.display = "block";
                  dojo.byId("getcsv").style.display = "block";
              }

              else {
                  dojo.byId("buttondraw").style.display = "none";
                  dojo.byId("buttonNewDraw").style.display = "block";
                  dojo.byId("getcsv").style.display = "block";
              }

              // add the drawn graphic to the map
              var geometry = evt.geometry;
              var symbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255]), 2),
                new Color([0, 0, 255, 0.5]));

              graphicarea = new Graphic(geometry, symbol);
              map.graphics.add(graphicarea);


              //#region Query
              var myquery = new esri.tasks.Query();
              myquery.geometry = geometry;

              bioLayer.queryFeatures(myquery, selectInDraw);

              //#endregion
          });
          
      }

      function selectInDraw(result) {

          var myfeats = result.features;
          var biomass = [];
          var abundance = [];
          var richness = [];
          var TroficIndex = [];

          for (var i = 0; i < myfeats.length; i++) {
              var feat = myfeats[i];
              biomass.push(feat.attributes.Biomass);
              abundance.push(feat.attributes.Abundance);
              richness.push(feat.attributes.Richness);
              TroficIndex.push(feat.attributes.Trofic_Index);
          }

          var final_biomass = 0;

          for (var i = 0; i < biomass.length; i++) {
              if (biomass[i] != null) {
                  final_biomass = final_biomass + biomass[i];
              }
          }

          final_biomass = (final_biomass / biomass.length) / 1000;
          console.log(final_biomass);

          var final_abundance = 0;

          for (var i = 0; i < abundance.length; i++) {
              if (abundance[i] != null) {
                  final_abundance = final_abundance + abundance[i];
              }
          }

          final_abundance = (final_abundance / abundance.length) / 1000;
          console.log(final_abundance);

          var final_richness = 0;

          for (var i = 0; i < richness.length; i++) {
              if (richness[i] != null) {
                  final_richness = final_richness + richness[i];
              }
          }

          final_richness = (final_richness / richness.length) / 10;
          console.log(final_richness);

          var final_TroficIndex = 0;

          for (var i = 0; i < TroficIndex.length; i++) {
              if (TroficIndex[i] != null) {
                  final_TroficIndex = final_TroficIndex + TroficIndex[i];
              }
          }

          final_TroficIndex = (final_TroficIndex / TroficIndex.length);
          console.log(final_TroficIndex);

          dojo.byId("Abundance").innerHTML = final_abundance.toString();
          dojo.byId("Richness").innerHTML = final_richness.toString();
          dojo.byId("Biomass").innerHTML = final_biomass.toString();
          dojo.byId("TroficIndex").innerHTML = final_TroficIndex.toString();

          showchart();
      }
           

      function newpolygon() {
          if (dojo.byId("buttondraw").style.display == "none") {
              dojo.byId("buttondraw").style.display = "block";
              dojo.byId("buttonNewDraw").style.display = "none";
              dojo.byId("getcsv").style.display = "none";
          }

          else {
              dojo.byId("buttondraw").style.display = "block";
              dojo.byId("buttonNewDraw").style.display = "none";
              dojo.byId("getcsv").style.display = "none";
          }

          console.log(mychart);
          if (mychart != null) {
              $('#container').highcharts().destroy();
          }

          dojo.byId("container").style.display = "none";

          mychart = null;

          map.graphics.remove(graphicarea);

      }

      //#endregion
            
      //#region Profile

      function profilePanel() {
          if (dojo.byId("PanelProfile").style.display == "none") {
              dojo.byId("PanelProfile").style.display = "block";
              dojo.byId("PanelCharts").style.display = "none";
          }

          else {
              dojo.byId("PanelProfile").style.display = "none";
              dojo.byId("PanelCharts").style.display = "none";
          }

      }

      function Parameter_selected() {
          console.log("hola");
          //Igualamos a la variable value_layer el valor de la capa seleccionado por el usuario
          var e = dojo.byId("Parameter_profile");
          value_layer = e.options[e.selectedIndex].value;

          var f = dojo.byId("Month_profile");
          f.disabled = false;

          //Desabilitamos el combo años para y le sugerimos que vuelvan a elegir un mes poniendo el valor del combo mes en "Choose a month"
          var s = dojo.byId("year_default");
          s.selected = "selected";

          var j = dojo.byId("Year_profile");
          j.disabled = true;

          var k = dojo.byId("month_default");
          k.selected = "selected";
      }

      function month_selected() {          

          var e = dojo.byId("Year_profile");
          e.disabled = false;
          dojo.byId("drawProfile").disabled = false;
      }

      function drawprofile() {
          tb = new esri.toolbars.Draw(map);
          tb.on("draw-end", DrawResults2);
          tb.activate(esri.toolbars.Draw.POLYLINE);
      }


      function DrawResults2(evt) {
          require([
            "esri/Color",
            "esri/graphic",
            "esri/symbols/SimpleLineSymbol",
            "esri/tasks/Geoprocessor",
            "esri/geometry/geodesicUtils",
            "esri/units",
            "esri/tasks/FeatureSet"
          ],
            function (Color, Graphic, SimpleLineSymbol, Geoprocessor, geodesicUtils, Units, FeatureSet) {

                timerID = setTimeout("fTimer()", 500);

                tb.deactivate();
                //Cierro el panel de profile
                if (dojo.byId("PanelProfile").style.display == "block") {
                    dojo.byId("PanelProfile").style.display = "none";
                    dojo.byId("PanelCharts").style.display = "block";
                }

                else {
                    dojo.byId("PanelProfile").style.display = "block";
                    dojo.byId("PanelCharts").style.display = "block";
                }

                if (dojo.byId("buttonProfile").style.display == "inline") {
                    dojo.byId("buttonProfile").style.display = "none";
                    dojo.byId("buttonNewProfile").style.display = "block";
                }

                else {
                    dojo.byId("buttonProfile").style.display = "none";
                    dojo.byId("buttonNewProfile").style.display = "block";
                }

                // Añadimos el gráfico dibujado al mapa
                var geometry = evt.geometry;
                var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255]), 2);

                graphicline = new Graphic(geometry, symbol);
                map.graphics.add(graphicline);

                //Instanciamos el objeto de geoprocesamiento
                gp = new Geoprocessor("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/StackProfile/GPServer/Stack%20Profile");

                //Creamos los parámetros para añadirlos al servicio de geoprocesamiento
                var features = [];
                features.push(graphicline);
                var featureSet = new FeatureSet();
                featureSet.features = features;

                var params = {
                    "in_line_features": featureSet
                };
                gp.submitJob(params, gpfinish);
                
            });

        }

        function gpfinish(results, messages) {
            gp.getResultData(results.jobId, "out_table", gpresult);
            
        }

        function gpresult(results) {
            console.log(results);
            console.log(results.value.features.length);
            arrayDistaciaZ = [];
            if (results.value.features[0]) {
                var i = 0;
                while (i < results.value.features.length) {
                    arrayDistaciaZ.push({ "Distancia": results.value.features[i].attributes.FIRST_DIST, "Altura": results.value.features[i].attributes.FIRST_Z });
                    i++
                }

                var arrayParaPerfil = {
                    "symbol": "Perfil",
                    "datos": arrayDistaciaZ
                };
                
                showProfile(arrayParaPerfil);
                return arrayParaPerfil;
            }

        }        

        function newprofile() {
            if (dojo.byId("buttonProfile").style.display == "none") {
                dojo.byId("buttonProfile").style.display = "inline";
                dojo.byId("buttonNewProfile").style.display = "none";
            }

            else {
                dojo.byId("buttonProfile").style.display = "inline";
                dojo.byId("buttonNewProfile").style.display = "none";
            }

            if (dojo.byId("PanelProfile").style.display == "none") {
                dojo.byId("PanelProfile").style.display = "block";
                dojo.byId("PanelCharts").style.display = "none";
            }

            else {
                dojo.byId("PanelProfile").style.display = "none";
                dojo.byId("PanelCharts").style.display = "none";
            }

            $('#container2').highcharts().destroy();

            dojo.byId("container2").style.display = "none";

            mychart2 = null;

            map.graphics.remove(graphicline);
        }
        //#endregion

      //#region Time Serie
        function drawTimeSeries() {
            console.log("hola");
            tb = new esri.toolbars.Draw(map);
            tb.on("draw-end", DrawResults3);
            tb.activate(esri.toolbars.Draw.POINT);
        }


        function DrawResults3(evt) {
            require([
            "esri/Color",
            "esri/graphic",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleMarkerSymbol"
          ],
            function (Color, Graphic, SimpleLineSymbol, SimpleMarkerSymbol) {

                timerID = setTimeout("fTimer()", 500);
                
                tb.deactivate();

                if (dojo.byId("buttonTimeSerie").style.display == "block") {
                    dojo.byId("buttonTimeSerie").style.display = "none";
                    dojo.byId("buttonNewTimeSerie").style.display = "block";
                }

                else {
                    dojo.byId("buttonTimeSerie").style.display = "none";
                    dojo.byId("buttonNewTimeSerie").style.display = "block";
                }

                // add the drawn graphic to the map
                var geometry = evt.geometry;

                var symbol = new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_CIRCLE,
                  12,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_NULL,
                    new Color([0, 0, 255, 0.9]),
                    1
                  ),
                  new Color([0, 0, 255, 0.5])
                );

                graphicpoint = new Graphic(geometry, symbol);
                map.graphics.add(graphicpoint);

                showTimeSeries(geometry);

            });

        }

        function newTimeSeries() {
            if (dojo.byId("buttonTimeSerie").style.display == "none") {
                dojo.byId("buttonTimeSerie").style.display = "block";
                dojo.byId("buttonNewTimeSerie").style.display = "none";
            }

            else {
                dojo.byId("buttonTimeSerie").style.display = "block";
                dojo.byId("buttonNewTimeSerie").style.display = "none";
            }

            $('#container3').highcharts().destroy();

            dojo.byId("container3").style.display = "none";

            mychart3 = null;

            map.graphics.remove(graphicpoint);
        }
        //#endregion


     //#region Print Results

        function PrintResults() {

            dojo.byId("PanelCharts").style.display = "none";
            $("div#body").printArea();
            dojo.byId("PanelCharts").style.display = "block";
        
        }

        //#endregion