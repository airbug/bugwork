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

//@TestFile

//@Require('Class')
//@Require('bugdouble.BugDouble')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.TestTag')
//@Require('bugwork.WorkerProcessFactory')
//@Require('bugyarn.BugYarn')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var BugDouble               = bugpack.require('bugdouble.BugDouble');
    var BugMeta                 = bugpack.require('bugmeta.BugMeta');
    var TestTag                 = bugpack.require('bugunit.TestTag');
    var WorkerProcessFactory    = bugpack.require('bugwork.WorkerProcessFactory');
    var BugYarn                 = bugpack.require('bugyarn.BugYarn');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta                 = BugMeta.context();
    var bugyarn                 = BugYarn.context();
    var stubObject              = BugDouble.stubObject;
    var test                    = TestTag.test;


    //-------------------------------------------------------------------------------
    // BugYarn
    //-------------------------------------------------------------------------------

    bugyarn.registerWinder("setupTestWorkerProcessFactory", function(yarn) {
        yarn.spin([
            "setupTestMarshaller"
        ]);
        yarn.wind({
            workerProcessFactory: new WorkerProcessFactory(this.marshaller)
        });
    });


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    var workerProcessFactoryInstantiationTest = {

        //-------------------------------------------------------------------------------
        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function(test) {
            var yarn = bugyarn.yarn(this);
            yarn.spin([
                "setupTestMarshaller"
            ]);
            this.testWorkerProcessFactory   = new WorkerProcessFactory(this.marshaller);
        },

        //-------------------------------------------------------------------------------
        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertTrue(Class.doesExtend(this.testWorkerProcessFactory, WorkerProcessFactory),
                "Assert instance of WorkerProcessFactory");
            test.assertEqual(this.testWorkerProcessFactory.getMarshaller(), this.marshaller,
                "Assert .marshaller was set correctly");
        }
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(workerProcessFactoryInstantiationTest).with(
        test().name("WorkerProcessFactory - instantiation test")
    );
});
