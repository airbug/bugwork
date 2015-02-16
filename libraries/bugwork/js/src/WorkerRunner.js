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

//@Export('bugwork.WorkerRunner')
//@Autoload

//@Require('Bug')
//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('bugioc.ArgTag')
//@Require('bugioc.IInitializingModule')
//@Require('bugioc.ModuleTag')
//@Require('bugmeta.BugMeta')
//@Require('bugwork.WorkerDefines')


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
    var TypeUtil                = bugpack.require('TypeUtil');
    var ArgTag                  = bugpack.require('bugioc.ArgTag');
    var IInitializingModule     = bugpack.require('bugioc.IInitializingModule');
    var ModuleTag               = bugpack.require('bugioc.ModuleTag');
    var BugMeta                 = bugpack.require('bugmeta.BugMeta');
    var WorkerDefines           = bugpack.require('bugwork.WorkerDefines');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var arg                     = ArgTag.arg;
    var bugmeta                 = BugMeta.context();
    var module                  = ModuleTag.module;
    var $task                   = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     * @implements {IInitializingModule}
     */
    var WorkerRunner = Class.extend(Obj, {

        _name: "bugwork.WorkerRunner",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {WorkerRegistry} workerRegistry
         * @param {Marshaller} marshaller
         */
        _constructor: function(workerRegistry, marshaller) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Marshaller}
             */
            this.marshaller         = marshaller;

            /**
             * @private
             * @type {string}
             */
            this.state              = WorkerRunner.States.STOPPED;

            /**
             * @private
             * @type {Worker}
             */
            this.worker             = null;

            /**
             * @private
             * @type {WorkerRegistry}
             */
            this.workerRegistry     = workerRegistry;

            var _this = this;
            this.hearProcessMessage = function(message) {
                _this.handleProcessMessage(message);
            };
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {string}
         */
        getState: function() {
            return this.state;
        },

        /**
         * @return {boolean}
         */
        isStarted: function() {
            return this.state == WorkerRunner.States.STARTED;
        },

        /**
         * @return {boolean}
         */
        isStarting: function() {
            return this.state === WorkerRunner.States.STARTING;
        },

        /**
         * @return {boolean}
         */
        isStopped: function() {
            return this.state === WorkerRunner.States.STOPPED;
        },

        /**
         * @return {boolean}
         */
        isStopping: function() {
            return this.state === WorkerRunner.States.STOPPING;
        },


        //-------------------------------------------------------------------------------
        // IInitializingModule Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        deinitializeModule: function(callback) {
            process.removeListener('message', this.hearProcessMessage);
            this.stopWorker(function(throwable) {
                callback(throwable);
            });
        },

        /**
         * @param {function(Throwable=)} callback
         */
        initializeModule: function(callback) {
            process.on('message', this.hearProcessMessage);
            callback();
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {string} workerName
         */
        generateWorker: function(workerName) {
            var workerRegistryEntry = this.workerRegistry.getRegistryEntryForName(workerName);
            if (workerRegistryEntry) {
                var workerClass         = workerRegistryEntry.getWorkerClass();
                var workerConstructor   = workerClass.getConstructor();
                this.worker = new workerConstructor();
            } else {
                throw new Exception("IllegalState", {}, "no registry entry by the name '" + workerName + "'");
            }
        },

        /**
         * @private
         * @param {*} message
         */
        handleProcessMessage: function(message) {
            if (TypeUtil.isObject(message)) {
                if (message.messageData) {
                    message.messageData = this.marshaller.unmarshalData(message.messageData);
                }
                if (message.messageType === WorkerDefines.MessageTypes.START_WORKER) {
                    this.processStartWorkerMessage(message);
                } else if (message.messageType === WorkerDefines.MessageTypes.STOP_WORKER) {
                    this.processStopWorkerMessage(message);
                }
            }
        },

        /**
         * @private
         * @param {Object} message
         */
        processStartWorkerMessage: function(message) {
            var _this = this;
            $task(function(flow) {
                if (!_this.isStarted()) {
                    var data = message.messageData;
                    _this.generateWorker(data.workerName);
                    _this.startWorker(function(throwable) {
                        flow.complete(throwable);
                    });
                } else {
                    flow.error(new Exception("IllegalState", {}, "Worker already started"));
                }
            }).execute(function(throwable) {
                if (throwable) {
                    //TEST
                    console.log("Throwable on processStartWorkerMessage - throwable:", throwable);

                    _this.sendProcessMessage(WorkerDefines.MessageTypes.WORKER_THROWABLE, {
                        throwable: throwable
                    });
                }
            });
        },

        /**
         * @private
         * @param {Object} message
         */
        processStopWorkerMessage: function(message) {
            var _this = this;
            $task(function(flow) {
                if (_this.isStarted()) {
                    _this.stopWorker(function(throwable) {
                        flow.complete(throwable);
                    });
                } else {
                    flow.error(new Exception("IllegalState", {}, "Worker already stopped"));
                }
            }).execute(function(throwable) {
                if (throwable) {
                    _this.sendProcessMessage(WorkerDefines.MessageTypes.WORKER_THROWABLE, {
                        throwable: throwable
                    });
                }
            });
        },

        /**
         * @private
         * @param {string} messageType
         * @param {*=} messageData
         */
        sendProcessMessage: function(messageType, messageData) {
            var message = {
                messageType: messageType,
                messageData: this.marshaller.marshalData(messageData)
            };
            process.send(message);
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        startWorker: function(callback) {
            var _this = this;
            if (this.isStopped()) {
                this.state = WorkerRunner.States.STARTING;
                this.worker.start(function(throwable) {
                    if (!throwable) {
                        _this.state = WorkerRunner.States.STARTED;
                        _this.sendProcessMessage(WorkerDefines.MessageTypes.WORKER_STARTED);
                    }
                    callback(throwable);
                });
            } else {
                callback();
            }
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        stopWorker: function(callback) {
            var _this = this;
            if (this.isStarted()) {
                this.state = WorkerRunner.States.STOPPING;
                this.worker.stop(function(throwable) {
                    if (!throwable) {
                        _this.state = WorkerRunner.States.STOPPED;
                        _this.sendProcessMessage(WorkerDefines.MessageTypes.WORKER_STOPPED);
                    }
                    callback(throwable);
                });
            } else {
                callback();
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    WorkerRunner.States = {
        STARTED: "State:Started",
        STARTING: "State:Starting",
        STOPPED: "State:Stopped",
        STOPPING: "State:Stopping"
    };


    //-------------------------------------------------------------------------------
    // Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(WorkerRunner, IInitializingModule);


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(WorkerRunner).with(
        module("workerRunner")
            .args([
                arg().ref("workerRegistry"),
                arg().ref("marshaller")
            ])
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerRunner', WorkerRunner);
});
