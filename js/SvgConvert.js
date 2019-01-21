/* global document, $, self */
/* jshint strict: global */
'use strict';

/**
 * Class that controls SVG conversion capabilities to other formats.
 * @requires jQuery Lib https://jquery.com/
 * @example new SvgConvert('#svgElement').toImage('#selectorToDraw');
 * @example new SvgConvert('#svgElement').toCanvas('#selectorToDraw');
 * @example new SvgConvert('#svgElement').toDownloadImage('image_svg.png');
 * @param {mixed} svg Element or selector jQuery
 * @returns {SvgConvert}
 */
function SvgConvert(svg)
{
    /**
     * Pointer.
     * @type SvgConvert
     */
    var that = this;

    /**
     * SVG clone encapsulated with jQuery.
     * @private
     * @type jQuery
     */
    var $clone = $(svg).clone(false).attr({
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        version: '1.1'
    });

    /**
     * Places all external CSS properties directly into the element, such as inline CSS.
     * @private
     * @returns {SvgConvert}
     */
    var cssToInline = function() {
        var rules,
            params,
            paramValue,
            $element;

        $(document.styleSheets).each(function() {
            rules = (this.cssRules || this.rules || []);
            $(rules).each(function() {
                try {
                    $element = $clone.find(this.selectorText);

                    if ($clone.is(this.selectorText)) {
                        $element.add($clone);
                    }

                    if (!$element.length) {
                        return; // continue $(rules).each
                    }

                    params = {};
                    $(this.style.cssText.split(';')).each(function() {
                        if ($.trim(this).length) {
                            paramValue = this.split(':');
                            params[$.trim(paramValue[0]).toString()] = $.trim(paramValue[1]).toString();
                        }
                    });

                    $element.css(params);
                } catch (ex) {
                    // nothing
                }
            });
        });

        return this;
    };

    /**
     * Returns a literal object, containing a canvas element and an image element,
     * encapsulated with jQuery.
     * @private
     * @param {string} type Image type, default 'image/png'
     * @returns {Object} Object {canvas: $canvas, image: $image}
     */
    var toCanvasAndImage = function(type) {
        cssToInline();
        var params = {
                width: $clone.attr('width'),
                height: $clone.attr('height')
            },
            canvas = $('<canvas>').attr(params).get(0),
            ctx = canvas.getContext('2d'),
            url = (self.URL || self.webkitURL || self),
            img = new Image(),
            $img = $('<img>'),
            dataUrl,
            svg = new Blob([that.toString()], {type: 'image/svg+xml;charset=utf-8'});

        img.src = url.createObjectURL(svg);
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            dataUrl = canvas.toDataURL((type || 'image/png'));
            $img.attr('src', dataUrl);
            url.revokeObjectURL(dataUrl);
        };

        return {
            canvas: $(canvas),
            image: $img
        };
    };

    /**
     * Returns an SVG object in the form of a string.
     * @returns {String}
     */
    this.toString = function() {
        return $.trim($('<div>').append($clone).html());
    };

    /**
     * Generates an image from SVG.
     * @param {mixed} selectorToDraw Selector jQuery
     * @param {string} type Image type optional, default 'image/png'
     * @param {string} msgDontSuport Message optional if don't have suport or error
     * @returns {jQuery} Image element generated
     */
    this.toImage = function(selectorToDraw, type, msgDontSuport) {
        try {
            var canvasAndImage = toCanvasAndImage(type);
            $(selectorToDraw).append(canvasAndImage.image);
            return canvasAndImage.image;
        } catch (ex) {
            if (msgDontSuport) {
                $(selectorToDraw).append($('<span>').html(msgDontSuport));
            }

            return $('<img>');
        }
    };

    /**
     * Generates a canvas element from the SVG.
     * @param {mixed} selectorToDraw Selector jQuery
     * @param {string} type Image type optional, default 'image/png'
     * @param {string} msgDontSuport Message optional if don't have suport or error
     * @returns {jQuery} Canvas element generated
     */
    this.toCanvas = function(selectorToDraw, type, msgDontSuport) {
        try {
            var canvasAndImage = toCanvasAndImage(type);
            $(selectorToDraw).append(canvasAndImage.canvas);
            return canvasAndImage.canvas;
        } catch (ex) {
            if (msgDontSuport) {
                $(selectorToDraw).append($('<span>').html(msgDontSuport));
            }

            return $('<canvas>');
        }
    };

    /**
     * Generate and download an SVG image.
     * @param {String} fileName Name of file displayed in download
     * @param {string} type Image type, default 'image/png'
     * @returns {undefined}
     */
    this.toDownloadImage = function(fileName, type) {
        try {
            var $img = toCanvasAndImage(type).image,
                params;

            $img.on('load', function() {
                params = {
                    download: (fileName || 'download.png'),
                    href: $img.attr('src'),
                    target: '_blank'
                };

                $('<a>').attr(params).get(0).click();
            });
        } catch (ex) {
            // nada
        }
    };
}