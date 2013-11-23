function SimpleDash() {
    this.configObj = {};
    this.chartConfig = [];
    this.chartWidgets = [];

    this.go = function () {
//        $("#workspace")[0].innerHTML = "<h1>Hello!</h1>";
        // 1. read configuration file
        this.readConfiguration();
        // 2. prepare all chart widget
        this.prepareChartWidgets();
        // 3. draw
        this.drawChartWidgets();
        // 4. populate with data
        this.populateChartWidgets();
        // 5. apply general layout
        this.applyLayout();
    };
    
    /**
     * Read configuration file using Node.js API
     */
    this.readConfiguration = function () {
        var app = require("nw.gui").App;
        
        
        var config = "../simpledash-config.json";
        
        if (app.argv.length > 0) {
            config = app.argv[0];
        }
        
        var fs = require("fs");
        var configFile = fs.readFileSync("../simpledash-config.json", {encoding: "utf8"});
        
        this.configObj = JSON.parse(configFile);
        this.chartConfig = this.configObj.charts;
    };
    
    /**
     * Scan configuration, fetch data
     */
    this.prepareChartWidgets = function () {
        for (var i = 0; i < this.chartConfig.length; i++) {
            var chart = this.chartConfig[i];
            // 1. create placeholder
            var placeholder = [
                "<div id='chart",
                i,
                "' height='",
                chart["widget"]["height"]
                ,"' width='",
                chart["widget"]["width"]
                ,"'></div>"].join("");
            this.chartWidgets[i] = placeholder;
        }
    };
    
    /**
     * Draw everything
     */
    this.drawChartWidgets = function () {
        var template = this.layoutTemplates[this.configObj["layout"]]["template"];
        $("#workspace")[0].innerHTML = Handlebars.compile(template)({"charts": this.chartWidgets});
    };
    
    /**
     * Initialize each chart
     */
    this.populateChartWidgets = function () {
        for (var i = 0; i < this.chartConfig.length; i++) {
            var chart = this.chartConfig[i];
            if (this.dataProvider[chart["widget"]["dataprovider"]] == null) {
                console.log("Unable to find provider " + chart["widget"]["dataprovider"] + " for chart " + i);
                continue;
            }
            $("#workspace #chart" + i).highcharts(this.dataProvider[chart["widget"]["dataprovider"]](i, chart));
        }
    }
    
    /**
     * Apply general layout
     */
    this.applyLayout = function () {
        if (this.layoutTemplates[this.configObj["layout"]] == null) {
            alert("Unknown layout: " + this.configObj["layout"]);
        }
        this.layoutTemplates[this.configObj["layout"]]["initFunction"]();
    }

    /**
     * Predefined layout templates.
     * Each object must contain handlebarjs "template" to render all charts (iterating over charts object) and
     * "initFunction" that will be called after rendered layout was inserted into DOM tree
     */
    this.layoutTemplates = {};
    
    /**
     * Register (or replace) layout template.
     * @param name name of a template
     * @param config configuration object with template and initFunction keys
     */
    this.registerLayout = function (name, config) {
        this.layoutTemplates[name] = config;
    };
    
    /** Known data providers. */
    this.dataProvider = {};
    
    /**
     * Register data provider.
     * @param name name of a data provider.
     * @param dataProviderFunc function to process chart data configuration and emit Highchart config object
     */
    this.registerDataProvider = function (name, dataProviderFunc) {
        this.dataProvider[name] = dataProviderFunc;
    }
    
    this.clearCharts = function () {
        for (var i = 0; i < this.chartConfig.length; i++) {
            var s = $("#chart" + i).highcharts().series;
            for (var j = 0; j < s.length; j++) {
                s[j].setData([]);
            }
        }
    };
}