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
//@Require('bugwork.ProcessConfig')
//@Require('bugyarn.BugYarn')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var BugDouble       = bugpack.require('bugdouble.BugDouble');
    var BugMeta         = bugpack.require('bugmeta.BugMeta');
    var TestTag         = bugpack.require('bugunit.TestTag');
    var ProcessConfig   = bugpack.require('bugwork.ProcessConfig');
    var BugYarn         = bugpack.require('bugyarn.BugYarn');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta         = BugMeta.context();
    var bugyarn         = BugYarn.context();
    var stubObject      = BugDouble.stubObject;
    var test            = TestTag.test;


    //-------------------------------------------------------------------------------
    // BugYarn
    //-------------------------------------------------------------------------------

    bugyarn.registerWinder("setupTestProcessConfig", function(yarn) {
        yarn.wind({
            processConfig: new ProcessConfig()
        });
    });


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    var processConfigInstantiationWithNoArgsTest = {

        //-------------------------------------------------------------------------------
        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function(test) {
            this.testProcessConfig  = new ProcessConfig({});
        },

        //-------------------------------------------------------------------------------
        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertTrue(Class.doesExtend(this.testProcessConfig, ProcessConfig),
                "Assert instance of ProcessConfig");
            test.assertEqual(this.testProcessConfig.getDebug(), false,
                "Assert #getDebug defaults to false");
            test.assertEqual(this.testProcessConfig.getDebugBreak(), false,
                "Assert #getDebugBreak defaults to false");
            test.assertEqual(this.testProcessConfig.getDebugPort(), undefined,
                "Assert #getDebugPort defaults to undefined");
        }
    };

    var processConfigInstantiationWithArgsTest = {

        //-------------------------------------------------------------------------------
        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function(test) {
            this.testProcessConfig  = new ProcessConfig({
                debug: true,
                debugBreak: true,
                debugPort: 5858
            });
        },

        //-------------------------------------------------------------------------------
        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertEqual(this.testProcessConfig.getDebug(), true,
                "Assert #getDebug was set to true");
            test.assertEqual(this.testProcessConfig.getDebugBreak(), true,
                "Assert #getDebugBreak was set to true");
            test.assertEqual(this.testProcessConfig.getDebugPort(), 5858,
                "Assert #getDebugPort was set to 5858");
        }
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(processConfigInstantiationWithNoArgsTest).with(
        test().name("ProcessConfig - instantiation with no args test")
    );
    bugmeta.tag(processConfigInstantiationWithArgsTest).with(
        test().name("ProcessConfig - instantiation with args test")
    );
});
