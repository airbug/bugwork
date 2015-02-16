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

//@Export('bugwork.WorkerDefines')

//@Require('Class')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var Obj     = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var WorkerDefines = Class.extend(Obj, {
        _name: "bugwork.WorkerDefines"
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    WorkerDefines.MessageTypes = {
        START_WORKER: "WorkerDefines:StartWorker",
        STOP_WORKER: "WorkerDefines:StopWorker",
        WORKER_ERROR: "WorkerDefines:WorkerError",
        WORKER_READY: "WorkerDefines:WorkerReady",
        WORKER_STARTED: "WorkerDefines:WorkerStarted",
        WORKER_STOPPED: "WorkerDefines:WorkerStopped",
        WORKER_THROWABLE: "WorkerDefines:WorkerThrowable"
    };

    /**
     * @static
     * @enum {string}
     */
     WorkerDefines.State = {
        NOT_READY: "WorkerDefines:State:NotReady",
        READY: "WorkerDefines:State:Ready",
        RUNNING: "WorkerDefines:State:Running"
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("bugwork.WorkerDefines", WorkerDefines);
});
