//<![CDATA[

var numeroPuntos = 1;
var textoCargando = "Loading";
var maxPuntos = 3;
var timerID = 0;
var cargado = false;
var tiempo = 500;

function ocultainformpanel() {
    document.getElementById("informpanel").style.display = "none";
    document.getElementById("cargando").style.display = "none";
    cargado = false;
    clearTimeout(timerID);
    numeroPuntos = 1;
}

function fTimer() {
    document.getElementById("informpanel").style.display = "block";
    document.getElementById("cargando").style.display = "block";

    var puntos = "";
    for (i = 0; i < numeroPuntos; i++) {
        puntos += ".";
    }
    if (numeroPuntos++ >= maxPuntos) {
        numeroPuntos = 0;
    }
    document.getElementById("cargando").innerHTML = textoCargando + puntos;
    if (!cargado) {
        timerID = setTimeout("fTimer()", 500);
    }
}
//]]>