var divPerfil;
var minimo;
var maximo;

function crearPerfil(theData, div) {

    // div = "divPerfil";

    divPerfil = "#" + div;
    var wdiv = $(divPerfil).css("width").substr(0, $(divPerfil).css("width").length - 2) - 200;
    var hdiv = $(divPerfil).css("height").substr(0, $(divPerfil).css("height").length - 2);

    $(divPerfil).css("overflow-y", "hidden");
    console.log(wdiv + "x" +  hdiv);

    $(divPerfil).html("");
    
    var m = [20, 20, 30, 20],
    w = wdiv - m[1] - m[3],
    h = 450;
    // h = hdiv + 400 - m[0] - m[2];

    var x,
        y,
        duration = 1500,
        delay = 500;

    var color = d3.scale.category10();



    var svg = d3.select(divPerfil).append("svg")

        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");





    var stocks,
        symbols;

    // A line generator, for the dark stroke.
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.price); });

    // A line generator, for the dark stroke.
    var axis = d3.svg.line()
        .interpolate("basis")
        .x(function (d) { return x(d.price); })
        .y(h);

    // A area generator, for the dark stroke.
    var area = d3.svg.area()
        .interpolate("basis")
        .x(function (d) { return x(d.date); })
        .y1(function (d) { return y(d.price); });


    var symbols = d3.nest(theData)
           .key(function (d) { return theData.symbol; })
           .entries(stocks = theData.datos);

    symbols.forEach(function (s) {
        s.values.forEach(function (d) { d.date = d.Distancia; d.price = +d.Altura; });
        s.maxPrice = d3.max(s.values, function (d) { return d.price; });
        s.sumPrice = d3.sum(s.values, function (d) { return d.price; });
        s.minPrice = d3.min(s.values, function (d) { return d.price; });
    });

    symbols.sort(function (a, b) { return b.maxPrice - a.maxPrice; });

    var g = svg.selectAll("g")
            .data(symbols)
            .enter().append("g")
            .attr("class", "symbol");

    setTimeout(lines, duration);



    function lines() {

        x = d3.time.scale().range([0, w - 60]);
        y = d3.scale.linear().range([h / 4 - 20, 0]);

        // Compute the minimum and maximum date across symbols.
        x.domain([
          d3.min(symbols, function (d) { return d.values[0].date; }),
          d3.max(symbols, function (d) { return d.values[d.values.length - 1].date; })
        ]);

        var g = svg.selectAll(".symbol")
            .attr("transform", function (d, i) { return "translate(0," + (i * h / 4 + 10) + ")"; });

        g.each(function (d) {
            var e = d3.select(this);

            e.append("path")
                .attr("class", "line");

            e.append("circle")
                .attr("r", 5)
                .style("fill", function (d) { return color(d.key); })
                .style("stroke", "#000")
                .style("stroke-width", "2px");


            //e.append("text")
            //    .attr("x", 12)
            //    .attr("dy", ".31em")
            //    .text(d.key);
        });

        function draw(k) {
            g.each(function (d) {
                minimo = d.minPrice;
                maximo = d.maxPrice;
                var e = d3.select(this);
                y.domain([d.minPrice + 10, d.maxPrice]);

                e.select("path")
                    .attr("d", function (d) { return line(d.values.slice(0, k + 1)); });

                e.selectAll("circle, text")
                    .data(function (d) { return [d.values[k], d.values[k]]; })
                    .attr("transform", function (d) { return "translate(" + x(d.date) + "," + y(d.price) + ")"; });
            });
        }

        var k = 1, n = symbols[0].values.length;
        d3.timer(function () {
            draw(k);
            if ((k += 2) >= n - 1) {
                draw(n - 1);
                setTimeout(horizons, 500);
                return true;
            }
        });
    }

    function horizons() {
        svg.insert("defs", ".symbol")
          .append("clipPath")
            .attr("id", "clip")
          .append("rect")
            .attr("width", w)
            .attr("height", h / 4 - 20);

        var color = d3.scale.ordinal()
            .range(["#c6dbef", "#9ecae1", "#6baed6"]);

        var g = svg.selectAll(".symbol")
            .attr("clip-path", "url(#clip)");

        area
            .y0(h / 4 - 20);

        g.select("circle").transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + (w - 60) + "," + (-h / 4) + ")"; })
            .remove();

        g.select("text").transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + (w - 60) + "," + (h / 4 - 20) + ")"; })
            .attr("dy", "0em");

        g.each(function (d) {
            y.domain([d.minPrice + 10, d.maxPrice]);

            d3.select(this).selectAll(".area")
                .data(d3.range(3))
              .enter().insert("path", ".line")
                .attr("class", "area")
                .attr("transform", function (d) { return "translate(0," + (d * (h / 4 - 20)) + ")"; })
                .attr("d", area(d.values))
                .style("fill", function (d, i) { return color(i); })
                .style("fill-opacity", 1e-6);

            y.domain([d.minPrice, d.maxPrice / 3]);

            d3.select(this).selectAll(".line").transition()
                .duration(duration)
                .attr("d", line(d.values))
                .style("stroke-opacity", 1e-6);

            d3.select(this).selectAll(".area").transition()
                .duration(duration)
                .style("fill-opacity", 1)
                .attr("d", area(d.values))
                .each("end", function () { d3.select(this).style("fill-opacity", null); });
        });

        setTimeout(areas, duration + delay);
    }

    function areas() {
        var g = svg.selectAll(".symbol");

        axis
            .y(h / 4 - 21);

        g.select(".line")
            .attr("d", function (d) { return axis(d.values); });

        

        g.each(function (d) {
            y.domain([d.minPrice + 10, d.maxPrice]);

            d3.select(this).select(".line").transition()
                .duration(duration)
                .style("stroke-opacity", 1)
                .each("end", function () { d3.select(this).style("stroke-opacity", null); });

            

            d3.select(this).selectAll(".area")
                .filter(function (d, i) { return i; })
              .transition()
                .duration(duration)
                .style("fill-opacity", 1e-6)
                .attr("d", area(d.values))
                .remove();

            d3.select(this).selectAll(".area")
                .filter(function (d, i) { return !i; })
              .transition()
                .duration(duration)
                .style("fill", color(d.key))
                .attr("d", area(d.values));

        });

        svg.select("defs").transition()
            .duration(duration)
            .remove();

        g.transition()
            .duration(duration)
            .each("end", function () { d3.select(this).attr("clip-path", null); });


        setTimeout(dibujarPuntosInvisibles, duration + delay);

        
    }

    
    function dibujarPuntosInvisibles() {

        x = d3.time.scale().range([0, w - 60]);
        y = d3.scale.linear().range([h / 4 - 20, 0]);

        // Compute the minimum and maximum date across symbols.
        x.domain([
          d3.min(symbols, function (d) { return d.values[0].date; }),
          d3.max(symbols, function (d) { return d.values[d.values.length - 1].date; })
          
        ]);

        var g = svg.selectAll(".symbol")
            .attr("transform", function (d, i) { return "translate(0," + (i * h / 4 + 10) + ")"; });

        function draw() {
            g.each(function (d) {
                var e = d3.select(this);
                y.domain([d.minPrice +10, d.maxPrice]);

                //e.select("circle")
                //    .attr("d", function (d) { return line(d.values.slice(0, k + 1)); });

                //e.selectAll("circle, text")
                //    .data(function (d) { return [d.values[k], d.values[k]]; })
                //    .attr("transform", function (d) { return "translate(" + x(d.date) + "," + y(d.price) + ")"; });


                
                e.append("circle")
                    .attr("id", "circle" + k);

                e.select("#circle" + k)
                    .attr("d", function (d) { return line(d.values.slice(0, k + 1)); })

                e.select("#circle" + k)
                   .attr("class", "puntoInvisible")
                   .style("pointer-events", "all")
                   .append("title")
                   .text(function (d) { return "Altitud: " + d.values[k].price.toFixed(0); });

                e.select("#circle" + k)
                        .attr("r", 5)
                        //.style("fill", function (d) { return color(d.key); })
                        //.style("stroke", "#000")
                        //.style("stroke-width", "1px");

               

                e.select("#circle" + k)
                    .attr("transform", function (d) { return "translate(" + x(d.values[k].date) + "," + y(d.values[k].price) + ")"; });
                
            });
        }


        var k = 1, n = symbols[0].values.length;


        d3.timer(function () {
            draw(k);
            if ((k += 2) >= n - 1) {
                draw(n - 1);
                //setTimeout(horizons, 500);
                return true;
            }
        });
    }

    setTimeout(activarOverMousePuntosPerfilYMostrarInfoResultado, 10000);

}


