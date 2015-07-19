var map;

require([
      "esri/map",
      "esri/geometry/Extent",
      "esri/arcgis/utils",
      "esri/dijit/Legend",
      "esri/geometry/webMercatorUtils",
      "esri/layers/ArcGISTiledMapServiceLayer",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "esri/layers/DynamicMapServiceLayer",
      "esri/dijit/LayerSwipe",
      "dojo/on",
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
        Map, Extent, utils, Legend, webMercatorUtils, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, DynamicMapServiceLayer, LayerSwipe, on, dom, domConstruct,
        parser, arrayUtils, ioquery, declare
      ) {
          var legend;
          parser.parse();

          legendLayers = [];

          //#region Map
          //Variable con la extensión inicial del mapa 
          startExtent = new Extent(-40, -3, -4, 36, new esri.SpatialReference({ wkid: 4326 }));

          map = new Map("map", {
              extent: startExtent,
              center: [-16.4, 23.8],
              basemap: "oceans",
              logo: false,
              maxZoom: 12,
              minZoom: 5
          });


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


          //#endregion

         

          ocultainformpanel();

          //#region wmsLayers
          declare("my.nexradWMSLayer", DynamicMapServiceLayer, {
              constructor: function () {
                  console.log(layer);
                  this.initialExtent = this.fullExtent = new Extent({
                      xmin: -180,
                      ymin: -90,
                      xmax: 180,
                      ymax: 90,
                      spatialReference: {
                          wkid: 4326
                      }
                  });
                  this.spatialReference = new esri.SpatialReference({
                      wkid: 4326
                  });
                  this.loaded = true;
                  this.onLoad(this);
              },

              getImageUrl: function (extent, width, height, callback) {
                  var mp = webMercatorUtils.webMercatorToGeographic(extent);
                  var params = {
                      request: "GetMap",
                      transparent: true,
                      format: "image/png",
                      transparent: "true",
                      bgcolor: "ffffff",
                      version: "1.3.0",
                      layers: layer,
                      styles: "default,default",
                      exceptions: "application/vnd.ogc.se_xml",
                      //changing values
                      bbox: mp.xmin + "," + mp.ymin + "," + mp.xmax + "," + mp.ymax,
                      srs: "EPSG:" + mp.spatialReference.wkid,
                      width: width,
                      height: height
                  };

                  console.log(urlwms + ioquery.objectToQuery(params));
                  callback(urlwms + ioquery.objectToQuery(params));
              }
          })


          declare("my.nexradWMSLayer1", DynamicMapServiceLayer, {
              constructor: function () {
                  console.log(layer1);
                  this.initialExtent = this.fullExtent = new Extent({
                      xmin: -180,
                      ymin: -90,
                      xmax: 180,
                      ymax: 90,
                      spatialReference: {
                          wkid: 4326
                      }
                  });
                  this.spatialReference = new esri.SpatialReference({
                      wkid: 4326
                  });
                  this.loaded = true;
                  this.onLoad(this);
              },

              getImageUrl: function (extent, width, height, callback) {
                  var mp = webMercatorUtils.webMercatorToGeographic(extent);
                  var params = {
                      request: "GetMap",
                      transparent: true,
                      format: "image/png",
                      transparent: "true",
                      bgcolor: "ffffff",
                      version: "1.3.0",
                      layers: layer1,
                      styles: "default,default",
                      exceptions: "application/vnd.ogc.se_xml",
                      //changing values
                      bbox: mp.xmin + "," + mp.ymin + "," + mp.xmax + "," + mp.ymax,
                      srs: "EPSG:" + mp.spatialReference.wkid,
                      width: width,
                      height: height
                  };

                  console.log(urlwms + ioquery.objectToQuery(params));
                  callback(urlwms + ioquery.objectToQuery(params));
              }
          })

          declare("my.nexradWMSLayer2", DynamicMapServiceLayer, {
              constructor: function () {
                  console.log(layer2);
                  this.initialExtent = this.fullExtent = new Extent({
                      xmin: -180,
                      ymin: -90,
                      xmax: 180,
                      ymax: 90,
                      spatialReference: {
                          wkid: 4326
                      }
                  });
                  this.spatialReference = new esri.SpatialReference({
                      wkid: 4326
                  });
                  this.loaded = true;
                  this.onLoad(this);
              },

              getImageUrl: function (extent, width, height, callback) {
                  var mp = webMercatorUtils.webMercatorToGeographic(extent);
                  console.log(mp);
                  var params = {
                      request: "GetMap",
                      transparent: true,
                      format: "image/png",
                      transparent: "true",
                      bgcolor: "ffffff",
                      version: "1.3.0",
                      layers: layer2,
                      styles: "default,default",
                      exceptions: "application/vnd.ogc.se_xml",
                      //changing values
                      bbox: mp.xmin + "," + mp.ymin + "," + mp.xmax + "," + mp.ymax,
                      srs: "EPSG:" + mp.spatialReference.wkid,
                      width: width,
                      height: height
                  };

                  console.log(urlwms + ioquery.objectToQuery(params));
                  callback(urlwms + ioquery.objectToQuery(params));
              }
          })

          //#endregion

          
      });

      function closeinformpanel() {
          console.log(document.getElementById("informpanel").style.display);
          document.getElementById("informpanel").style.display = "none";
          document.getElementById("cargando").style.display = "none";
          cargado = true;
          clearTimeout(timerID);
      }

