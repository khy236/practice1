// TO DO
// add info button on bottom right. add popup data sources to it, remove from description.
// add nabe photos and nta bounds?
// change to bushwick, bedstuy, crownheights, ocean hill (top 5 NTAs)?
// add imagery/narrative w/popups (pictures) for select properties
// handle multiple properties on one BBL




// my token
mapboxgl.accessToken = 'pk.eyJ1Ijoia2h5MjM2IiwiYSI6ImNsZzVxYTVnNDA1d2kzZW45b3l5d280N3oifQ.GqfNX5HwLaA5utEN2iQkXg';

// initialize chart
let ctx = document.getElementById('chart');

// dummy chart
var tempChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [0],
    datasets: [{
      data: [0]
    }]
  }
});

// hide dummy chart
document.getElementById('chart').style.display = "none";


// shading mask boundaries
var bounds = [-75.90202, 38.82094, -71.24568, 42.07133]

// initialize basemap
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
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

  // NTA borders
  map.addSource('select_ntas_geojson', {
    type: 'geojson',
    data: select_ntas
  })

  map.addLayer({
    id: 'line-select-ntas',
    type: 'line',
    source: 'select_ntas_geojson',
    'layout': {
      'visibility': 'visible'
    },
    paint: {
      'line-width': 5,
      'line-color': '#857271'
    }
  })


  // add mask outside select NTAs
  map.addSource('outside_select_ntas', {
    type: 'geojson',
    data: polyMask(mask, bounds)
  })

  map.addLayer({
    "id": "outside_select_ntas_mask",
    "source": "outside_select_ntas",
    'layout': {
      'visibility': 'visible'
    },
    "type": "fill",
    "paint": {
      "fill-color": "#857271",
      'fill-opacity': 0.5
    }
  });


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

    $('#chart_text').html(``);

    const feature = e.features[0];
    bbl = Math.round(feature.properties.BBL);
    address = feature.properties.address;

    // find all sales matching BBL
    var lot_sales = $.grep(reflips, function (element, index) {
      return element.address == address;
    });

    lot_sales.forEach(object => {
      console.log(object['address']);
      console.log(object['bbl']);
    })

    // make chart of sales data
    makeChart(lot_sales, $("#chart"));

    // add details to description div
    $('#description').html(`
    <div>
    <br>
    <h2><b>DOF-recorded sale address</b></h2>
    <h3>
        ${feature.properties.address},
        <br>
        ${feature.properties.Borough}, New York ${feature.properties.ZipCode}
    <h2><b>Property details</b></h2>
    <p>
      <b>BBL</b>: ${bbl}<br>
      <b>Name of current owner</b>: "${feature.properties.OwnerName}"<br>
        <b>Year built</b>: ${feature.properties.YearBuilt}<br>
      <b>DOF building class category</b>: "${feature.properties.building_class_category}"<br>
      <b>Total units</b>: ${feature.properties.units} (${feature.properties.unitsres} residential and ${feature.properties.unitscom} commercial)<br>
    </p>
    <h2><b>Sales volume</b></h2>
    <p>
        This property has been sold ${lot_sales.length} time(s) since 2003.
    </p>
    </div>`);

  });


  // buttons

  // button to hide select NTAs mask
  $('#remove-mask').on('click', function () {
    map.setLayoutProperty('outside_select_ntas_mask', 'visibility', 'none');
    map.setLayoutProperty('line-select-ntas', 'visibility', 'none');
    map.fitBounds([-74.25581, 40.41798, -73.73367, 40.94616]);
  })

  // button to show select NTAs mask
  $('#show-mask').on('click', function () {
    map.setLayoutProperty('outside_select_ntas_mask', 'visibility', 'visible');
    map.setLayoutProperty('line-select-ntas', 'visibility', 'visible');
    map.fitBounds([-73.97374, 40.65206, -73.89378, 40.71295]);
  })

  // button to return to home page
  $('#home').on('click', function () {
    document.getElementById('chart').style.display = "none";
    $('#description').html(`
    <h2>
    <br>
    The Central Brooklyn neighborhoods of Bed-Stuy, Crown Heights, Ocean Hill, and Prospect Lefferts Gardens contain <b>23% of all NYC properties that have been sold 5+ times over the last three decades</b>. This map highlights these frequently-sold properties in red.
    <br><br><br>
    <b>Hover</b> over a red, highlighted lot to view the BBL and address of the frequently-sold property that sits on it and the number of times it has been sold since 2003.
    <br><br>
    <b>Click</b> on the lot to view its sales history and more details on the property.
    <br><br>
    If you want to view frequently-sold properties outside Central Brooklyn,  <b>search</b> for a specific address or <b>toggle</b> to a view of the entire city using the navigation buttons on the top-right.
    <br><br><br><br><br><br>
    <b>Data sources:</b>
    <ul>
        <li>Property sales data is from the <a href='https://www.nyc.gov/site/finance/taxes/property-annualized-sales-update.page' target="_blank" rel="noopener noreferrer">NYC Department of Finance Annualized Sales</a>. </li>
        <li>Tax lot outlines are from <a href='https://www.nyc.gov/site/planning/data-maps/open-data/dwn-pluto-mappluto.page' target="_blank" rel="noopener noreferrer">NYC PLUTO</a>.</li>
        <li>Neighborhood Tabulation Areas used to define the Central Brooklyn neighborhoods that this map focuses on are from <a href='https://www.nyc.gov/site/planning/data-maps/open-data.page' target="_blank" rel="noopener noreferrer">BYTES of the BIG APPLE™</a>.</li>
    </ul>
    </h2>
    `);
    $('#chart_text').html(``);
  })

})


