/**
 * Munin-for-Android-Chromecast-Receiver
 */

var PeriodEnum = {
    DAY: { val: 'day' },
    WEEK: { val: 'week' },
    MONTH: { val: 'month' },
    YEAR: { val: 'year' }
};

(function($, window) {
    var ChromecastReceiver = function(options) {
        this.options = options;
        this.init();
    };

    ChromecastReceiver.prototype = {
        defaults: {
            // Set to false when debugging in a web browser
            chromecast: true,
            // Set to false to disable logging
            debug: true,
            autorefreshInterval: 5*60*1000, // 5 minutes
            graphAspectRatio: 497/228
        },

        log: function(str) {
            if (this.settings.debug)
                console.log(str);
        },

        init: function() {
            this.settings = $.extend({}, this.defaults, this.options);

            // Vars
            this.gridItems = [];
            this.gridName = '';
            this.period = PeriodEnum.DAY;

            // Chromecast
            this.castReceiverManager = null;
            this.messageBus = null;

            // UI
            this.ui = {
                body: $('body'),
                gridName: $('#gridName'),
                preloader: $('#preloader'),
                gridsContainer: $('#gridsContainer')
            };

            if (this.settings.chromecast)
                this.initForChromecast();
            else
                this.initForDebug();
        },

        initForChromecast: function() {
            var that = this;

            cast.receiver.logger.setLevelValue(0);
            this.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
            this.log('Starting Receiver Manager');

            // handler for the 'ready' event
            this.castReceiverManager.onReady = function(event) {
                that.log('Received Ready event: ' + JSON.stringify(event.data));
                that.castReceiverManager.setApplicationState("Munin for Android");
                that.hideLoading();
            };

            // handler for 'senderconnected' event
            this.castReceiverManager.onSenderConnected = function(event) {
                that.log('Received Sender Connected event: ' + event.data);
                that.log(that.castReceiverManager.getSender(event.data).userAgent);
            };

            // handler for 'senderdisconnected' event
            this.castReceiverManager.onSenderDisconnected = function(event) {
                // Here, either the sender intentionally disconnected (closed_by_peer),
                // or the connection has been lost (transport_closed)
                that.log('Received Sender Disconnected event: ' + event.data);
                if (event.reason == cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER
                        && that.castReceiverManager.getSenders().length == 0) {
                    window.close();
                }
                else
                    that.log('(ignoring)');
            };

            // handler for 'systemvolumechanged' event
            /*castReceiverManager.onSystemVolumeChanged = function(event) {
            that.log('Received System Volume Changed event: ' + event.data['level'] + ' ' + event.data['muted']);
            };*/

            // create a CastMessageBus to handle messages for a custom namespace
            this.messageBus = this.castReceiverManager.getCastMessageBus(
                'urn:x-cast:com.chteuchteu.munin');

            // handler for the CastMessageBus message event
            this.messageBus.onMessage = function(event) {
                that.log('Message [' + event.senderId + ']: ' + event.data);

                that.receiveMessage(event.data);

                // Inform all senders on the CastMessageBus of the incoming message event
                // sender message listener will be invoked
                that.messageBus.send(event.senderId, event.data);
            };

            // initialize the CastReceiverManager with an application status message
            this.castReceiverManager.start({statusText: "Application is starting"});
            this.log('Receiver Manager started');
        },

        initForDebug: function() {
            this.hideLoading();
            this.gridName = 'Grid test';
            this.initGrid();

            this.gridItems = [
                {'graphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-{period}.png',
                    'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '0', 'y': '0',
                    'masterName': 'munin-monitoring.org',
                    'hdGraphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/if1sec_eth0-pinpoint={pinpoint1},{pinpoint2}.png?size_x={size_x}&size_y={size_y}'},
                {'graphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/virtualwebhosts-{period}.png',
                    'pluginName': 'Traffic per interface', 'serverName': 'demo.munin-monitoring.org', 'x': '1', 'y': '0',
                    'masterName': 'munin-monitoring.org'},
                {'graphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-{period}.png',
                    'pluginName': 'CPU usage', 'serverName': 'demo.munin-monitoring.org', 'x': '2', 'y': '0',
                    'masterName': 'munin-monitoring.org'},
                {'graphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-{period}.png',
                    'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '0', 'y': '1',
                    'masterName': 'munin-monitoring.org'},
                {'graphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-{period}.png',
                    'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '2', 'y': '1',
                    'masterName': 'munin-monitoring.org'},
                {'graphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-{period}.png',
                    'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '3', 'y': '1',
                    'masterName': 'munin-monitoring.org'},
                {'graphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-{period}.png',
                    'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '0', 'y': '2',
                    'masterName': 'munin-monitoring.org'},
                {'graphUrl': 'http://demo.munin-monitoring.org/munin-monitoring.org/demo.munin-monitoring.org/multicpu1sec-{period}.png',
                    'pluginName': 'multicpu1sec', 'serverName': 'demo.munin-monitoring.org', 'x': '3', 'y': '0',
                    'masterName': 'munin-monitoring.org'}
            ];

            this.inflateGridItems();
        },

        hideLoading: function() {
            this.ui.preloader.delay(2500).fadeOut();
        },

        /**
         * Called once the connection with the sender is established,
         *  but also each time a change is made in the Grid on the sender
         */
        inflateGridItems: function() {
            this.ui.gridsContainer.html('');

            var maxRow = Util.getMaxRows(this.gridItems);
            for (var y=0; y<=maxRow; y++) {
                var rowItems = Util.getRowItems(this.gridItems, y);

                var rowHtml = '';
                for (var i=0; i<rowItems.length; i++)
                    rowHtml += this.getGridItemHTML(rowItems[i]);

                this.ui.gridsContainer.append('<div class="gridItemsRow">' + rowHtml + '</div>');
            }

            // Check if we should hide server / master name
            var serverNames = $('.serverName'),
                masterNames = $('.masterName'),
                bullets = $('.bullet'),
                infosContainer = $('.gridItem_serverName');
            var hideServerName = Util.shouldHideServerName(this.gridItems),
                hideMasterName = Util.shouldHideMasterName(this.gridItems);

            if (hideServerName)   serverNames.hide();
            else                  serverNames.show();

            if (hideMasterName)   masterNames.hide();
            else                  masterNames.show();

            if (!hideServerName && !hideMasterName)
                bullets.show();
            else
                bullets.hide();

            if (hideServerName && hideMasterName)
                infosContainer.hide();
            else
                infosContainer.show();

            this.fluidGrid();
        },

        initGrid: function() {
            this.ui.gridName.text(this.gridName);

            if (this.settings.chromecast)
                this.castReceiverManager.setApplicationState("Munin for Android: " + this.gridName);

            this.startAutoRefresh();
        },

        startAutoRefresh: function() {
            window.setInterval(this.refreshGridItems, this.settings.autorefreshInterval);
        },

        refreshGridItems: function() {
            var that = this;

            this.gridItems.forEach(function(gridItem) {
                var graphUrl = that.getCacheProofGraphUrl(gridItem);
                $("[data-x='" + gridItem.x + "'][data-y='" + gridItem.y + "']")
                    .css('background-image', 'url(\'' + graphUrl + '\')');
            });
        },

        /**
         * Appends current time to requested URL in order to avoid receiving a cached version of the image
         *  Also, replace {period} in /multicpu1sec-{period}.png by the current period (day/week/month/year)
         */
        getCacheProofGraphUrl: function(gridItem) {
            var graphUrl = gridItem.graphUrl + '?' + new Date().getTime();
            return graphUrl.replace('{period}', this.period.val);
        },

        preview: function(x, y) {
            var gridItem = this.getGridItem(this.gridItems, x, y);

            if (gridItem == null)
                return;

            $('.card-pluginName').text(gridItem.pluginName);
            $('.card-serverName').text(gridItem.serverName);

            // If the masters supports HD graphs (DynazoomAvailability = TRUE), Munin for Android sent us
            // the hdGraphUrl. If not, let's just use the image currently displayed on the grid item.

            var graphUrl = '';
            var fullscreenCard = $('#fullscreenCard');
            if ('hdGraphUrl' in gridItem) { // HD graph is available
                var withPlaceholders = gridItem.hdGraphUrl;
                // Replace placeholders ({pinpoint1}, {pinpoint2}, {size_x} and {size_y})
                graphUrl = withPlaceholders.replace('{pinpoint1}', Util.getFromPinPoint(this.period));
                graphUrl = graphUrl.replace('{pinpoint2}', Util.getToPinPoint());
                var graphSize = Util.getHdGraphSize();
                graphUrl = graphUrl.replace('{size_x}', Util.getHDGraphWidth(graphSize[0]));
                graphUrl = graphUrl.replace('{size_y}', graphSize[1]);

                // Set fullscreen container dimensions
                fullscreenCard.css('width', graphSize[0]+'px');
                var marginTop = Math.floor(graphSize[1]/2) * -1 -100;
                fullscreenCard.css('margin-top', marginTop+'px');
            } else { // Not available
                // Find currently displayed graph source (try to get image from cache)
                graphUrl = $("[data-x='" + gridItem.x + "'][data-y='" + gridItem.y + "']").css('background-image');
                // Get # from url('#')
                graphUrl = graphUrl.substr("url('".length-1, graphUrl.length);
                graphUrl = graphUrl.substr(0, graphUrl.length - "')".length-1);

                // Set fullscreen container dimensions
                fullscreenCard.css('width', '497px');
                fullscreenCard.css('margin-top', '-200px');
            }

            $('#card-graph').attr('src', graphUrl);
            $('#fullscreen').show();
        },

        closePreview: function() {
            $('.card-pluginName').text('');
            $('.card-serverName').text('');
            $('#card-graph').attr('src', '');
            $('#fullscreen').hide();
        },

        fluidGrid: function() {
            if (this.gridItems.length == 0)
                return;

            var gridItemsRowList = $('.gridItemsRow'),
                gridsContainer = $('#gridsContainer'),
                gridsContainerPadding = gridsContainer.outerWidth() - gridsContainer.width(),
                firstGridItemContainer = $('.gridItemContainer').first();

            // HEIGHT
            // Set gridItem containers height
            var linesCount = Util.getLinesCount(this.gridItems);
            var availableHeight = this.ui.body.height() - $('.header').height() - 10;
            var gridItemHeight = Math.trunc(availableHeight/linesCount);
            gridItemsRowList.children().css('height', gridItemHeight + 'px');

            // Set gridItem height (set by gridItem_graph height)
            var legendHeight = $('.gridItemInfos').first().outerHeight();
            var graphHeight = firstGridItemContainer.height() - legendHeight;
            $('.gridItem_graph').css('height', graphHeight);


            // WIDTH
            var widestRowItemsCount = Util.getWidestRowItemsCount(this.gridItems);
            var maxWidth = (this.ui.body.width() - gridsContainerPadding - 30) / widestRowItemsCount;
            maxWidth = Math.trunc(maxWidth);

            // Keep graph ratio
            var horizontalPadding = firstGridItemContainer.outerWidth() - firstGridItemContainer.width();
            var width = Math.trunc(graphHeight * this.settings.graphAspectRatio);

            var recomputeHeight = false;
            if (width > maxWidth) {
                width = maxWidth;
                recomputeHeight = true;
            }

            gridItemsRowList.children().css('min-width', width);

            if (recomputeHeight) {
                var height = width*(1/this.settings.graphAspectRatio);
                $('.gridItem_graph').css('height', height);
            }
        },

        getGridItemHTML: function(gridItem) {
            return  '<div class="gridItemContainer">' +
                '    <div class="gridItem paper">' +
                '        <div class="gridItem_graph"' +
                '           data-x="' + gridItem.x + '"' +
                '           data-y="' + gridItem.y + '"' +
                '           style="background-image:url(\'' + this.getCacheProofGraphUrl(gridItem) + '\');">' +
                '        </div>' +
                '        <div class="gridItemInfos">' +
                '            <div class="gridItem_pluginName">' + gridItem.pluginName + '</div>' +
                '            <div class="gridItem_serverName">' +
                '               <span class="masterName">' + gridItem.masterName + '</span>' +
                '               <span class="bullet"> &bullet; </span>' +
                '               <span class="serverName">' + gridItem.serverName + '</span>' +
                '            </div>' +
                '       </div>' +
                '   </div>' +
                '</div>';
        },

        /**
         * Main application logic
         * @param text
         */
        receiveMessage: function(text) {
            var jsonMessage = JSON.parse(text);
            var action = jsonMessage['action'];

            switch (action) {
                case 'inflate_grid':
                    this.gridName = jsonMessage['gridName'];
                    this.gridItems = jsonMessage['gridItems'];
                    this.period = Util.getPeriod(jsonMessage['period']);

                    this.initGrid();
                    this.inflateGridItems();
                    break;
                case 'preview':
                    this.preview(jsonMessage["x"], jsonMessage['y']);
                    break;
                case 'cancel_preview':
                    this.closePreview();
                    break;
                case 'refresh':
                    this.refreshGridItems();
                    break;
                case 'change_period':
                    this.period = Util.getPeriod(jsonMessage['period']);
                    this.refreshGridItems();
                    break;
                default: break;
            }
        }
    };

    window.ChromecastReceiver = ChromecastReceiver;
})(jQuery, window);

// Instantiate ChromecastReceiver
$(document).ready(function() {
    var r = new window.ChromecastReceiver({
        chromecast: true,
        debug: true
    });

    if (!r.settings.chromecast) {
        $(window).resize(function () {
            r.fluidGrid();
        });
    }
});