//#region First Panel

      function Showonelayer() {
          if (document.getElementById("SelectonelayerPanel").style.display == "none") {
              document.getElementById("SelectonelayerPanel").style.display = "block";
              document.getElementById("FirstPanel").style.display = "none";
          }
          else {
              document.getElementById("SelectonelayerPanel").style.display = "block";
              document.getElementById("FirstPanel").style.display = "none";
          }
      }

      function Showcomparativelayers() {
          if (document.getElementById("PanelSelect").style.display == "none") {
              console.log("hola estoy aquí");
              document.getElementById("PanelSelect").style.display = "block";
              document.getElementById("FirstPanel").style.display = "none";
              console.log(document.getElementById("PanelSelect").style.display = "block");
          }
          else {
              document.getElementById("PanelSelect").style.display = "block";
              document.getElementById("FirstPanel").style.display = "none";
          }
      }

//#endregion

//#region Select One Layer

      function parameter_selected_one() {
          //Activo el combobox de mes
          var a = dojo.byId("Select7");
          a.disabled = false;

          //Desactivo el combobox de año
          var d = dojo.byId("Select8");
          d.disabled = true;

          var c = dojo.byId("Select6");
          if (c.options[c.selectedIndex].value == 1) {
              urlwms = "http://gmis.jrc.ec.europa.eu/webservices/4km/wms/pathfinder?";
          }

          else if (c.options[c.selectedIndex].value == 2) {
              urlwms = "http://gmis.jrc.ec.europa.eu/webservices/4km/wms/modisa?";
          }
      }


      function layer_selected() {
          //Activo el combobox
          var e = dojo.byId("Select8");
          e.disabled = false;

          //Borrar la lista
          var selectParentNode = e.parentNode;
          var newSelectObj = e.cloneNode(false); // Make a shallow copy
          selectParentNode.replaceChild(newSelectObj, e);
          //Añado la opción de mensaje al usuario para informarle que seleccione algún elemento
          var choosoption = document.createElement("option");
          choosoption.text = "Choose a Year";
          choosoption.value = "";
          newSelectObj.options.add(choosoption);

          var c = dojo.byId("Select6");
          if (c.options[c.selectedIndex].value == 1) {
              for (var i = 1981; i < 2010; i++) {
                  var newoption = document.createElement("option");
                  newoption.text = i.toString();
                  newoption.value = i.toString();
                  newSelectObj.options.add(newoption);
              }
          }

          else if (c.options[c.selectedIndex].value == 2) {
              for (var i = 2003; i < 2013; i++) {
                  var newoption = document.createElement("option");
                  newoption.text = i.toString();
                  newoption.value = i.toString();
                  newSelectObj.options.add(newoption);
              }
          }
      }

      function SelectOneLayer() {
          require([
           "dojo/on"
          ],
         function (on) {
             if (dojo.byId("SelectonelayerPanel").style.display == "none") {
                 dojo.byId("SelectonelayerPanel").style.display = "block";
             }

             else {
                 dojo.byId("SelectonelayerPanel").style.display = "none";
             }

             if (dojo.byId("NewSelect").style.display == "none") {
                 dojo.byId("NewSelect").style.display = "block";
             }

             else {
                 dojo.byId("NewSelect").style.display = "none";
             }

             //Abro el Informpanel para mostrar que está cargando
             console.log(timerID = setTimeout("fTimer()", 500));
             //timerID = setTimeout("fTimer()", 500);

             var combo1 = dojo.byId("Select7");
             var meslayer = combo1.options[combo1.selectedIndex].value;
             var combo2 = dojo.byId("Select8");
             var añolayer = combo2.options[combo2.selectedIndex].value;

             var c = dojo.byId("Select6");
             if (c.options[c.selectedIndex].value == 1) {
                 layer = "GMIS_P_SST_" + meslayer + "_" + añolayer;
             }

             else if (c.options[c.selectedIndex].value == 2) {
                 layer = "GMIS_A_CHLA_" + meslayer + "_" + añolayer;
             }

             console.log(layer);

             var wmsLayer = new my.nexradWMSLayer();

             //map.addLayer(wmsLayer1);
             //map.addLayer(wmsLayer2);
             map.addLayers([wmsLayer]);

             console.log(closeinformpanel());

             cargarLegendaOneLayer();


         });

      }

      function cargarLegendaOneLayer() {

          var c = dojo.byId("Select6");
          var imglegend = dojo.byId("imaglegend1");
          var legendDiv3 = dojo.byId("legendDiv3");
          var MetadataDiv = dojo.byId("MetadataDiv");
          var legendtitle = dojo.byId("legendtitle1");
          var Units = dojo.byId("Units1");

          var combo1 = dojo.byId("Select7");
          var meslayer = combo1.options[combo1.selectedIndex].value;
          var combo2 = dojo.byId("Select8");
          var añolayer = combo2.options[combo2.selectedIndex].value;

          if (c.options[c.selectedIndex].value == 1) {
              imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_sst.PNG";
              document.getElementById('legendtitle1').innerHTML = 'Sea Surface Temperature PATHFINDER';
              document.getElementById('Units1').innerHTML = 'Units:           ºC';
              document.getElementById('metadata1').innerHTML = "Sea surface temperature (SST in degree-C): Sea surface temperature is the temperature of the water close to the sea surface. SST is a standard product from satellite-based thermal infra-red sensors, and optical sensors complemented with infrared bands.";
              document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>Pathfinder Data Set (Jan. 1985 - Dec. 2009) - The data is a re-analysis of the NOAA/NASA Advanced Very High Resolution Radiometer (AVHRR) data stream conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS) and the NOAA National Oceanographic Data Center (NODC). It consists of 4km monthly SST (in °C) extracted from the version 5.2 AVHRR Pathfinder project (' + '<a target="_blank" href="' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '">' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '</a>' + ').<br><br><b>Reference:</b><br>Casey, K.S., T.B. Brandon, P. Cornillon, and R. Evans (2010). ' + '"The Past, Present and Future of the AVHRR Pathfinder SST Program, in Oceanography from Space: Revisited", eds. V. Barale, J.F.R. Gower, and L. Alberotanza, Springer. DOI: 10.1007/978-90-481-8681-5_16.';
              document.getElementById('InfoLayer').innerHTML = "<b>Info Layer:</b><br>Month: " + meslayer + "   " + "Year: " + añolayer;
              legendDiv3.style.display = "block";
              MetadataDiv.style.display = "block";
          }

          else if (c.options[c.selectedIndex].value == 2) {
              imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_Chl_a.PNG";
              document.getElementById('legendtitle1').innerHTML = 'Chlorophyll Concentration MODIS-A';
              document.getElementById('Units1').innerHTML = 'Units:           mg.m^-3';
              document.getElementById('metadata1').innerHTML = "Algal biomass (chlorophyll concentration, Chla in mg.m-3): Chlorophyll is a photosynthetic pigment commonly present in all phytoplankton species. It is used as a proxy for phytoplankton biomass. Chlorophyll concentration is a standard product from satellite-based optical sensors, usually retrieved from empirical algorithms using reflectance ratios at two or more wavebands.";
              document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>MODIS-Aqua data set (Jul. 2002 - Apr. 2006) - This data set consists of 4km monthly standard 11µm Non-Linear SST (NLSST) algorithm developed by conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS). This data is equivalent to the standard NASA products available from ' + '<a target="_blank" href="' + 'http://oceancolor.gsfc.nasa.gov/' + '">' + 'http://oceancolor.gsfc.nasa.gov/' + '</a>' + '<br><br><b>Reference:</b><br>Brown, O.B., and P.J. Minnett, 1999, ' + '"MODIS Infrared Sea Surface Temperature Algorithm Theoretical Basis Document", Ver 2.0, ' + '<a target="_blank" href="' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '">' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '</a>';
              document.getElementById('InfoLayer').innerHTML = "<b>Info Layer:</b><br>Month: " + meslayer + "   " + "Year: " + añolayer;
              legendDiv3.style.display = "block";
              MetadataDiv.style.display = "block";
          }

      }