function activarOverMousePuntosPerfilYMostrarInfoResultado() {
    
    console.log("mouseover");

    $(".puntoInvisible").mouseover(function (data) {

        console.log(data);

        var idPuntoPerfil = data.currentTarget.attributes.id.nodeValue.substr(6);
        console.log(idPuntoPerfil);
        var distanciaPunto = data.currentTarget.__data__.values[idPuntoPerfil].Distancia
        console.log(distanciaPunto);

        var geometria = capaLineaPerfil.features[0].geometry
        var punto = LRSLocatePoint(geometria, distanciaPunto);


        var pointFeature = new OpenLayers.Feature.Vector(punto, null);

        addPuntoACapaLineaPerfilSiendoUnico(pointFeature)
       

    });

    mostrarinfoResultado();
}

function mostrarinfoResultado(){

    var longitud = capaLineaPerfil.features[0].geometry.getLength()/1000;
    var divResumen = "<div id='divResumenPerfil' style='display: inline-block;'>" +
                      "</br></br><p><b>Altitud máxima:</b> " + maximo.toFixed(0) + " m</br>"+
                      "<b>Altitud mínima:</b> " + minimo.toFixed(0) + " m</br>" +
                      "<b>Longitud:</b> " + longitud.toFixed(1) + " km</p></br>" +
                        
                 "</div>"

                 $(divPerfil).append(divResumen);

}

function addPuntoACapaLineaPerfilSiendoUnico(pointFeature)
{
    
    while (capaLineaPerfil.features.length > 1)
    {
        capaLineaPerfil.features[1].destroy();
    }
   
    capaLineaPerfil.addFeatures([pointFeature]);


}

