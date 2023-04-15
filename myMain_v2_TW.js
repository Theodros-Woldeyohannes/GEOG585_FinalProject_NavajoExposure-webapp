"use strict"; // JS strict mode 

//execute only when window is fully loaded
window.onload = function () {
    
    //define map object, define basemap tilelayer
    var mapObject = L.map('mapId');

    var baseMap = L.tileLayer('https://api.mapbox.com/styles/v1/liping17/cj6ut4r6u1vnw2rmrtwymq5lq/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlwaW5nMTciLCJhIjoiY2o2dTJwYTJ0MG1wdzMzbzRrNDJlOG5jbyJ9.cr8HRltBug7xDGgTV_X__A', {
        maxZoom: 18,
        attribution: '&copy; <a href=”https://www.mapbox.com/about/maps/”>Mapbox</a> &copy; <a href=”http://www.openstreetmap.org/copyright”>OpenStreetMap</a>'
    });

    
    //add basemap to map
    baseMap.addTo(mapObject);

    //define popup function
    function addPopups(feature, layer) {

        // Assign location and stolen value properties to variables. Assign those variables to a combined
        //information variable that is passed to bindPopup()

        //parse geoJSON for Class property, define as variable (this is the potential exposure class)
        var ex_class = feature.properties.Class
        
        //define HTML variable for popup that displays potential exposure class, pass to bindPopup
        var info = "<dl><dt>Exposure Potential is:</dt>"
                    + "<dd>" + ex_class + "</dd></dl>"
        layer.bindPopup(info)
    
    }
    
    //define variable for marker options (symbology for mines layer)
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "green",
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8 
    };

    //read in mines geoJSON, define as variable. Pass to circleMarker
    var aumlayer = L.geoJSON(aum, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions)
        } 
    });

    //read in exposure geoJSON, define as variable
    var expolayer = L.geoJSON(exposure, {
        
        //use switch case to set color based on exposure class, remove polygon outlines, add popup function
        style: function(feature) {
            switch (feature.properties.Class) {
                case 'low': return {color: "#0000ff", stroke: false};
                case 'medium': return {color: "#ffff00", stroke: false};
                case 'high': return {color: "#ff0000", stroke: false};

            }   
        },
        onEachFeature: addPopups
       });

    //add mine and exposure layers to map
    mapObject.addLayer(aumlayer);
    mapObject.addLayer(expolayer);

    //define variables for basemap layer and overlays (overlay contains mine and exposure layers)
    var baseLayer = {"Base Map": baseMap};
    var overlay = {"Mines": aumlayer, "Potential Exposure": expolayer};

    //pass layer variables to leaflet layer control
    L.control.layers(baseLayer, overlay, {collapsed: false}).addTo(mapObject);
    
    //set map view to extent of exposure layer
    mapObject.fitBounds(expolayer.getBounds());
};