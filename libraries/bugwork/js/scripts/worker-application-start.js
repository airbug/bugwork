/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require("bugpack");
var domain          = require('domain');


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

bugpack.loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExports(["bugapp.Application", "bugwork.WorkerApplication", "bugwork.WorkerDefines"], function(error) {
            if (!error) {

                //-------------------------------------------------------------------------------
                // BugPack
                //-------------------------------------------------------------------------------

                var Application                 = bugpack.require('bugapp.Application');
                var WorkerApplication           = bugpack.require('bugwork.WorkerApplication');
                var WorkerDefines               = bugpack.require('bugwork.WorkerDefines');


                //-------------------------------------------------------------------------------
                // Script
                //-------------------------------------------------------------------------------

                var gracefulShutdown = function() {
                    var killtimer = setTimeout(function() {
                        process.exit(1);
                    }, 10000);
                    killtimer.unref();

                    try {
                        application.stop();
                    } catch(error) {
                        if (process.connected) {
                            process.send({
                                type: WorkerDefines.MessageTypes.WORKER_ERROR,
                                data: {
                                    message: error.message,
                                    stack: error.stack
                                }
                            });
                        }
                        process.exit(1);
                    }
                };

                var applicationDomain = domain.create();
                applicationDomain.on('error', function(error) {
                    if (process.connected) {
                        process.send({
                            messageType: WorkerDefines.MessageTypes.WORKER_ERROR,
                            error: {
                                message: error.message,
                                stack: error.stack
                            }
                        });
                    }

                    // Note: we're in dangerous territory!
                    // By definition, something unexpected occurred,
                    // which we probably didn't want.
                    // Anything can happen now!  Be very careful!

                    gracefulShutdown();
                });

                var application = new WorkerApplication();
                applicationDomain.add(application);
                applicationDomain.add(bugpack);
                applicationDomain.add(WorkerApplication);
                applicationDomain.run(function() {

                    console.log("Creating worker application...");
                    application.addEventListener(Application.EventTypes.STARTED, function(event) {
                        console.log("Worker application created!");
                        process.send({
                            messageType: WorkerDefines.MessageTypes.WORKER_READY
                        });
                    });
                    application.addEventListener(Application.EventTypes.STOPPED, function(event) {
                        process.exit();
                    });
                    application.addEventListener(Application.EventTypes.ERROR, function(event) {
                        if (process.connected) {
                            process.send({
                                messageType: WorkerDefines.MessageTypes.WORKER_ERROR,
                                error: {
                                    message: event.getData().error.message,
                                    stack: event.getData().error.stack
                                }
                            });
                        }
                        if (application.isStarting()) {
                            process.exit(1);
                        } else if (application.isStarted()) {
                            gracefulShutdown();
                        } else if (application.isStopping()) {
                            //do nothing (try to finish up the stop)
                        } else {
                            process.exit(1);
                        }
                    });

                    application.start();
                });


                process.on('SIGINT', gracefulShutdown);
                process.on('SIGTERM', gracefulShutdown);


            } else {
                console.log(error.message);
                console.log(error.stack);
                process.exit(1);
            }
        });
    } else {
        console.log(error.message);
        console.log(error.stack);
        process.exit(1);
    }
});
