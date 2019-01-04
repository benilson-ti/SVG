/* global document, $ */
/* jshint strict: global */
'use strict';

/**
 * Classe para as funcionalidades com os componentes SVG.
 * @see https://www.w3schools.com/graphics/svg_reference.asp
 * @param {Object} params {width: integer N, height: integer N}
 * @param {Object} style {}
 * <ul>
 *  <li>
 *  <li>x="top left corner when embedded (default 0)"</li>
 *  <li>y="top left corner when embedded (default 0)"</li>
 *  <li>width="the width of the svg fragment (default 100%)"</li>
 *  <li>height="the height of the svg fragment (default 100%)"</li>
 *  <li>
 *      viewBox="the points "seen" in this SVG drawing area. 4 values separated
 *      by white space or commas. (min x, min y, width, height)"
 *  </li>
 *  <li>
 *      preserveAspectRatio="'none' or any of the 9 combinations of 'xVALYVAL'
 *      where VAL is 'min', 'mid' or 'max'. (default xMidYMid)"
 *  </li>
 *  <li>
 *      zoomAndPan="'magnify' or 'disable'. Magnify option allows users to pan
 *      and zoom your file (default magnify)"
 *  </li>
 *  <li>
 *      xml="outermost <svg> element needs to setup SVG and its
 *      namespace: xmlns="http://www.w3.org/2000/svg"
 *      xmlns:xlink="http://www.w3.org/1999/xlink"
 *      xml:space="preserve""
 *  </li>
 * </ul>
 * @returns {Svg}
 */
function Svg(params, style)
{
    /**
     * Ponteiro para o próprio objeto.
     * @private
     * @type Svg
     */
    var that = this,

    /**
     * Objeto svg html gerado.
     * @private
     * @type Object
     */
    svg;

    /**
     * Largura do svg.
     * @var Number
     */
    this.width = params.width;

    /**
     * Algura do svg.
     * @var Number
     */
    this.height = params.height;

    /**
     * Define se o SVG é para ser responsivo ou não.
     * @var Boolean
     */
    this.responsive = false;

    XmlSvg.call(this, 'svg', params, style); // extend XmlSvg

    /**
     * Método que define o valor do atributo responsive.
     * @param {Boolean} value Valor do atributo
     * @return Svg
     */
    this.setResponsive = function(value) {
        this.responsive = value;
        return this;
    };

    /**
     * Gera o svg e adiciona ao elemento do seletor informado.
     * @param {String} seletor Seletor jQuery
     * @returns {jQuery} Svg gerado
     */
    this.draw = function(seletor) {
        svg = this.generate();
        $(seletor).append(svg);

        if (this.responsive) {
            svg.get(0).setAttribute('viewBox', ('0 0 ' + that.width + ' ' + that.height));
            $(svg).removeProp('width');
            $(svg).removeProp('height');
            $(svg).css('width', '100%');
            $(svg).css('height', 'auto');
        }

        return svg;
    };
}

/**
 * Classe que serve para representar qualquer elemento xml gerado por svg.
 * @constructor
 * @param {String} tag Tag do elemento xml
 * @param {Object} attrs Objeto literal de atributos
 * @param {Object} style Objeto literal de atributos css
 * @returns {XmlSvg}
 */
