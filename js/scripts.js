// my token
mapboxgl.accessToken = 'pk.eyJ1Ijoia2h5MjM2IiwiYSI6ImNsZzVxYTVnNDA1d2kzZW45b3l5d280N3oifQ.GqfNX5HwLaA5utEN2iQkXg';

// initialize basemap
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/standard',
  center: [-73.93366, 40.67941], // Jackson Heights
  pitch: 40,
  bounds: [-73.97374, 40.65206, -73.89378, 40.71295]
});

// add geocoder
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  })
);

map.addControl(new mapboxgl.NavigationControl());


map.on('load', function () {

  map.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
        'fill-extrusion-color': '#aaa',

        // use an 'interpolate' expression to add a smooth transition effect to the
        // buildings as the user zooms in
        'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
        ],
        'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
    }
  })
});
