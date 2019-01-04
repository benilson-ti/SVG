/* global Svg, parseFloat, Math */
/* jshint strict: global */
"use strict";

/**
 * Class to control the deviation index graphing generation features, using svg.
 * @requires jquery.js
 * @requires Svg.js
 * @requires deviation_index.css
 * @param {Json} dados Json of graph data
 * @returns {DeviationIndex}
 */
function DeviationIndex(dados) {
    /**
     * Pointer.
     * @type DeviationIndex
     */
    var that = this;

    /**
     * Svg width.
     * @type {Number} Integer value
     */
    this.width = 600;

    /**
     * Svg height.
     * @type {Number} Integer value
     */
    this.height = 400;

    /**
     * X-axis labels list.
     * @type {Array} Object list
     */
    this.labelsX;

    /**
     * Y-axis labels list.
     * @type {Array} Object list
     */
    this.labelsY;

    /**
     * Y-axis text title.
     * @type {String}
     */
    this.titleY;

    /**
     * Whether or not to add the two standard deviation bars in the middle of the graph.
     * @type {Boolean} Default false (not add)
     */
    this.withStandardDeviationBars = false;

    /**
     * Responsive true or false.
     * @type {Boolean} Default false (not responsive)
     */
    this.responsive = false;

    /**
     * Total allowed error.
     * @type {Object} Literal object with the settings
     */
    this.ETp;

    /**
     * Systematic error allowed
     * @type {Object} Literal object with the settings
     */
    this.ESp;

    /**
     * Params x-axis line.
     * @type {Object} Literal object with the settings
     */
    this.paramsLineX = {};

    /**
     * Default attributes list bootstrap popover.
     * @var {Object}
     */
    this.popoverDefault = {
        'data-toggle': "popover",
        'data-trigger': "hover",
        'data-container': "body",
        'data-html': "true",
        'data-placement': "auto top"
    };

    // apply the set configuration.
    $.extend(this, dados);
    dados = null;

    /**
     * Set responsive atribute.
     * @param {Boolean} value Atribute value
     * @return {DeviationIndex}
     */
    this.setResponsive = function(value) {
        this.responsive = value;
        return this;
    };

    /**
     * Svg generated. @see Svg.js
     * @type {Svg} Objeto Svg
     */
    this.svg;

    /**
     * Group of elements x-axis.
     * @type {Group}
     */
    this.grupoEixoX;

    /**
     * Group of elements y-axis.
     * @type {Group}
     */
    this.grupoEixoY;

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
     * Draws the graph in the jQuery selector.
     * @param {String|Object} selector jQuery selector
     * @returns {Svg}
     */
    this.draw = function(selector) {
        var svg = this.getSvg().setResponsive(this.responsive).draw(selector);
        $('.svg-popover').popover();
        return svg;
    };

    /**
     * Returns a square used in the svg frame.
     * @returns {Rect}
     */
    this.getBoard = function() {
        return new Rect(
            {width: this.width, height: this.height, class: 'svg-deviation-index-board'}
        );
    };

    /**
     * Return one line, used for draw x-axis.
     * @returns {Line}
     */
    this.getLineX = function() {
        if (this.lineX) {
            return this.lineX;
        }

        var qtdChar = this.getQtdCharLabelY(),
            height = (this.height * 0.9),
            x1 = (50 + (qtdChar * 6)), // adicina 6 para cada caracter da label do eixo Y
            x2 = this.width,
            params = {
                x1: x1,
                y1: height,
                x2: x2,
                y2: height,
                class: 'svg-deviation-index-line-x'
            };

        this.lineX = new Line($.extend(params, that.paramsLineX));
        return this.lineX;
    };

    /**
     * Returns the largest number of characters in the Y-axis labels.
     * @returns {Number}
     */
    this.getQtdCharLabelY = function() {
        var qtdChar = 0;
        $(this.labelsY).each(function() {
            qtdChar = (qtdChar > this.toString().length ? qtdChar : this.toString().length);
        });

        return qtdChar;
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
            y1 = (this.height * 0.05),
            y2 = this.getLineX().getParam('y1'),
            params = {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-deviation-index-line-y'};

        this.lineY = new Line(params);
        return this.lineY;
    };

    /**
     * Return one group of elements x-axis.
     * @returns {Group}
     */
    this.getGrupoEixoX = function() {
        if (!this.grupoEixoX) {
            this.grupoEixoX = new Group({class: 'svg-deviation-index-group-x'});
        }

        //this.grupoEixoX.add(this.getLineX());

        this.addLabelsEixoX();

        return this.grupoEixoX;
    };

    /**
     * Return one group of elements y-axis.
     * @returns {Group}
     */
    this.getGrupoEixoY = function() {
        if (!this.grupoEixoY) {
            this.grupoEixoY = new Group({class: 'svg-deviation-index-group-y'});
        }

        //this.grupoEixoY.add(this.getLineY());

        return this.grupoEixoY;
    };

    /**
     * Return text title of y-axis.
     * @returns {Text}
     */
    this.getTitleY = function() {
        var x = (this.getLineX().getParam('x1') -10 -(this.getQtdCharLabelY() * 10)),
            y = (this.height * 0.5),
            params = {
                x: x,
                y: y,
                class: 'svg-deviation-index-title-y'
            };

        // hack for rendering tag html inside title
        if (/\<sup\>/.test(this.titleY)) {
            params.height = this.height;
            params.width = 20;
            params.y = 0;
            params.x = x - 10; //(this.getLineX().getParam('x1') - 20 -(this.getQtdCharLabelY() * 10));

            var $div = $('<div>').append(this.titleY).addClass('svg-deviation-index-title-y-div'),
                foreign = new ForeignObject(params);

            foreign.generate().append($div);
            return foreign;
        }

        params.transform = 'rotate(-90,' + x + ',' + y + ')';

        return new Text(this.titleY, params);
    };

    /**
     * Adds a triangle that indicates that the item is out of bounds.
     * @param {Number} x Coordinate x
     * @param {Number} y Coordinate y
     * @param {Number} side Size of the sides of the triangle
     * @param {Number} index Item index
     * @param {Boolean} transform Whether or not to rotate the triangle by 180 degrees
     * @param {Object} popover Popover params
     * @returns {undefined}
     */
    this.addTriangleItemOut = function(x, y, side, index, transform, popover) {
        var points = [
                (x + ',' + y),
                ((x - (side * 0.5)) + ',' + (y + side)),
                ((x + (side * 0.5)) + ',' + (y + side))
            ],
            params = {
                points: points.join(' '),
                class: ('svg-popover svg-deviation-index-item-out svg-deviation-index-item' + (index + 1))
            };

        if (transform) {
            params['transform'] = 'rotate(180,' + x + ',' + (y + side / 2) + ')';
        }

        if (popover) {
            params = $.extend(params, this.popoverDefault, popover);
        }

        this.svg.add(new Polygon(params));
    };

    /**
     * Add optional vertical bar to graphic.
     * @param {Object} dados Literal object with params
     * <ul>
     *  <li>value: float</li>
     *  <li>width: float</li>
     *  <li>x: float</li>
     *  <li>classe: string</li>
     *  <li>popover: Object</li>
     * </ul>
     * @returns {undefined}
     */
    this.addVerticalBar = function(dados) {
        if (!dados || !dados.value) {
            return;
        }

        var value = parseFloat(dados.value),
            lineY = this.getLineY(),
            alturaLinhaY = (lineY.getParam('y2') - lineY.getParam('y1')),
            meio = Math.abs(this.labelsY[0]),
            max = (meio * 2),
            media = (alturaLinhaY / max),
            height = (dados.height ? dados.height : (value * media * 2)),
            espacoEntreLinhas = (alturaLinhaY / (this.labelsY.length - 1)),
            modificador = (dados.height ? (dados.height / 2) : 0),
            meioPixel = 0.5,
            params = {
                class: ('svg-popover ' + dados.classe),
                width: dados.width,
                height: (height - meioPixel),
                x: (dados.x - (dados.width / 2)),
                y: ((((value * -1) + meio) * media) + (espacoEntreLinhas / 2) - modificador - meioPixel)
            };

        if (dados.popover) {
            params = $.extend(params, this.popoverDefault, dados.popover);
        }

        that.svg.add(new Rect(params));
    };

    /**
     * Adds an optional vertical bar to the graph, referring to the standard deviation of the z-index.
     * @param {Object} indexZ Index z params
     * @param {Number} width Bar width
     * @param {Number} x Bar position x-axis
     * @returns {undefined}
     */
    this.addBarIndexZ = function(indexZ, width, x) {
        this.addVerticalBar($.extend(indexZ, {
            width: width,
            x: x,
            classe: 'svg-popover svg-deviation-index-z'
        }));
    };

    /**
     * Adds an optional vertical bar to the graph, referring to the total allowed error.
     * @param {Number} width Bar width
     * @param {Number} x Bar position x-axis
     * @returns {undefined}
     */
    this.addBarETp = function(width, x) {
        this.addVerticalBar($.extend(this.ETp, {
            width: width,
            x: x,
            classe: 'svg-deviation-index-etp'
        }));
    };

    /**
     * Adds an optional vertical bar to the graph, referring to the systematic error.
     * @param {Number} width Bar width
     * @param {Number} x Bar position x-axis
     * @param {Object} systematicError Systematic error params
     * @returns {undefined}
     */
    this.addBarEs = function(width, x, systematicError) {
        this.addVerticalBar($.extend(systematicError, {
            width: width,
            height: 3,
            x: x,
            classe: 'svg-deviation-index-es'
        }));
    };

    /**
     * Adds an optional vertical bar to the graph, referring to the systematic allowed error.
     * Adiciona uma barra vertical opcional ao gráfico, referente ao erro sistemático permitido.
     * @param {Number} width Bar width
     * @param {Number} x Bar position x-axis
     * @returns {undefined}
     */
    this.addBarESp = function(width, x) {
        this.addVerticalBar($.extend(this.ESp, {
            width: width,
            x: x,
            classe: 'svg-deviation-index-esp'
        }));
    };

    /**
     * Add a diamond, referring to the item/level to the chart.
     * @param {Number} x X-axis position
     * @param {Number} y Y-axis position
     * @param {Number} side Width of each side of the diamond
     * @param {Number} index Item identifier to be added to css class
     * @param {Object} popover Popover params
     * @returns {undefined}
     */
    this.addLosangoItem = function(x, y, side, index, popover) {
        var params = {
            class: ('svg-popover svg-deviation-index-item' + (index + 1)),
            width: side,
            height: side,
            x: (x - (side / 2)),
            y: y,
            opacity: 1,
            transform: ('rotate(45,' + x + ',' + (y + (side / 2)) + ')')
        };

        if (popover) {
            params = $.extend(params, this.popoverDefault, popover);
        }

        this.svg.add(new Rect(params));
    };

    /**
     * Add x-axis labels.
     * @returns {undefined}
     */
    this.addLabelsEixoX = function()
    {
        var lineX = this.getLineX(),
            alturaEixoX = lineX.getParam('y1'),
            larguraX = (lineX.getParam('x2') - lineX.getParam('x1')),
            larguraCadaGrupo = (larguraX / this.labelsX.length),
            x,
            x1 = (lineX.getParam('x1') + (larguraCadaGrupo / 2)),
            lado = 40,
            y = (alturaEixoX + 15),
            params;

        $(this.labelsX).each(function(i, label) {
            x = (x1 + (larguraCadaGrupo * i));
            params = {
                x: x,
                //y: (alturaEixoX + 20),
                y: y,
                class: 'svg-deviation-index-label-x'
            };

            that.grupoEixoX.add(new Text(label.text, params));
            that.addBarIndexZ(label.indiceZ, lado, x);

            if (label.itens.length) {
                that.addBarETp(lado, x);
                that.addBarESp(lado, x);
                that.addBarEs((lado / 2), x, label.erroSistematico);
            }
        });
    };

    /**
     * Add y-axis labels.
     * @returns {undefined}
     */
    this.addLabelsEixoY = function() {
        var maiorGrupo = (this.labelsY.length - 1),
            alturaEixoX = this.getLineY().getParam('y2'),
            alturaLinhaY = (alturaEixoX - this.getLineY().getParam('y1')),
            alturaCadaGrupo = (alturaLinhaY / maiorGrupo),
            x1 = this.getLineX().getParam('x1'),
            x2 = this.getLineX().getParam('x2'),
            x = (x1 - 10),
            y,
            paramsText = {x: x, y: y, class: 'svg-deviation-index-label-y'},
            paramsLine = {x1: x1, y1: y, x2: x2, y2: y, class: 'svg-deviation-index-label-horizontal-line'};

        $(this.labelsY).each(function(i, val) {
            y = (alturaEixoX - (i * alturaCadaGrupo));
            paramsText.y = y;
            paramsLine.y1 = y;
            paramsLine.y2 = y;

            that.grupoEixoY.add(new Text(val.toString().replace('.', ','), paramsText));
            that.svg.add(new Line(paramsLine));
        });
    };

    /**
     * Add bars to svg.
     * @returns {undefined}
     */
    this.addBars = function()
    {
        var x = (this.getLineX().getParam('x1')),
            y = this.getLineY().getParam('y1'),
            larguraX = (this.getLineX().getParam('x2') - x),
            alturaLinhaY = (this.getLineY().getParam('y2') - y),
            params,
            i = 0,
            qtdBars = (this.labelsY.length - 1),
            metade = (qtdBars / 2),
            altura = (alturaLinhaY / qtdBars),
            indiceLabelsY,
            opacity = [4, 3, 2, 1, 0, 1, 2, 3, 4];

        for (i = 0; i < qtdBars; i++) {
            indiceLabelsY = ((i >= metade) ? (i + 1) : i);
            params = {
                class: 'svg-deviation-index-bar',
                width: larguraX,
                height: altura,
                x: x,
                y: (y + (altura * i)),
                opacity: ((opacity[indiceLabelsY] * 0.2) - 0.1)
            };

            if (this.withStandardDeviationBars && ((metade === i) || (metade === (i + 1)))) {
                // horizontal bars of the middle of the graph, with different color
                params['class'] = 'svg-deviation-index-bar-desvio-padrao';
                params['opacity'] = 1;
            }

            that.svg.add(new Rect(params));
        }
    };

    /**
     * Add diamonds or triangles to svg.
     * @returns {undefined}
     */
    this.addLosangosOrTriangles = function()
    {
        var lineX = this.getLineX(),
            lineY = this.getLineY(),
            larguraX = (lineX.getParam('x2') - lineX.getParam('x1')),
            alturaLinhaY = (lineY.getParam('y2') - lineY.getParam('y1')),
            larguraCadaGrupo = (larguraX / this.labelsX.length),
            x,
            x1 = (lineX.getParam('x1') + (larguraCadaGrupo / 2)),
            y,
            valItem,
            lado = 8,
            //meio = ((this.labelsY.length - 1) / 2),
            meio = Math.abs(this.labelsY[0]),
            max = (meio * 2),
            media = (alturaLinhaY / max);

        $(this.labelsX).each(function(i, label) {
            x = (x1 + (larguraCadaGrupo * i));

            $(label.itens).each(function(ind, item) {
                if (item === null || item.value === null) {
                    return; // continue
                }

                valItem = ((item.value * -1) + meio);
                y = lado;

                if (valItem > max) {
                    y += (max * media);
                    that.addTriangleItemOut(x, y, lado, ind, true, item.popover);
                    return; // continue;
                }

                if (valItem < 0) {
                    that.addTriangleItemOut(x, y, lado, ind, false, item.popover);
                    return; // continue;
                }

                y = ((valItem * media) + lado);
                that.addLosangoItem(x, y, lado, ind, item.popover);
            });
        });
    };

    /**
     * Returns an svg element, with its components and histogram information.
     * @returns {Svg}
     */
    this.getSvg = function() {
        if (this.svg) {
            return this.svg;
        }

        this.svg = new Svg({
            width: this.width,
            height: this.height,
            class: 'svg-deviation-index'
        });
        this.svg.add(this.getBoard());
        this.svg.add(this.getTitleY());
        this.addBars();
        this.svg.add(this.getGrupoEixoX());
        this.svg.add(this.getGrupoEixoY());
        this.addLabelsEixoY();
        this.addLosangosOrTriangles();
        return this.svg;
    };
}