function XmlSvg(tag, attrs, style)
{
    this.tag = tag;
    var tags = [],
        params = $.extend({}, attrs),
        css = $.extend({}, style);

    /**
     * Adiciona um objeto XmlSvg como filho.
     * @param {XmlSvg} xml Classe filha de XmlSvg
     * @returns {XmlSvg}
     */
    this.add = function(xml) {
        tags.push(xml);
        return this;
    };

    /**
     * Adiciona um atributo.
     * @param {String} attr Nome do atributo
     * @param {String} value Valor do atributo
     * @returns {XmlSvg}
     */
    this.addAttr = function(attr, value) {
        params[attr] = value;
        return this;
    };

    /**
     * Adiciona uma lista de atributos.
     * @param {Object} attrs Objeto literal com os atributos
     * @returns {XmlSvg}
     */
    this.setAttrs = function(attrs) {
        params = $.extend(params, attrs);
        return this;
    };

    /**
     * Adiciona um atributo CSS.
     * @param {String} attr Nome do atributo CSS
     * @param {String} value Valor do atributo
     * @returns {XmlSvg}
     */
    this.addCss = function(attr, value) {
        css[attr] = value;
        return this;
    };

    /**
     * Adiciona uma lista de atributos CSS.
     * @param {Object} style Objeto literal com os atributos CSS
     * @returns {XmlSvg}
     */
    this.setCss = function(style) {
        css = $.extend(css, style);
        return this;
    };

    /**
     * Retorna o valor de um atributo.
     * @param {string} param Nome do atributo
     * @returns {String}
     */
    this.getParam = function(param) {
        return params[param];
    };

    /**
     * Gera o elemento html e retorna, encapsulado como elemento jQuery.
     * @returns {jQuery}
     */
    this.generate = function() {
        var $tag = $(document.createElementNS('http://www.w3.org/2000/svg', tag));
        var prop;

        for (prop in params) {
            $tag.get(0).setAttribute(prop, params[prop]);
            //$tag.attr(prop, params[prop]); // não serve, aplica lowercase
        }

        $tag.css(css);

        $(tags).each(function() {
            $tag.append(
                this.generate() // recursivo
            );
        });

        if ((tag === 'text' || tag === 'title') && this.text) {
            var textNode = document.createTextNode(this.text);
            $tag.get(0).appendChild(textNode);
        }

        return $tag;
    };
}

/**
 * Adiciona e retorna uma linha ao svg.
 * @constructor
 * @extends XmlSvg
 * @example
 *      var svg = new Svg({width: 200, height: 200});                       <br>
 *      var params = {x1: 50, y1: 50, x2: 100, y2: 100};                    <br>
 *      var style = {stroke: '#000', 'stroke-width': 1};                    <br>
 *      var line = new Line(params, style);                                 <br>
 *      svg.add(line);                                                      <br>
 *      svg.draw('#idDivAddSvg');                                           <br>
 * @param {Object} params {x1: 50, y1: 50, x2: 100, y2: 100}
 * <ul>
 *  <li>x1="the x start point of the line"</li>
 *  <li>y1="the y start point of the line"</li>
 *  <li>x2="the x end point of the line"</li>
 *  <li>y2="the y end point of the line"</li>
 * </ul>
 * @param {Object} style {stroke: '#000', 'stroke-width': 1}
 * @returns {Line}
 */
function Line (params, style) {
    XmlSvg.call(this, 'line', params, style); // extend XmlSvg

    /**
     * Preenche o valor do atributo x1 (posição inicial no eixo x).
     * @param {Number} value Valor inteiro
     * @returns {Line}
     */
    this.setX1 = function(value) {
        this.addAttr('x1', value);
        return this;
    };

    /**
     * Preenche o valor do atributo y1 (posição inicial no eixo y).
     * @param {Number} value Valor inteiro
     * @returns {Line}
     */
    this.setY1 = function(value) {
        this.addAttr('y1', value);
        return this;
    };

    /**
     * Preenche o valor do atributo x2 (posição final no eixo x).
     * @param {Number} value Valor inteiro
     * @returns {Line}
     */
    this.setX2 = function(value) {
        this.addAttr('x2', value);
        return this;
    };

    /**
     * Preenche o valor do atributo y2 (posição final no eixo y).
     * @param {Number} value Valor inteiro
     * @returns {Line}
     */
    this.setY2 = function(value) {
        this.addAttr('y2', value);
        return this;
    };
};

/**
 * Adiciona e retorna um quadrilátero ao svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {width: 150, height: 150}
 * <ul>
 *  <li>x="the x-axis top-left corner of the rectangle"</li>
 *  <li>y="the y-axis top-left corner of the rectangle"</li>
 *  <li>rx="the x-axis radius (to round the element)"</li>
 *  <li>ry="the y-axis radius (to round the element)"</li>
 *  <li>width="the width of the rectangle". Required.</li>
 *  <li>height="the height of the rectangle" Required.</li>
 * </ul>
 * @param {Object} style {stroke: '#000', 'stroke-width': 1, fill: #fff}
 * @returns {Rect}
 */
