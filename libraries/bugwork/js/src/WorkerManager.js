/*
 * Copyright (c) 2015 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugwork.WorkerManager')
//@Autoload

//@Require('Bug')
//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('Obj')
//@Require('Set')
//@Require('TypeUtil')
//@Require('bugioc.ArgTag')
//@Require('bugioc.IInitializingModule')
//@Require('bugioc.ModuleTag')
//@Require('bugmeta.BugMeta')
//@Require('bugwork.WorkerMaster')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug                     = bugpack.require('Bug');
    var Class                   = bugpack.require('Class');
    var Exception               = bugpack.require('Exception');
    var Flows                   = bugpack.require('Flows');
    var Obj                     = bugpack.require('Obj');
    var Set                     = bugpack.require('Set');
    var TypeUtil                = bugpack.require('TypeUtil');
    var ArgTag                  = bugpack.require('bugioc.ArgTag');
    var IInitializingModule     = bugpack.require('bugioc.IInitializingModule');
    var ModuleTag               = bugpack.require('bugioc.ModuleTag');
    var BugMeta                 = bugpack.require('bugmeta.BugMeta');
    var WorkerMaster            = bugpack.require('bugwork.WorkerMaster');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var arg                     = ArgTag.arg;
    var bugmeta                 = BugMeta.context();
    var module                  = ModuleTag.module;
    var $iterableParallel       = Flows.$iterableParallel;
    var $task                   = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     * @implements {IInitializingModule}
     */
    var WorkerManager = Class.extend(Obj, {

        _name: "bugwork.WorkerManager",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {WorkerRegistry} workerRegistry
         * @param {WorkerContextFactory} workerContextFactory
         */
        _constructor: function(workerRegistry, workerContextFactory) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Set.<WorkerMaster>}
             */
            this.workerMasterSet                = new Set();

            /**
             * @private
             * @type {WorkerContextFactory}
             */
            this.workerContextFactory           = workerContextFactory;

            /**
             * @private
             * @type {WorkerRegistry}
             */
            this.workerRegistry                 = workerRegistry;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {WorkerContextFactory}
         */
        getWorkerContextFactory: function() {
            return this.workerContextFactory;
        },


        //-------------------------------------------------------------------------------
        // IInitializingModule Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        deinitializeModule: function(callback) {
            this.destroyAllWorkers(callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        initializeModule: function(callback) {
            callback();
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} workerName
         * @param {{
         *      maxConcurrency: number,
         *      debug: boolean=
         * }} options
         * @param {function(Throwable=)} callback
         */
        createWorker: function(workerName, options, callback) {
            var debugBreak      = (process.execArgv.indexOf("--debug-brk") >= 0);
            var debug           = (process.execArgv.indexOf("--debug") >= 0) || debugBreak;
            var workerMaster    = this.factoryWorkerMaster(workerName, options.maxConcurrency, debug, debugBreak);
            this.workerMasterSet.add(workerMaster);

            $task(function(flow) {
                workerMaster.createAndStartWorkers(function(throwable) {
                    flow.complete(throwable);
                });
            }).execute(callback);
        },

        /**
         * @param {WorkerMaster} workerMaster
         * @param {function(Throwable=)} callback
         */
        destroyWorker: function(workerMaster, callback) {
            if (this.workerMasterSet.contains(workerMaster)) {
                this.workerMasterSet.remove(workerMaster);
                $task(function(flow) {
                    workerMaster.stopAndDestroyWorkers(function(throwable) {
                        flow.complete(throwable);
                    });
                }).execute(callback);
            } else {
                callback();
            }
        },

        /**
         * @param {function(Throwable=)} callback
         */
        destroyAllWorkers: function(callback) {
            var _this = this;
            $iterableParallel(this.workerMasterSet.clone(), function(flow, workerMaster) {
                _this.destroyWorker(workerMaster, function(throwable) {
                    flow.complete(throwable);
                });
            }).execute(callback);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {string} workerName
         * @param {number} maxConcurrency
         * @param {boolean} debug
         * @param {boolean} debugBreak
         * @return {WorkerMaster}
         */
        factoryWorkerMaster: function(workerName, maxConcurrency, debug, debugBreak) {
            return new WorkerMaster(workerName, maxConcurrency, debug, debugBreak, this.workerContextFactory);
        }
    });


    //-------------------------------------------------------------------------------
    // Implement Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(WorkerManager, IInitializingModule);


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(WorkerManager).with(
        module("workerManager")
            .args([
                arg().ref("workerRegistry"),
                arg().ref("workerContextFactory")
            ])
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerManager', WorkerManager);
});
