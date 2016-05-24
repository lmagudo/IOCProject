//<![CDATA[

PropiedadesMapa.numeroPuntos = 1;
PropiedadesMapa.textoCargando = "Loading";
PropiedadesMapa.maxPuntos = 3;
PropiedadesMapa.timerID = 0;
PropiedadesMapa.cargado = false;
PropiedadesMapa.tiempo = 500;

function ocultainformpanel() {
    document.getElementById("informpanel").style.display = "none";
    document.getElementById("cargando").style.display = "none";
    PropiedadesMapa.cargado = false;
    clearTimeout(PropiedadesMapa.timerID);
    PropiedadesMapa.numeroPuntos = 1;
}

function fTimer() {
    document.getElementById("informpanel").style.display = "block";
    document.getElementById("cargando").style.display = "block";

    var puntos = "";
    for (i = 0; i < PropiedadesMapa.numeroPuntos; i++) {
        puntos += ".";
    }
    if (PropiedadesMapa.numeroPuntos++ >= PropiedadesMapa.maxPuntos) {
        PropiedadesMapa.numeroPuntos = 0;
    }
    document.getElementById("cargando").innerHTML = PropiedadesMapa.textoCargando + puntos;
    if (!PropiedadesMapa.cargado) {
        PropiedadesMapa.timerID = setTimeout("fTimer()", 500);
    }
}
//]]>