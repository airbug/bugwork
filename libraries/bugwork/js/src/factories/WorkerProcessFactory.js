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

//@Export('bugwork.WorkerProcessFactory')
//@Autoload

//@Require('Class')
//@Require('Obj')
//@Require('bugioc.ArgTag')
//@Require('bugioc.ModuleTag')
//@Require('bugmeta.BugMeta')
//@Require('bugwork.CreateWorkerProcessCommand')
//@Require('bugwork.DestroyWorkerProcessCommand')
//@Require('bugwork.StartWorkerCommand')
//@Require('bugwork.StopWorkerCommand')
//@Require('bugwork.WorkerProcess')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                           = bugpack.require('Class');
    var Obj                             = bugpack.require('Obj');
    var ArgTag                          = bugpack.require('bugioc.ArgTag');
    var ModuleTag                       = bugpack.require('bugioc.ModuleTag');
    var BugMeta                         = bugpack.require('bugmeta.BugMeta');
    var CreateWorkerProcessCommand      = bugpack.require('bugwork.CreateWorkerProcessCommand');
    var DestroyWorkerProcessCommand     = bugpack.require('bugwork.DestroyWorkerProcessCommand');
    var StartWorkerCommand              = bugpack.require('bugwork.StartWorkerCommand');
    var StopWorkerCommand               = bugpack.require('bugwork.StopWorkerCommand');
    var WorkerProcess                   = bugpack.require('bugwork.WorkerProcess');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var arg                             = ArgTag.arg;
    var bugmeta                         = BugMeta.context();
    var module                          = ModuleTag.module;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var WorkerProcessFactory = Class.extend(Obj, {

        _name: "bugwork.WorkerProcessFactory",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Marshaller} marshaller
         */
        _constructor: function(marshaller) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Marshaller}
             */
            this.marshaller         = marshaller;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Marshaller}
         */
        getMarshaller: function() {
            return this.marshaller;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {ProcessConfig} processConfig
         * @return {WorkerProcess}
         */
        factoryWorkerProcess: function(processConfig) {
            return new WorkerProcess(this.marshaller, processConfig);
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(WorkerProcessFactory).with(
        module("workerProcessFactory")
            .args([
                arg().ref("marshaller")
            ])
    );



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerProcessFactory', WorkerProcessFactory);
});