//#endregion


//#region Comparative Layers

      function parameter_selected() {
          //Activo los combobox de mes
          var a = dojo.byId("Select1");
          var b = dojo.byId("Select3");
          a.disabled = false;
          b.disabled = false;

          //Desactivo los combobox de año
          var d = dojo.byId("Select2");
          var e = dojo.byId("Select4");
          d.disabled = true;
          e.disabled = true;

          var c = dojo.byId("Select5");
          if (c.options[c.selectedIndex].value == 1) {
              urlwms = "http://gmis.jrc.ec.europa.eu/webservices/4km/wms/pathfinder?";
          }

          else if (c.options[c.selectedIndex].value == 2) {
              urlwms = "http://gmis.jrc.ec.europa.eu/webservices/4km/wms/modisa?";
          }
      }

      //Función que maneja el evento de cambiar selección en combobox de mes de la layer 1
      function layer1_selected() {

          //Activo el combobox
          var e = dojo.byId("Select2");
          e.disabled = false;

          //Borrar la lista
          var selectParentNode = e.parentNode;
          var newSelectObj = e.cloneNode(false); // Make a shallow copy
          selectParentNode.replaceChild(newSelectObj, e);
          //Añado la opción de mensaje al usuario para informarle que seleccione algún elemento
          var choosoption = document.createElement("option");
          choosoption.text = "Choose a Year";
          choosoption.value = "";
          newSelectObj.options.add(choosoption);

          var c = dojo.byId("Select5");
          if (c.options[c.selectedIndex].value == 1) {
              for (var i = 1981; i < 2010; i++) {
                  var newoption = document.createElement("option");
                  newoption.text = i.toString();
                  newoption.value = i.toString();
                  newSelectObj.options.add(newoption);
              }
          }

          else if (c.options[c.selectedIndex].value == 2) {
              for (var i = 2003; i < 2013; i++) {
                  var newoption = document.createElement("option");
                  newoption.text = i.toString();
                  newoption.value = i.toString();
                  newSelectObj.options.add(newoption);
              }
          }

          

      }

      //Función que maneja el evento de cambiar selección en combobox de mes de la layer 2
      function layer2_selected() {

          //Activo el combobox
          var e = dojo.byId("Select4");
          e.disabled = false;

          //Borrar la lista
          var selectParentNode = e.parentNode;
          var newSelectObj = e.cloneNode(false); // Make a shallow copy
          selectParentNode.replaceChild(newSelectObj, e);
          //Añado la opción de mensaje al usuario para informarle que seleccione algún elemento
          var choosoption = document.createElement("option");
          choosoption.text = "Choose a Year";
          choosoption.value = "";
          newSelectObj.options.add(choosoption);

          var c = dojo.byId("Select5");
          if (c.options[c.selectedIndex].value == 1) {
              for (var i = 1981; i < 2010; i++) {
                  var newoption = document.createElement("option");
                  newoption.text = i.toString();
                  newoption.value = i.toString();
                  newSelectObj.options.add(newoption);
              }
          }

          else if (c.options[c.selectedIndex].value == 2) {
              for (var i = 2003; i < 2013; i++) {
                  var newoption = document.createElement("option");
                  newoption.text = i.toString();
                  newoption.value = i.toString();
                  newSelectObj.options.add(newoption);
              }
          }

      }


      function SelectLayers() {

          require([
            "dojo/on"
          ],
          function (on) {
              if (dojo.byId("PanelSelect").style.display == "none") {
                  dojo.byId("PanelSelect").style.display = "block";
              }

              else {
                  dojo.byId("PanelSelect").style.display = "none";
              }

              if (dojo.byId("NewSelect").style.display == "none") {
                  dojo.byId("NewSelect").style.display = "block";
              }

              else {
                  dojo.byId("NewSelect").style.display = "none";
              }

              //Abro el Informpanel para mostrar que está cargando
              console.log(timerID = setTimeout("fTimer()", 500));
              //timerID = setTimeout("fTimer()", 500);

              var combo1 = dojo.byId("Select1");
              var meslayer1 = combo1.options[combo1.selectedIndex].value;
              var combo2 = dojo.byId("Select2");
              var añolayer1 = combo2.options[combo2.selectedIndex].value;

              var combo3 = dojo.byId("Select3");
              var meslayer2 = combo3.options[combo3.selectedIndex].value;
              var combo4 = dojo.byId("Select4");
              var añolayer2 = combo4.options[combo4.selectedIndex].value;

              var c = dojo.byId("Select5");
              if (c.options[c.selectedIndex].value == 1) {
                  layer1 = "GMIS_P_SST_" + meslayer1 + "_" + añolayer1;
                  layer2 = "GMIS_P_SST_" + meslayer2 + "_" + añolayer2;
              }

              else if (c.options[c.selectedIndex].value == 2) {
                  layer1 = "GMIS_A_CHLA_" + meslayer1 + "_" + añolayer1;
                  layer2 = "GMIS_A_CHLA_" + meslayer2 + "_" + añolayer2;
              }

              console.log(layer1, layer2);

              var wmsLayer1 = new my.nexradWMSLayer1();

              var wmsLayer2 = new my.nexradWMSLayer2();

              //map.addLayer(wmsLayer1);
              //map.addLayer(wmsLayer2);
              map.addLayers([wmsLayer1, wmsLayer2]);

              console.log(closeinformpanel());

              cargarLegenda();


          });
          
      }


    function cargarLegenda() {

        var c = dojo.byId("Select5");
        var imglegend = dojo.byId("imaglegend");
        var legendDiv2 = dojo.byId("legendDiv2");
        var MetadataDiv = dojo.byId("MetadataDiv");
        var legendtitle = dojo.byId("legendtitle");
        var Units = dojo.byId("Units");

        var combo1 = dojo.byId("Select1");
        var meslayer1 = combo1.options[combo1.selectedIndex].value;
        var combo2 = dojo.byId("Select2");
        var añolayer1 = combo2.options[combo2.selectedIndex].value;

        var combo3 = dojo.byId("Select3");
        var meslayer2 = combo3.options[combo3.selectedIndex].value;
        var combo4 = dojo.byId("Select4");
        var añolayer2 = combo4.options[combo4.selectedIndex].value;

        if (c.options[c.selectedIndex].value == 1) {
            imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_sst.PNG";
            document.getElementById('legendtitle').innerHTML = 'Sea Surface Temperature PATHFINDER';
            document.getElementById('Units').innerHTML = 'Units:           ºC';
            document.getElementById('metadata1').innerHTML = "Sea surface temperature (SST in degree-C): Sea surface temperature is the temperature of the water close to the sea surface. SST is a standard product from satellite-based thermal infra-red sensors, and optical sensors complemented with infrared bands.";
            document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>Pathfinder Data Set (Jan. 1985 - Dec. 2009) - The data is a re-analysis of the NOAA/NASA Advanced Very High Resolution Radiometer (AVHRR) data stream conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS) and the NOAA National Oceanographic Data Center (NODC). It consists of 4km monthly SST (in °C) extracted from the version 5.2 AVHRR Pathfinder project (' + '<a target="_blank" href="' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '">' + 'http://www.nodc.noaa.gov/SatelliteData/pathfinder4km/' + '</a>' + ').<br><br><b>Reference:</b><br>Casey, K.S., T.B. Brandon, P. Cornillon, and R. Evans (2010). ' + '"The Past, Present and Future of the AVHRR Pathfinder SST Program, in Oceanography from Space: Revisited", eds. V. Barale, J.F.R. Gower, and L. Alberotanza, Springer. DOI: 10.1007/978-90-481-8681-5_16.';
            document.getElementById('LeftInfoLayer').innerHTML = "<b>Left Layer:</b><br>Month: " + meslayer2 + "Year: " + añolayer2;
            document.getElementById('RightInfoLayer').innerHTML = "<b>Right Layer:</b><br>Month: " + meslayer1 + "Year: " + añolayer1;
            legendDiv2.style.display = "block";
            MetadataDiv.style.display = "block";
        }

        else if (c.options[c.selectedIndex].value == 2) {
            imglegend.src = "http://gmis.jrc.ec.europa.eu/mapserver/images/legend_Chl_a.PNG";
            document.getElementById('legendtitle').innerHTML = 'Chlorophyll Concentration MODIS-A';
            document.getElementById('Units').innerHTML = 'Units:           mg.m^-3';
            document.getElementById('metadata1').innerHTML = "Algal biomass (chlorophyll concentration, Chla in mg.m-3): Chlorophyll is a photosynthetic pigment commonly present in all phytoplankton species. It is used as a proxy for phytoplankton biomass. Chlorophyll concentration is a standard product from satellite-based optical sensors, usually retrieved from empirical algorithms using reflectance ratios at two or more wavebands.";
            document.getElementById('metadata2').innerHTML = '<b>Satellite:</b><br>MODIS-Aqua data set (Jul. 2002 - Apr. 2006) - This data set consists of 4km monthly standard 11µm Non-Linear SST (NLSST) algorithm developed by conducted by the University of Miami' + "'s " + 'Rosenstiel School of Marine and Atmospheric Science (RSMAS). This data is equivalent to the standard NASA products available from ' + '<a target="_blank" href="' + 'http://oceancolor.gsfc.nasa.gov/' + '">' + 'http://oceancolor.gsfc.nasa.gov/' + '</a>' + '<br><br><b>Reference:</b><br>Brown, O.B., and P.J. Minnett, 1999, ' + '"MODIS Infrared Sea Surface Temperature Algorithm Theoretical Basis Document", Ver 2.0, ' + '<a target="_blank" href="' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '">' + 'http://modis.gsfc.nasa.gov/data/atbd/atbd_mod25.pdf' + '</a>';
            document.getElementById('LeftInfoLayer').innerHTML = "<b>Left Layer:</b><br>Month: " + meslayer2 + "   " + "Year: " + añolayer2;
            document.getElementById('RightInfoLayer').innerHTML = "<b>Right Layer:</b><br>Month: " + meslayer1 + "   " + "Year: " + añolayer1;
            legendDiv2.style.display = "block";
            MetadataDiv.style.display = "block";
          }
        
        var layerIni;
        var legendLayers = [];
        var primera = false;
        if (legend != null) {
            primera = true;
        }

        for (var j = 1; j < map.layerIds.length; j++) {
            var capa = map.getLayer(map.layerIds[j]);
            if (layerIni == null)
                layerIni = capa;
            legendLayers.push({ layer: capa, title: capa.id });
        }

        if (!primera) {
            legend = new esri.dijit.Legend({
                map: map,
                layerInfos: legendLayers,
                autoUpdate: true
            }, "legendDiv");
            //legend.startup();
        }

        else {
            legend.layerInfos = legendLayers;
            //legend.refresh();
            dojo.byId("swipeDiv").style.display = "block";
        }


        var arraylayers = map.layerIds;
        var layerswipe = arraylayers[2].toString();

        if (!primera) {
            swipeWidget = new esri.dijit.LayerSwipe({
                type: "vertical",  //Try switching to "scope" or "horizontal"
                map: map,
                layers: [layerswipe]
            }, "swipeDiv");
            swipeWidget.startup();
        }

        else {
            swipeWidget.layers = [layerswipe];
        }
        
    }

//#endregion

 function OpenSelectPanel() {

//     if (dojo.byId("PanelSelect").style.display == "none") {
//         dojo.byId("PanelSelect").style.display = "block";
//     }

//     else {
//         dojo.byId("PanelSelect").style.display = "none";
//     }

//     if (dojo.byId("NewSelect").style.display == "none") {
//         dojo.byId("NewSelect").style.display = "block";
//     }

//     else {
//         dojo.byId("NewSelect").style.display = "none";
//     }
//     
//     map.removeAllLayers();
//     swipeWidget.layers = [];
//     dojo.byId("swipeDiv").style.display = "none";
//     legend.layers = [];
//     legend.layerInfos = [];
//     legend.refresh();

     document.location.reload(true);

     //map.setBasemap("oceans");
}