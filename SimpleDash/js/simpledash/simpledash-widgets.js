function sd_registerWidgetTypes () {
    sd.registerWidgetType("chart", function (elem, config) {
        elem.highcharts(config);
    });

    sd.registerWidgetType("table", function (elem, config) {
        elem.html("<table cellpadding='0' cellspacing='0' border='0' id='dataTable'></table>");
        config['sScrollY'] = config['widget']['height'] + "px";
        config['sScrollX'] = config['widget']['width'] + "px";
        elem.find("#dataTable").dataTable(config);
    });
}