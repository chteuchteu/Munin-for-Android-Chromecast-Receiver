// Set CHROMECAST to false when debugging on a web browser
var CHROMECAST = false;
var DEBUG = true;

window.onload = function() {
    if (CHROMECAST) {
        cast.receiver.logger.setLevelValue(0);
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        log('Starting Receiver Manager');

        // handler for the 'ready' event
        castReceiverManager.onReady = function(event) {
            log('Received Ready event: ' + JSON.stringify(event.data));
            window.castReceiverManager.setApplicationState("Application status is ready...");
            hideLoading();
        };

        // handler for 'senderconnected' event
        castReceiverManager.onSenderConnected = function(event) {
            log('Received Sender Connected event: ' + event.data);
            log(window.castReceiverManager.getSender(event.data).userAgent);
        };

        // handler for 'senderdisconnected' event
        castReceiverManager.onSenderDisconnected = function(event) {
            log('Received Sender Disconnected event: ' + event.data);
            if (window.castReceiverManager.getSenders().length == 0) {
                window.close();
            }
        };

        // handler for 'systemvolumechanged' event
        /*castReceiverManager.onSystemVolumeChanged = function(event) {
         log('Received System Volume Changed event: ' + event.data['level'] + ' ' + event.data['muted']);
         };*/

        // create a CastMessageBus to handle messages for a custom namespace
        window.messageBus = window.castReceiverManager.getCastMessageBus(
            'urn:x-cast:com.chteuchteu.munin');

        // handler for the CastMessageBus message event
        window.messageBus.onMessage = function(event) {
            log('Message [' + event.senderId + ']: ' + event.data);
            // display the message from the sender
            receiveMessage(event.data);
            // inform all senders on the CastMessageBus of the incoming message event
            // sender message listener will be invoked
            window.messageBus.send(event.senderId, event.data);
        };

        // initialize the CastReceiverManager with an application status message
        window.castReceiverManager.start({statusText: "Application is starting"});
        log('Receiver Manager started');
    } else {
        hideLoading();
        initGrid('Grid test');
        inflateGridItems([
            {'graphUrl': 'http://demo.munin-monitoring.org/munin-cgi/munin-cgi-graph/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-day.png',
                'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '0', 'y': '0'},
            {'graphUrl': 'http://demo.munin-monitoring.org/munin-cgi/munin-cgi-graph/munin-monitoring.org/demo.munin-monitoring.org/traffic-day.png',
                'pluginName': 'Traffic per interface', 'serverName': 'demo.munin-monitoring.org', 'x': '1', 'y': '0'},
            {'graphUrl': 'http://demo.munin-monitoring.org/munin-cgi/munin-cgi-graph/munin-monitoring.org/demo.munin-monitoring.org/cpu-day.png',
                'pluginName': 'CPU usage', 'serverName': 'demo.munin-monitoring.org', 'x': '2', 'y': '0'},
            {'graphUrl': 'http://demo.munin-monitoring.org/munin-cgi/munin-cgi-graph/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-day.png',
                'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '0', 'y': '1'},
            {'graphUrl': 'http://demo.munin-monitoring.org/munin-cgi/munin-cgi-graph/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-day.png',
                'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '2', 'y': '1'},
            {'graphUrl': 'http://demo.munin-monitoring.org/munin-cgi/munin-cgi-graph/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-day.png',
                'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '3', 'y': '1'},
            {'graphUrl': 'http://demo.munin-monitoring.org/munin-cgi/munin-cgi-graph/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-day.png',
                'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '0', 'y': '2'}
        ]);
    }
};

function hideLoading() {
    stopAnimation();
    $('#loaderImage').hide();
    $('#preloader').fadeOut();
}

function initGrid(gridName) {
    $('#gridName').text(gridName);
}

function receiveMessage(text) {
    var jsonMessage = JSON.parse(text);
    var action = jsonMessage['action'];

    switch (action) {
        case 'inflate_grid':
            initGrid(jsonMessage["gridName"]);
            inflateGridItems(jsonMessage['gridItems']);
            break;
        default: break;
    }
}

function inflateGridItems(gridItems) {
    var maxRow = getMaxRows(gridItems);

    for (var y=0; y<=maxRow; y++) {
        var rowItems = getRowItems(gridItems, y);

        var rowHtml = '';
        for (var i=0; i<rowItems.length; i++)
            rowHtml += getGridItemHtml(rowItems[i]);

        $('#gridsContainer').append('<div class="gridItemsRow">' + rowHtml + '</div>');
    }

    fluidGrid(gridItems);
}

function getGridItemHtml(gridItem) {
    return  '<div class="gridItemContainer">' +
    '    <div class="gridItem paper">' +
    '        <div class="gridItem_graph" style="background-image:url(\'' + gridItem['graphUrl'] + '\')"></div>' +
    '        <div class="gridItemInfos">' +
    '            <div class="gridItem_pluginName">' + gridItem['pluginName'] + '</div>' +
    '            <div class="gridItem_serverName">' + gridItem['serverName'] + '</div>' +
    '       </div>' +
    '   </div>' +
    '</div>';
}

function getMaxRows(gridItems) {
    var maxRow = 0;
    for (var i=0; i<gridItems.length; i++) {
        var y = gridItems[i]['y'];
        if (y > maxRow)
            maxRow = y;
    }
    return maxRow;
}

function getRowItems(gridItems, y) {
    var rowItems = [];
    for (var i=0; i<gridItems.length; i++) {
        if (gridItems[i]['y'] == y)
            rowItems[rowItems.length] = gridItems[i];
    }

    return rowItems;
}

function getWidestRowItemsCount(gridItems) {
    var widestRow = -1;
    var widestRowCount = -1;

    for (var y=0; y<=getMaxRows(gridItems); y++) {
        var nbItems = getRowItems(gridItems, y).length;
        if (nbItems > widestRowCount) {
            widestRowCount = nbItems;
            widestRow = y;
        }
    }

    return widestRowCount;
}

function fluidGrid(gridItems) {
    var gridItemsRowList = $('.gridItemsRow');

    // Set gridItemContainers width
    var gridItemMaxWidthCssAttr = $('.gridItemContainer').first().css('max-width');
    var gridItemMaxWidth = gridItemMaxWidthCssAttr.substr(0, 3);
    var widestRowItemsCount = getWidestRowItemsCount(gridItems);
    var width = ($('#gridsContainer').width() - 30) / widestRowItemsCount;
    if (width > gridItemMaxWidth)
        width = gridItemMaxWidth;
    width = Math.trunc(width);

    gridItemsRowList.children().css('min-width', width);

    // Set gridItem_graphs height
    var ratio = 497/228;
    gridItemsRowList.each(function() {
        $(this).find('.gridItem_graph').each(function() {
            var width = $(this).width();
            var height = width * (1/ratio);
            height = Math.trunc(height);
            $(this).css('height', height);
        });
    });
}

function preview(graphUrl, pluginName, serverName) {
    $('.card-pluginName').text(pluginName);
    $('.card-serverName').text(serverName);
    $('#card-graph').attr('src', graphUrl);
    $('#fullscreen').show();
}

function log(msg) {
    if (DEBUG)
        console.log(msg);
}