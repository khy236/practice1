
// my token
mapboxgl.accessToken = 'pk.eyJ1Ijoia2h5MjM2IiwiYSI6ImNsZzVxYTVnNDA1d2kzZW45b3l5d280N3oifQ.GqfNX5HwLaA5utEN2iQkXg';

// initialize basemap
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [-73.88661930570889, 40.750486754379065], // Jackson Heights
  zoom: 14.5,
  pitch: 40
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function () {

  // real estate sold >4x since 2003 (PLUTO polygons)
  map.addSource('reflips_geojson', {
    type: 'geojson',
    data: reflips_w_pluto
  })

  map.addLayer({
    id: 'fill-reflips',
    type: 'fill',
    source: 'reflips_geojson',
    paint: {
      'fill-color': '#A90A03',
      'fill-opacity': 0.5 
    }
  })//, 'road-label-simple') // place polygons below road labels
  

  // user clicks on a lot
  map.on('click', 'fill-reflips', (e) => {

    const feature = e.features[0];
    bbl = Math.round(feature.properties.BBL);

    // find all sales matching BBL
    var lot_sales = $.grep(reflips, function (element, index) {
      return element.bbl == bbl;
    });

    // clear out table
    $("#tblDiv").html("");

    // pull table of sales data
    makeTable(lot_sales, $("#tblDiv"));
    
    // add details to description div
    $('#description').html(`
    <div>
    <b> Address: </b>
    <h3>
        ${feature.properties.address},
        <br>
        ${feature.properties.borough}, New York ${feature.properties.zipcode}
    </h3>
    <b> Sales history: </b>
    <p>
        Sold ${lot_sales.length} times since 2003.
    </p>
    </div>`);

  });

})


// Function that loops through array to create HTML table
// Adapted from: https://stackoverflow.com/questions/66481697/create-html-table-from-array-loop-specific and https://stackoverflow.com/questions/21515354/display-htmltableelement-object-returned-from-function 
let makeTable = (arr, tableDiv) => {
  
  let table = document.createElement('table');
  
  // delete BBL, previous sale price, and previous sale date columns
  arr.forEach(object => {
    delete object['bbl'];
    delete object['prev_saleprice'];
    delete object['prev_saledate'];
    object['saleprice'] = formatter.format(object['saleprice']); 
  });

  // add header row
  arr.unshift({saleprice: "Sale Price", sale_date: "Sale Date", saletime: "Sale Time (days)"});
  
  // loop through data in array
  for (let entry of arr) {
    let row = document.createElement('tr');
    Object.values(entry).forEach(value => {
      let data = document.createElement('td');
      data.appendChild(document.createTextNode(value));
      row.appendChild(data);
    });
    table.appendChild(row);
  }

  // append break and table to tableDiv (created in index.html)
  tableDiv.append(table);  
  return;
} 


// Function that formats number as USD $ 
// From: https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings 
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0, // round to whole number
  maximumFractionDigits: 0, // round to whole number
});

