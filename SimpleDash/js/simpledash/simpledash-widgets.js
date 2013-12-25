function SimpleDashChartWidget() {
    this.clear = function (elem, config) {
        var s = elem.highcharts().series;
        for (var j = 0; j < s.length; j++) {
            s[j].setData([]);
        }
    };

    this.populate = function (elem, config, data) {
        if (!data) {
            throw new Error("Empty data source");
        }
    
        var chart = elem.highcharts(config);
        if (data instanceof SimpleDashChartModel) {
            var seriesArray = data.getSeriesArray();
            for (var j = 0; j < seriesArray.length; j++) {
                var s = data.get(seriesArray[j]);
                var chartSeries = chart.highcharts().get(seriesArray[j]);
                var cats = [];
                for (var i = 0; i < s.length; i++) {
                    if (typeof(s[i]) == "object") {
                        chartSeries.addPoint({ name: s[i]["category"], y: s[i]["y"]});
                        cats.push(s[i]["category"]);                
                    } else {
                        chartSeries.addPoint(s[i]);                    
                    }
                }
                chart.highcharts().xAxis[0].setCategories(cats);
            }
        } else {
            throw new Error("Unsupported data source");
        }    
    }
}

function SimpleDashTableWidget() {
    this.tableId = 0;
    this.clear = function () {}
    this.populate = function (elem, config, data) {
        for (var field in config["fields"]) {
            if (config["fields"][field]["sd-display"]) {
                var template = config["fields"][field]["sd-display"];
                config["fields"][field]["display"] = function (data) {
                    return Handlebars.compile(template)({data: data});
                }
            }
        }

        elem.jtable(config);
        elem.find(".jtable-main-container")
                .css("max-height", config["widget"]["height"])
                .css("max-width", config["widget"]["width"])
                .css("height", config["widget"]["height"])
                .css("width", config["widget"]["width"])
                .css("overflow", "auto")
                ;

    }
}

function sd_registerWidgetTypes () {
    sd.registerWidgetType("chart", new SimpleDashChartWidget());
    sd.registerWidgetType("table", new SimpleDashTableWidget());
}