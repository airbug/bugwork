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

//@Export('bugwork.WorkerCommandFactory')
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
    var WorkerCommandFactory = Class.extend(Obj, {

        _name: "bugwork.WorkerCommandFactory",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Marshaller} marshaller
         * @param {WorkerProcessFactory} workerProcessFactory
         */
        _constructor: function(marshaller, workerProcessFactory) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Marshaller}
             */
            this.marshaller                 = marshaller;

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
         * @return {Marshaller}
         */
        getMarshaller: function() {
            return this.marshaller;
        },

        /**
         * @return {WorkerProcessFactory}
         */
        getWorkerProcessFactory: function() {
            return this.workerProcessFactory;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {WorkerContext} workerContext
         * @return {CreateWorkerProcessCommand}
         */
        factoryCreateWorkerProcessCommand: function(workerContext) {
            return new CreateWorkerProcessCommand(workerContext, this.workerProcessFactory);
        },

        /**
         * @param {WorkerContext} workerContext
         * @return {DestroyWorkerProcessCommand}
         */
        factoryDestroyWorkerProcessCommand: function(workerContext) {
            return new DestroyWorkerProcessCommand(workerContext);
        },

        /**
         * @param {WorkerContext} workerContext
         * @return {StartWorkerCommand}
         */
        factoryStartWorkerCommand: function(workerContext) {
            return new StartWorkerCommand(workerContext, this.marshaller);
        },

        /**
         * @param {WorkerContext} workerContext
         * @return {StopWorkerCommand}
         */
        factoryStopWorkerCommand: function(workerContext) {
            return new StopWorkerCommand(workerContext);
        }
    });


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(WorkerCommandFactory).with(
        module("workerCommandFactory")
            .args([
                arg().ref("marshaller"),
                arg().ref("workerProcessFactory")
            ])
    );



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerCommandFactory', WorkerCommandFactory);
});
