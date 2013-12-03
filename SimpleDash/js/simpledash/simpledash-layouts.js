function sd_registerLayouts () {
    sd.registerLayout("wookmark", {
        "template": "<ul class='wookmark'>{{#each charts}}<li>{{{this}}}</li>{{/each}}</ul>",
        "initFunction": function () {
            $("ul.wookmark li").wookmark({autoResize: true, itemWidth: 200});
        }
    });

    sd.registerLayout("2x2", {
        "template": "<table width='100%' height='100%' id='grid2x2'><tr id='row0'>{{#each charts}}<td id='cell{{@index}}'>{{{this}}}</td>{{/each}}</tr><tr id='row1'></tr></table>",
        "initFunction": function () {
            // re-shuffle cells to their proper place
            $("#grid2x2 #cell2").appendTo("#grid2x2 #row1");
            $("#grid2x2 #cell3").appendTo("#grid2x2 #row1");
        }
    });
    
    sd.registerLayout("3x2", {
        "template": "<table width='100%' height='100%' id='grid3x2'><tr id='row0'>{{#each charts}}<td id='cell{{@index}}'>{{{this}}}</td>{{/each}}</tr><tr id='row1'></tr></table>",
        "initFunction": function () {
            // re-shuffle cells to their proper place
            $("#grid3x2 #cell3").appendTo("#grid3x2 #row1");
            $("#grid3x2 #cell4").appendTo("#grid3x2 #row1");
            $("#grid3x2 #cell5").appendTo("#grid3x2 #row1");
        }
    });

    sd.registerLayout("masonry", {
        "template": "<div id='masonry'>{{#each charts}}<div class='item'>{{{this}}}</div>{{/each}}</div>",
        "initFunction": function () {
            $("div#masonry").masonry({
                itemSelector: ".item",
                columnWidth: 400, // XXX: make configurable
                gutter: 10
            });
        }
    });

    sd.registerLayout("gridster", {
        "template": "<div id='gridster'><ul>{{#each charts}}<li>{{{this}}}</li>{{/each}}</ul></div>",
        "initFunction": function () {
            $("div#gridster ul").gridster({
                widget_margins: [10, 10],
                widget_base_dimensions: [400, 400]
            });
        }
    });
};