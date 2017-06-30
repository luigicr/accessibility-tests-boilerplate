/* globals _*/
(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function (jQuery) {
            return (root.M = factory(jQuery));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        root.M = factory(root.jQuery);
    }
}(this, function ($) {
    'use strict';

    var ATTRIBUTE_QUERY = '[data-widget]',
        widgets = {},
        services = {},
        servicesCache = {},
        loader,
        M;

    function getDependencies(id) {
        var deps = null,
            i;

        function initService(name) {
            var service;

            if (services[name]) {
                service = services[name]();
                servicesCache[name] = service;
            }

            return service;
        }

        function get(name) {
            return widgets[name] || servicesCache[name] || initService(name) || null;
        }

        if ($.isArray(id)) {
            deps = [];
            for (i = 0; i < id.length; i++) {
                deps[i] = get(id[i]);
            }
        } else {
            deps = get(id);
        }

        return deps;
    }

    function fetchDependencies(id, callback) {
        var list = !$.isArray(id) ? [id] : id,
            length = list.length,
            count = 0;

        function next() {
            count++;

            if (count === length) {
                callback();
            }
        }

        if (list.length > 0 && loader) {
            $.each(list, function (index, component) {
                if (getDependencies(component)) {
                    next();
                } else {
                    loader(component, next);
                }
            });
        } else {
            callback();
        }
    }

    function destroyInstance(el) {
        var instance = M.getInstance(el);

        if (instance && $.isFunction(instance.onDestroy)) {
            instance.onDestroy();
        }
    }

    M = {
        init: function init(element) {
            var me = this;

            $(element).find(ATTRIBUTE_QUERY).each(function (i, el) {
                me.instantiate(el);
            });
        },

        instantiate: function instantiate(element, widget) {
            var me = this,
                el = $(element),
                type = (widget && widget !== '') ? widget : el.data('widget');

            if (type) {
                me.get(type, function (config) {
                    var instance = {},
                        parameters = [el],
                        tmplElement;

                    function run() {
                        el.data('_M', instance);
                        config.handler.apply(instance, parameters);
                    }

                    if (config) {
                        if (config.template && window._) {
                            if (window._) {
                                tmplElement = element.find(config.template);

                                if (tmplElement.length === 0) {
                                    tmplElement = $(tmplElement);
                                }

                                parameters.push(_.template(tmplElement.html()));
                            } else {
                                parameters.push(function () {
                                    return '';
                                });
                                console.error('M: underscore.js not found, can\'t compile template for "' +
                                              type + '" widget...');
                            }
                        }

                        if ($.isArray(config.dependencies)) {
                            me.get(config.dependencies, function () {
                                parameters = parameters.concat(Array.prototype.slice.call(arguments, 0));
                                run();
                            });
                        } else {
                            run();
                        }
                    } else {
                        console.error('M: widget "' + type + '" not found...');
                    }
                });
            }
        },

        widget: function widget(id, handler, template, dependencies) {

            if (widgets[id]) {
                console.warn('M: overriding ' + id + ' widget...');
            }

            widgets[id] = {
                handler: handler,
                template: template,
                dependencies: dependencies
            };
        },

        service: function service(id, definition) {

            if ($.isFunction(definition)) {

                if (widgets[id]) {
                    console.warn('M: overriding ' + id + ' service...');
                }

                servicesCache[id] = undefined;
                services[id] = definition;
            } else {
                console.warn('M: error registering ' + id + ' service, definition parameter must be a function...');
            }
        },

        get: function get(id, callback) {
            var result;

            if ($.isFunction(callback)) {
                fetchDependencies(id, function () {
                    var dependencies = $.isArray(id) ? id : [id];

                    callback.apply(null, getDependencies(dependencies));
                });
            } else {
                result = getDependencies(id);
            }

            return result;
        },

        getInstance: function getInstance(element) {
            return $(element).data('_M');
        },

        destroy: function destroy(element) {
            var el = $(element);

            el.find(ATTRIBUTE_QUERY).each(function (index, obj) {
                destroyInstance($(obj));
            });

            if (el.is(ATTRIBUTE_QUERY)) {
                destroyInstance(el);
            }
        }
    };

    return M;
}));
