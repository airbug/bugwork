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

//@Export('bugwork.WorkerTagProcessor')

//@Require('Class')
//@Require('Obj')
//@Require('bugmeta.ITagProcessor')
//@Require('bugwork.WorkerRegistryEntry')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var Obj                     = bugpack.require('Obj');
    var ITagProcessor           = bugpack.require('bugmeta.ITagProcessor');
    var WorkerRegistryEntry     = bugpack.require('bugwork.WorkerRegistryEntry');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     * @implements {ITagProcessor}
     */
    var WorkerTagProcessor = Class.extend(Obj, {

        _name: "bugwork.WorkerTagProcessor",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {WorkerRegistry} workerRegistry
         */
        _constructor: function(workerRegistry) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {WorkerRegistry}
             */
            this.workerRegistry = workerRegistry;
        },


        //-------------------------------------------------------------------------------
        // ITagProcessor Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {Tag} tag
         */
        process: function(tag) {
            this.processWorkerTag(/** @type {WorkerTag} */(tag));
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {string} workerName
         * @param {Class} workerClass
         * @return {WorkerRegistryEntry}
         */
        factoryWorkerRegistryEntry: function(workerName, workerClass) {
            return new WorkerRegistryEntry(workerName, workerClass);
        },

        /**
         * @private
         * @param {WorkerTag} workerTag
         */
        processWorkerTag: function(workerTag) {
            var workerConstructor   = workerTag.getTagReference();
            var workerClass         = workerConstructor.getClass();
            var workerName          = workerTag.getWorkerName();
            if (!this.workerRegistry.hasRegistryEntryForName(workerName)) {
                var registryEntry = this.factoryWorkerRegistryEntry(workerName, workerClass);
                this.workerRegistry.addRegistryEntry(registryEntry);
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Implement Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(WorkerTagProcessor, ITagProcessor);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerTagProcessor', WorkerTagProcessor);
});
