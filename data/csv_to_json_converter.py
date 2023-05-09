# Adapted from: https://chenyuzuoo.github.io/posts/56646/

import csv

# Read in raw data from csv
rawData = csv.reader(open('data/reflips_230428.csv', 'rt'), dialect='excel')

# the template. where data from the csv will be formatted to geojson
template = \
   ''' \
   { "bbl" : "%s", 
   "saleprice" : "%s", 
   "prev_saleprice": "%s",
   "sale_date" : "%s", 
   "prev_saledate": "%s", 
   "saletime": "%s"},
   '''

# the head of the geojson file
output = \
   ''' \

[   '''


# loop through the csv
iter = 0
i=0
for row in rawData:
   iter += 1
   # skip first row
   if iter >= 2:
      bbl = str(row[5])
      saleprice = str(row[13])
      prev_saleprice = str(row[18])
      sale_date = str(row[14])
      prev_saledate = str(row[17])
      saletime = str(row[19])
      output += template % (bbl, saleprice, prev_saleprice, sale_date, prev_saledate, saletime)
     

# COLUMNS
# 0"",
# 1"address",
# 2"borough",
# 3"block",
# 4"lot",
# 5"bbl",
# 6"zipcode",
# 7"numbldgs",
# 8"unitsres.x",
# 9"unitscomm",
# 10"unitstotal",
# 11"yearbuilt",
# 12"borocode",
# 13"saleprice",
# 14"saledate",
# 15"unitsres.y",
# 16"num_sales",
# 17"prev_saledate",
# 18"prev_saleprice",
# 19"saletime"

# SAMPLE ROW
# "1","BARRY STREET","Bronx",2737,20,2027370020,10474,0,0,0,0,0,2,0,2015-03-02,0,6,NA,NA,NA



# the tail of the geojson file
output += \
   ''' \
]
   '''


# opens an geoJSON file to write the output
outFileHandle = open("data/reflips_230428.json", "w")
outFileHandle.write(output)
outFileHandle.close()
