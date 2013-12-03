function sd_registerDataProviders() {
    sd.registerDataProvider("as-is", function (id, config) { return config; });
    sd.registerDataProvider("sqlite3", sd_dp_SQLite3_call);
    sd.registerDataProvider("google-spreadsheet", sd_dp_GoogleSpreadsheet_call);
    sd.registerDataProvider("jira-issuestatus", sd_dp_JiraIssueStatus_call);
    sd.registerDataProvider("jira-issuelist", sd_dp_JiraIssueList_call);
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
                            var chart = $("#chart" + chartId).highcharts();
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

/**
 * JIRA Issue status chart
 */
function SimpleDashJiraIssueStatus() {
    var ckey = "jira-issuestatus";
    this.series = function (chartId, config) {
        // 1. perform JIRA API request
        var searchRequest = require("url").parse(config[ckey]['baseUrl']);

        for (var s in config[ckey]['series']) {
            searchRequest.search = require("querystring").stringify({
                "jql": config[ckey]['series'][s]['jql'],
                "fields": config[ckey]['series'][s]['fields']
            });
            sr = require("url").parse(searchRequest.format());
            sr.rejectUnauthorized = false;

            function responseHandler(s, chartId) {
                return function (res) {
                    res.on('data', function (d) {
                        if (!res.xData) { res.xData = "";}
                        res.xData += d.toString();
                    });
                    res.on('end', function () {
                        // 2. parse response and gather statuses by category
                        var response = JSON.parse(res.xData.toString());
                        var statusMap = {};
                        for (var i = 0; i < response.issues.length; i++) {
                            var statusName = response.issues[i].fields.status.name;
                            if (statusMap[statusName] == null) {
                                statusMap[statusName] = 0;
                            }
                            statusMap[statusName]++;
                        }
                        // 3. update config
                        var cats = [];
                        var chart = $("#chart" + chartId).highcharts();
                        var series = chart.get(s);
                        for (var key in statusMap) {
                            cats.push(key);
                            series.addPoint({name: key, y: statusMap[key]});
                        }
                        chart.xAxis[0].setCategories(cats);
                    });
                    res.on('error', function (e) {console.error(e);})
                }
            }

            require("https").get(sr, responseHandler(s, chartId));
        }
    }
}

var sd_dp_SimpleDashJiraIssueStatus = new SimpleDashJiraIssueStatus();

function sd_dp_JiraIssueStatus_call(id, config) {
    sd_dp_SimpleDashJiraIssueStatus.series(id, config);
    return config;
}

function SimpleDashJiraIssueList () {
    var ckey = "jira-issuelist";

    this.list = function (id, config) {
        // 1. perform JIRA API request
        var searchRequest = require("url").parse(config[ckey]['baseUrl']);

        searchRequest.search = require("querystring").stringify({
             "jql": config[ckey]['jql'],
             "fields": config[ckey]['fields'].toLowerCase()
        });
        sr = require("url").parse(searchRequest.format());
        sr.rejectUnauthorized = false;

        function responseHandler(chartId, fields) {
            return function (res) {
                res.on('data', function (d) {
                    if (!res.xData) { res.xData = "";}
                    res.xData += d.toString();
                });
                res.on('end', function () {
                    // 2. parse response and gather statuses by category
                    var response = JSON.parse(res.xData.toString());
                    var statusMap = {};

                    var rows = [];
                    var fieldArray = fields.split(",");
                    for (var i = 0; i < response.issues.length; i++) {
                        var row = [];
                        for (var j = 0; j < fieldArray.length; j++) {
                            var key = fieldArray[j].toLowerCase();
                            if (response.issues[i][key]) {
                                row[fieldArray[j]] = response.issues[i][key];
                            } else if (response.issues[i].fields && response.issues[i].fields[key] && response.issues[i].fields[key].name) {
                                row[fieldArray[j]] = response.issues[i].fields[key].name;
                            } else {
                                row[fieldArray[j]] = response.issues[i].fields[key];
                            }
                        }
                        rows.push(row);
                    }
                    // 3. update table
                    
                    for (var i = 0; i < rows.length; i++) {
                        $("#chart" + chartId).jtable('addRecord', { record: rows[i], clientOnly: true });
                    }
                });
                res.on('error', function (e) {console.error(e);})
            }
        }

        require("https").get(sr, responseHandler(id, config[ckey]['fields']));
    }
}

var sd_dp_SimpleDashJiraIssueList = new SimpleDashJiraIssueList();

/***/
function sd_dp_JiraIssueList_call (id, config) {
    sd_dp_SimpleDashJiraIssueList.list(id, config);
    return config;
}