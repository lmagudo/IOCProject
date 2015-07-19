require([
      "esri/map",
      "esri/dijit/HomeButton",
      "dojo/domReady!"
    ], function (
      Map, HomeButton
    ) {

        var map = new Map("map", {
            center: [-56.049, 38.485],
            zoom: 3,
            basemap: "streets"
        });

        var home = new HomeButton({
            map: map
        }, "HomeButton");
        home.startup();

    });
