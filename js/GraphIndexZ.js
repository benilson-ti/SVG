/* global Svg */
/* jshint strict: global */
"use strict";

/**
 * Classe que controla as funcionalidades de geração de gráficos de índice Z, usando svg.
 * @requires jquery.js
 * @requires Svg.js
 * @requires graph_index_z.css
 * @param {Json} dados Json de dados do gráfico
 * @example new GraphIndexZ({dp: {value: '3', text: '2,58 (3 DP) 99%'}}).draw('#graphIndiceZ');
 * @returns {GraphIndexZ}
 */
function GraphIndexZ(dados) {
    /**
     * Ponteiro.
     * @type GraphIndexZ
     */
    var that = this;

    /**
     * Define a largura do svg.
     * @type {Number} valor inteiro
     */
    this.width = 200;

    /**
     * Define a altura do svg.
     * @type {Number} valor inteiro
     */
    this.height = 100;

    /**
     * Dp utilizado para montar o gráfico
     * @type {Object} Objeto contendo value (float) e text (string)
     */
    this.dp = {
        value: 2,
        text: '1,96 (2 DP) 95%'
    };

    /**
     * Path default (d).
     * @type {Array}
     */
    this.d = [
        'M30 89', // posição inicial
        'C 30 89, 40 89, 50 85',    // x = -4 e -3      // 4 DP
        'C 50 85 60 82 70 70',      // x = -3 e -2      // 3 DP
        'C 70 70 75 65 80 55',      // x = -2 e -1.5    // 2 DP
        'C 80 55 90 35 95 23',      // x = -1.5 e -1.0  // 1.5 DP
        'C 95 23 110 -13 125 23',   // x = -1.0 e 1.0
        'C 125 23 130 35 140 55',   // x = 1.0 e 1.5    // 1.5 DP
        'C 140 55 145 65 150 70',   // x = 1.5 e 2      // 2 DP
        'C 150 70 160 82 170 85',   // x = 2 e 3        // 3 DP
        'C 170 85, 180 89, 190 89'  // x = 3 e 4        // 4 DP
    ];

    /**
     * Lista de labels do eixo x.
     * @type {Array} Lista de objetos
     */
    this.labelsX = [
        {"text": "-4.0"},
        {"text": "-3.0"},
        {"text": "-2.0"},
        {"text": "-1.0"},
        {"text": "0.0"},
        {"text": "1.0"},
        {"text": "2.0"},
        {"text": "3.0"},
        {"text": "4.0"}
    ];

    /**
     * Lista de labels do eixo Y.
     * @type {Array} Lista de valores
     */
    this.labelsY = [0.0, 0.1, 0.2, 0.3, 0.4];

    /**
     * Define se o SVG é para ser responsivo ou não.
     * @type {Boolean} Default false (não responsivo)
     */
    this.responsive = false;

    /**
     * Parâmetros da linha do eixo X
     * @type {Object} Objeto literal com as configurações
     */
    this.paramsLineX = {};

    // aplica a configuração informada.
    $.extend(this, dados);
    dados = null;

    /**
     * Método que define o valor do atributo responsive.
     * @param {Boolean} value Valor do atributo
     * @return {GraphIndexZ}
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
        $('.svg-popover').popover();
        return svg;
    };

    /**
     * Retorna um quadrado usado na moldura do svg.
     * @returns {Rect}
     */
    this.getBoard = function() {
        return new Rect(
            {width: this.width, height: this.height, class: 'svg-graph-index-z-board'}
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

        var height = (this.height * 0.9),
            x1 = 20,
            x2 = this.width,
            params = {
                x1: x1,
                y1: height,
                x2: x2,
                y2: height,
                class: 'svg-graph-index-z-line-x'
            };

        this.lineX = new Line($.extend(params, that.paramsLineX));
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
            y1 = (this.height * 0.05),
            y2 = this.getLineX().getParam('y1'),
            params = {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-graph-index-z-line-y'};

        this.lineY = new Line(params);
        return this.lineY;
    };

    /**
     * Retorna um grupo de elementos do eixo x.
     * @returns {Group}
     */
    this.getGrupoEixoX = function() {
        if (!this.grupoEixoX) {
            this.grupoEixoX = new Group({class: 'svg-graph-index-z-group-x'});
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
            this.grupoEixoY = new Group({class: 'svg-graph-index-z-group-y'});
        }

        this.grupoEixoY.add(this.getLineY());

        this.addLabelsEixoY();

        return this.grupoEixoY;
    };

    /**
     * Adiciona as labels do eixo x.
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
            y = (alturaEixoX + 7),
            params;

        $(this.labelsX).each(function(i, label) {
            x = (x1 + (larguraCadaGrupo * i));
            params = {
                x: x,
                y: y,
                class: 'svg-graph-index-z-label-x'
            };

            that.grupoEixoX.add(new Text(label.text, params));
        });
    };

    /**
     * Adiciona as labels do eixo y.
     * @returns {undefined}
     */
    this.addLabelsEixoY = function() {
        var maiorGrupo = (this.labelsY.length - 1),
            alturaEixoX = this.getLineY().getParam('y2'),
            alturaLinhaY = (alturaEixoX - this.getLineY().getParam('y1')),
            alturaCadaGrupo = (alturaLinhaY / maiorGrupo),
            x1 = this.getLineX().getParam('x1'),
            x = (x1 - 5),
            y,
            paramsText = {x: x, y: y, class: 'svg-graph-index-z-label-y'};

        $(this.labelsY).each(function(i, val) {
            y = (alturaEixoX - (i * alturaCadaGrupo));
            paramsText.y = y;
            that.grupoEixoY.add(new Text(val.toString(), paramsText));
        });
    };

    /**
     * Retorna o desenho do gráfico.
     * @param {Boolean} closeImage True fecha a figura e usa como background,
     *                             False deixa somente a linha superior verde desenhada
     * @returns {Path}
     */
    this.getPath = function(closeImage) {
        var classe = 'svg-graph-index-z-path-without-z',
            params = {class: classe},
            d = this.d.slice();

        if (closeImage) {
            classe = 'svg-graph-index-z-path-with-z';
            d.push('Z');// += ' Z'; // traça uma linha reta até a posição inicial, fechando a figura
        }

        params.d = d.join(' ');
        params.class = classe;

        return new Path(params);
    };

    /**
     * Retorna a figura desenhada como background (cinza escuro), dentro do gráfico.
     * @returns {Path}
     */
    this.getBgInside = function() {
        var d;

        switch (this.dp.value) {
            case '1.5':
                d = this.d.slice(4, 7);
                d.unshift('M80 89 V 55');
                d.push('V 89');
                break;

            case '2':
                d = this.d.slice(3, 8);
                d.unshift('M70 89 V 70');
                d.push('V 89');
                break;

            case '3':
                d = this.d.slice(2, 9);
                d.unshift('M50 89 V 85');
                d.push('V 89');
                break;

            default: // '4'
                d = this.d.slice();
        }

        d.push('Z'); // traça uma linha reta até a posição inicial, fechando a figura

        return new Path({d: d.join(' '), class: 'svg-graph-index-z-inside-rect'});
    };

    /**
     * Retorna um quadrado cinza claro, usado como background externo do dp selecionado.
     * @returns {Rect}
     */
    this.getRectBackGround = function() {

        var x = {
            1.5: 80,
            2: 70,
            3: 50,
            4: 30
        };

        var width = {
            1.5: 60,
            2: 80,
            3: 120,
            4: 160
        };

        return new Rect(
            {width: width[this.dp.value], height: 84.5, x: x[this.dp.value], y: 5, class: 'svg-graph-index-z-rect-back-ground'}
        );
    };

    /**
     * Retorna a label usada no gráfico
     * @returns {Text}
     */
    this.getLabel = function() {
        var params = {
            x: 80,
            y: 75,
            class: 'svg-graph-index-z-label'
        };

        return new Text(this.dp.text, params);
    };

    /**
     * Retorna um quadrado usado como background do dp selecionado.
     * @returns {Rect}
     */
    this.getRect = function() {
        return new Rect(
            {width: 80, height: 85, x: 70, y: 5, class: 'svg-graph-index-z-rect'}
        );
    };

    /**
     * Retorna um elemento svg, com seus componentes e as informações do gráfico de índice Z.
     * @returns {Svg}
     */
    this.getSvg = function() {
        if (this.svg) {
            return this.svg;
        }

        this.svg = new Svg({
            width: this.width,
            height: this.height,
            class: 'svg-graph-index-z'
        });
        this.svg.add(this.getBoard());
        this.svg.add(this.getGrupoEixoX());
        this.svg.add(this.getGrupoEixoY());
        this.svg.add(this.getPath(true));
        this.svg.add(this.getRectBackGround());
        this.svg.add(this.getPath(false));
        this.svg.add(this.getBgInside());
        this.svg.add(this.getLabel());

        return this.svg;
    };
}
