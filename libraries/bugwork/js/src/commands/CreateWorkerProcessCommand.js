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

//@Export('bugwork.CreateWorkerProcessCommand')

//@Require('Bug')
//@Require('Class')
//@Require('bugwork.WorkerCommand')
//@Require('bugwork.WorkerDefines')
//@Require('bugwork.WorkerProcess')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug             = bugpack.require('Bug');
    var Class           = bugpack.require('Class');
    var WorkerCommand   = bugpack.require('bugwork.WorkerCommand');
    var WorkerDefines   = bugpack.require('bugwork.WorkerDefines');
    var WorkerProcess   = bugpack.require('bugwork.WorkerProcess');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {WorkerCommand}
     */
    var CreateWorkerProcessCommand = Class.extend(WorkerCommand, {

        _name: "bugwork.CreateWorkerProcessCommand",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {WorkerContext} workerContext
         * @param {WorkerProcessFactory} workerProcessFactory
         */
        _constructor: function(workerContext, workerProcessFactory) {

            this._super(workerContext);


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {function(Throwable=)}
             */
            this.callback                   = null;

            /**
             * @private
             * @type {boolean}
             */
            this.completed                  = false;

            /**
             * @private
             * @type {WorkerProcessFactory}
             */
            this.workerProcessFactory       = workerProcessFactory;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {function(Throwable, WorkerProcess=)}
         */
        getCallback: function() {
            return this.callback;
        },

        /**
         * @return {boolean}
         */
        getCompleted: function() {
            return this.completed;
        },

        /**
         * @return {WorkerProcessFactory}
         */
        getWorkerProcessFactory: function() {
            return this.workerProcessFactory;
        },


        //-------------------------------------------------------------------------------
        // Command Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {function(Throwable, WorkerProcess=)} callback
         */
        executeCommand: function(callback) {
            this.callback       = callback;
            if (!this.getWorkerContext().hasWorkerProcess()) {
                this.createWorkerProcess();
            } else {
                this.complete();
            }
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {WorkerProcess} workerProcess
         */
        addProcessListeners: function(workerProcess) {
            workerProcess.addEventListener(WorkerProcess.EventTypes.CLOSED, this.hearProcessClosed, this);
            workerProcess.addEventListener(WorkerProcess.EventTypes.READY, this.hearProcessReady, this);
            workerProcess.addEventListener(WorkerProcess.EventTypes.THROWABLE, this.hearProcessThrowable, this);
        },

        /**
         * @private
         * @param {Throwable=} throwable
         */
        complete: function(throwable) {
            if (!this.completed) {
                this.completed = true;
                this.removeProcessListeners(this.getWorkerContext().getWorkerProcess());
                this.workerContext = null;
                if (!throwable) {
                    this.callback();
                } else {
                    this.callback(throwable);
                }
            } else {
                throw new Bug("IllegalState", {}, "Creator already complete");
            }
        },

        /**
         * @private
         */
        createWorkerProcess: function() {
            var workerProcess  = this.workerProcessFactory.factoryWorkerProcess(this.getWorkerContext().getProcessConfig());
            this.getWorkerContext().updateWorkerProcess(workerProcess);
            this.addProcessListeners(workerProcess);
            workerProcess.createProcess();
        },

        /**
         * @private
         * @param {WorkerProcess} workerProcess
         */
        removeProcessListeners: function(workerProcess) {
            workerProcess.removeEventListener(WorkerProcess.EventTypes.CLOSED, this.hearProcessClosed, this);
            workerProcess.removeEventListener(WorkerProcess.EventTypes.READY, this.hearProcessReady, this);
            workerProcess.removeEventListener(WorkerProcess.EventTypes.THROWABLE, this.hearProcessThrowable, this);
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearProcessClosed: function(event) {
            this.complete(new Bug("Worker closed before ready event"));
        },

        /**
         * @private
         * @param {Event} event
         */
        hearProcessThrowable: function(event) {
            this.complete(event.getData().throwable);
        },

        /**
         * @private
         * @param {Event} event
         */
        hearProcessReady: function(event) {
            this.getWorkerContext().updateWorkerState(WorkerDefines.State.READY);
            this.complete();
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.CreateWorkerProcessCommand', CreateWorkerProcessCommand);
});
