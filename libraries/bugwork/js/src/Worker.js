/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugwork.Worker')

//@Require('Bug')
//@Require('Class')
//@Require('Flows')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug         = bugpack.require('Bug');
    var Class       = bugpack.require('Class');
    var Flows       = bugpack.require('Flows');
    var Obj         = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series     = Flows.$series;
    var $task       = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var Worker = Class.extend(Obj, {

        _name: "bugwork.Worker",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {boolean}
             */
            this.started = false;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        start: function(callback) {
            var _this = this;
            $series([
                $task(function(flow) {
                    _this.configure(function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.initialize(function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ]).execute(callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        stop: function(callback) {
            var _this = this;
            $series([
                $task(function(flow) {
                    _this.deinitialize(function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ]).execute(callback);
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {function(Throwable=)} callback
         */
        configure: function(callback) {
            callback();
        },

        /**
         * @protected
         * @param {function(Throwable=)} callback
         */
        deinitialize: function(callback) {
            callback();
        },

        /**
         * @protected
         * @param {function(Throwable=)} callback
         */
        initialize: function(callback) {
            callback();
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.Worker', Worker);
});
