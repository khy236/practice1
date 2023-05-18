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
- *Condensing information:* My first draft displayed a table of sales data rather than a chart. The table was difficult to create and format, and overwhelming to interpret. I sought advice from my Professor (@chriswhong) and he directed me to try the jscharts package, which was remarkably easy to use and allowed me to display sales history in a way that didn't overwhelm the viewer.
- *Creating a responsive website layout:* Building on @chriswhong 's responsive web layout template, I designed this site to split the screen space between the map and data panel 50/50. While this looks simple, it took me many tries to display the map, data panel, and buttons in the sequence I wanted.

Challenges:
- *Data processing workflow:* X
- *X:* X

Opportunities for further exploration:
- *Data exploration:* X
- *Adding imagery:* X
- *Adding narrative:* X
