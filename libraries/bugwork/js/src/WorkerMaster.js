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

//@Export('bugwork.WorkerMaster')

//@Require('Bug')
//@Require('Class')
//@Require('Flows')
//@Require('Obj')
//@Require('Set')
//@Require('bugwork.ProcessConfig')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug                 = bugpack.require('Bug');
    var Class               = bugpack.require('Class');
    var Flows               = bugpack.require('Flows');
    var Obj                 = bugpack.require('Obj');
    var Set                 = bugpack.require('Set');
    var ProcessConfig       = bugpack.require('bugwork.ProcessConfig');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $iterableParallel   = Flows.$iterableParallel;
    var $task               = Flows.$task;
    var $whileParallel      = Flows.$whileParallel;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var WorkerMaster = Class.extend(Obj, {

        _name: "bugwork.WorkerMaster",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {string} workerName
         * @param {number} maxConcurrency
         * @param {boolean} debug
         * @param {boolean} debugBreak
         * @param {WorkerContextFactory} workerContextFactory
         */
        _constructor: function(workerName, maxConcurrency, debug, debugBreak, workerContextFactory) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {boolean}
             */
            this.debug                      = debug;

            /**
             * @private
             * @type {boolean}
             */
            this.debugBreak                 = debugBreak;

            /**
             * @private
             * @type {number}
             */
            this.maxConcurrency             = maxConcurrency;

            /**
             * @private
             * @type {WorkerContextFactory}
             */
            this.workerContextFactory       = workerContextFactory;

            /**
             * @private
             * @type {string}
             */
            this.workerName                 = workerName;

            /**
             * @private
             * @type {Set.<WorkerContext>}
             */
            this.workerContextSet           = new Set();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Set.<WorkerContext>}
         */
        getWorkerContextSet: function() {
            return this.workerContextSet;
        },

        /**
         * @return {boolean}
         */
        isDebug: function() {
            return this.debug;
        },

        /**
         * @return {boolean}
         */
        isDebugBreak: function() {
            return this.debugBreak;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        createAndStartWorkers: function(callback) {
            var _this   = this;
            var i       = 0;
            $whileParallel(function(flow) {
                    flow.assert(i < _this.maxConcurrency);
                },
                $task(function(flow) {
                    i++;
                    _this.createAndStartWorker(function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ).execute(callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        startWorkers: function(callback) {
            var _this = this;
            $iterableParallel(this.workerContextSet, function(flow, workerContext) {
                _this.startWorker(workerContext, function(throwable) {
                    flow.complete(throwable);
                });
            }).execute(callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        stopAndDestroyWorkers: function(callback) {
            var _this = this;
            $iterableParallel(this.workerContextSet, function(flow, workerContext) {
                _this.stopAndDestroyWorker(workerContext, function(throwable) {
                    flow.complete(throwable);
                });
            }).execute(callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        stopWorkers: function(callback) {
            var _this = this;
            $iterableParallel(this.workerContextSet, function(flow, workerContext) {
                _this.stopWorker(workerContext, function(throwable) {
                    flow.complete(throwable);
                });
            }).execute(callback);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {WorkerContext} workerContext
         */
        addWorkerContext: function(workerContext) {
            this.workerContextSet.add(workerContext);
        },

        /**
         * @private
         * @return {ProcessConfig}
         */
        buildProcessConfig: function() {
            return new ProcessConfig({
                debug: this.isDebug(),
                debugBreak: this.isDebugBreak(),
                debugPort: WorkerMaster.lastDebugPort
            });
        },


        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        createAndStartWorker: function(callback) {
            var _this = this;
            $task(function(flow) {
                WorkerMaster.lastDebugPort++;
                var workerContext = _this.workerContextFactory.factoryWorkerContext(_this.workerName, _this.buildProcessConfig());
                workerContext.createAndStartWorker(function(throwable) {
                    if (!throwable) {
                        _this.addWorkerContext(workerContext);
                    }
                    flow.complete(throwable);
                });
            }).execute(callback);
        },

        /**
         * @private
         * @param {WorkerContext} workerContext
         */
        removeWorkerContext: function(workerContext) {
            this.workerContextSet.remove(workerContext);
        },

        /**
         * @private
         * @param {WorkerContext} workerContext
         * @param {function(Throwable=)} callback
         */
        startWorker: function(workerContext, callback) {
            $task(function(flow) {
                workerContext.startWorker(function(throwable) {
                    flow.complete(throwable);
                });
            }).execute(callback);
        },

        /**
         * @private
         * @param {WorkerContext} workerContext
         * @param {function(Throwable=)} callback
         */
        stopAndDestroyWorker: function(workerContext, callback) {
            var _this = this;
            $task(function(flow) {
                workerContext.stopAndDestroyWorker(function(throwable) {
                    if (!throwable) {
                        _this.removeWorkerContext(workerContext);
                    }
                    flow.complete(throwable);
                });
            }).execute(callback);
        },

        /**
         * @private
         * @param {WorkerContext} workerContext
         * @param {function(Throwable=)} callback
         */
        stopWorker: function(workerContext, callback) {
            $task(function(flow) {
                workerContext.stopWorker(function(throwable) {
                    flow.complete(throwable);
                });
            }).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @type {number}
     */
    WorkerMaster.lastDebugPort = 5858;


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerMaster', WorkerMaster);
});