function Rect(params, style) {
    XmlSvg.call(this, 'rect', params, style); // extend XmlSvg

    /**
     * Preenche o valor do atributo width (largura do quadrilátero).
     * @param {Number} value Valor inteiro
     * @returns {Rect}
     */
    this.setWidth = function(value) {
        this.addCss('width', value);
        return this;
    };

    /**
     * Preenche o valor do atributo height (altura do quadrilátero).
     * @param {Number} value Valor inteiro
     * @returns {Rect}
     */
    this.setHeight = function(value) {
        this.addCss('height', value);
        return this;
    };

    /**
     * Preenche o valor do atributo x (posição no eixo x).
     * @param {Number} value Valor inteiro
     * @returns {Rect}
     */
    this.setX = function(value) {
        this.addAttr('x', value);
        return this;
    };

    /**
     * Preenche o valor do atributo y (posição no eixo y).
     * @param {Number} value Valor inteiro
     * @returns {Rect}
     */
    this.setY = function(value) {
        this.addAttr('y', value);
        return this;
    };

    /**
     * Preenche o valor do atributo rx (arredondamento no eixo x).
     * @param {Number} value Valor inteiro
     * @returns {Rect}
     */
    this.setRx = function(value) {
        this.addAttr('rx', value);
        return this;
    };

    /**
     * Preenche o valor do atributo ry (arredondamento no eixo y).
     * @param {Number} value Valor inteiro
     * @returns {Rect}
     */
    this.setRy = function(value) {
        this.addAttr('ry', value);
        return this;
    };
};

/**
 * Adiciona e retorna uma elipse ao svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {cx: 200, cy: 80, rx: 60, ry: 30}
 * <ul>
 *  <li>
 *  <li>cx="the x-axis center of the ellipse"</li>
 *  <li>cy="the y-axis center of the ellipse"</li>
 *  <li>rx="the length of the ellipse's radius along the x-axis". Required.</li>
 *  <li>ry="the length of the ellipse's radius along the y-axis". Required.</li>
 * </ul>
 * @param {Object} style {stroke: '#000', 'stroke-width': 1, fill: #fff}
 * @returns {Ellipse}
 */
function Ellipse(params, style) {
    XmlSvg.call(this, 'ellipse', params, style); // extend XmlSvg

    /**
     * Preenche o valor do atributo cx (posição central no eixo x).
     * @param {Number} value Valor inteiro
     * @returns {Ellipse}
     */
    this.setX = function(value) {
        this.addAttr('cx', value);
        return this;
    };

    /**
     * Preenche o valor do atributo cy (posição central no eixo y).
     * @param {Number} value Valor inteiro
     * @returns {Ellipse}
     */
    this.setY = function(value) {
        this.addAttr('cy', value);
        return this;
    };

    /**
     * Preenche o valor do atributo rx (raio no eixo x).
     * @param {Number} value Valor inteiro
     * @returns {Ellipse}
     */
    this.setRaioX = function(value) {
        this.addAttr('rx', value);
        return this;
    };

    /**
     * Preenche o valor do atributo ry (raio no eixo y).
     * @param {Number} value Valor inteiro
     * @returns {Ellipse}
     */
    this.setRaioY = function(value) {
        this.addAttr('ry', value);
        return this;
    };
};


/**
 * Adiciona e retorna um círculo ao svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {cx: 100, cy: 100, r: 20}
 * <ul>
 *  <li>cx="the x-axis center of the circle"</li>
 *  <li>cy="the y-axis center of the circle"</li>
 *  <li>r="The circle's radius". Required.</li>
 * </ul>
 * @param {Object} style {stroke: '#000', 'stroke-width': 1, fill: #fff}
 * @returns {Circle}
 */
