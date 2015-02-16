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

//@Export('bugwork.ProcessConfig')

//@Require('Class')
//@Require('Config')
//@Require('TypeUtil')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Config      = bugpack.require('Config');
    var TypeUtil    = bugpack.require('TypeUtil');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Config}
     */
    var ProcessConfig = Class.extend(Config, {

        _name: "bugwork.ProcessConfig",


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        getDebug: function() {
            var debug = this.getProperty("debug");
            if (!TypeUtil.isBoolean(debug)) {
                debug = false;
            }
            return debug;
        },

        /**
         * @param {boolean} debug
         */
        setDebug: function(debug) {
            this.setProperty("debug", debug);
        },

        /**
         * @return {boolean}
         */
        getDebugBreak: function() {
            var debugBreak = this.getProperty("debugBreak");
            if (!TypeUtil.isBoolean(debugBreak)) {
                debugBreak = false;
            }
            return debugBreak;
        },

        /**
         * @param {boolean} debugBreak
         */
        setDebugBreak: function(debugBreak) {
            this.setProperty("debugBreak", debugBreak);
        },

        /**
         * @return {number}
         */
        getDebugPort: function() {
            return this.getProperty("debugPort");
        },

        /**
         * @param {number} debugPort
         */
        setDebugPort: function(debugPort) {
            this.setProperty("debugPort", debugPort);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("bugwork.ProcessConfig", ProcessConfig);
});
