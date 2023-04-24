"use strict"; // JS strict mode 

//execute only when window is fully loaded
window.onload = function () {
    
    //define map object, define basemap tilelayers
    var mapObject = L.map('mapId');

    //streets
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/liping17/cj6ut4r6u1vnw2rmrtwymq5lq/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlwaW5nMTciLCJhIjoiY2o2dTJwYTJ0MG1wdzMzbzRrNDJlOG5jbyJ9.cr8HRltBug7xDGgTV_X__A', {
        maxZoom: 18,
        attribution: '&copy; <a href=”https://www.mapbox.com/about/maps/”>Mapbox</a> &copy; <a href=”http://www.openstreetmap.org/copyright”>OpenStreetMap</a>'
    });

    //satellite
    var satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    
    

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
    
    //read in mines geoJSON, define as variable. Pass to circleMarker
    var aumlayer = L.geoJSON(aum, {
        pointToLayer: function (feature, latlng) {

            //add popup
            var popupContent = feature.properties.Mine_Name;

            //base radius marker option on mine size
            function getOptions(properties) {
                return {
                    radius: Math.sqrt(Number(properties.Area_sqm) / 2000) + 3,
                    fillColor: "green",
                    color: "black",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                };
            }

            return L.circleMarker(latlng, getOptions(feature.properties)).bindPopup(popupContent);
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
    
    
    //add basemaps to map
    streetMap.addTo(mapObject);
    satelliteMap.addTo(mapObject);
    
    //add mine and exposure layers to map 
    mapObject.addLayer(aumlayer);
    mapObject.addLayer(expolayer);

    //define variables for basemap layer and overlays (overlay contains mine and exposure layers)
    var baseLayer = {"Satellite Map": satelliteMap, "Street Map": streetMap};
    var overlay = {"Mines (Note: Potential Exposure layer must be off to identify mine names)": aumlayer, "Potential Exposure": expolayer};

    //pass layer variables to leaflet layer control
    L.control.layers(baseLayer, overlay, {collapsed: false}).addTo(mapObject);

    //define legend 
    const legend = L.control.Legend({
        position: "bottomleft",
        collapsed: false,
        symbolWidth: 24,
        opacity: 1,
        column: 1,
        legends: [
        {
            label: "Mines (larger circle indicates bigger mine)",
            type: "circle",
            color: "#00FF00",
            fillColor: "#00FF00",
            weight: 2
        },{
            label: "low potential exposure",
            type: "rectangle",
            color: "#0000ff",
            fillColor: "#0000ff",
            weight: 2
        },{
            label: "medium potential exposure",
            type: "rectangle",
            color: "#ffff00",
            fillColor: "#ffff00",
            weight: 2 
        },{
            label: "high potential exposure",
            type: "rectangle",
            color: "#ff0000",
            fillColor: "#ff0000",
            weight: 2
        }]
    }).addTo(mapObject); 

    

    
    
    //set map view to extent of exposure layer
    mapObject.fitBounds(expolayer.getBounds());
};