function Circle(params, style) {
    XmlSvg.call(this, 'circle', params, style); // extend XmlSvg

    /**
     * Preenche o valor do atributo cx (posição central no eixo x).
     * @param {Number} value Valor inteiro
     * @returns {Circle}
     */
    this.setX = function(value) {
        this.addAttr('cx', value);
        return this;
    };

    /**
     * Preenche o valor do atributo cy (posição central no eixo y).
     * @param {Number} value Valor inteiro
     * @returns {Circle}
     */
    this.setY = function(value) {
        this.addAttr('cy', value);
        return this;
    };

    /**
     * Preenche o valor do atributo r (raio).
     * @param {Number} value Valor inteiro
     * @returns {Circle}
     */
    this.setRaio = function(value) {
        this.addAttr('r', value);
        return this;
    };
};

/**
 * Adiciona e retorna um polígono ao svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {points: "200,10 250,190 160,210"}
 * @param {Object} style {stroke: '#000', 'stroke-width': 1, fill: #fff}
 * @returns {Polygon}
 */
function Polygon(params, style) {
    XmlSvg.call(this, 'polygon', params, style); // extend XmlSvg

    /**
     * Preenche o valor do atributo points (pontos x1,y1, x2,y2, ..., xN,yN do polígono).
     * @param {Number} value Valor inteiro
     * @returns {Polygon}
     */
    this.setPoints = function(value) {
        this.addAttr('points', value);
        return this;
    };
};

/**
 * Adiciona e retorna uma linha não reta ao svg.
 * @constructor
 * @extends Polygon
 * @param {Object} params {points: "20,20 40,25 60,40 80,120 120,140 200,180"}
 * @param {Object} style {stroke: '#000', 'stroke-width': 1, fill: #fff}
 * @returns {Polyline}
 */
function Polyline(params, style) {
    Polygon.call(this, 'polyline', params, style); // extend Polygon
};

/**
 * Adiciona e retorna um desenho "feito à mão livre" ao svg.
 * @constructor
 * @extends XmlSvg
 * <ul>
 *  <li>M = moveto</li>
 *  <li>L = lineto</li>
 *  <li>H = horizontal lineto</li>
 *  <li>V = vertical lineto</li>
 *  <li>C = curveto</li>
 *  <li>S = smooth curveto</li>
 *  <li>Q = quadratic Bézier curve</li>
 *  <li>T = smooth quadratic Bézier curveto</li>
 *  <li>A = elliptical Arc</li>
 *  <li>Z = closepath</li>
 * </ul>
 * @param {Object} params {d: "M40,20  A30,30 0 1,1 70,70"}
 * @param {Object} style {stroke: '#000', 'stroke-width': 1, fill: 'none'}
 * @returns {Path}
 */
function Path(params, style) {
    XmlSvg.call(this, 'path', params, style); // extend XmlSvg

    /**
     * Preenche o valor do atributo d (definições da figura).
     * @param {Number} value Valor inteiro
     * @returns {Path}
     */
    this.setD = function(value) {
        this.addAttr('d', value);
        return this;
    };
};

/**
 * Adiciona e retorna um seção de definições ao svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {}
 * @param {Object} style {}
 * @returns {Defs}
 */
function Defs(params, style) {
    XmlSvg.call(this, 'defs', params, style); // extend XmlSvg
};

/**
 * Adiciona e retorna um grupo de elementos ao svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {}
 * <ul>
 *  <li>id="the name of the group"</li>
 *  <li>fill="the fill color for the group"</li>
 *  <li>opacity="the opacity for the group"</li>
 * </ul>
 * @param {Object} style {}
 * @returns {Group}
 */
function Group(params, style) {
    XmlSvg.call(this, 'g', params, style); // extend XmlSvg
};

