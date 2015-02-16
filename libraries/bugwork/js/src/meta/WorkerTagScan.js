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

//@Export('bugwork.WorkerTagScan')

//@Require('Class')
//@Require('bugmeta.TagClassTagScan')
//@Require('bugwork.WorkerTag')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var TagClassTagScan     = bugpack.require('bugmeta.TagClassTagScan');
    var WorkerTag           = bugpack.require('bugwork.WorkerTag');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {TagClassTagScan}
     */
    var WorkerTagScan = Class.extend(TagClassTagScan, {

        _name: "bugwork.WorkerTagScan",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {MetaContext} metaContext
         * @param {TagProcessor} processor
         */
        _constructor: function(metaContext, processor) {
            this._super(metaContext, processor, WorkerTag.getClass());
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugwork.WorkerTagScan', WorkerTagScan);
});
