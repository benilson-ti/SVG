/* global document, $ */
/* jshint strict: global */
'use strict';

/**
 * Class for features with SVG components.
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
     * Pointer to the object itself.
     * @private
     * @type Svg
     */
    var that = this,

    /**
     * Object html svg generated.
     * @private
     * @type Object
     */
    svg;

    /**
     * Svg width.
     * @var Number
     */
    this.width = params.width;

    /**
     * Svg height.
     * @var Number
     */
    this.height = params.height;

    /**
     * Sets whether SVG is to be responsive or not.
     * @var Boolean
     */
    this.responsive = false;

    XmlSvg.call(this, 'svg', params, style); // extend XmlSvg

    /**
     * Method that defines the value of the responsive attribute.
     * @param {Boolean} value Attribute Value
     * @return Svg
     */
    this.setResponsive = function(value) {
        this.responsive = value;
        return this;
    };

    /**
     * Generates svg and adds to the selector element.
     * @param {String} seletor Selector jQuery
     * @returns {jQuery} Svg generated
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
 * Class that serves to represent any xml element generated for svg.
 * @constructor
 * @param {String} tag Tag of element xml
 * @param {Object} attrs Literal Object width attributes
 * @param {Object} style Literal Object width css attributes
 * @returns {XmlSvg}
 */
function XmlSvg(tag, attrs, style)
{
    this.tag = tag;
    var tags = [],
        params = $.extend({}, attrs),
        css = $.extend({}, style);

    /**
     * Add an XmlSvg object as child.
     * @param {XmlSvg} xml Classe filha de XmlSvg
     * @returns {XmlSvg}
     */
    this.add = function(xml) {
        tags.push(xml);
        return this;
    };

    /**
     * Add one atribute.
     * @param {String} attr Atribute name
     * @param {String} value Atribute value
     * @returns {XmlSvg}
     */
    this.addAttr = function(attr, value) {
        params[attr] = value;
        return this;
    };

    /**
     * Add one list of atributes.
     * @param {Object} attrs Literal object with atributes
     * @returns {XmlSvg}
     */
    this.setAttrs = function(attrs) {
        params = $.extend(params, attrs);
        return this;
    };

    /**
     * Add one CSS atribute.
     * @param {String} attr Name CSS atribute
     * @param {String} value Atribute value
     * @returns {XmlSvg}
     */
    this.addCss = function(attr, value) {
        css[attr] = value;
        return this;
    };

    /**
     * Add one list of CSS atributes.
     * @param {Object} style Literal object with CSS atributes
     * @returns {XmlSvg}
     */
    this.setCss = function(style) {
        css = $.extend(css, style);
        return this;
    };

    /**
     * Returns the value of an attribute.
     * @param {string} param Atribute name
     * @returns {String}
     */
    this.getParam = function(param) {
        return params[param];
    };

    /**
     * Generates html element and returns, encapsulated as jQuery element.
     * @returns {jQuery}
     */
    this.generate = function() {
        var $tag = $(document.createElementNS('http://www.w3.org/2000/svg', tag));
        var prop;

        for (prop in params) {
            $tag.get(0).setAttribute(prop, params[prop]);
        }

        $tag.css(css);

        $(tags).each(function() {
            $tag.append(
                this.generate() // recursive
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
 * Create svg line.
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
     * Fills the attribute value x1 (initial position on the x-axis).
     * @param {Number} value Integer value
     * @returns {Line}
     */
    this.setX1 = function(value) {
        this.addAttr('x1', value);
        return this;
    };

    /**
     * Fills the attribute value y1 (initial position on the y-axis).
     * @param {Number} value Integer value
     * @returns {Line}
     */
    this.setY1 = function(value) {
        this.addAttr('y1', value);
        return this;
    };

    /**
     * Fills the attribute value x2 (final position on the x-axis).
     * @param {Number} value Integer value
     * @returns {Line}
     */
    this.setX2 = function(value) {
        this.addAttr('x2', value);
        return this;
    };

    /**
     * Fills the attribute value y2 (final position on the y-axis).
     * @param {Number} value Integer value
     * @returns {Line}
     */
    this.setY2 = function(value) {
        this.addAttr('y2', value);
        return this;
    };
};

/**
 * Create svg rect.
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
     * Set the value of the width attribute.
     * @param {Number} value Integer value
     * @returns {Rect}
     */
    this.setWidth = function(value) {
        this.addCss('width', value);
        return this;
    };

    /**
     * Set the value of the height attribute.
     * @param {Number} value Integer value
     * @returns {Rect}
     */
    this.setHeight = function(value) {
        this.addCss('height', value);
        return this;
    };

    /**
     * Set the value of position in the x-axis.
     * @param {Number} value Integer value
     * @returns {Rect}
     */
    this.setX = function(value) {
        this.addAttr('x', value);
        return this;
    };

    /**
     * Set the value of position in the y-axis.
     * @param {Number} value Integer value
     * @returns {Rect}
     */
    this.setY = function(value) {
        this.addAttr('y', value);
        return this;
    };

    /**
     * Set atribute rx value (round x-axis).
     * @param {Number} value Integer value
     * @returns {Rect}
     */
    this.setRx = function(value) {
        this.addAttr('rx', value);
        return this;
    };

    /**
     * Set atribute ry value (round y-axis).
     * @param {Number} value Integer value
     * @returns {Rect}
     */
    this.setRy = function(value) {
        this.addAttr('ry', value);
        return this;
    };
};

/**
 * Create svg Ellipse.
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
     * Set cx atribute (central position x-axis).
     * @param {Number} value Integer value
     * @returns {Ellipse}
     */
    this.setX = function(value) {
        this.addAttr('cx', value);
        return this;
    };

    /**
     * Set cy atribute (central position y-axis).
     * @param {Number} value Integer value
     * @returns {Ellipse}
     */
    this.setY = function(value) {
        this.addAttr('cy', value);
        return this;
    };

    /**
     * Set rx atribute (radius x-axis).
     * @param {Number} value Integer value
     * @returns {Ellipse}
     */
    this.setRaioX = function(value) {
        this.addAttr('rx', value);
        return this;
    };

    /**
     * Set ry atribute (radius y-axis).
     * @param {Number} value Integer value
     * @returns {Ellipse}
     */
    this.setRaioY = function(value) {
        this.addAttr('ry', value);
        return this;
    };
};


/**
 * Create svg circle.
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
     * Set cx atribute (central position x-axis).
     * @param {Number} value Integer value
     * @returns {Circle}
     */
    this.setX = function(value) {
        this.addAttr('cx', value);
        return this;
    };

    /**
     * Set cy atribute (central position y-axis).
     * @param {Number} value Integer value
     * @returns {Circle}
     */
    this.setY = function(value) {
        this.addAttr('cy', value);
        return this;
    };

    /**
     * Set r atribute (radius).
     * @param {Number} value Integer value
     * @returns {Circle}
     */
    this.setR = function(value) {
        this.addAttr('r', value);
        return this;
    };
};

/**
 * Create svg polygon.
 * @constructor
 * @extends XmlSvg
 * @param {Object} params {points: "200,10 250,190 160,210"}
 * @param {Object} style {stroke: '#000', 'stroke-width': 1, fill: #fff}
 * @returns {Polygon}
 */
function Polygon(params, style) {
    XmlSvg.call(this, 'polygon', params, style); // extend XmlSvg

    /**
     * Set points atribute (points x1,y1, x2,y2, ..., xN,yN).
     * @param {Number} value String value
     * @returns {Polygon}
     */
    this.setPoints = function(value) {
        this.addAttr('points', value);
        return this;
    };
};

/**
 * Create svg polyline.
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
 * Create svg "drawing freehand".
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
 * @param {Object} params {d: "M40,20 A30,30 0 1,1 70,70"}
 * @param {Object} style {stroke: '#000', 'stroke-width': 1, fill: 'none'}
 * @returns {Path}
 */
function Path(params, style) {
    XmlSvg.call(this, 'path', params, style); // extend XmlSvg

    /**
     * Set d atribute (figure settings).
     * @param {String} value Text value
     * @returns {Path}
     */
    this.setD = function(value) {
        this.addAttr('d', value);
        return this;
    };
};

/**
 * Create svg defs.
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
 * Create svg group.
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
 * Create svg text.
 * @constructor
 * @extends XmlSvg
 * @param {String} text Text to be drawn
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
     * Text to be drawn.
     * @var {String}
     */
    this.text = text;

    // @todo: sets...

    /**
     * Set text atribute.
     * @param {String} value Atribute vaue
     * @returns {Text}
     */
    this.setText = function(value) {
        this.text = value;
        return this;
    };
};

