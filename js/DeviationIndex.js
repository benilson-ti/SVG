/* global Svg, parseFloat, Math */
/* jshint strict: global */
"use strict";

/**
 * Classe que controla as funcionalidades de geração de gráficos de índice de desvio, usando svg.
 * @requires jquery.js
 * @requires Svg.js
 * @requires deviation_index.css
 * @param {Json} dados Json de dados do gráfico
 * @returns {DeviationIndex}
 */
function DeviationIndex(dados) {
    /**
     * Ponteiro.
     * @type DeviationIndex
     */
    var that = this;

    /**
     * Define a largura do svg.
     * @type {Number} valor inteiro
     */
    this.width = 600;

    /**
     * Define a altura do svg.
     * @type {Number} valor inteiro
     */
    this.height = 400;

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
     * Título do gráfico no eixo y.
     * @type {String}
     */
    this.titleY;

    /**
     * Se é para adicionar ou não as duas barras de desvio padrão, no meio do gráfico.
     * @type {Boolean} Default false (não adicionar)
     */
    this.withStandardDeviationBars = false;

    /**
     * Define se o SVG é para ser responsivo ou não.
     * @type {Boolean} Default false (não responsivo)
     */
    this.responsive = false;

    /**
     * Erro total permitido
     * @type {Object} Objeto literal com as configurações
     */
    this.ETp;

    /**
     * Erro sistemático permitido
     * @type {Object} Objeto literal com as configurações
     */
    this.ESp;

    /**
     * Parâmetros da linha do eixo X
     * @type {Object} Objeto literal com as configurações
     */
    this.paramsLineX = {};

    /**
     * Lista de atributos default de uma popover do bootstrap.
     * @var {Object}
     */
    this.popoverDefault = {
        'data-toggle': "popover",
        'data-trigger': "hover",
        'data-container': "body",
        'data-html': "true",
        'data-placement': "auto top"
    };

    // aplica a configuração informada.
    $.extend(this, dados);
    dados = null;

    /**
     * Método que define o valor do atributo responsive.
     * @param {Boolean} value Valor do atributo
     * @return {DeviationIndex}
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
            {width: this.width, height: this.height, class: 'svg-deviation-index-board'}
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
     * Retorna a maior quantidade de caracteres, dos elementos das labels, no eixo Y.
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
            params = {x1: x, y1: y1, x2: x, y2: y2, class: 'svg-deviation-index-line-y'};

        this.lineY = new Line(params);
        return this.lineY;
    };

    /**
     * Retorna um grupo de elementos do eixo x.
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
     * Retorna um grupo de elementos do eixo y.
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
     * Retorna o título do eixo y.
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

        // hack para renderizar tag html dentro do título
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
     * Adiciona um triângulo indicativo de que o item está fora dos limites.
     * @param {Number} x Coordenada x
     * @param {Number} y Coordenada y
     * @param {Number} lado Tamanho dos lados do triângulo
     * @param {Number} indice Índice do item
     * @param {Boolean} transform Se é para rotacionar ou não o triângulo em 180 graus
     * @param {Object} popover Parâmetros da popover
     * @returns {undefined}
     */
    this.addTriangleItemOut = function(x, y, lado, indice, transform, popover) {
        var points = [
                (x + ',' + y),
                ((x - (lado * 0.5)) + ',' + (y + lado)),
                ((x + (lado * 0.5)) + ',' + (y + lado))
            ],
            params = {
                points: points.join(' '),
                class: ('svg-popover svg-deviation-index-item-out svg-deviation-index-item' + (indice + 1))
            };

        if (transform) {
            params['transform'] = 'rotate(180,' + x + ',' + (y + lado / 2) + ')';
        }

        if (popover) {
            params = $.extend(params, this.popoverDefault, popover);
        }

        this.svg.add(new Polygon(params));
    };

    /**
     * Adiciona uma barra vertical opcional ao gráfico.
     * @param {Object} dados Objeto literal com os parâmetros
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
     * Adiciona uma barra vertical opcional ao gráfico, referente ao desvio padrão do índice z.
     * @param {Object} indiceZ Parâmetros do índice z
     * @param {Number} width Largura da barra
     * @param {Number} x Posição da barra no eixo x
     * @returns {undefined}
     */
    this.addBarIndexZ = function(indiceZ, width, x) {
        this.addVerticalBar($.extend(indiceZ, {
            width: width,
            x: x,
            classe: 'svg-popover svg-deviation-index-z'
        }));
    };

    /**
     * Adiciona uma barra vertical opcional ao gráfico, referente ao erro total permitido.
     * @param {Number} width Largura da barra
     * @param {Number} x Posição da barra no eixo x
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
     * Adiciona uma barra vertical opcional ao gráfico, referente ao erro sistemático.
     * @param {Number} width Largura da barra
     * @param {Number} x Posição da barra no eixo x
     * @param {Object} erroSistematico Dados do erro sistemático
     * @returns {undefined}
     */
    this.addBarEs = function(width, x, erroSistematico) {
        this.addVerticalBar($.extend(erroSistematico, {
            width: width,
            height: 3,
            x: x,
            classe: 'svg-deviation-index-es'
        }));
    };

    /**
     * Adiciona uma barra vertical opcional ao gráfico, referente ao erro sistemático permitido.
     * @param {Number} width Largura da barra
     * @param {Number} x Posição da barra no eixo x
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
     * Adiciona um losango, referente ao item / nível ao gráfico.
     * @param {Number} x Posição no eixo x
     * @param {Number} y Posição no eixo y
     * @param {Number} side Largura de cada lado do losango
     * @param {Number} indice Identificador do item para ser adicionado a classe css
     * @param {Object} popover Parâmetros da popover
     * @returns {undefined}
     */
    this.addLosangoItem = function(x, y, side, indice, popover) {
        var params = {
            class: ('svg-popover svg-deviation-index-item' + (indice + 1)),
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
     * Adiciona as labels do eixo y.
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
     * Adiciona as barras do gráfico ao svg.
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
                // barras horizontais do meio do gráfico, com cor diferente
                params['class'] = 'svg-deviation-index-bar-desvio-padrao';
                params['opacity'] = 1;
            }

            that.svg.add(new Rect(params));
        }
    };

    /**
     * Adiciona os losangos ou triângulos.
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