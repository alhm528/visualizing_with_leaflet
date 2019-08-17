// Store API link
var link =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(link, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Use a function to establish how large each circle will be
function circleSize(mag) {
  return mag * 20000;
}

// Use if statement to choose what color each circle is
function circleColor(mag) {
  if (mag <= 1) {
    return "#39FF33";
  } else if (mag <= 2) {
    return "#E5FF33";
  } else if (mag <= 3) {
    return "#FFE333";
  } else if (mag <= 4) {
    return "#FFBF33";
  } else if (mag <= 5) {
    return "#FF9033";
  } else {
    return "#FF3333";
  }
}

function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "<h3>" +
          feature.properties.place +
          "</h3><hr><p> Time:" +
          new Date(feature.properties.time) +
          "<br> Magnitude: " +
          feature.properties.mag +
          "</p>"
      );
    },
    pointToLayer: function(feature, latlng) {
      return new L.circle(latlng, {
        radius: circleSize(feature.properties.mag),
        fillColor: circleColor(feature.properties.mag),
        fillOpacity: 0.7,
        stroke: true,
        weight: 1.5,
        color: "#323232"
      });
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define satellitemap lightmap and and darkmap layers
  var satellitemap = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    }
  );

  var outdoors = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    }
  );

  var darkmap = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    }
  );

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    Satellite: satellitemap,
    Outdoors: outdoors,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the satellitemap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37, -100],
    zoom: 4,
    layers: [satellitemap, earthquakes]
  });

  // Create a layer control
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false
    })
    .addTo(myMap);

  // Set up legend
  var legend = L.control({ position: "bottomright" });

  // Create content within legend by looping through density intervals and generating labels wih corresponding colored squares
  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend"),
      magnitudes = [0, 1, 2, 3, 4, 5];

    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        circleColor(magnitudes[i] + 1) +
        '"></i> ' +
        magnitudes[i] +
        (magnitudes[i + 1] ? " - " + magnitudes[i + 1] + "<br>" : " + ");
    }

    return div;
  };

  legend.addTo(myMap);
}
