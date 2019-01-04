/* global Svg, $ */
/* jshint strict: global */
"use strict";

/**
 * Class for generate svg histogram using Svg.js.
 * @requires jquery.js
 * @requires Svg.js
 * @requires histogram.css
 * @requires bootstrap.js
 * @requires bootstrap.css
 * @param {Json} dados Json with params graphic
 * @returns {Histogram}
 */
function Histogram(dados) {
    /**
     * Pointer.
     * @type Histogram
     */
    var that = this;

    /**
     * Svg width.
     * @type {Number} valor inteiro
     */
    this.width = 700;

    /**
     * Svg height.
     * @type {Number} valor inteiro
     */
    this.height = 400;

    /**
     * Height y-axis.
     * @type {Number} valor inteiro
     */
    this.heightY;

    /**
     * Labels list x-axis.
     * @type {Array} Object list
     */
    this.labelsX;

    /**
     * Labels list y-axis.
     * @type {Array} Object list
     */
    this.labelsY;

    /**
     * Graphic title.
     * @type {String}
     */
    this.title;

    /**
     * Title x-axis.
     * @type {String}
     */
    this.titleX;

    /**
     * Title y-axis.
     * @type {String}
     */
    this.titleY;

    /**
     * Median value.
     * @type {Number}
     */
    this.median;

    /**
     * Optional value, to add an indicator outside the evaluation range, to the left.
     * @type {Number}
     */
    this.outLeft;

    /**
     * Optional value, to add an indicator outside the evaluation range, to the right.
     * @type {Number}
     */
    this.outRight;

    /**
     * List of objects with the title and content configuration of tooltips.
     * @type {Array} Lista de objetos
     */
    this.tooltips;

    /**
     * Set responsive atribute.
     * @var Boolean
     */
    this.responsive = false;

    // apply the set configuration.
    $.extend(this, dados);
    dados = null;

    /**
     * Set responsive atribute value.
     * @param {Boolean} value Atribute value
     * @return {Histogram}
     */
    this.setResponsive = function(value) {
        this.responsive = value;
        return this;
    };

    /**
     * Generated svg. @see Svg.js
     * @type {Svg} Objeto Svg
     */
    this.svg;

    /**
     * Group of elements svg x-axis.
     * @type {Group}
     */
    this.grupoEixoX;

    /**
     * Group of elements svg y-axis.
     * @type {Group}
     */
    this.grupoEixoY;

    /**
     * Line x-axis.
     * @type {Line}
     */
    this.lineX;

    /**
     * Line y-axis.
     * @type {Line}
     */
    this.lineY;

    /**
     * Draw Graphic on element defined by selector.
     * @param {String|Object} selector Selector jQuery
     * @returns {Svg}
     */
    this.draw = function(selector) {
        var svg = this.getSvg().setResponsive(this.responsive).draw(selector);
        $('.svg-histogram-bar').popover(); // bootstrap
        return svg;
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
            class: 'svg-histogram'
        });
        this.svg.add(this.getBoard());
        this.svg.add(this.getTitle());
        this.svg.add(this.getTitleX());
        this.svg.add(this.getTitleY());
        this.svg.add(this.getGrupoEixoX());
        this.svg.add(this.getGrupoEixoY());
        this.addLinesEixoX();
        this.addLinesEixoY();
        this.addOutLeft();
        this.addOutRight();
        this.addBars();
        this.addMedian();
        return this.svg;
    };

    /**
     * Returns a square used in the svg frame.
     * @returns {Rect}
     */
    this.getBoard = function() {
        return new Rect(
            {width: this.width, height: this.height, class: 'svg-histogram-board'}
        );
    };

    /**
     * Return one line using to draw x-axis.
     * @returns {Line}
     */
    this.getLineX = function() {
        if (this.lineX) {
            return this.lineX;
        }

        var height = (this.height * 0.70), // postion in 70% svg height;
            x1 = (this.width * 0.08), // 8% svg height
            x2 = (this.width * 0.92), // ends 92% svg width
            params = {
                x1: x1,
                y1: height,
                x2: x2,
                y2: height,
                class: 'svg-histogram-line-x'
            };

        this.lineX = new Line(params);
        return this.lineX;
    };

    /**
     * Return one line using to draw y-axis.
     * @returns {Line}
     */
    this.getLineY = function() {
        if (this.lineY) {
            return this.lineY;
        }

        var x = this.getLineX().getParam('x1'),
            y1 = (this.height * 0.10), // 10% svg height
            y2 = this.getLineX().getParam('y1'),
            params = {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-histogram-line-y'};

        this.lineY = new Line(params);
        return this.lineY;
    };

    /**
     * Return one group of elements x-axis.
     * @returns {Group}
     */
    this.getGrupoEixoX = function() {
        if (!this.grupoEixoX) {
            this.grupoEixoX = new Group({class: 'svg-histogram-group-x'});
        }

        this.grupoEixoX.add(this.getLineX());

        this.addLabelsEixoX();

        return this.grupoEixoX;
    };

    /**
     * Return one group of elements y-axis.
     * @returns {Group}
     */
    this.getGrupoEixoY = function() {
        if (!this.grupoEixoY) {
            this.grupoEixoY = new Group({class: 'svg-histogram-group-y'});
        }

        this.grupoEixoY.add(this.getLineY());

        this.addLabelsEixoY();

        return this.grupoEixoY;
    };

    /**
     * Return svg title.
     * @returns {Text}
     */
    this.getTitle = function() {
        return new Text(
            this.title,
            {x: this.getLineX().getParam('x1'), y: '5%', class: 'svg-histogram-title'}
        );
    };

    /**
     * Return text title x-axis.
     * @returns {Text}
     */
    this.getTitleX = function() {
        return new Text(
            this.titleX,
            {x: '45%', y: '98%', class: 'svg-histogram-title-x'}
        );
    };

    /**
     * Return text title y-axis.
     * @returns {Text}
     */
    this.getTitleY = function() {
        var x = (this.width * 0.02),
            y = (this.height * 0.55),
            params = {
                x: x,
                y: y,
                fill: '#000',
                transform: 'rotate(-90,' + x + ',' + y + ')',
                class: 'svg-histogram-title-y'
            };

        return new Text(this.titleY, params);
    };

    /**
     * Add labels on x-axis.
     * @returns {undefined}
     */
    this.addLabelsEixoX = function()
    {
        var lineX = this.getLineX(),
            text,
            line,
            alturaEixoX = lineX.getParam('y1'),
            larguraX = (lineX.getParam('x2') - lineX.getParam('x1')),
            larguraCadaGrupo = (larguraX / this.labelsX.length),
            x,
            x1 = (lineX.getParam('x1') + (larguraCadaGrupo / 2)),
            y = (alturaEixoX + 10),
            y1 = alturaEixoX,
            y2 = (alturaEixoX + 4);

        $(this.labelsX).each(function(i, valor) {
            x = (x1 + (larguraCadaGrupo * i));
            text = new Text(
                valor.text,
                {
                    x: x,
                    y: y,
                    transform: 'rotate(-90,' + x + ',' + y + ')',
                    class: 'svg-histogram-label-x'
                }
            );

            line = new Line(
                {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-histogram-label-line-x'}
            );

            that.grupoEixoX.add(text);
            that.grupoEixoX.add(line);
        });
    };

    /**
     * Add labels on y-axis.
     * @returns {undefined}
     */
    this.addLabelsEixoY = function() {
        var text,
            line,
            maiorGrupo = this.heightY,
            alturaEixoX = this.getLineY().getParam('y2'),
            alturaLinhaY = (alturaEixoX - this.getLineY().getParam('y1')),
            alturaCadaGrupo = (alturaLinhaY / maiorGrupo),
            x2 = this.getLineX().getParam('x1'),
            x = (x2 - 10),
            x1 = (x2 - 4),
            y;

        $(this.labelsY).each(function(i, valor) {
            y = (alturaEixoX - (valor.y * alturaCadaGrupo));

            text = new Text(
                valor.text.toString(),
                {
                    x: x,
                    y: y,
                    fill: '#000',
                    class: 'svg-histogram-label-y'
                }
            );

            line = new Line(
                {x1: x1, y1: y, x2: x2, y2: y, class: 'svg-histogram-label-line-y'}
            );

            that.grupoEixoY.add(text);
            that.grupoEixoY.add(line);
        });
    };

    /**
     * Adds the vertical lines of each label on the x-axis.
     * @returns {undefined}
     */
    this.addLinesEixoX = function() {
        var lineX = this.getLineX(),
            line,
            larguraX = (lineX.getParam('x2') - lineX.getParam('x1')),
            larguraCadaGrupo = (larguraX / this.labelsX.length),
            x,
            x1 = (lineX.getParam('x1') + (larguraCadaGrupo / 2)),
            y1 = this.getLineY().getParam('y1'),
            y2 = this.getLineY().getParam('y2');

        $(this.labelsX).each(function(i) {
            x = (x1 + (larguraCadaGrupo * i));

            line = new Line(
                {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-histogram-label-vertical-line'}
            );

            that.svg.add(line);
        });
    };

    /**
     * Adds the vertical lines of each label on the y-axis.
     * @returns {undefined}
     */
    this.addLinesEixoY = function()
    {
        var line,
            maiorGrupo = this.heightY,
            alturaEixoX = this.getLineY().getParam('y2'),
            alturaLinhaY = (alturaEixoX - this.getLineY().getParam('y1')),
            alturaCadaGrupo = (alturaLinhaY / maiorGrupo),
            x1 = this.getLineX().getParam('x1'),
            x2 = this.getLineX().getParam('x2'),
            y;

        $(this.labelsY).each(function(i, valor) {
            y = (alturaEixoX - (valor.y * alturaCadaGrupo));

            line = new Line(
                {x1: x1, y1: y, x2: x2, y2: y, class: 'svg-histogram-label-horizontal-line'}
            );

            that.svg.add(line);
        });
    };

    /**
     * Add bars to svg.
     * @returns {undefined}
     */
    this.addBars = function()
    {
        var alturaInicialEixoY = this.getLineY().getParam('y1'),
            larguraX = (this.getLineX().getParam('x2') - this.getLineX().getParam('x1')),
            segmentosX = (larguraX / this.labelsX.length),
            espacamento = (segmentosX * 0.10), // 10% bar width
            larguraCadaGrupo = (segmentosX - espacamento),
            x,
            x1 = (this.getLineX().getParam('x1')),
            alturaLinhaY = (this.getLineY().getParam('y2') - this.getLineY().getParam('y1')),
            maiorGrupo = this.heightY,
            mediaAlturaCadaGrupo = (alturaLinhaY / maiorGrupo),
            alturaMaximaGrupo = (maiorGrupo * mediaAlturaCadaGrupo),
            height,
            params = { // fixed values
                class: 'svg-histogram-bar',
                'data-toggle': 'popover',
                'data-trigger': 'hover',
                'data-container': 'body',
                'data-html': true,
                'data-placement': 'top'
            };

        $(this.labelsY).each(function(i, valor) {
            x = (x1 + (espacamento / 2) + ((larguraCadaGrupo + espacamento) * i));
            height = (mediaAlturaCadaGrupo * valor.y);

            params['width'] = larguraCadaGrupo;
            params['height'] = (mediaAlturaCadaGrupo * valor.y);
            params['x'] = x;
            params['y'] = (alturaInicialEixoY + alturaMaximaGrupo - height);
            try {
                params['title'] = that.tooltips[i].title;
                params['data-content'] = that.tooltips[i].content;
            } catch (ex) {
                // nothing
            }

            that.svg.add(new Rect(params));
        });
    };

    /**
     * Add one median to graphic.
     * @returns {undefined}
     */
    this.addMedian = function() {
        if (!that.median) {
            return;
        }

        $(this.labelsX).each(function(i, valor) {
            var valores = valor.text.replace(/\,/g, '.').replace(/\+/g, '').split(' a '),
                median = window.parseFloat(that.median),
                menorValor = window.parseFloat(valores[0]),
                maiorValor = window.parseFloat(valores[1]);

            if (median < menorValor || median > maiorValor) {
                return; // continue
            }

            var lineX = that.getLineX(),
                x1 = lineX.getParam('x1'),
                larguraX = (lineX.getParam('x2') - x1),
                segmentosX = (larguraX / that.labelsX.length),
                espacamento = (segmentosX * 0.10),
                xIni = (x1 + (segmentosX * i) + (espacamento / 2)),
                xFim = (xIni + segmentosX - espacamento),
                larguraMediaValores = ((xFim - xIni) / (maiorValor - menorValor)),
                x = (xIni + (larguraMediaValores * (that.median - menorValor))),
                params = {
                    width: espacamento,
                    height: (that.getLineY().getParam('y2') - that.getLineY().getParam('y1')),
                    y: that.getLineY().getParam('y1'),
                    class: 'svg-histogram-median',
                    x: x
                };

            if ((x + espacamento) > xFim) {
                params.x -= espacamento;
            }

            that.svg.add(new Rect(params));
            return true; // break
        });
    };

    /**
     * Adds a rectangle showing the bars outside the evaluation, left.
     * @returns {undefined}
     */
    this.addOutLeft = function() {
        if (!that.outLeft) {
            return;
        }

        $(this.labelsX).each(function(i, valor) {
            var valores = valor.text.replace(/\,/g, '.').replace(/\+/g, '').split(' a '),
                outLeft = window.parseFloat(that.outLeft),
                menorValor = window.parseFloat(valores[0]),
                maiorValor = window.parseFloat(valores[1]);

            if (outLeft < menorValor || outLeft > maiorValor) {
                return; // continue
            }

            var lineX = that.getLineX(),
                x1 = lineX.getParam('x1'),
                larguraX = (lineX.getParam('x2') - x1),
                segmentosX = (larguraX / that.labelsX.length),
                espacamento = (segmentosX * 0.10),
                xIni = (x1 + (segmentosX * i) + (espacamento / 2)),
                xFim = (xIni + segmentosX - espacamento),
                larguraMediaValores = ((xFim - xIni) / (maiorValor - menorValor)),
                x = (xIni + (larguraMediaValores * (that.outLeft - menorValor))),
                params = {
                    width: (x - x1),
                    height: (that.getLineY().getParam('y2') - that.getLineY().getParam('y1')),
                    x: x1,
                    y: that.getLineY().getParam('y1'),
                    class: 'svg-histogram-out-left'
                };

            that.svg.add(new Rect(params));
            return true; // break
        });
    };

    /**
     * Adds a rectangle showing the bars outside the evaluation, right.
     * @returns {undefined}
     */
    this.addOutRight = function() {
        if (!that.outRight) {
            return;
        }

        $(this.labelsX).each(function(i, valor) {
            var valores = valor.text.replace(/\,/g, '.').replace(/\+/g, '').split(' a '),
                outRight = window.parseFloat(that.outRight),
                menorValor = window.parseFloat(valores[0]),
                maiorValor = window.parseFloat(valores[1]);

            if (outRight < menorValor || outRight > maiorValor) {
                return; // continue
            }

            var lineX = that.getLineX(),
                x1 = lineX.getParam('x1'),
                larguraX = (lineX.getParam('x2') - x1),
                segmentosX = (larguraX / that.labelsX.length),
                espacamento = (segmentosX * 0.10),
                xIni = (x1 + (segmentosX * i) + (espacamento / 2)),
                xFim = (xIni + segmentosX - espacamento),
                larguraMediaValores = ((xFim - xIni) / (maiorValor - menorValor)),
                x = (xIni + (larguraMediaValores * (that.outRight - menorValor))),
                params = {
                    width: (lineX.getParam('x2') - x),
                    height: (that.getLineY().getParam('y2') - that.getLineY().getParam('y1')),
                    x: x,
                    y: that.getLineY().getParam('y1'),
                    class: 'svg-histogram-out-right'
                };

            that.svg.add(new Rect(params));
            return true; // break
        });
    };
}