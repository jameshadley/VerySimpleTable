/**
 * Very simple Javascript tables with server-side paging, sorting and filtering
 * Requires JQuery
 * @author James Hadley http://www.sysadmin.co.uk/
 * @license The MIT License
 * @constructor
 */

function VerySimpleTable() {};
var VerySimple = {};

/**
 * @param callUrl The URL to POST data to: see readme for explanation
 * @param container The ID of the element to populate
 * @param columns An array containing a list of columns to draw
 */
VerySimpleTable.prototype.initalise = function(input) {
    VerySimple.skip      = 0;
    VerySimple.take      = 10;
    VerySimple.sortBy    = 'id';
    VerySimple.direction = 'ASC';
    VerySimple.filter    = '';
    VerySimple.takeVals  = [10, 25, 50, 100, 200];
    VerySimple.callUrl   = input.callUrl;
    VerySimple.editUrl   = input.editUrl;
    VerySimple.deleteUrl = input.deleteUrl;
    VerySimple.container = input.container;
    VerySimple.columns   = input.columns;
    VerySimple.postData  = input.postData;

    VerySimpleTable.redraw();
};

VerySimpleTable.setField = function(field, value) {
    // Toggle sort direction if heading clicked on again
    if(field == 'sortBy' && value == VerySimple.sortBy) VerySimple['direction'] = (VerySimple['direction'] == 'ASC') ? 'DESC' : 'ASC';
    VerySimple[field]= value;
    VerySimpleTable.redraw();
}


VerySimpleTable.redraw = function() {
    var url = VerySimple.callUrl+'?skip='+VerySimple.skip+'&take='+VerySimple.take+'&sortBy='+VerySimple.sortBy+'&direction='+VerySimple.direction+'&filter='+VerySimple.filter;
    $.ajax({
        type: 'POST',
        url: url,
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(VerySimple.postData),
        error: function () {
            alert("Unexpected error")
        },
        success: function (data) {
            // Error handing
            if (data.status == 'error') alert(data.data);
            else {
                // Filter and take
                var htmlToInsert = '<div class="row"><div class="col-sm-3"><input type="text" class="form-control" placeholder="Filter" onchange="VerySimpleTable.setField(\'filter\', this.value)" value="' + VerySimple.filter + '"></div><div class="col-sm-3 col-sm-offset-6" align="right">Page Size: <select onchange="VerySimpleTable.setField(\'take\', this.value)">';
                $.each(VerySimple.takeVals, function (index) {
                    if (VerySimple.take == VerySimple['takeVals'][index]) {
                        htmlToInsert += '<option value="' + VerySimple['takeVals'][index] + '" selected="selected">' + VerySimple['takeVals'][index] + '</option>';
                    } else {
                        htmlToInsert += '<option value="' + VerySimple['takeVals'][index] + '">' + VerySimple['takeVals'][index] + '</option>';
                    }
                })
                htmlToInsert += '</select></div>';

                // Create header
                htmlToInsert += '<table class="table"><thead>';

                // Create headings
                $.each(VerySimple.columns, function (index) {
                    htmlToInsert += '<th style="text-transform: capitalize"><a style="cursor: pointer" onclick="VerySimpleTable.setField(\'sortBy\', \'' + VerySimple.columns[index] + '\')">' + VerySimple.columns[index].split('_').join(' ')+'</a></th>';
                });

                // Edit and delete
                if(VerySimple.editUrl != '' || VerySimple.deleteUrl != '') {
                    htmlToInsert += '<th>&nbsp;</th>';
                }

                htmlToInsert += '</thead><tbody>'

                // Iterate over rows
                $.each(data.data, function (index) {
                    // Start row
                    htmlToInsert += '<tr>';

                    // Iterate over data items
                    var tableRow = {};
                    $.each(data['data'][index], function (field, value) {
                        if ($.inArray(field, VerySimple.columns) !== false) tableRow[field] = value;
                    });

                    // Iterate over columns
                    $.each(VerySimple.columns, function (column) {
                        htmlToInsert += '<td>' + tableRow[VerySimple.columns[column]] + '</td>';
                    });

                    if(VerySimple.editUrl != '' || VerySimple.deleteUrl != '') {
                        htmlToInsert += '<td>';
                        if(VerySimple.editUrl != '') htmlToInsert += '<a class="btn btn-info" href="'+VerySimple.editUrl+'?'+VerySimple.columns[0]+'='+tableRow[VerySimple.columns[0]]+'">Edit</a>';
                        if(VerySimple.deleteUrl != '') htmlToInsert += '<a class="btn btn-danger" href="'+VerySimple.deleteUrl+'?'+VerySimple.columns[0]+'='+tableRow[VerySimple.columns[0]]+'">Delete</a>';
                        htmlToInsert += '</td>'
                    }

                    // End row
                    htmlToInsert += '</tr>';
                });

                // Create footer
                htmlToInsert += '</tbody></table>';

                // Create pagination
                var pages = Math.ceil(data['count'] / VerySimple.take);
                htmlToInsert += '<ul class="pagination">';
                for (var i = 0; i < pages; i++) htmlToInsert += '<li><a onclick="VerySimpleTable.setField(\'skip\', ' + i * VerySimple.take + ')" style="cursor: pointer">' + (i + 1) + '</a></li>';
                htmlToInsert += '</ul>';

                $('#' + VerySimple.container).html(htmlToInsert);
            }
        }
    });
}
