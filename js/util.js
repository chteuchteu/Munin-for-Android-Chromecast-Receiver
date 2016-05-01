/**
 * Munin-for-Android-Chromecast-Receiver
 * Generic util functions
 */

Util = {
    getHdGraphSize: function() {
        return [ $(window).width()*3/4, $(window).height()*3/4 ];
    },

    getMaxRows: function(gridItems) {
        var maxRow = 0;
        for (var i=0; i<gridItems.length; i++) {
            var y = gridItems[i].y;
            if (y > maxRow)
                maxRow = y;
        }
        return maxRow;
    },

    getGridItem: function(gridItems, x, y) {
        for (var i=0; i<gridItems.length; i++) {
            if (gridItems[i].x == x && gridItems[i].y == y)
                return gridItems[i];
        }
        return null;
    },

    getRowItems: function(gridItems, y) {
        var rowItems = [];
        for (var i=0; i<gridItems.length; i++) {
            if (gridItems[i].y == y)
                rowItems[rowItems.length] = gridItems[i];
        }

        return rowItems;
    },

    getWidestRowItemsCount: function(gridItems) {
        var widestRow = -1;
        var widestRowCount = -1;

        for (var y=0; y<=this.getMaxRows(gridItems); y++) {
            var nbItems = this.getRowItems(gridItems, y).length;
            if (nbItems > widestRowCount) {
                widestRowCount = nbItems;
                widestRow = y;
            }
        }

        return widestRowCount;
    },

    getLinesCount: function(gridItems) {
        return parseInt(this.getMaxRows(gridItems))+1;
    },

    getPeriod: function(period) {
        switch (period) {
            case 'DAY': return PeriodEnum.DAY; break;
            case 'WEEK': return PeriodEnum.WEEK; break;
            case 'MONTH': return PeriodEnum.MONTH; break;
            case 'YEAR': return PeriodEnum.YEAR; break;
            default: return PeriodEnum.DAY; break;
        }
    },

    shouldHideServerName: function(gridItems) {
        var firstServerName = '';

        for (var z=0; z<gridItems.length; z++) {
            var gridItem = gridItems[z];

            if (firstServerName == '')
                firstServerName = gridItem.serverName;

            if (firstServerName != gridItem.serverName)
                return false;
        }
        return true;
    },

    shouldHideMasterName: function(gridItems) {
        var firstMasterName = '';

        for (var z=0; z<gridItems.length; z++) {
            var gridItem = gridItems[z];

            if (firstMasterName == '')
                firstMasterName = gridItem.masterName;

            if (firstMasterName != gridItem.masterName)
                return false;
        }
        return true;
    }
};
