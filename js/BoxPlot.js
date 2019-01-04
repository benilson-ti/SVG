/* global Svg, $ */
/* jshint strict: global */
'use strict';

/**
 * Class for boxplot graphic using svg.
 * @requires jquery.js
 * @requires Svg.js
 * @requires boxplot.css
 * @param {Object} Literal Object with graphic informations
 * @returns {BoxPlot}
 */
function BoxPlot(dados) {
    /**
     * Pointer.
     * @type BoxPlot
     */
    var that = this;

    /**
     * Svg width.
     * @type {Number} Integer value
     */
    this.width = 500;

    /**
     * Svg height.
     * @type {Number} Integer value
     */
    this.height = 300;

    /**
     * Y-axis height.
     * @type {Number} Integer value
     */
    this.heightY;

    /**
     * Labels list y-axis.
     * @type {Array} Objects list
     */
    this.labelsY;

    /**
     * Y-axis title.
     * @type {String} Text title
     */
    this.titleY;

    /**
     * Responsive true or false.
     * @var Boolean
     */
    this.responsive = false;

    /**
     * List of data, to form the groups in the graph.
     * @var Array
     */
    this.groups;

    // apply the set configuration.
    $.extend(this, dados);
    dados = null;

    /**
     * Svg generated. @see Svg.js
     * @type {Svg} Object Svg
     */
    this.svg;

    /**
     * X-axis line.
     * @type {Line}
     */
    this.lineX;

    /**
     * Y-axis line.
     * @type {Line}
     */
    this.lineY;

    /**
     * Set responsive atribute.
     * @param {Boolean} value Atribute value
     * @return {BoxPlot}
     */
    this.setResponsive = function(value) {
        this.responsive = value;
        return this;
    };

    /**
     * Return one line, used for draw x-axis.
     * @returns {Line}
     */
    this.getLineX = function() {
        if (this.lineX) {
            return this.lineX;
        }

        var height = (this.height * 0.90), // put in 90% svg height;
            x1 = (this.width * 0.15), // 15% svg width
            x2 = (this.width * 0.95), // ends in 95% svg width
            params = {
                x1: x1,
                y1: height,
                x2: x2,
                y2: height,
                class: 'svg-boxplot-line-x'
            };

        this.lineX = new Line(params);
        return this.lineX;
    };

    /**
     * Return one line, used for draw y-axis.
     * @returns {Line}
     */
    this.getLineY = function() {
        if (this.lineY) {
            return this.lineY;
        }

        var x = this.getLineX().getParam('x1'),
            y1 = (this.height * 0.10), // 10% svg height
            y2 = this.getLineX().getParam('y1'),
            params = {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-boxplot-line-y'};

        this.lineY = new Line(params);
        return this.lineY;
    };

    /**
     * Add one title on y-axis.
     * @returns {Text}
     */
    this.addTitleY = function() {
        if (!this.titleY) {
            return;
        }

        var x = (this.width * 0.04),
            y = (this.height * 0.85),
            params = {
                x: x,
                y: y,
                fill: '#000',
                transform: 'rotate(-90,' + x + ',' + y + ')',
                class: 'svg-boxplot-title-y'
            };

        this.svg.add(new Text(this.titleY, params));
    };

    /**
     * Draw graphic on selector of element.
     * @param {String} selector jQuery selector
     * @returns {Svg}
     */
    this.draw = function(selector) {
        return this.getSvg().setResponsive(this.responsive).draw(selector);
    };

    /**
     * Return one svg element with histogram informations.
     * @returns {Svg}
     */
    this.getSvg = function() {
        if (this.svg) {
            return this.svg;
        }

        this.svg = new Svg({
            width: this.width,
            height: this.height,
            class: 'svg-boxplot'
        });
        this.svg.add(this.getBoard());
        this.addTitleY();
        this.svg.add(this.getLineX());
        this.svg.add(this.getLineY());
        this.addLabelsEixoY();
        this.addGroupsBoxPlot();

        return this.svg;
    };

    /**
     * Returns a square used in the svg frame.
     * @returns {Rect}
     */
    this.getBoard = function() {
        return new Rect(
            {width: this.width, height: this.height, class: 'svg-boxplot-board'}
        );
    };

    /**
     * Add labels to y-axis.
     * @returns {undefined}
     */
    this.addLabelsEixoY = function() {
        var label,
            maiorGrupo = this.heightY,
            alturaEixoX = this.getLineY().getParam('y2'),
            alturaLinhaY = (alturaEixoX - this.getLineY().getParam('y1')),
            alturaCadaGrupo = (alturaLinhaY / maiorGrupo),
            x2 = this.getLineX().getParam('x1'),
            x = (x2 - 10),
            x1 = (x2 - 4),
            y,
            paramsText = {x: x, class: 'svg-boxplot-label-y'},
            paramsLine = {x1: x1, x2: x2, class: 'svg-boxplot-label-line-y'};

        $(this.labelsY).each(function() {
            label = this;
            y = (alturaEixoX - (label * alturaCadaGrupo));
            paramsText.y = y;
            paramsLine.y1 = y;
            paramsLine.y2 = y;

            that.svg.add(new Text(label.toString(), paramsText));
            that.svg.add(new Line(paramsLine));
        });
    };

    /**
     * Add groups to svg.
     * @returns {undefined}
     */
    this.addGroupsBoxPlot = function()
    {
        /**
         * Return params to set.
         * @param {Object} params Params list
         * @param {Number} index Group index
         * @returns {Object}
         */
        var getParamsGroups = function(params, index) {
            var lineY = that.getLineY(),
                lineX = that.getLineX(),
                largura = (lineX.getParam('x2') - lineX.getParam('x1')),
                // + 2 to add a space at the beginning and end
                qtdGrupos = (that.groups.length + 2),
                numGroup = (index + 1),
                larguraCadaGrupo = (largura / qtdGrupos),
                alturaMedia = (
                    (lineY.getParam('y2') - lineY.getParam('y1')) / that.heightY
                ),
                x1 = ((lineX.getParam('x1') + (numGroup * larguraCadaGrupo)) + (larguraCadaGrupo * 0.10)),
                x2 = x1,
                y1 = (lineY.getParam('y2') - (alturaMedia * params.upLimit)),
                y2 = (lineY.getParam('y2') - (alturaMedia * params.downLimit));

            return {
                point: params.point,
                numGroup: numGroup,
                lineY: that.getLineY(),
                lineX: that.getLineX(),
                alturaMedia: alturaMedia,
                largura: largura,
                larguraCadaGrupo: larguraCadaGrupo,
                x1: x1,
                x2: x1,
                y1: y1,
                y2: y2,
                downQuartile: params.downQuartile,
                upQuartile: params.upQuartile,
                median: params.median,
                params: {
                    x1: (x1 + (larguraCadaGrupo / 2) - (larguraCadaGrupo * 0.10)),
                    y1: y1,
                    x2: (x2 + (larguraCadaGrupo / 2) - (larguraCadaGrupo * 0.10)),
                    y2: y2,
                    class: 'svg-boxsplot-group-line-y'
                }
            };
        },

        /**
         * Return one vertical line used in graph group.
         * @param {Object} dados Params list
         * @returns {Line}
         */
        getVerticalLineGroup = function(dados) {
            return new Line(dados.params);
        },

        /**
         * Return one up line used in graph group.
         * @param {Object} dados Params list
         * @returns {Line}
         */
        getLimitUpLineGroup = function(dados) {
            var params = {
                x1: (dados.x1 + (dados.larguraCadaGrupo * 0.20)),
                x2: (dados.x1 + dados.larguraCadaGrupo - (dados.larguraCadaGrupo * 0.40)),
                y1: dados.y1,
                y2: dados.y1,
                class: 'svg-boxsplot-group-line-x'
            };

            return new Line(params);
        },

        /**
         * Return one bottom line used in graph group.
         * @param {Object} dados Params list
         * @returns {Line}
         */
        getLimitDownLineGroup = function(dados) {
            var params = {
                x1: (dados.x1 + (dados.larguraCadaGrupo * 0.20)),
                x2: (dados.x1 + dados.larguraCadaGrupo - (dados.larguraCadaGrupo * 0.40)),
                y1: dados.y2,
                y2: dados.y2,
                class: 'svg-boxsplot-group-line-x'
            };

            return new Line($.extend(dados.params, params));
        },

        /**
         * Returns the point marked in the graphic group.
         * @param {Object} dados Params list
         * @returns {Circle}
         */
        getPointGroup = function(dados) {
            return new Circle({
                cx: (dados.x1 + (dados.larguraCadaGrupo / 2) - (dados.larguraCadaGrupo * 0.10)),
                cy: (dados.lineY.getParam('y2') - (dados.alturaMedia * dados.point)),
                r: 4,
                class: 'svg-boxsplot-group-circle'
            });
        },

        /**
         * Returns the rectangle used in the graphic group, has the first and third quartiles.
         * @param {Object} dados Params list
         * @returns {Rect}
         */
        getRectGroup = function(dados) {
            var params = {
                width: (dados.larguraCadaGrupo * 0.80),
                height: ((dados.alturaMedia * dados.upQuartile) - (dados.alturaMedia * dados.downQuartile)),
                y: dados.lineY.getParam('y2') - (dados.alturaMedia * dados.upQuartile),
                x: dados.x1,
                class: 'svg-boxsplot-group-rect'
            };

            return new Rect(params);
        },

        /**
         * Returns the median line used in the graphic group. Third quartile.
         * @param {Object} dados Params list
         * @returns {Line}
         */
        getMedianGroup = function(dados) {
                var y1 = (dados.lineY.getParam('y2') - (dados.alturaMedia * dados.median)),
                params = {
                    x1: dados.x1,
                    y1: y1,
                    x2: (dados.x1 + dados.larguraCadaGrupo - (dados.larguraCadaGrupo * 0.20)),
                    y2: y1,
                    class: 'svg-boxsplot-group-median'
                };

            return new Line(params);
        };

        $(this.groups).each(function(i, params) {
            if (params.noGroup) { // for spacing modification
                return; // continue
            }

            var dados = getParamsGroups(params, i),
                group = new Group({class: 'svg-boxplot-group'});

            group.add(getVerticalLineGroup(dados));
            group.add(getLimitUpLineGroup(dados));
            group.add(getLimitDownLineGroup(dados));
            group.add(getRectGroup(dados));
            group.add(getMedianGroup(dados));

            if (params.point) {
                group.add(getPointGroup(dados));
            }

            that.svg.add(group);
        });
    };
}