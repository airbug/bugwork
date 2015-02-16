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

//@Export('bugwork.WorkerProcess')

//@Require('Bug')
//@Require('Class')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Exception')
//@Require('ObjectUtil')
//@Require('TypeUtil')
//@Require('bugfs.BugFs')
//@Require('bugwork.WorkerDefines')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var child_process       = require('child_process');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug                 = bugpack.require('Bug');
    var Class               = bugpack.require('Class');
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Exception           = bugpack.require('Exception');
    var ObjectUtil          = bugpack.require('ObjectUtil');
    var TypeUtil            = bugpack.require('TypeUtil');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var WorkerDefines       = bugpack.require('bugwork.WorkerDefines');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var WorkerProcess = Class.extend(EventDispatcher, {

        _name: "bugwork.WorkerProcess",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Marshaller} marshaller
         * @param {ProcessConfig} processConfig
         */
        _constructor: function(marshaller, processConfig) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Process}
             */
            this.childProcess       = null;

            /**
             * @private
             * @type {boolean}
             */
            this.created            = false;

            /**
             * @private
             * @type {Marshaller}
             */
            this.marshaller         = marshaller;

            /**
             * @private
             * @type {ProcessConfig}
             */
            this.processConfig      = processConfig;

            /**
             * @private
             * @type {boolean}
             */
            this.ready              = false;


            var _this = this;
            this.hearChildProcessMessage    = function(message) {
                _this.handleChildProcessMessage(message);
            };
            this.hearStdoutData             = function(data) {
                console.log(data)
            };
            this.hearStderrData             = function(data) {
                console.error(data)
            };
            this.hearProcessClose           = function(code) {
                _this.handleChildProcessClose(code);
            };
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        isCreated: function() {
            return this.created;
        },

        /**
         * @return {ProcessConfig}
         */
        getProcessConfig: function() {
            return this.processConfig;
        },

        /**
         * @return {boolean}
         */
        isReady: function() {
            return this.ready;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        createProcess: function() {
            if (!this.isCreated()) {
                this.created    = true;
                var params      = [];
                var options     = {
                    stdio: 'inherit'
                };
                var execArgv = [];
                if (this.processConfig.getDebug()) {
                    if (this.processConfig.getDebugBreak()) {
                        execArgv.push("--debug-brk=" + this.processConfig.getDebugPort());
                    } else {
                        execArgv.push("--debug=" + this.processConfig.getDebugPort());
                    }
                }
                var configIndex = process.argv.indexOf("--config");
                if (configIndex > -1) {
                    execArgv.push("--config");
                    execArgv.push(process.argv[configIndex + 1]);
                }
                options.execArgv = execArgv;
                var processPath     = BugFs.resolvePaths([__dirname, "../scripts/worker-application-start.js"]);
                this.childProcess   = child_process.fork(processPath.getAbsolutePath(), params, options);
                this.childProcess.on('message', this.hearChildProcessMessage);
                this.childProcess.on('close', this.hearProcessClose);
            } else {
                throw new Bug("IllegalState", {}, "Process already created");
            }
        },

        /**
         *
         */
        destroyProcess: function() {
            if (this.isCreated()) {
                this.childProcess.kill();
            }
        },

        /**
         * @param {string} messageType
         * @param {*} messageData
         */
        sendMessage: function(messageType, messageData) {
            var message = {
                messageType: messageType,
                messageData: this.marshaller.marshalData(messageData)
            };
            this.childProcess.send(message)
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        cleanupProcess: function() {
            if (this.childProcess) {
                this.childProcess.removeListener('message', this.hearChildProcessMessage);
                this.childProcess.removeListener('close', this.hearProcessClose);
                this.childProcess = null;
            }
        },

        /**
         * @private
         */
        dispatchClosed: function() {
            this.dispatchEvent(new Event(WorkerProcess.EventTypes.CLOSED));
        },

        /**
         * @private
         * @param {*} message
         */
        dispatchMessage: function(message) {
            this.dispatchEvent(new Event(WorkerProcess.EventTypes.MESSAGE, {
                message: message
            }));
        },

        /**
         * @private
         */
        dispatchReady: function() {
            this.dispatchEvent(new Event(WorkerProcess.EventTypes.READY));
        },

        /**
         * @private
         * @param {Throwable} throwable
         */
        dispatchThrowable: function(throwable) {
            this.dispatchEvent(new Event(WorkerProcess.EventTypes.THROWABLE, {
                throwable: throwable
            }));
        },

        /**
         * @private
         * @param {number} code
         */
        handleChildProcessClose: function(code) {
            this.resetProcessState();
            this.dispatchClosed();
        },

        /**
         * @private
         * @param {*} message
         */
        handleChildProcessMessage: function(message) {
            if (TypeUtil.isObject(message)) {
                if (message.messageData) {
                    message.messageData = this.marshaller.unmarshalData(message.messageData);
                }
                switch (message.messageType) {
                    case WorkerDefines.MessageTypes.WORKER_ERROR:
                        this.handleWorkerErrorMessage(message);
                        break;
                    case WorkerDefines.MessageTypes.WORKER_THROWABLE:
                        this.handleWorkerThrowableMessage(message);
                        break;
                    case WorkerDefines.MessageTypes.WORKER_READY:
                        this.handleWorkerReadyMessage(message);
                        break;
                    default:
                        this.dispatchMessage(message);
                }
            } else {
                console.log("Unhandled process message:" + message);
            }
        },

        /**
         * @private
         * @param {*} message
         */
        handleWorkerErrorMessage: function(message) {
            var error = new Bug("ChildProcessError", {}, message.error.message);
            error.stack = message.error.stack;
            this.dispatchThrowable(error);
        },

        /**
         * @private
         * @param {*} message
         */
        handleWorkerReadyMessage: function(message) {
            if (!this.isReady()) {
                this.ready = true;
                this.dispatchReady();
            } else {
                this.dispatchThrowable(new Bug("IllegalState", {}, "Process is already ready. Received a worker ready message after already ready"));
            }
        },

        /**
         * @private
         * @param {*} message
         */
        handleWorkerThrowableMessage: function(message) {
            this.dispatchThrowable(message.messageData.throwable);
        },

        /**
         * @private
         */
        resetProcessState: function() {
            this.ready = false;
            this.created = false;
            this.cleanupProcess();
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    WorkerProcess.EventTypes = {
        CLOSED: "WorkerProcess:Closed",
        MESSAGE: "WorkerProcess:Message",
        READY: "WorkerProcess:Ready",
        THROWABLE: "WorkerProcess:Throwable"
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerProcess', WorkerProcess);
});
