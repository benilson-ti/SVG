/* global Svg, $ */
/* jshint strict: global */
'use strict';

/**
 * Classe que controla as funcionalidades de geração de gráficos box plot, usando svg.
 * @requires jquery.js
 * @requires Svg.js
 * @requires boxplot.css
 * @param {Object} Objeto literal de dados do gráfico
 * @returns {BoxPlot}
 */
function BoxPlot(dados) {
    /**
     * Ponteiro.
     * @type BoxPlot
     */
    var that = this;

    /**
     * Define a largura do svg.
     * @type {Number} valor inteiro
     */
    this.width = 500;

    /**
     * Define a altura do svg.
     * @type {Number} valor inteiro
     */
    this.height = 300;

    /**
     * Define a altura do eixo y.
     * @type {Number} valor inteiro
     */
    this.heightY;

    /**
     * Lista de labels do eixo Y.
     * @type {Array} Lista de objetos
     */
    this.labelsY;

    /**
     * Título do gráfico no eixo y.
     * @type {String} Título
     */
    this.titleY;

    /**
     * Define se o SVG é para ser responsivo ou não.
     * @var Boolean
     */
    this.responsive = false;

    /**
     * Lista de dados, para formar os grupos no gráfico.
     * @var Array
     */
    this.groups;

    // aplica a configuração informada.
    $.extend(this, dados);
    dados = null;

    /**
     * Svg gerado. @see Svg.js
     * @type {Svg} Objeto Svg
     */
    this.svg;

    /**
     * Linha do eixo x.
     * @type {Line}
     */
    this.lineX;

    /**
     * Linha do eixo y.
     * @type {Line}
     */
    this.lineY;

    /**
     * Método que define o valor do atributo responsive.
     * @param {Boolean} value Valor do atributo
     * @return {BoxPlot}
     */
    this.setResponsive = function(value) {
        this.responsive = value;
        return this;
    };

    /**
     * Retorna uma linha, usada para desenhar o eixo x.
     * @returns {Line}
     */
    this.getLineX = function() {
        if (this.lineX) {
            return this.lineX;
        }

        var height = (this.height * 0.90), // posiciona em 90% da altura do svg;
            x1 = (this.width * 0.15), // 15% do tamanho do svg
            x2 = (this.width * 0.95), // vai até 95% do tamanho do svg
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
            params = {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-boxplot-line-y'};

        this.lineY = new Line(params);
        return this.lineY;
    };

    /**
     * Adiciona o título do eixo y.
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
     * Desenha o gráfico no seletor informado.
     * @param {String} seletor Seletor jQuery
     * @returns {Svg}
     */
    this.draw = function(seletor) {
        return this.getSvg().setResponsive(this.responsive).draw(seletor);
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
     * Retorna um quadrado usado na moldura do svg.
     * @returns {Rect}
     */
    this.getBoard = function() {
        return new Rect(
            {width: this.width, height: this.height, class: 'svg-boxplot-board'}
        );
    };

    /**
     * Adiciona as labels do eixo y.
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
     * Adiciona os grupos gráficos ao svg.
     * @returns {undefined}
     */
    this.addGroupsBoxPlot = function()
    {
        /**
         * Retorna os parâmetros usados na configuração.
         * @param {Object} params Lista de parâmetros
         * @param {Number} indice Índice do grupo
         * @returns {Object}
         */
        var getParamsGroups = function(params, indice) {
            var lineY = that.getLineY(),
                lineX = that.getLineX(),
                largura = (lineX.getParam('x2') - lineX.getParam('x1')),
                // + 2 para adicionar um espaçamento no início e no fim
                qtdGrupos = (that.groups.length + 2),
                numGroup = (indice + 1),
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
         * Retorna a linha verticial usada no grupo gráfico.
         * @param {Object} dados Lista de parâmetros
         * @returns {Line}
         */
        getVerticalLineGroup = function(dados) {
            return new Line(dados.params);
        },

        /**
         * Retorna a linha superior usada no grupo gráfico.
         * @param {Object} dados Lista de parâmetros
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
         * Retorna a linha inferior usada no grupo gráfico.
         * @param {Object} dados Lista de parâmetros
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
         * Retorna o ponto marcado no grupo gráfico.
         * @param {Object} dados Lista de parâmetros
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
         * Retorna o retângulo usado no grupo gráfico, possui o primeiro e o terceiro quartil.
         * @param {Object} dados Lista de parâmetros
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
         * Retorna a linha da média (terceiro quartil), usada no grupo gráfico.
         * @param {Object} dados Lista de parâmetros
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
            if (params.noGroup) { // para modificação do espaçamento
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