/**
 * Adiciona e retorna um texto ao svg.
 * @constructor
 * @extends XmlSvg
 * @param {String} text Texto para ser desenhado
 * @param {Object} params {x: 10, y: 15, transform: "rotate(30 20,40)"}
 * <ul>
 *  <li>
 *  <li>
 *      x="a list of x-axis positions. The nth x-axis position is given to the
 *      nth character in the text. If there are additional characters after the
 *      positions run out they are placed after the last character. 0 is default"
 *  </li>
 *  <li>y="a list of y-axis positions. (see x). 0 is default"</li>
 *  <li>
 *      dx="a list of lengths which moves the characters relative to the absolute
 *      position of the last glyph drawn. (see x)"
 *  </li>
 *  <li>
 *      dy="a list of lengths which moves the characters relative to the absolute
 *      position of the last glyph drawn. (see x)"
 *  </li>
 *  <li>
 *      rotate="a list of rotations. The nth rotation is performed on the nth
 *      character. Additional characters are NOT given the last rotation value"
 *  </li>
 *  <li>
 *      textLength="a target length for the text that the SVG viewer will attempt
 *      to display the text between by adjusting the spacing and/or the glyphs.
 *      (default: The text's normal length)"
 *  </li>
 *  <li>
 *      lengthAdjust="tells the viewer what to adjust to try to accomplish rendering the
 *      text if the length is specified. The two values are 'spacing' and 'spacingAndGlyphs'"
 *  </li>
 * </ul>
 *
 * @param {Object} style {fill="red"}
 * @returns {Text}
 */
function Text(text, params, style) {
    XmlSvg.call(this, 'text', params, style); // extend XmlSvg

    /**
     * Texto que será gerado no svg.
     * @var {String}
     */
    this.text = text;

    // @todo: sets...

    /**
     * Preenche o valor do atributo text.
     * @param {String} value Valor do atributo
     * @returns {Text}
     */
    this.setText = function(value) {
        this.text = value;
        return this;
    };
};

/**
 * Adiciona uma tag title, função semelhante ao atributo title do html, em algum elemento svg.
 * @constructor
 * @extends XmlSvg
 * @param {String} text Texto para ser renderizado de forma semelhante ao title do html
 * @param {Object} params {class: 'nome-classe', id: 'id'"}
 * @param {Object} style {fill="#ff0000"}
 * @returns {Text}
 */
function Title(text, params, style) {
    // params e style são adicionados ao elemento, mas em 25/10/2018 ainda não modifica
    // a aparência renderizada, talvez no futuro.
    XmlSvg.call(this, 'title', params, style); // extend XmlSvg

    /**
     * Texto que será gerado no svg.
     * @var {String}
     */
    this.text = text;

    /**
     * Preenche o valor do atributo text.
     * @param {String} value Valor do atributo
     * @returns {Text}
     */
    this.setText = function(value) {
        this.text = value;
        return this;
    };
};

/**
 * Adiciona e retorna um efeito de gradiente de cor radial em uma tag defs.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {id: "grad1", cx: "50%", cy: "50%", r: "50%", fx: "50%", fy: "50%"}
 * <ul>
 *  <li>
 *  <li>
 *      gradientUnits="'userSpaceOnUse' or 'objectBoundingBox'. Use the view box or object
 *      to determine relative position of vector points. (Default 'objectBoundingBox')"
 *  </li>
 *  <li>gradientTransform="the transformation to apply to the gradient"</li>
 *  <li>cx="the center point of the gradient (number or % - 50% is default)"</li>
 *  <li>cy="the center point of the gradient. (50% default)"</li>
 *  <li>r="the radius of the gradient. (50% default)"</li>
 *  <li>fx="the focus point of the gradient. (0% default)"</li>
 *  <li>fy="The focus point of the gradient. (0% default)"</li>
 *  <li>spreadMethod="'pad' or 'reflect' or 'repeat'"</li>
 *  <li>
 *      xlink:href="Reference to another gradient whose attribute values are used
 *      as defaults and stops included. Recursive"
 *  </li>
 * </ul>
 * @param {Object} style {'stop-color': '#ff0', 'stop-opacity': 1}
 * @example
 * <svg height="150" width="500">
 *   <defs>
 *     <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
 *       <stop offset="0%" style="stop-color:rgb(255,255,255); stop-opacity:0" />
 *       <stop offset="100%" style="stop-color:rgb(0,0,255);stop-opacity:1" />
 *     </radialGradient>
 *   </defs>
 *   <ellipse cx="200" cy="70" rx="85" ry="55" fill="url(#grad1)" />
 * </svg>
 * @returns {RadialGradient}
 */
this.RadialGradient = function(params, style) {
    XmlSvg.call(this, 'radialGradient', params, style); // extend XmlSvg

    // @todo: sets...
};

