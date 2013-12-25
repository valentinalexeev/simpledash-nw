/**
 * A data model for graphs - data points organized in series.
 */
function SimpleDashChartModel () {
    this.series = {};
    this.categories = [];
    
    /**
     * Add new series
     * @param seriesName add new series if it doesn't exist
     * @return series data points as array
     */
    this.add = function (seriesName) {
        if (!this.series[seriesName]) {
            this.series[seriesName] = [];
        }
        return this.series[seriesName];
    }
    
    this.setData = function (seriesName, data) {
        this.series[seriesName] = data;
    }
    
    /**
     * Get series specified by name.
     * @return array of datapoints
     */
    this.get = function (seriesName) {
        return this.series[seriesName];
    }
    
    /**
     * Get all series' names.
     * @return array of series names
     */
    this.getSeriesArray = function () {
        var res = [];
        for (var key in this.series) {
            res.push(key);
        }
        return res;
    }
    
    this.getCategories = function () {
        return this.categories;
    }
    
    this.setCategories = function (categories) {
        this.categories = categories;
    }
}

/**
 * Data model for table data.
 */
function SimpleDashTableModel () {
    this.columns = {};
    this.data = [];
    
    /** Add new column.
     * @param columnName new column name
     */
    this.addColumn = function (columnName) {
        this.columns[columnName] = true;
    }
    
    /**
     * Add new data row.
     * @param rowObj row object to load.
     */
    this.addRow = function (rowObj) {
        this.data.push(rowObj);
    }
    
    /**
     * Get all columns.
     * @return array of column names
     */
    this.getColumns = function () {
        var res = [];
        for (var key in this.columns) {
            res.push(key);
        }
        return res;
    }
}