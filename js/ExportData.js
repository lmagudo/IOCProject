//Funcionalidad para exportar los resultados

//Función que abre y cierra el panel donde se selecciona el formato de salida y se lanza el proceso de exportación
function OpenExportPanel() {
    if (dojo.byId("ExportPanel").style.display == "none") {
        dojo.byId("ExportPanel").style.display = "block";
    }

    else {
        dojo.byId("ExportPanel").style.display = "none";
    }
    
}

//Función con el proceso de exportar datos
function ExportData() {

    //Importamos recursos de dojo
    require([
        "dojo/dom",
        "dojo/dom-style"
    ], function (dom, domStyle) {

        // Keep a reference to the loading icon DOM node.
        var loading = dom.byId("informpanel");

        //Iniciamos el servicio de geoprocesamiento para exportar los datos
        gp = new esri.tasks.Geoprocessor("http://barreto.md.ieo.es/arcgis/rest/services/UNESCO/ExtractDataTask/GPServer/ExtractDataTask");
        gp.setOutSpatialReference({ wkid: 4326 });

        //Almacenamos en un FeatureSet los gráficos de la capa gráfica del mapa que tiene las entidades que interesan al usuario
        var featureSet = new esri.tasks.FeatureSet();
        var features = [];
        for (var i = 1; i < mygraphiclayer.graphics.length; i++) {
            features.push(mygraphiclayer.graphics[i]);
        }
        //features.push(map.graphics.graphics[0]);
        featureSet.features = features;
        console.log(featureSet);

        //Almacenamos en una variable la selección del usuario con el formato de salida de los datos
        var formatSelect = dojo.byId("formatBox");
        var value_format = formatSelect.options[formatSelect.selectedIndex].value;

        //almacenamos los valores que vamos a pasar como parámetros al servicio de geoprocesamiento
        var params = {
            "ExportCCLME_shp": featureSet,
            "Feature_Format": value_format
        };
        console.log(params);
        //Cerramos el panel de exportación y enseñamos el gif de loading
        dojo.byId("ExportPanel").style.display = "none";
        domStyle.set(loading, "display", "inline-block");

        //Ejecutamos la tarea de geoprocesamiento con los valores de los parámetros seleccionamos anteriormente
        gp.submitJob(params, completeCallback, statusCallback, function (error) {
            alert(error);
            domStyle.set(loading, "display", "none");
        });

        //función que se ejecuta cuando se ha completado el geoprocesamiento
        function completeCallback(jobInfo) {
            if (jobInfo.jobStatus !== "esriJobFailed") {
                //Definimos la función que va a ser el manejador del resultado del geoprocesamiento. La función se llama downloadFile
                gp.getResultData(jobInfo.jobId, "Output_Zip_File", downloadFile);
            }
        }

        //Función que controla el estado del geoprocesamiento, si hay un error nos avisa
        function statusCallback(jobInfo) {
            var status = jobInfo.jobStatus;
            if (status === "esriJobFailed") {
                alert(status);
                domStyle.set("informpanel", "display", "none");
            }
            else if (status === "esriJobSucceeded") {
                domStyle.set("informpanel", "display", "none");
            }
        }

        //Función manejadora del resultado del geoprocesamiento. Como parámetro de entrada tiene el fichero resultado del geoprocesamiento
        function downloadFile(outputFile) {
            //map.graphics.clear();
            //Cojemos la url del fichero de salida y abrimos una nueva ventana del navegador, de esta forma el usuario se lo descarga
            var theurl = outputFile.value.url;
            window.location = theurl;
        }
    });

}