/**
 * Adiciona e retorna um efeito de gradiente de cor linear em uma tag defs.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {id: "grad1", x1: "0%", y1: "0%", x2: "100%", y2: "0%"}
 * <ul>
 *  <li>id="the unique id used to reference this pattern. Required to reference it"</li>
 *  <li>
 *      gradientUnits="'userSpaceOnUse' or 'objectBoundingBox'. Use the view box or object
 *      to determine relative position of vector points. (Default 'objectBoundingBox')"
 *  </li>
 *  <li>gradientTransform="the transformation to apply to the gradient"</li>
 *  <li>x1="the x start point of the gradient vector (number or % - 0% is default)"</li>
 *  <li>y1="the y start point of the gradient vector. (0% default)"</li>
 *  <li>x2="the x end point of the gradient vector. (100% default)"</li>
 *  <li>y2="the y end point of the gradient vector. (0% default)"</li>
 *  <li>spreadMethod="'pad' or 'reflect' or 'repeat'"</li>
 *  <li>
 *      xlink:href="reference to another gradient whose attribute values are
 *      used as defaults and stops included. Recursive"
 *  </li>
 * </ul>
 * @param {Object} style {}
 * @example
 *     <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
 *       <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
 *       <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
 *     </linearGradient>
 * @returns {LinearGradient}
 */
function LinearGradient(params, style) {
    XmlSvg.call(this, 'linearGradient', params, style); // extend XmlSvg

    // @todo: sets...
};

/**
 * Adiciona e retorna um efeito de gradiente de cor linear/radial em uma tag defs.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {offset: "0%"}
 * <ul>
 *  <li>offset="the offset for this stop (0 to 1/0% to 100%)". Required.</li>
 *  <li>stop-color="the color of this stop"</li>
 *  <li>stop-opacity="the opacity of this stop (0 to 1)"</li>
 * </ul>
 * @param {Object} style {'stop-color': '#ff0', 'stop-opacity': 1}
 * @example
 *     <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
 *       <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
 *       <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
 *     </linearGradient>
 * @returns {Stop}
 */
function Stop(params, style) {
    XmlSvg.call(this, 'stop', params, style); // extend XmlSvg

    // @todo: sets...
};

/**
 * Adiciona e retorna os filtros nas definições de um svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {id: "f1", x:0, y:0}
 * @param {Object} style {}
 * @returns {XmlSvg}
 */
this.filter = function(params, style) {
    XmlSvg.call(this, 'filter', params, style); // extend XmlSvg
};

/**
 * Adiciona e retorna o efeito gaussiano para ser aplicado usando filter,
 * nas definições de um svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {in: "SourceGraphic", stdDeviation: 15}
 * @param {Object} style {}
 * @returns {FeGaussianBlur}
 */
function FeGaussianBlur(params, style) {
    XmlSvg.call(this, 'feGaussianBlur', params, style); // extend XmlSvg
};

/**
 * Adiciona e retorna o efeito de criar um elemento sombra, usando filter,
 * nas definições de um svg.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {result: "offOut", in: "SourceGraphic", dx: 20, dy: 20}
 * @param {Object} style {}
 * @returns {FeOffset}
 */
function FeOffset(params, style) {
    XmlSvg.call(this, 'feOffset', params, style); // extend XmlSvg
};

/**
 * Adiciona e retorna o efeito de criar um elemento sombra, usando filter,
 * nas definições de um svg. Usar em conjunto com feOffset.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {in: "SourceGraphic", in2: "offOut", mode: "normal"}
 * @param {Object} style {}
 * @returns {FeBlend}
 */
function FeBlend(params, style) {
    XmlSvg.call(this, 'feBlend', params, style); // extend XmlSvg
};

/**
 * Adiciona e retorna um elemento svg que permite adicionar html no SVG.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {x:"20", y:"20", width:"160", height:"160"}
 * @param {Object} style {}
 * @returns {ForeignObject}
 */
function ForeignObject(params, style) {
    XmlSvg.call(this, 'foreignObject', params, style); // extend XmlSvg
    var $tag = this.generate();

    /**
     * Gera o elemento e retorna, encapsulado como elemento jQuery.
     * @returns {jQuery}
     */
    this.generate = function() {
        return $tag;
    };
};
