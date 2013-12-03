function SimpleDashChartWidget() {
    this.clear = function (elem, config) {
        var s = elem.highcharts().series;
        for (var j = 0; j < s.length; j++) {
            s[j].setData([]);
        }
    };

    this.populate = function (elem, config) {
        elem.highcharts(config);    
    }
}

function SimpleDashTableWidget() {
    this.tableId = 0;
    this.clear = function () {}
    this.populate = function (elem, config) {
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