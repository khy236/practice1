# Adapted from: https://chenyuzuoo.github.io/posts/56646/

import csv

# Read in raw data from csv
rawData = csv.reader(open('data/reflips_230514.csv', 'rt'), dialect='excel')

# the template. where data from the csv will be formatted to geojson
template = \
   ''' \
   {"bbl" : "%s", 
   "saleprice" : "%s", 
   "prev_saleprice": "%s",
   "sale_date" : "%s", 
   "prev_saledate": "%s", 
   "saletime": "%s",
   "address": "%s",
   "apt_num": "%s",
   "building_class_category": "%s",
   "totalunits": "%s",
   "unitsres": "%s",
   "unitscom": "%s"},
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
      bbl = str(row[1])
      saleprice = str(row[2])
      prev_saleprice = str(row[12])
      sale_date = str(row[3])
      prev_saledate = str(row[11])
      saletime = str(row[13])
      address = str(row[8])
      apt_num = str(row[9])
      building_class_category = str(row[7])
      totalunits = str(row[6])
      unitsres = str(row[4])
      unitscom = str(row[5])
      output += template % (bbl, saleprice, prev_saleprice, sale_date, prev_saledate, saletime, address, apt_num, building_class_category, totalunits, unitsres, unitscom)
     

"""
COLS
0"",
1"bbl",
2"saleprice",
3"saledate",
4"unitsres",
5"unitscom",
6"units",
7"building_class_category",
8"address",
9"apartment_number",
10"num_sales",
11"prev_saledate",
12"prev_saleprice",
13"saletime"

SAMPLE ROW
"1",5078950034,335000,2004-12-04,1,0,1,"01  ONE FAMILY HOMES","1 ACADEMY AVENUE",NA,7,NA,NA,NA
 """


# the tail of the geojson file
output += \
   ''' \
]
   '''


# opens an geoJSON file to write the output
outFileHandle = open("data/reflips_230514.json", "w")
outFileHandle.write(output)
outFileHandle.close()
