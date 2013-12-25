function SimpleDashWidget (simpleDash, index, config) {
    this.simpleDash = simpleDash;
    this.index = index;
    this.config = config;
    this.dataProvider = config["widget"]["dataprovider"];
    
    if (!this.config["widget"]["type"]) {
        this.config["widget"]["type"] = "chart";
    }
    this.type = this.config["widget"]["type"];
    
    this.data = null;
    
    this.getPlaceholder = function () {
        var placeholder = [
                "<div class='widgetHolder resizable' id='chart",
                this.index,
                "' style='max-height:",
                this.config["widget"]["height"]
                ,"px; max-width:",
                this.config["widget"]["width"]
                ,"px'></div>"].join("");
        return placeholder;
    }
    
    this.fetchData = function () {
        var dp = this.simpleDash.getDataProvider(this.dataProvider);
        if (!dp) {
            throw new Error ("Unknown data provider " + this.dataProvider + " for widget " + this.index);
        }
        
        dp.fetchData(this.index, this.config, this, this.dataAvailable);
    }
    
    this.dataAvailable = function (data) {
        this.data = data;
        this.populateWidget();
    }
    
    this.populateWidget = function () {
        var display = this.simpleDash.getWidgetType(this.type);
        display.populate($("#workspace #chart" + this.index), this.config, this.data);
    }
}

function SimpleDash() {
    this.charts = [];

    this.configObj = {};
    this.chartConfig = [];
    this.chartWidgets = [];

    this.go = function () {
        // 1. read configuration file
        this.readConfiguration();
        // 2. prepare all chart widget
        var placeholders = this.prepareChartWidgets();
        // 3. draw
        this.drawChartWidgets(placeholders);
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
        for (var i = 0; i < this.configObj.charts.length; i++) {
            this.charts.push(new SimpleDashWidget(this, i, this.configObj.charts[i]));
        }
        this.chartConfig = this.configObj.charts;
    };
    
    /**
     * Prepare placeholders for each widget.
     */
    this.prepareChartWidgets = function () {
        var chartWidgets = [];
        for (var i = 0; i < this.charts.length; i++) {
            // 1. create placeholder
            chartWidgets.push(this.charts[i].getPlaceholder());
        }
        return chartWidgets;
    };
    
    /**
     * Draw everything
     */
    this.drawChartWidgets = function (placeholders) {
        var template = this.layoutTemplates[this.configObj["layout"]]["template"];
        $("#workspace")[0].innerHTML = Handlebars.compile(template)({"charts": placeholders});
    };
    
    /**
     * Initialize each chart
     */
    this.populateChartWidgets = function () {
        for (var i = 0; i < this.charts.length; i++) {
            var widget = this.charts[i];
            widget.fetchData();
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
        if (this.configObj["resizable"]) {
            $(".resizable").resizable();
        }
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
     * @param dataProviderObject function to process chart data configuration and emit Highchart config object
     */
    this.registerDataProvider = function (name, dataProviderObject) {
        this.dataProvider[name] = dataProviderObject;
    }
    
    this.getDataProvider = function (name) {
        return this.dataProvider[name];
    }
    
    this.clearCharts = function () {
        for (var i = 0; i < this.chartConfig.length; i++) {
            this.widgetTypes[this.chartConfig[i]["widget"]["type"]].clear($("#chart" + i), this.chartConfig[i]);
        }
    };

    /** Dictionary of know widget types. */
    this.widgetTypes = {};

    /**
     * Register new widget type.
     * @param name name of a widget type
     * @param widgetHandler widget configuration handler
     */
    this.registerWidgetType = function (name, widgetHandler) {
        this.widgetTypes[name] = widgetHandler;
    }
    
    this.getWidgetType = function (name) {
        return this.widgetTypes[name];
    }
}