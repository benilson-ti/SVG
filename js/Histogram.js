/* global location, Object, parent, Svg, d3, jsonTeste */
/* jshint strict: global */
"use strict";

/**
 * Classe que controla as funcionalidades de geração de histogramas, usando svg.
 * @requires jquery.js
 * @requires Svg.js
 * @requires histogram.css
 * @requires bootstrap.js
 * @requires bootstrap.css
 * @param {Json} dados Json de dados do gráfico
 * @returns {Histogram}
 */
function Histogram(dados) {
    /**
     * Ponteiro.
     * @type Histogram
     */
    var that = this;

    /**
     * Define a largura do svg.
     * @type {Number} valor inteiro
     */
    this.width = 700;

    /**
     * Define a altura do svg.
     * @type {Number} valor inteiro
     */
    this.height = 400;

    /**
     * Define a altura do eixo y.
     * @type {Number} valor inteiro
     */
    this.heightY;

    /**
     * Lista de labels do eixo x.
     * @type {Array} Lista de objetos
     */
    this.labelsX;

    /**
     * Lista de labels do eixo Y.
     * @type {Array} Lista de objetos
     */
    this.labelsY;

    /**
     * Título do gráfico.
     * @type {String}
     */
    this.title;

    /**
     * Título do gráfico no eixo x.
     * @type {String}
     */
    this.titleX;

    /**
     * Título do gráfico no eixo y.
     * @type {String}
     */
    this.titleY;

    /**
     * Valor da mediana.
     * @type {Number}
     */
    this.median;

    /**
     * Valor para adicionar um indicativo de fora da faixa de avaliação, a esquerda.
     * @type {Number}
     */
    this.outLeft;

    /**
     * Valor para adicionar um indicativo de fora da faixa de avaliação, a direita.
     * @type {Number}
     */
    this.outRight;

    /**
     * Lista de objetos com a configuração de title e content das tooltips.
     * @type {Array} Lista de objetos
     */
    this.tooltips;

    /**
     * Define se o SVG é para ser responsivo ou não.
     * @var Boolean
     */
    this.responsive = false;

    // aplica a configuração informada.
    $.extend(this, dados);
    dados = null;

    /**
     * Método que define o valor do atributo responsive.
     * @param {Boolean} value Valor do atributo
     * @return {Histogram}
     */
    this.setResponsive = function(value) {
        this.responsive = value;
        return this;
    };

    /**
     * Svg gerado. @see Svg.js
     * @type {Svg} Objeto Svg
     */
    this.svg;

    /**
     * Grupo de elementos svg do eixo x.
     * @type {Group}
     */
    this.grupoEixoX;

    /**
     * Grupo de elementos svg do eixo y.
     * @type {Group}
     */
    this.grupoEixoY;

    /**
     * Line do eixo x.
     * @type {Line}
     */
    this.lineX;

    /**
     * Line do eixo y.
     * @type {Line}
     */
    this.lineY;

    /**
     * Desenha o gráfico no seletor informado.
     * @param {String|Object} seletor Seletor jQuery
     * @returns {Svg}
     */
    this.draw = function(seletor) {
        var svg = this.getSvg().setResponsive(this.responsive).draw(seletor);
        $('.svg-histogram-bar').popover();
        return svg;
    };

    /**
     * Retorna um elemento svg, com seus componentes e as informações do histograma.
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
     * Retorna um quadrado usado na moldura do svg.
     * @returns {Rect}
     */
    this.getBoard = function() {
        return new Rect(
            {width: this.width, height: this.height, class: 'svg-histogram-board'}
        );
    };

    /**
     * Retorna uma linha, usada para desenhar o eixo x.
     * @returns {Line}
     */
    this.getLineX = function() {
        if (this.lineX) {
            return this.lineX;
        }

        var height = (this.height * 0.70), // posiciona em 70% da altura do svg;
            x1 = (this.width * 0.08), // 8% do tamanho do svg
            x2 = (this.width * 0.92), // vai até 92% do tamanho do svg
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
     * Retorna uma linha, usada para desenhar o eixo y.
     * @returns {Line}
     */
    this.getLineY = function() {
        if (this.lineY) {
            return this.lineY;
        }

        var x = this.getLineX().getParam('x1'),
            y1 = (this.height * 0.10), // 10% da altura do svg
            y2 = this.getLineX().getParam('y1'),
            params = {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-histogram-line-y'};

        this.lineY = new Line(params);
        return this.lineY;
    };

    /**
     * Retorna um grupo de elementos do eixo x.
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
     * Retorna um grupo de elementos do eixo y.
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
     * Retorna o título do svg.
     * @returns {Text}
     */
    this.getTitle = function() {
        return new Text(
            this.title,
            {x: this.getLineX().getParam('x1'), y: '5%', class: 'svg-histogram-title'}
        );
    };

    /**
     * Retorna o título do eixo x.
     * @returns {Text}
     */
    this.getTitleX = function() {
        return new Text(
            this.titleX,
            {x: '45%', y: '98%', class: 'svg-histogram-title-x'}
        );
    };

    /**
     * Retorna o título do eixo y.
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
     * Adiciona as labels do eixo x.
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
     * Adiciona as labels do eixo y.
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
     * Adiciona as linhas verticais de cada label no eixo x.
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
     * Adiciona as linhas horizontais de cada label no eixo y.
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
     * Adiciona as barras do gráfico ao svg.
     * @returns {undefined}
     */
    this.addBars = function()
    {
        var alturaInicialEixoY = this.getLineY().getParam('y1'),
            larguraX = (this.getLineX().getParam('x2') - this.getLineX().getParam('x1')),
            segmentosX = (larguraX / this.labelsX.length),
            espacamento = (segmentosX * 0.10), // 10% do tamanho da barra
            larguraCadaGrupo = (segmentosX - espacamento),
            x,
            x1 = (this.getLineX().getParam('x1')),
            alturaLinhaY = (this.getLineY().getParam('y2') - this.getLineY().getParam('y1')),
            maiorGrupo = this.heightY,
            mediaAlturaCadaGrupo = (alturaLinhaY / maiorGrupo),
            alturaMaximaGrupo = (maiorGrupo * mediaAlturaCadaGrupo),
            height,
            params = { // valores fixo
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

            // valores variáveis
            params['width'] = larguraCadaGrupo;
            params['height'] = (mediaAlturaCadaGrupo * valor.y);
            params['x'] = x;
            params['y'] = (alturaInicialEixoY + alturaMaximaGrupo - height);
            try {
                params['title'] = that.tooltips[i].title;
                params['data-content'] = that.tooltips[i].content;
            } catch (ex) {
                // nada
            }

            that.svg.add(new Rect(params));
        });
    };

    /**
     * Adiciona uma mediana ao gráfico.
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
     * Adiciona um retângulo demonstrativo das barras fora da avaliação, a esquerda.
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
     * Adiciona um retângulo demonstrativo das barras fora da avaliação, a direita.
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