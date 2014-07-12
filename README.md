simpledash-nw
=============

Re-implementation of SimpleDash as Node-WebKit application

Description
===========

SimpleDash is an app to display dashboards derived from various information sources.

The following data sources are supported now:
- as-is: a dummy data source with set data,
- sqlite3: perform queries against SQLite3 database,
- google-spreadsheet: fetch data from Google Spreadsheet

Dependencies
============

- node-webkit

References
==========

SimpleDash uses the following excellent work from the community:
- node-webkit
- sqlite3 node.js module
- google-spreadsheet module
- jQuery for ease of life
- Handlebarsjs for internal templating
- Wookmark for Pinterest-like layout
- Highcharts for it's main charting purpose
- Masonry as yet another pinterest-like layout

Limitations
===========

To use sqlite3 module it is necessary to have pre-compiled node-webkit module for specific platform.
The repository contains one for Mac OS X - I'll try to add others as I build them.