// function that creates sales chart
let makeChart = (data, chartDiv) => {

  $('#chart_text').html(``);

  // unhide chart div
  document.getElementById('chart').style.display = "";

  // destroy previous chart
  tempChart.destroy();

  // create array of sale dates and array of sale prices
  var x_saledates = [];
  var y_saleprices = [];

  var i = 0; // $0 transaction counter

  data.forEach(object => {
    if (object['saleprice'] == 0) {
      i++;
      x_saledates.push(new Date(object['sale_date']));
      y_saleprices.push(parseInt(object['saleprice']));
    }
    if (object['saleprice'] != 0) { // filter our $0 transactions
      x_saledates.push(new Date(object['sale_date']));
      y_saleprices.push(parseInt(object['saleprice']));
    }
  });

  // do not produce chart if all sales were for $0
  if (i == y_saleprices.length) {
    $('#chart_text').html(`
    <h2><b>Price history</b></h2>
      <p>  
      This property was transacted at $0 each time it was sold.
      </p>
    </div>`);
    return;
  }

  // do not produce chart if just one non-zero sale

  // dummy variables
  var nonzero_price = 0;
  var nonzero_date_position = 0;
  var nonzero_date = new Date('January 1, 1111 11:11:11');

  if (i == (y_saleprices.length - 1)) {
    // find non-zero price and date
    y_saleprices.forEach(object => {
      if (object != 0) {
        nonzero_price = object;
        nonzero_date_position = y_saleprices.indexOf(nonzero_price);
        nonzero_date = x_saledates[nonzero_date_position];
      }
    })

    $('#chart_text').html(`
    <h2><b>Price history</b></h2>
      <p>  
      This property was sold for ${formatter.format(nonzero_price)} on ${moment(nonzero_date).format('MMMM Do YYYY')}, but was transacted for $0 in all other sales. 
      </p>
    </div>`);
    return;
  }

  // if >1 non-zero sales, create chart
  if (i != (y_saleprices.length - 1) && i != y_saleprices.length) {
    $('#chart_text').html(`
    <h2><b>Price history</b></h2>
      <p>  
      The chart below shows the property's sale price over time, excluding $0 transactions.
      </p>
    </div>`);
  }

  //sort dates array
  x_saledates.sort((a, b) => a - b);

  // create new chart
  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: x_saledates,
      datasets: [{
        label: 'Sale price ($)',
        data: y_saleprices,
        borderColor: '#CF807D',
        borderWidth: 1.5,
        borderCapStyle: "round",
        tension: 0.1,
        pointBackgroundColor: '#857271', // color options: 6b4f4d, 857271
        pointBorderWidth: 0,
        pointRadius: 2.5
      }]
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            parser: 'MM/DD/YYYY HH:mm',
            tooltipFormat: 'MM/dd/yyyy', // format popup dates MM/DD/YYYY
            unit: 'year', // format x axis as YYYY
            unitStepSize: 1,
            displayFormats: {
              'year': 'yyyy'
            }
          }
        },
        y: {
          ticks: {
            callback: function (value, index, ticks) {
              return '$' + Chart.Ticks.formatters.numeric.apply(this, [value, index, ticks]); // format y axis as $XXX,XXX
            }
          }
        }
      }
    }
  });

}


