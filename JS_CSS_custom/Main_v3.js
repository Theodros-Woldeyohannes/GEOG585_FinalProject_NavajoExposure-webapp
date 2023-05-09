"use strict"; // JS strict mode 

//execute only when window is fully loaded
window.onload = function () {

    //define map object, set zoom, define basemap tilelayers
    var mapObject = L.map('mapId', {
        zoomControl: false
    });

    //streets
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/liping17/cj6ut4r6u1vnw2rmrtwymq5lq/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlwaW5nMTciLCJhIjoiY2o2dTJwYTJ0MG1wdzMzbzRrNDJlOG5jbyJ9.cr8HRltBug7xDGgTV_X__A', {
        maxZoom: 18,
        attribution: '&copy; <a href=”https://www.mapbox.com/about/maps/”>Mapbox</a> &copy; <a href=”http://www.openstreetmap.org/copyright”>OpenStreetMap</a>',
    });

    //satellite
    var satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    });

    //define popup function
    function addPopups(feature, layer) {

        // Assign location and stolen value properties to variables. Assign those variables to a combined
        //information variable that is passed to bindPopup()

        //parse geoJSON for aggregated Class and potential exposure index properties, define as variable (this is the potential exposure class)
        var ex_class = feature.properties.Class_AGG
        var ex_index = feature.properties.Index
        
        //define HTML variable for popup that displays potential exposure class and index value range, pass to bindPopup
        var info = "<dl><dt>Exposure Potential is:</dt>"
                    + "<dd>" + ex_index + " " + "(" + ex_class + ")" + "</dd></dl>"
        layer.bindPopup(info, {className: "popup-gen"})
    
    }
    
    //read in exposure geoJSON, define as variable
    var expolayer = L.geoJSON(exposure, {

        //use switch case to set color based on exposure class, remove polygon outlines, add popup function
        style: function(feature) {
            switch (feature.properties.Class) {
                case 'low': return {color: "#FFFFFF", fillOpacity: 0.6, stroke: false};
                case 'low-medium': return {color: "#FFCCCC", fillOpacity: 0.6, stroke: false};
                case 'medium': return {color: "#FF9999", fillOpacity: 0.7, stroke: false};
                case 'medium-high': return {color: "#FF6666", fillOpacity: 0.7, stroke: false};
                case 'high': return {color: "#FF3333", fillOpacity: 0.8, stroke: false};
                case 'high-high': return {color: "#8b0000", fillOpacity: 0.8, stroke: false};

            }   
        },
        onEachFeature: addPopups
       });
    
    
    //add basemaps to map
    streetMap.addTo(mapObject);
    satelliteMap.addTo(mapObject);
    
    //add mine layer to map 
    mapObject.addLayer(expolayer);
    
    //read in mines geoJSON, define as variable. Pass to circleMarker. Add to map.
    var aumlayer = L.geoJSON(aum, {
        
        pointToLayer: function (feature, latlng) {

            //add popup of mine name and size
            var popupContent = "<b>Mine Name</b>: " + feature.properties.Mine_Name +
             "<br>" + "<br>" + "<b>Mine Size</b>: " + (feature.properties.Area_sqm/1000).toFixed(0) + " " + "km<sup>2</sup>";

            //base radius marker option on mine size
            function getOptions(properties) {
                return {
                    radius: Math.sqrt(Number(properties.Area_sqm) / 2000) + 3,
                    fillColor: "orange",
                    color: "black",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                };
            }

            return L.circleMarker(latlng, getOptions(feature.properties)).bindPopup(popupContent, {className: "popup-gen"});
        } 
    }).addTo(mapObject);

    //define slider variable by referencing slider div in document, base min/max values off data
    var slider = document.getElementById('slider');

    noUiSlider.create(slider, {
        start: [0, 1200],
        tooltips: true,
        connect: true,
        range: {
            'min': 0,
            'max': 1200
    }

    //return value from slider (value as user clicks and drags)
}).on('slide', function(e) {
    console.log(e)

    //turn on/off mine markers based on slider value
    aumlayer.eachLayer(function(layer) {
        if((layer.feature.properties.Area_sqm/1000)>=parseFloat(e[0])&&(layer.feature.properties.Area_sqm/1000)<=parseFloat(e[1])) {
            layer.addTo(mapObject);
        } else {
            mapObject.removeLayer(layer);
        }
    });
});

    //define variables for basemap layer and overlays (overlay contains mine and exposure layers)
    var baseLayer = {"Satellite Map": satelliteMap, "Street Map": streetMap};
    var overlay = {"Mines": aumlayer, "Potential Exposure": expolayer};
    
    //pass layer variables to leaflet layer control
    L.control.layers(baseLayer, overlay, {collapsed: false}).addTo(mapObject);

    //define legend 
    const legend = L.control.Legend({
        position: "bottomleft",
        collapsed: false,
        symbolWidth: 24,
        opacity: 0.7,
        column: 1,
        legends: [
        {
            label: "Mines (larger circle indicates bigger mine)",
            type: "circle",
            radius: 5,
            color: "#000000",
            fillColor: "#FFA500",
            weight: 1
        },{
            label: "0 - 0.17 (low potential exposure)",
            type: "rectangle",
            color: "#000000",
            fillColor: "#FFFFFF",
            weight: 1
        },{
            label: "0.17 - 0.26 (low potential exposure)",
            type: "rectangle",
            color: "#FFCCCC",
            fillColor: "#FFCCCC",
            weight: 2 
        },{
            label: "0.26 - 0.34 (medium potential exposure)",
            type: "rectangle",
            color: "#FF9999",
            fillColor: "#FF9999",
            weight: 2 
        },{
            label: "0.34 - 0.42 (medium potential exposure)",
            type: "rectangle",
            color: "#FF6666",
            fillColor: "#FF6666",
            weight: 2 
        },{
            label: "0.42 - 0.5 (high potential exposure)",
            type: "rectangle",
            color: "#FF3333",
            fillColor: "#FF3333",
            weight: 2 
        },{
            label: "0.5 - 0.6 (high potential exposure)",
            type: "rectangle",
            color: "#8b0000",
            fillColor: "#8b0000",
            weight: 2
        }]
    }).addTo(mapObject); 

    //set map view to extent of exposure layer
    mapObject.fitBounds(expolayer.getBounds());

    //add reset button to zoom control
    var zoomHome = L.Control.zoomHome();
    zoomHome.addTo(mapObject);

};