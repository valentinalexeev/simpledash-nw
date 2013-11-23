function sd_registerDataProviders() {
    sd.registerDataProvider("as-is", function (id, config) { return config; });
    sd.registerDataProvider("sqlite3", sd_dp_SQLite3_call);
    sd.registerDataProvider("google-spreadsheet", sd_dp_GoogleSpreadsheet_call);
}

/**
 * SQLite3 Data provider using node-sqlite3 implementation.
 */
function SimpleDashSQLite3 () {
    this.connections = [];
    this.sql = null;
    
    this.open = function (chartId, config) {
        if (this.sql == null) {
            this.sql = require("sqlite3");
        }
        if (this.connections[chartId] == null) {
            this.connections[chartId] = new this.sql.Database(config["sqlite3"]["database"]);
        }
    }
    
    this.series = function (chartId, config) {
        if (config["sqlite3"]["series"]) {
            for (var seriesName in config["sqlite3"]["series"]) {
                function updateSeriesGenerator(series) {
                    return function (err, rows) {
                        if (err) {
                            console.log(err);
                        } else {
                            var cats = [];
                            var chart = $("#chart" + chartId).highcharts()
                            var s = chart.get(series);
                            for (var i = 0; i < rows.length; i++) {
                                s.addPoint({ name: rows[i]["category"], y: rows[i]["y"]});
                                cats.push(rows[i]["category"]);
                            }
                            chart.xAxis[0].setCategories(cats);
                        }
                    }
                };
            
                this.connections[chartId].all(config["sqlite3"]["series"][seriesName]["sql"], updateSeriesGenerator(seriesName));
            }
        }
    }
}

var sd_dp_SQLite3 = new SimpleDashSQLite3();

function sd_dp_SQLite3_call (id, config) {
    // 1. open database
    sd_dp_SQLite3.open(id, config);
    // 2. if series query present - execute and populate
    sd_dp_SQLite3.series(id, config);
    // 4. cleanup
    return config;
}

/**
 */
function SimpleDashGoogleSpreadsheet() {
    var ckey = "google-spreadsheet";
    this.connections = [];
    this.open = function (chartId, config) {
        if (!this.connections[chartId]) {
            var gs = require(ckey);
            var conn = new gs(config[ckey]["key"]);
            conn.setAuth(config[ckey]["email"], config[ckey]["password"], function (err) {console.log(err);});
            this.connections[chartId] = conn;
        }
    };
    
    this.series = function (chartId, config) {
        if (config[ckey]["series"]) {
            for (var seriesName in config[ckey]["series"]) {
                function updateSeriesGenerator(series, nameLabel, yLabel, yType) {
                    return function (err, rows) {
                        if (err) {
                            console.log(err);
                        } else {
                            var cats = [];
                            var chart = $("#chart" + chartId).highcharts()
                            var s = chart.get(series);
                            var yValue;
                            for (var i = 0; i < rows.length; i++) {
                                yValue = rows[i][yLabel];
                                if (yType == "float") {
                                    yValue = parseFloat(yValue);
                                }
                                s.addPoint({ name: rows[i][nameLabel], y: yValue});
                                cats.push(rows[i][nameLabel]);
                            }
                            chart.xAxis[0].setCategories(cats);
                        }
                    }
                };
                var cfg = config[ckey]["series"][seriesName];
            
                this.connections[chartId].getRows(
                    cfg["sheet"],
                    {},
                    "",
                    updateSeriesGenerator(seriesName, cfg["name"], cfg["y"], cfg["yType"])
                );
            }
        }
    };
}

var sd_dp_GoogleSpreadsheet = new SimpleDashGoogleSpreadsheet();

function sd_dp_GoogleSpreadsheet_call (id, config) {
    sd_dp_GoogleSpreadsheet.open(id, config);
    sd_dp_GoogleSpreadsheet.series(id, config);

    return config;
}