// popup on hover
// from: https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover/
const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('mouseenter', 'fill-reflips', (e) => {
  map.getCanvas().style.cursor = 'pointer';

  const coordinates = e.features[0].geometry.coordinates[0][0];

  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  popup.setLngLat(coordinates).setHTML(`<b>BBL:</b> ${e.features[0].properties.BBL}<br><b>Address:</b> ${e.features[0].properties.address}<br><b>Times sold:</b> ${e.features[0].properties.num_sales}`).addTo(map);

});

map.on('mouseleave', 'fill-reflips', () => {
  map.getCanvas().style.cursor = '';
  popup.remove();
});


// function that formats number as USD $ 
// from: https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings 
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0, // round to whole number
  maximumFractionDigits: 0, // round to whole number
});


// function that creates mask outside select ntas
// from https://jsfiddle.net/kmandov/cr2rav7v
function polyMask(mask, bounds) {
  var bboxPoly = turf.bboxPolygon(bounds);
  return turf.difference(bboxPoly, mask);
}

var mask = turf.polygon([[[-73.922811, 40.667071], [-73.923034, 40.666974], [-73.92312, 40.666936], [-73.923232, 40.666887], [-73.92331, 40.666853], [-73.924245, 40.666444], [-73.924688, 40.667467], [-73.924781, 40.667642], [-73.924893, 40.667811], [-73.925022, 40.667973], [-73.925167, 40.668126], [-73.925327, 40.66827], [-73.925401, 40.668351], [-73.925528, 40.668499], [-73.925607, 40.668505], [-73.92835, 40.668647], [-73.931119, 40.668798], [-73.933888, 40.66895], [-73.936657, 40.6691], [-73.939427, 40.669248], [-73.942196, 40.669403], [-73.944965, 40.669555], [-73.945226, 40.66957], [-73.946385, 40.669636], [-73.94773, 40.669713], [-73.950502, 40.669865], [-73.950875, 40.669887], [-73.951605, 40.669923], [-73.95327, 40.670007], [-73.95527, 40.670124], [-73.957973, 40.670657], [-73.95889, 40.670849], [-73.959047, 40.670882], [-73.959288, 40.670932], [-73.961337, 40.671356], [-73.961264, 40.671563], [-73.961029, 40.672243], [-73.96071, 40.673121], [-73.960393, 40.673998], [-73.960073, 40.674864], [-73.963182, 40.675529], [-73.962864, 40.676405], [-73.962546, 40.677286], [-73.962228, 40.678166], [-73.961956, 40.678933], [-73.96168, 40.679702], [-73.96154, 40.680086], [-73.96141, 40.680413], [-73.961347, 40.680463], [-73.961266, 40.680523], [-73.961424, 40.681434], [-73.96161, 40.682375], [-73.961671, 40.68269], [-73.960718, 40.682801], [-73.959784, 40.682908], [-73.958841, 40.683018], [-73.958983, 40.683749], [-73.959132, 40.684485], [-73.959276, 40.685216], [-73.9593, 40.685334], [-73.959423, 40.68595], [-73.959568, 40.686682], [-73.959714, 40.687415], [-73.959859, 40.688147], [-73.960005, 40.688881], [-73.960097, 40.689345], [-73.960147, 40.689608], [-73.960172, 40.689729], [-73.960187, 40.689803], [-73.960223, 40.689988], [-73.960237, 40.690062], [-73.960293, 40.690346], [-73.960138, 40.690364], [-73.960083, 40.69037], [-73.959576, 40.690429], [-73.959428, 40.690447], [-73.959843, 40.69253], [-73.960158, 40.694117], [-73.96062, 40.69632], [-73.960925, 40.697736], [-73.961051, 40.698326], [-73.960197, 40.698462], [-73.958859, 40.698677], [-73.957959, 40.698819], [-73.95702, 40.698973], [-73.956074, 40.699089], [-73.955184, 40.699192], [-73.95429, 40.699295], [-73.95337, 40.699404], [-73.952548, 40.699494], [-73.951952, 40.699562], [-73.951773, 40.699584], [-73.951537, 40.699613], [-73.951373, 40.699633], [-73.951011, 40.699677], [-73.950091, 40.69979], [-73.949794, 40.699823], [-73.948132, 40.700006], [-73.947248, 40.700104], [-73.947128, 40.700122], [-73.946316, 40.700214], [-73.944618, 40.700405], [-73.944388, 40.700424], [-73.943723, 40.700505], [-73.941931, 40.700725], [-73.941149, 40.700281], [-73.940463, 40.699897], [-73.94042, 40.699873], [-73.93969, 40.699455], [-73.938901, 40.699036], [-73.938569, 40.698848], [-73.938177, 40.69864], [-73.937774, 40.698404], [-73.937391, 40.698185], [-73.93676, 40.697831], [-73.936388, 40.697615], [-73.936007, 40.697405], [-73.935223, 40.696986], [-73.934797, 40.696736], [-73.934689, 40.696674], [-73.934607, 40.696628], [-73.93458, 40.696612], [-73.934488, 40.69656], [-73.934134, 40.696358], [-73.933828, 40.696184], [-73.933119, 40.695791], [-73.932366, 40.695358], [-73.931929, 40.695114], [-73.931774, 40.695028], [-73.931472, 40.69486], [-73.931212, 40.694712], [-73.931145, 40.694673], [-73.930511, 40.694316], [-73.929702, 40.693863], [-73.928829, 40.69335], [-73.928828, 40.69335], [-73.928643, 40.69324], [-73.928507, 40.693165], [-73.928042, 40.692905], [-73.927782, 40.692761], [-73.926481, 40.69414], [-73.926735, 40.69428], [-73.927227, 40.694548], [-73.927498, 40.694696], [-73.9265, 40.695711], [-73.92575, 40.695284], [-73.924996, 40.694854], [-73.924249, 40.694428], [-73.922271, 40.696442], [-73.921983, 40.696735], [-73.92189, 40.69683], [-73.921218, 40.697515], [-73.921142, 40.697593], [-73.920824, 40.697917], [-73.920496, 40.69773], [-73.920431, 40.697693], [-73.920074, 40.697489], [-73.919605, 40.697222], [-73.919569, 40.697202], [-73.919321, 40.69706], [-73.917871, 40.698536], [-73.917522, 40.698893], [-73.916316, 40.700121], [-73.915565, 40.699693], [-73.914814, 40.699265], [-73.914681, 40.69919], [-73.914061, 40.698838], [-73.913606, 40.6993], [-73.912568, 40.700358], [-73.911422, 40.701486], [-73.910679, 40.701045], [-73.911808, 40.699937], [-73.911035, 40.699532], [-73.909533, 40.698675], [-73.908774, 40.698255], [-73.908023, 40.697825], [-73.90757, 40.697571], [-73.907275, 40.697399], [-73.906846, 40.697163], [-73.906524, 40.696976], [-73.906116, 40.69675], [-73.905765, 40.696548], [-73.905401, 40.69635], [-73.905005, 40.696118], [-73.904664, 40.695932], [-73.90426, 40.6957], [-73.904804, 40.695148], [-73.904914, 40.695073], [-73.905796, 40.694127], [-73.905043, 40.693703], [-73.904288, 40.693277], [-73.903866, 40.693035], [-73.903541, 40.692848], [-73.902788, 40.692418], [-73.902073, 40.691999], [-73.901761, 40.691807], [-73.901554, 40.691679], [-73.90144, 40.691612], [-73.901398, 40.691589], [-73.901888, 40.691077], [-73.902504, 40.690472], [-73.90271, 40.690264], [-73.902911, 40.690054], [-73.903107, 40.68984], [-73.903297, 40.689624], [-73.90418, 40.68858], [-73.904883, 40.687735], [-73.904956, 40.687631], [-73.905022, 40.687523], [-73.905081, 40.687414], [-73.905339, 40.686817], [-73.904969, 40.6866], [-73.904494, 40.686298], [-73.905042, 40.685302], [-73.905756, 40.684004], [-73.905306, 40.683776], [-73.904636, 40.683375], [-73.903903, 40.682946], [-73.903152, 40.682519], [-73.90281, 40.68234], [-73.902833, 40.682161], [-73.902853, 40.681609], [-73.902858, 40.680938], [-73.902623, 40.680664], [-73.903526, 40.679739], [-73.904046, 40.67922], [-73.903491, 40.678897], [-73.903208, 40.67874], [-73.902565, 40.678345], [-73.902022, 40.678026], [-73.901454, 40.677693], [-73.900464, 40.677122], [-73.900149, 40.676949], [-73.900046, 40.676893], [-73.900792, 40.676572], [-73.900962, 40.676502], [-73.902456, 40.675881], [-73.902577, 40.675831], [-73.902678, 40.675789], [-73.902758, 40.675759], [-73.902919, 40.675684], [-73.903021, 40.675656], [-73.903138, 40.675622], [-73.903474, 40.675506], [-73.903744, 40.675406], [-73.904288, 40.675229], [-73.904388, 40.675206], [-73.904509, 40.675052], [-73.90524, 40.674724], [-73.905826, 40.674469], [-73.906094, 40.674352], [-73.906297, 40.674265], [-73.906957, 40.673985], [-73.907468, 40.673761], [-73.907877, 40.673566], [-73.908278, 40.673379], [-73.90833, 40.673355], [-73.908419, 40.673313], [-73.90924, 40.672954], [-73.909462, 40.672861], [-73.909898, 40.67268], [-73.909958, 40.672655], [-73.910143, 40.672579], [-73.910193, 40.672558], [-73.910375, 40.672483], [-73.910463, 40.672446], [-73.911046, 40.672204], [-73.911099, 40.672182], [-73.91116, 40.672155], [-73.911335, 40.672076], [-73.912218, 40.671687], [-73.913086, 40.67131], [-73.914039, 40.670896], [-73.914545, 40.670675], [-73.914619, 40.670643], [-73.914873, 40.670532], [-73.915534, 40.670243], [-73.915585, 40.670221], [-73.915729, 40.670158], [-73.915804, 40.670125], [-73.915862, 40.6701], [-73.916472, 40.669836], [-73.916523, 40.669814], [-73.916585, 40.669787], [-73.917136, 40.669543], [-73.917483, 40.669392], [-73.918382, 40.669002], [-73.919231, 40.668631], [-73.919418, 40.668397], [-73.919956, 40.668319], [-73.920048, 40.668276], [-73.920149, 40.668229], [-73.92102, 40.667852], [-73.921872, 40.66748], [-73.922216, 40.667333], [-73.922753, 40.667097], [-73.922811, 40.667071]]]);
