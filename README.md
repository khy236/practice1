# FOR SALE: Central Brooklyn
Central Brooklyn contains the greatest concentration of frequently sold or "flipped" properties in NYC. Together, Bed-Stuy, Bushwick, Crown Heights, and Ocean Hill contain 28% of all NYC properties that were sold 5+ times over the last three decades (from 2003 to 2023). This map invites users to think about the drivers behind the frequency and price at which these properties are sold and what these sales have meant for owners and residents by exploring data on flipped properties.

*Sample property profile*
<img src="images/result2.png" width="100%"/> 

## How to use this map
- Frequently-sold properties are highlighted in red. 
- Hover over a red, highlighted lot to view the Borough-Block-Lot (BBL) ID and address of the frequently-sold property that sits on it, as well as the number of times it has been sold since 2003.
- Click on the lot to view its sales history and more details about the property.
- If you would like to view frequently-sold properties outside Central Brooklyn, search for a specific address or toggle to a view of the entire city using the navigation buttons on the top-right.

<img src="images/hover3.png" width="32.9%"/> <img src="images/search.png" width="32.9%"/> <img src="images/citywide2.png" width="32.9%"/>

## Data sources
- Property sales data is from the [NYC Department of Finance Annualized Sales](https://www.nyc.gov/site/finance/taxes/property-annualized-sales-update.page).
- Tax lot outlines are from [NYC PLUTO](https://www.nyc.gov/site/planning/data-maps/open-data/dwn-pluto-mappluto.page).
- Neighborhood Tabulation Areas used to define the Central Brooklyn neighborhoods that this map focuses on are from [BYTES of the BIG APPLE™](https://www.nyc.gov/site/planning/data-maps/open-data.page).

## Map-mapping takeaways
Lessons learned:
- **Condensing information:** My first draft displayed a table of sales data rather than a chart. The table was difficult to create and format, and overwhelming to interpret. I sought advice from [@chriswhong](https://github.com/chriswhong), who directed me to try the chart.js package. It was remarkably easy to use and allowed me to display sales history in a way that didn't overwhelm the viewer.
- **Creating a responsive website layout:** Building on @chriswhong's [responsive web layout template](https://github.com/chriswhong/responsive-web-map-layout/tree/main), I designed this site to split the screen space between the map and data panel 50/50. While this looks simple, it took me many tries to display the map, data panel, and buttons in the sequence I wanted.

Challenges:
- **Interpreting sales patterns:** My first draft focused on Jackson Heights because it was an area that my initial data analysis flagged as a hotsplot for real estate sales. Turns out, I was counting all coop sales against the buildings they were in, resulting in concentrations of flipping in locations with concentrations of coops. I adjusted my data processing methodology to look for sales with the same address after that, as DOF annualized sales data includes unit numbers in addresses. While imperfect, this approach avoided double-counting.
- **Data processing workflow:** My data processing workflow was long and hard to replicate. I processed DOF sales data for most-flipped properties locally in R Studio and then uploaded the most-flipped properties to VS Studio where I converted the csv data from R into JSON format. Every time I changed my locational focus, I downloaded Neighborhood Tabulation Area polygons locally from BYTES of the BIG APPLE™, selected the ones I wanted in QGIS, and then exported them as geoJSONs to display in the map. Both these workflows are manual, time-consuming, and prone to error with repetition.

Opportunities for further exploration:
- **Data exploration:** X
- **Adding imagery:** X
- **Adding narrative:** X
