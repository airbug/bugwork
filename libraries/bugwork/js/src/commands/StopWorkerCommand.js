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

//@Export('bugwork.StopWorkerCommand')

//@Require('Bug')
//@Require('Class')
//@Require('Exception')
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
    var Exception       = bugpack.require('Exception');
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
    var StopWorkerCommand = Class.extend(WorkerCommand, {

        _name: "bugwork.StopWorkerCommand",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {WorkerContext} workerContext
         */
        _constructor: function(workerContext) {

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
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {function(Throwable=)}
         */
        getCallback: function() {
            return this.callback;
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
            var workerContext   = this.getWorkerContext();
            if (workerContext.isRunning()) {
                this.stopWorker();
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
            workerProcess.addEventListener(WorkerProcess.EventTypes.MESSAGE, this.hearProcessMessage, this);
            workerProcess.addEventListener(WorkerProcess.EventTypes.THROWABLE, this.hearProcessThrowable, this);
        },

        /**
         * @private
         * @param {Throwable=} throwable
         */
        complete: function(throwable) {
            if (!this.completed) {
                this.completed = true;
                if (this.getWorkerContext().hasWorkerProcess()) {
                    this.removeProcessListeners(this.getWorkerContext().getWorkerProcess());
                }
                this.workerContext = null;
                if (!throwable) {
                    this.callback();
                } else {
                    this.callback(throwable);
                }
            } else {
                throw new Bug("IllegalState", {}, "Stopper already complete");
            }
        },

        /**
         * @private
         * @param {*} message
         */
        processMessage: function(message) {

            console.log("StopWorkerCommand#processMessage - message:", message);

            if (message.messageType === WorkerDefines.MessageTypes.WORKER_STOPPED) {
                this.getWorkerContext().updateWorkerState(WorkerDefines.State.READY);
                this.complete();
            }
        },

        /**
         * @private
         * @param {WorkerProcess} workerProcess
         */
        removeProcessListeners: function(workerProcess) {
            workerProcess.removeEventListener(WorkerProcess.EventTypes.CLOSED, this.hearProcessClosed, this);
            workerProcess.removeEventListener(WorkerProcess.EventTypes.MESSAGE, this.hearProcessMessage, this);
            workerProcess.removeEventListener(WorkerProcess.EventTypes.THROWABLE, this.hearProcessThrowable, this);
        },

        /**
         * @private
         */
        stopWorker: function() {
            var workerContext = this.getWorkerContext();
            this.addProcessListeners(workerContext.getWorkerProcess());
            workerContext.getWorkerProcess().sendMessage(WorkerDefines.MessageTypes.STOP_WORKER, {});
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearProcessClosed: function(event) {
            this.complete(new Exception("Worker closed before it could be stopped"));
        },

        /**
         * @private
         * @param {Event} event
         */
        hearProcessMessage: function(event) {
            var message = event.getData().message;
            this.processMessage(message);
        },

        /**
         * @private
         * @param {Event} event
         */
        hearProcessThrowable: function(event) {
            this.complete(event.getData().throwable);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.StopWorkerCommand', StopWorkerCommand);
});
