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

//@Export('bugwork.WorkerContext')

//@Require('Bug')
//@Require('Class')
//@Require('CommandProcessor')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Exception')
//@Require('StateMachine')
//@Require('bugwork.WorkerDefines')
//@Require('bugwork.WorkerProcess')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug                 = bugpack.require('Bug');
    var Class               = bugpack.require('Class');
    var CommandProcessor    = bugpack.require('CommandProcessor');
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Exception           = bugpack.require('Exception');
    var StateMachine        = bugpack.require('StateMachine');
    var WorkerDefines       = bugpack.require('bugwork.WorkerDefines');
    var WorkerProcess       = bugpack.require('bugwork.WorkerProcess');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var WorkerContext = Class.extend(EventDispatcher, {

        _name: "bugwork.WorkerContext",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {string} workerName
         * @param {processConfig} processConfig
         * @param {Logger} logger
         * @param {WorkerCommandFactory} workerCommandFactory
         */
        _constructor: function(workerName, processConfig, logger, workerCommandFactory) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {CommandProcessor}
             */
            this.commandProcessor       = new CommandProcessor();

            /**
             * @private
             * @type {WorkerDefines.State}
             */
            this.desiredWorkerState     = WorkerDefines.State.NOT_READY;

            /**
             * @private
             * @type {Logger}
             */
            this.logger                 = logger;

            /**
             * @private
             * @type {ProcessConfig}
             */
            this.processConfig          = processConfig;

            /**
             * @private
             * @type {string}
             */
            this.workerName             = workerName;

            /**
             * @private
             * @type {WorkerProcess}
             */
            this.workerProcess          = null;

            /**
             * @private
             * @type {WorkerCommandFactory}
             */
            this.workerCommandFactory   = workerCommandFactory;

            /**
             * @private
             * @type {StateMachine}
             */
            this.workerStateMachine     = new StateMachine({
                initialState: WorkerDefines.State.NOT_READY,
                states: [
                    WorkerDefines.State.NOT_READY,
                    WorkerDefines.State.READY,
                    WorkerDefines.State.RUNNING
                ]
            });


            //-------------------------------------------------------------------------------
            // Setup
            //-------------------------------------------------------------------------------

            this.workerStateMachine.setParentPropagator(this);
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {ProcessConfig}
         */
        getProcessConfig: function() {
            return this.processConfig;
        },

        /**
         * @return {string}
         */
        getWorkerName: function() {
            return this.workerName;
        },

        /**
         * @return {WorkerProcess}
         */
        getWorkerProcess: function() {
            return this.workerProcess;
        },

        /**
         * @return {(WorkerDefines.State|string)}
         */
        getWorkerState: function() {
            return this.workerStateMachine.getCurrentState();
        },


        //-------------------------------------------------------------------------------
        // Convenience Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        hasWorkerProcess: function() {
            return !!this.workerProcess;
        },

        /**
         * @return {boolean}
         */
        isCreated: function() {
            return this.isReady() || this.isRunning();
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
        isReady: function() {
            return this.getWorkerState() === WorkerDefines.State.READY;
        },

        /**
         * @return {boolean}
         */
        isRunning: function() {
            return this.getWorkerState() === WorkerDefines.State.RUNNING;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        createAndStartWorker: function(callback) {
            var commands = [
                this.workerCommandFactory.factoryCreateWorkerProcessCommand(this),
                this.workerCommandFactory.factoryStartWorkerCommand(this)
            ];
            this.commandProcessor.processCommands(commands, callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        stopAndDestroyWorker: function(callback) {
            var commands = [
                this.workerCommandFactory.factoryStopWorkerCommand(this),
                this.workerCommandFactory.factoryDestroyWorkerProcessCommand(this)
            ];
            this.commandProcessor.processCommands(commands, callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        recreateWorker: function(callback) {
            var commands = [
                this.workerCommandFactory.factoryStopWorkerCommand(this),
                this.workerCommandFactory.factoryDestroyWorkerProcessCommand(this),
                this.workerCommandFactory.factoryCreateWorkerProcessCommand(this)
            ];
            this.commandProcessor.processCommands(commands, callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        restartWorker: function(callback) {
            var commands = [
                this.workerCommandFactory.factoryStopWorkerCommand(this),
                this.workerCommandFactory.factoryDestroyWorkerProcessCommand(this),
                this.workerCommandFactory.factoryCreateWorkerProcessCommand(this),
                this.workerCommandFactory.factoryStartWorkerCommand(this)
            ];
            this.commandProcessor.processCommands(commands, callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        startWorker: function(callback) {
            var commands = [
                this.workerCommandFactory.factoryStartWorkerCommand(this)
            ];
            this.commandProcessor.processCommands(commands, callback);
        },

        /**
         * @param {function(Throwable=)} callback
         */
        stopWorker: function(callback) {
            var commands = [
                this.workerCommandFactory.factoryStopWorkerCommand(this)
            ];
            this.commandProcessor.processCommands(commands, callback);
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        clearWorkerProcess: function() {
            if (this.workerProcess) {
                this.cleanupWorkerProcess();
            }
        },

        /**
         * @protected
         * @param {WorkerProcess} workerProcess
         */
        updateWorkerProcess: function(workerProcess) {
            if (this.workerProcess) {
                this.cleanupWorkerProcess();
            }
            this.workerProcess = workerProcess;
            this.addProcessListeners();
        },

        /**
         * @protected
         * @param {WorkerDefines.State} workerState
         */
        updateWorkerState: function(workerState) {
            this.desiredWorkerState = workerState;
            this.workerStateMachine.changeState(workerState);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        alertRestartWorker: function() {
            this.logger.warn("Worker restarted - workerName:", this.workerName);
            this.dispatchAlertRestarted();
        },

        /**
         * @private
         * @param {Throwable} throwable
         */
        alertRestartWorkerWithThrowable: function(throwable) {
            this.logger.error(throwable);
            this.alertRestartWorker();
        },

        /**
         * @private
         */
        addProcessListeners: function() {
            this.workerProcess.addEventListener(WorkerProcess.EventTypes.CLOSED, this.hearProcessClosed, this);
            this.workerProcess.addEventListener(WorkerProcess.EventTypes.READY, this.hearProcessReady, this);
            this.workerProcess.addEventListener(WorkerProcess.EventTypes.THROWABLE, this.hearProcessThrowable, this);
        },

        /**
         * @private
         */
        checkState: function() {
            var _this = this;
            if (this.desiredWorkerState === WorkerDefines.State.READY) {
                this.alertRestartWorker();
                this.recreateWorker(function(throwable) {
                    if (throwable) {
                        _this.dispatchThrowable(throwable);
                    }
                });
            } else if (this.isRunning()) {
                this.alertRestartWorker();
                this.restartWorker(function(throwable) {
                    if (throwable) {
                        _this.dispatchThrowable(throwable);
                    }
                });
            }
        },

        /**
         * @private
         * @param {Throwable} throwable
         */
        checkStateAfterThrowable: function(throwable) {
            this.alertRestartWorkerWithThrowable(throwable);
            this.checkState();
        },

        /**
         * @private
         */
        cleanupWorkerProcess: function() {
            this.removeProcessListeners();
            this.workerProcess = null;
            this.updateWorkerState(WorkerDefines.State.NOT_READY);
        },

        /**
         * @private
         */
        dispatchAlertRestarted: function() {
            this.dispatchEvent(new Event(WorkerContext.EventTypes.ALERT_RESTARTED));
        },

        /**
         * @private
         * @param {Throwable} throwable
         */
        dispatchThrowable: function(throwable) {
            this.dispatchEvent(new Event(WorkerContext.EventTypes.THROWABLE, {
                throwable: throwable
            }));
        },

        /**
         * @private
         */
        removeProcessListeners: function() {
            this.workerProcess.removeEventListener(WorkerProcess.EventTypes.CLOSED, this.hearProcessClosed, this);
            this.workerProcess.removeEventListener(WorkerProcess.EventTypes.READY, this.hearProcessReady, this);
            this.workerProcess.removeEventListener(WorkerProcess.EventTypes.THROWABLE, this.hearProcessThrowable, this);
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearProcessClosed: function(event) {
            this.cleanupWorkerProcess();
            this.checkState();
        },

        /**
         * @private
         * @param {Event} event
         */
        hearProcessThrowable: function(event) {
            this.checkStateAfterThrowable(event.getData().throwable);
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    WorkerContext.EventTypes = {
        ALERT_RESTARTED: "WorkerContext:AlertRestarted",
        THROWABLE: "WorkerContext:Throwable"
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerContext', WorkerContext);
});
