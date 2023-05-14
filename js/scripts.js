// TO DO
// 1. handle multiple properties on one BBL
// 2. add imagery/narrative w/popups (pictures) for select properties



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
  bounds: [-73.97374, 40.65206, -73.89378, 40.68295]
});

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
      <b>BBL</b>: ${feature.properties.BBL}<br>
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
    map.fitBounds([-73.97374, 40.65206, -73.89378, 40.68295]);
  })

 // button to return to home page
  $('#home').on('click', function () {
    document.getElementById('chart').style.display = "none";
    $('#description').html(`
    <h2>
      <br>
      Description TBD.
    </h2>
    `);
  })

})


// function that creates sales chart
let makeChart = (data, chartDiv) => {

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
  if(i == y_saleprices.length) {
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

  if (i == (y_saleprices.length-1)) {
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
  if(i != (y_saleprices.length-1) && i != y_saleprices.length) {
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

var mask = turf.polygon([ [ [ -73.93148, 40.662051 ], [ -73.931407, 40.66133 ], [ -73.931326, 40.660593 ], [ -73.932336, 40.660531 ], [ -73.93423, 40.660415 ], [ -73.933996, 40.658118 ], [ -73.932091, 40.658235 ], [ -73.931083, 40.658295 ], [ -73.930904, 40.65661 ], [ -73.931907, 40.656537 ], [ -73.932847, 40.656478 ], [ -73.93381, 40.656423 ], [ -73.934784, 40.65636 ], [ -73.935718, 40.656303 ], [ -73.936179, 40.656273 ], [ -73.936685, 40.656241 ], [ -73.937121, 40.656215 ], [ -73.937636, 40.656167 ], [ -73.938204, 40.656148 ], [ -73.938594, 40.656122 ], [ -73.939559, 40.656062 ], [ -73.940532, 40.656001 ], [ -73.941463, 40.655944 ], [ -73.942402, 40.655884 ], [ -73.943355, 40.655828 ], [ -73.943652, 40.655809 ], [ -73.944288, 40.65577 ], [ -73.944873, 40.655734 ], [ -73.945079, 40.655722 ], [ -73.947159, 40.655593 ], [ -73.950067, 40.655423 ], [ -73.95016, 40.65626 ], [ -73.953053, 40.65608 ], [ -73.956389, 40.655874 ], [ -73.9563, 40.655048 ], [ -73.959697, 40.654839 ], [ -73.959861, 40.655634 ], [ -73.960698, 40.65534 ], [ -73.961394, 40.65507 ], [ -73.961565, 40.655004 ], [ -73.961881, 40.654881 ], [ -73.962455, 40.658287 ], [ -73.962813, 40.660509 ], [ -73.963083, 40.662131 ], [ -73.963074, 40.662212 ], [ -73.963055, 40.662292 ], [ -73.963028, 40.66237 ], [ -73.962993, 40.662447 ], [ -73.962949, 40.662521 ], [ -73.962898, 40.662592 ], [ -73.962838, 40.66266 ], [ -73.962772, 40.662723 ], [ -73.962388, 40.663089 ], [ -73.96225, 40.663198 ], [ -73.962131, 40.663208 ], [ -73.96171, 40.663235 ], [ -73.960956, 40.663285 ], [ -73.961109, 40.664062 ], [ -73.961223, 40.664626 ], [ -73.961258, 40.664801 ], [ -73.961282, 40.664926 ], [ -73.961616, 40.666695 ], [ -73.961807, 40.667681 ], [ -73.961997, 40.668662 ], [ -73.96211, 40.669195 ], [ -73.962194, 40.669641 ], [ -73.962523, 40.671379 ], [ -73.962541, 40.67146 ], [ -73.962571, 40.671622 ], [ -73.961337, 40.671356 ], [ -73.961264, 40.671563 ], [ -73.961029, 40.672243 ], [ -73.96071, 40.673121 ], [ -73.960393, 40.673998 ], [ -73.960073, 40.674864 ], [ -73.963182, 40.675529 ], [ -73.962864, 40.676405 ], [ -73.962546, 40.677286 ], [ -73.962228, 40.678166 ], [ -73.961956, 40.678933 ], [ -73.96168, 40.679702 ], [ -73.96154, 40.680086 ], [ -73.96141, 40.680413 ], [ -73.961347, 40.680463 ], [ -73.961266, 40.680523 ], [ -73.961424, 40.681434 ], [ -73.96161, 40.682375 ], [ -73.961671, 40.68269 ], [ -73.960718, 40.682801 ], [ -73.959784, 40.682908 ], [ -73.958841, 40.683018 ], [ -73.958983, 40.683749 ], [ -73.959132, 40.684485 ], [ -73.959276, 40.685216 ], [ -73.9593, 40.685334 ], [ -73.959423, 40.68595 ], [ -73.959568, 40.686682 ], [ -73.959714, 40.687415 ], [ -73.959859, 40.688147 ], [ -73.960005, 40.688881 ], [ -73.960097, 40.689345 ], [ -73.960147, 40.689608 ], [ -73.960172, 40.689729 ], [ -73.960187, 40.689803 ], [ -73.960223, 40.689988 ], [ -73.960237, 40.690062 ], [ -73.960293, 40.690346 ], [ -73.960138, 40.690364 ], [ -73.960083, 40.69037 ], [ -73.959576, 40.690429 ], [ -73.959428, 40.690447 ], [ -73.959843, 40.69253 ], [ -73.960158, 40.694117 ], [ -73.96062, 40.69632 ], [ -73.960925, 40.697736 ], [ -73.961051, 40.698326 ], [ -73.960197, 40.698462 ], [ -73.958859, 40.698677 ], [ -73.957959, 40.698819 ], [ -73.95702, 40.698973 ], [ -73.956074, 40.699089 ], [ -73.955184, 40.699192 ], [ -73.95429, 40.699295 ], [ -73.95337, 40.699404 ], [ -73.952548, 40.699494 ], [ -73.951952, 40.699562 ], [ -73.951773, 40.699584 ], [ -73.951537, 40.699613 ], [ -73.951373, 40.699633 ], [ -73.951011, 40.699677 ], [ -73.950091, 40.69979 ], [ -73.949794, 40.699823 ], [ -73.948132, 40.700006 ], [ -73.947248, 40.700104 ], [ -73.947128, 40.700122 ], [ -73.946316, 40.700214 ], [ -73.944618, 40.700405 ], [ -73.944388, 40.700424 ], [ -73.943723, 40.700505 ], [ -73.941931, 40.700725 ], [ -73.941149, 40.700281 ], [ -73.940463, 40.699897 ], [ -73.94042, 40.699873 ], [ -73.93969, 40.699455 ], [ -73.938901, 40.699036 ], [ -73.938569, 40.698848 ], [ -73.938177, 40.69864 ], [ -73.937774, 40.698404 ], [ -73.937391, 40.698185 ], [ -73.93676, 40.697831 ], [ -73.936388, 40.697615 ], [ -73.936007, 40.697405 ], [ -73.935223, 40.696986 ], [ -73.934797, 40.696736 ], [ -73.934689, 40.696674 ], [ -73.934607, 40.696628 ], [ -73.93458, 40.696612 ], [ -73.934488, 40.69656 ], [ -73.934134, 40.696358 ], [ -73.933828, 40.696184 ], [ -73.933119, 40.695791 ], [ -73.932366, 40.695358 ], [ -73.931929, 40.695114 ], [ -73.931774, 40.695028 ], [ -73.931472, 40.69486 ], [ -73.931212, 40.694712 ], [ -73.931145, 40.694673 ], [ -73.930511, 40.694316 ], [ -73.929702, 40.693863 ], [ -73.928829, 40.69335 ], [ -73.928828, 40.69335 ], [ -73.928643, 40.69324 ], [ -73.928507, 40.693165 ], [ -73.928042, 40.692905 ], [ -73.927782, 40.692761 ], [ -73.927507, 40.692603 ], [ -73.927071, 40.692346 ], [ -73.92645, 40.692001 ], [ -73.926316, 40.691928 ], [ -73.925561, 40.69149 ], [ -73.925349, 40.691366 ], [ -73.924392, 40.690831 ], [ -73.924292, 40.690773 ], [ -73.923644, 40.690398 ], [ -73.92317, 40.690123 ], [ -73.922807, 40.689923 ], [ -73.922071, 40.689489 ], [ -73.921306, 40.689071 ], [ -73.921214, 40.689019 ], [ -73.920961, 40.688871 ], [ -73.92055, 40.68864 ], [ -73.91981, 40.688211 ], [ -73.919061, 40.687784 ], [ -73.918783, 40.687626 ], [ -73.918293, 40.687356 ], [ -73.918046, 40.687213 ], [ -73.917681, 40.687004 ], [ -73.917552, 40.68693 ], [ -73.916798, 40.686497 ], [ -73.91661, 40.686391 ], [ -73.916046, 40.686072 ], [ -73.9155, 40.685761 ], [ -73.91529, 40.685645 ], [ -73.914701, 40.685316 ], [ -73.914689, 40.68531 ], [ -73.91454, 40.685226 ], [ -73.913797, 40.684799 ], [ -73.913307, 40.68452 ], [ -73.913037, 40.684367 ], [ -73.912273, 40.683934 ], [ -73.911512, 40.683504 ], [ -73.91077, 40.683092 ], [ -73.910025, 40.682657 ], [ -73.909275, 40.682234 ], [ -73.909055, 40.682105 ], [ -73.90886, 40.681993 ], [ -73.908516, 40.681803 ], [ -73.907772, 40.681377 ], [ -73.907018, 40.680948 ], [ -73.906719, 40.680767 ], [ -73.906283, 40.680506 ], [ -73.905659, 40.68014 ], [ -73.905548, 40.680071 ], [ -73.905493, 40.680037 ], [ -73.905414, 40.679992 ], [ -73.904789, 40.67965 ], [ -73.904569, 40.679515 ], [ -73.904046, 40.67922 ], [ -73.903491, 40.678897 ], [ -73.903208, 40.67874 ], [ -73.902565, 40.678345 ], [ -73.902022, 40.678026 ], [ -73.901454, 40.677693 ], [ -73.900464, 40.677122 ], [ -73.900149, 40.676949 ], [ -73.900046, 40.676893 ], [ -73.900792, 40.676572 ], [ -73.900962, 40.676502 ], [ -73.902456, 40.675881 ], [ -73.902577, 40.675831 ], [ -73.902678, 40.675789 ], [ -73.902758, 40.675759 ], [ -73.902919, 40.675684 ], [ -73.903021, 40.675656 ], [ -73.903138, 40.675622 ], [ -73.903474, 40.675506 ], [ -73.903744, 40.675406 ], [ -73.904288, 40.675229 ], [ -73.904388, 40.675206 ], [ -73.904509, 40.675052 ], [ -73.90524, 40.674724 ], [ -73.905826, 40.674469 ], [ -73.906094, 40.674352 ], [ -73.906297, 40.674265 ], [ -73.906957, 40.673985 ], [ -73.907468, 40.673761 ], [ -73.907877, 40.673566 ], [ -73.908278, 40.673379 ], [ -73.90833, 40.673355 ], [ -73.908419, 40.673313 ], [ -73.90924, 40.672954 ], [ -73.909462, 40.672861 ], [ -73.909898, 40.67268 ], [ -73.909958, 40.672655 ], [ -73.910143, 40.672579 ], [ -73.910193, 40.672558 ], [ -73.910375, 40.672483 ], [ -73.910463, 40.672446 ], [ -73.911046, 40.672204 ], [ -73.911099, 40.672182 ], [ -73.91116, 40.672155 ], [ -73.911335, 40.672076 ], [ -73.912218, 40.671687 ], [ -73.913086, 40.67131 ], [ -73.914039, 40.670896 ], [ -73.914545, 40.670675 ], [ -73.914619, 40.670643 ], [ -73.914873, 40.670532 ], [ -73.915534, 40.670243 ], [ -73.915585, 40.670221 ], [ -73.915729, 40.670158 ], [ -73.915804, 40.670125 ], [ -73.915862, 40.6701 ], [ -73.916472, 40.669836 ], [ -73.916523, 40.669814 ], [ -73.916585, 40.669787 ], [ -73.917136, 40.669543 ], [ -73.917483, 40.669392 ], [ -73.918382, 40.669002 ], [ -73.919231, 40.668631 ], [ -73.919418, 40.668397 ], [ -73.919956, 40.668319 ], [ -73.920048, 40.668276 ], [ -73.920149, 40.668229 ], [ -73.92102, 40.667852 ], [ -73.921872, 40.66748 ], [ -73.922216, 40.667333 ], [ -73.922753, 40.667097 ], [ -73.922811, 40.667071 ], [ -73.923034, 40.666974 ], [ -73.92312, 40.666936 ], [ -73.923232, 40.666887 ], [ -73.92331, 40.666853 ], [ -73.924245, 40.666444 ], [ -73.924391, 40.666381 ], [ -73.925463, 40.665916 ], [ -73.925922, 40.665715 ], [ -73.92638, 40.665514 ], [ -73.927394, 40.665074 ], [ -73.927712, 40.664934 ], [ -73.928229, 40.664709 ], [ -73.928722, 40.664495 ], [ -73.929052, 40.664351 ], [ -73.929168, 40.664299 ], [ -73.929404, 40.664199 ], [ -73.929874, 40.66399 ], [ -73.930685, 40.66362 ], [ -73.931607, 40.663556 ], [ -73.931602, 40.66323 ], [ -73.931556, 40.662755 ], [ -73.93148, 40.662051 ] ] ] );