/**
 * Creates a title tag, similar to the title attribute of the html, in some svg element.
 * @constructor
 * @extends XmlSvg
 * @param {String} text Text for title
 * @param {Object} params {class: 'name-classe', id: 'id'"}
 * @param {Object} style {fill="#ff0000"}
 * @returns {Text}
 */
function Title(text, params, style) {
    // params and style are added to the element, but in the year 2018, it still
    // does not modify the rendered appearance, maybe in the future.
    XmlSvg.call(this, 'title', params, style); // extend XmlSvg

    /**
     * Text for using in title.
     * @var {String}
     */
    this.text = text;

    /**
     * Set text atribute.
     * @param {String} value Atribute value
     * @returns {Text}
     */
    this.setText = function(value) {
        this.text = value;
        return this;
    };
};

/**
 * Creates a radial color gradient effect on a defs tag.
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
 * Creates a linear color gradient effect on a defs tag
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
 * Creates a linear/radial color gradient effect on a defs tag.
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
 * Create svg filter.
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
 * Creates a gaussian effect for using on filter element.
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
 * Creates a shadow effect for using on filter element.
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
 * Creates a shadow effect for using on filter element. Using with feOffset.
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
 * Create svg ForeignObject for using external html inside svg.
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
     * Return generated ForeignObject. Encapsulated as jQuery element.
     * @returns {jQuery}
     */
    this.generate = function() {
        return $tag;
    };
};
