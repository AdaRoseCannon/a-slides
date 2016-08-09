(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ASlides"] = factory();
	else
		root["ASlides"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _regenerator = __webpack_require__(2);

	var _regenerator2 = _interopRequireDefault(_regenerator);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var slideSelector = function slideSelector(slideId) {
		return '.a-slides_slide[data-slide-id="' + slideId + '"] .a-slides_slide-content';
	};

	var _require = __webpack_require__(6);

	var fire = _require.fire;
	var on = _require.on;
	var once = _require.once;
	var off = _require.off;

	var prevAll = __webpack_require__(77);

	// Setup document listeners and event handlers
	function ASlide(slideData) {
		var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var _ref$plugins = _ref.plugins;
		var plugins = _ref$plugins === undefined ? [] : _ref$plugins;
		var _ref$slideContainer = _ref.slideContainer;
		var slideContainer = _ref$slideContainer === undefined ? document.body : _ref$slideContainer;


		var noEvents = 0;

		function getCurrentSlide() {
			return slideContainer.querySelector('.a-slides_slide[data-slide-id].active');
		}

		function getNextSlide() {
			return slideContainer.querySelector('.a-slides_slide[data-slide-id].active + .a-slides_slide[data-slide-id]');
		}

		// prepare a slide to be used
		var setupSlide = function setupSlide(slideId) {

			if (this.nextEvents) {
				this.nextEvents.teardown.bind(this.nextSlide);
				this.nextEvents = null;
				this.nextSlide = null;
			}

			fire(slideContainer, 'a-slides_slide-setup', { slideId: slideId });

			this.nextSlide = slideContainer.querySelector('.a-slides_slide[data-slide-id="' + slideId + '"]');

			if (slideData[slideId]) {
				if (slideData[slideId].setup) {
					slideData[slideId].setup.bind(slideContainer.querySelector(slideSelector(slideId)))();
				}
			} else {
				slideData[slideId] = {
					setup: function setup() {},

					action: _regenerator2.default.mark(function action() {
						return _regenerator2.default.wrap(function action$(_context) {
							while (1) {
								switch (_context.prev = _context.next) {
									case 0:
										_context.next = 2;
										return;

									case 2:
									case 'end':
										return _context.stop();
								}
							}
						}, action, this);
					}),
					teardown: function teardown() {}
				};
			}

			this.nextEvents = slideData[slideId];
			noEvents = 0;
		}.bind(this);

		// use that slide
		var loadNextSlide = function loadNextSlide() {

			this.currentEvents = this.nextEvents.action.bind(this.nextSlide)();
			this.currentSlide = this.nextSlide;

			this.nextEvents = null;
			this.nextSlide = null;

			location.hash = this.currentSlide.dataset.slideId;

			fire(slideContainer, 'a-slides_slide-show', { slideId: this.currentSlide.dataset.slideId });

			// if a go to new slide is already triggered then cancel it so
			// we don't accidentially go to the wrong slide.
			clearTimeout(this.nextSlideTimeOut);

			// Do first action
			this.currentEvents.next();
		}.bind(this);

		function teardownSlide(slideId) {

			fire(slideContainer, 'a-slides_slide-teardown', { slideId: slideId });
			if (slideData[slideId]) {
				if (slideData[slideId].teardown) {
					slideData[slideId].teardown.bind(slideContainer.querySelector(slideSelector(slideId)))();
				}
			}
		}

		// Slide is a dom element or an integer
		var goToSlide = function goToSlide(_ref2) {
			var _this = this;

			var slide = _ref2.slide;

			var newSlide = typeof slide === 'number' ? slideContainer.querySelectorAll('.a-slides_slide[data-slide-id]')[slide] : slide;
			if (!newSlide) return;
			var newSlideId = newSlide.dataset.slideId;
			var oldSlide = getCurrentSlide();
			if (newSlide && newSlide !== oldSlide) {
				if (oldSlide) {
					oldSlide.classList.remove('active');
					once(oldSlide, 'transitionend', function () {
						if (_this.nextEvents) {
							loadNextSlide();

							// preload the next slide.
							var nextSlide = getNextSlide();
							if (nextSlide) {
								off(nextSlide, 'transitionend');
								teardownSlide(nextSlide.dataset.slideId);
								setupSlide(nextSlide.dataset.slideId);
							}
						}
						teardownSlide(oldSlide.dataset.slideId);
					});
				}
				off(newSlide, 'transitionend');
				newSlide.classList.add('active');

				// in the case where the next slide is not the on buffered.
				// Or in the case where there this is the first slide
				// show this side immediately
				if (newSlide !== this.nextSlide || !oldSlide) {
					setupSlide(newSlideId);
					loadNextSlide();
					var nextSlide = getNextSlide();
					if (nextSlide) {
						off(nextSlide, 'transitionend');
						teardownSlide(nextSlide.dataset.slideId);
						setupSlide(nextSlide.dataset.slideId);
					}
				}
			}
		}.bind(this);

		function goToNextSlide() {
			goToSlide({ slide: getNextSlide() });
		}

		var goToPrevSlide = function goToPrevSlide() {

			if (noEvents) {
				fire(slideContainer, 'a-slides_refresh-slide');
				return;
			}

			// Wait a smidge before changing slides.
			slideContainer.nextSlideTimeOut = setTimeout(function () {
				return goToSlide({ slide: prevAll(getCurrentSlide()).length - 1 });
			}, 10);
		};

		this.currentEvents = {
			next: function next() {
				return { done: false };
			}
		};

		// e.g. click presses next etc etc
		on(slideContainer, 'a-slides_trigger-event', function () {
			noEvents++;
			if (this.currentEvents.next().done) {

				// Wait a smidge before triggering the next slide.
				this.nextSlideTimeOut = setTimeout(goToNextSlide, 10);
			}
		}.bind(this));

		function refreshSlide() {
			var id = getCurrentSlide().dataset.slideId;
			teardownSlide(id);
			setupSlide(id);
			loadNextSlide();
		}

		on(slideContainer, 'a-slides_refresh-slide', function () {
			return refreshSlide();
		});
		on(slideContainer, 'a-slides_next-slide', function () {
			return goToNextSlide();
		});
		on(slideContainer, 'a-slides_previous-slide', function () {
			return goToPrevSlide();
		});
		on(slideContainer, 'a-slides_goto-slide', function (e) {
			return goToSlide(e.detail);
		});

		on(slideContainer, 'scroll', function () {
			return slideContainer.scrollLeft = 0;
		});

		plugins.forEach(function (plugin) {
			if (typeof plugin === 'function') {
				plugin({
					slideData: slideData,
					slideContainer: slideContainer
				});
			}
		});
	}

	ASlide.plugins = {
		deepLinking: __webpack_require__(83),
		interactionKeyboard: __webpack_require__(84),
		interactionTouch: __webpack_require__(85),
		markdownTransform: __webpack_require__(87),
		slideController: __webpack_require__(93),
		bridgeServiceWorker: __webpack_require__(94),
		bridgeWebRTC: __webpack_require__(102)
	};

	module.exports = ASlide;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(3);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {// This method of obtaining a reference to the global object needs to be
	// kept identical to the way it is obtained in runtime.js
	var g =
	  typeof global === "object" ? global :
	  typeof window === "object" ? window :
	  typeof self === "object" ? self : this;

	// Use `getOwnPropertyNames` because not all browsers support calling
	// `hasOwnProperty` on the global `self` object in a worker. See #183.
	var hadRuntime = g.regeneratorRuntime &&
	  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

	// Save the old regeneratorRuntime in case it needs to be restored later.
	var oldRuntime = hadRuntime && g.regeneratorRuntime;

	// Force reevalutation of runtime.js.
	g.regeneratorRuntime = undefined;

	module.exports = __webpack_require__(4);

	if (hadRuntime) {
	  // Restore the original runtime.
	  g.regeneratorRuntime = oldRuntime;
	} else {
	  // Remove the global property added by runtime.js.
	  try {
	    delete g.regeneratorRuntime;
	  } catch(e) {
	    g.regeneratorRuntime = undefined;
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
	 * additional grant of patent rights can be found in the PATENTS file in
	 * the same directory.
	 */

	!(function(global) {
	  "use strict";

	  var hasOwn = Object.prototype.hasOwnProperty;
	  var undefined; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	  var inModule = typeof module === "object";
	  var runtime = global.regeneratorRuntime;
	  if (runtime) {
	    if (inModule) {
	      // If regeneratorRuntime is defined globally and we're in a module,
	      // make the exports object identical to regeneratorRuntime.
	      module.exports = runtime;
	    }
	    // Don't bother evaluating the rest of this file if the runtime was
	    // already defined globally.
	    return;
	  }

	  // Define the runtime globally (as expected by generated code) as either
	  // module.exports (if we're in a module) or a new, empty object.
	  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided, then outerFn.prototype instanceof Generator.
	    var generator = Object.create((outerFn || Generator).prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  runtime.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  runtime.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  runtime.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `value instanceof AwaitArgument` to determine if the yielded value is
	  // meant to be awaited. Some may consider the name of this method too
	  // cutesy, but they are curmudgeons.
	  runtime.awrap = function(arg) {
	    return new AwaitArgument(arg);
	  };

	  function AwaitArgument(arg) {
	    this.arg = arg;
	  }

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value instanceof AwaitArgument) {
	          return Promise.resolve(value.arg).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration. If the Promise is rejected, however, the
	          // result for this iteration will be rejected with the same
	          // reason. Note that rejections of yielded Promises are not
	          // thrown back into the generator function, as is the case
	          // when an awaited Promise is rejected. This difference in
	          // behavior between yield and await is important, because it
	          // allows the consumer to decide what to do with the yielded
	          // rejection (swallow it and continue, manually .throw it back
	          // into the generator, abandon iteration, whatever). With
	          // await, by contrast, there is no opportunity to examine the
	          // rejection reason outside the generator function, so the
	          // only option is to throw it from the await expression, and
	          // let the generator function handle the exception.
	          result.value = unwrapped;
	          resolve(result);
	        }, reject);
	      }
	    }

	    if (typeof process === "object" && process.domain) {
	      invoke = process.domain.bind(invoke);
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return runtime.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          if (method === "return" ||
	              (method === "throw" && delegate.iterator[method] === undefined)) {
	            // A return or throw (when the delegate iterator has no throw
	            // method) always terminates the yield* loop.
	            context.delegate = null;

	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            var returnMethod = delegate.iterator["return"];
	            if (returnMethod) {
	              var record = tryCatch(returnMethod, delegate.iterator, arg);
	              if (record.type === "throw") {
	                // If the return method threw an exception, let that
	                // exception prevail over the original return or throw.
	                method = "throw";
	                arg = record.arg;
	                continue;
	              }
	            }

	            if (method === "return") {
	              // Continue with the outer return, now that the delegate
	              // iterator has been terminated.
	              continue;
	            }
	          }

	          var record = tryCatch(
	            delegate.iterator[method],
	            delegate.iterator,
	            arg
	          );

	          if (record.type === "throw") {
	            context.delegate = null;

	            // Like returning generator.throw(uncaught), but without the
	            // overhead of an extra function call.
	            method = "throw";
	            arg = record.arg;
	            continue;
	          }

	          // Delegate generator ran and handled its own exceptions so
	          // regardless of what the method was, we continue as if it is
	          // "next" with an undefined arg.
	          method = "next";
	          arg = undefined;

	          var info = record.arg;
	          if (info.done) {
	            context[delegate.resultName] = info.value;
	            context.next = delegate.nextLoc;
	          } else {
	            state = GenStateSuspendedYield;
	            return info;
	          }

	          context.delegate = null;
	        }

	        if (method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = arg;

	        } else if (method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw arg;
	          }

	          if (context.dispatchException(arg)) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            method = "next";
	            arg = undefined;
	          }

	        } else if (method === "return") {
	          context.abrupt("return", arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          var info = {
	            value: record.arg,
	            done: context.done
	          };

	          if (record.arg === ContinueSentinel) {
	            if (context.delegate && method === "next") {
	              // Deliberately forget the last sent value so that we don't
	              // accidentally pass it on to the delegate.
	              arg = undefined;
	            }
	          } else {
	            return info;
	          }

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(arg) call above.
	          method = "throw";
	          arg = record.arg;
	        }
	      }
	    };
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp[toStringTagSymbol] = "Generator";

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  runtime.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  runtime.values = values;

	  function doneResult() {
	    return { value: undefined, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined;
	      this.done = false;
	      this.delegate = null;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;
	        return !!caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.next = finallyEntry.finallyLoc;
	      } else {
	        this.complete(record);
	      }

	      return ContinueSentinel;
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = record.arg;
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      return ContinueSentinel;
	    }
	  };
	})(
	  // Among the various tricks for obtaining a reference to the global
	  // object, this seems to be the most reliable technique that does not
	  // use indirect eval (which violates Content Security Policy).
	  typeof global === "object" ? global :
	  typeof window === "object" ? window :
	  typeof self === "object" ? self : this
	);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	(function () {
	  try {
	    cachedSetTimeout = setTimeout;
	  } catch (e) {
	    cachedSetTimeout = function () {
	      throw new Error('setTimeout is not defined');
	    }
	  }
	  try {
	    cachedClearTimeout = clearTimeout;
	  } catch (e) {
	    cachedClearTimeout = function () {
	      throw new Error('clearTimeout is not defined');
	    }
	  }
	} ())
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = cachedSetTimeout.call(null, cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    cachedClearTimeout.call(null, timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        cachedSetTimeout.call(null, drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	'use strict';

	var _set = __webpack_require__(7);

	var _set2 = _interopRequireDefault(_set);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function on(node, name, fn) {
		if (!node.funcRef) node.funcRef = new _set2.default();

		// Store it for later
		node.funcRef.add(fn);
		node.addEventListener(name, fn);
		return node;
	}

	function off(node, name, fn) {
		if (!node.funcRef) return;
		if (fn) {
			node.removeEventListener(name, fn);
		} else {
			node.funcRef.forEach(function (fn) {
				return node.removeEventListener(name, fn);
			});
		}
		node.funcRef.delete(fn);
		return node;
	}

	module.exports = { on: on, off: off,

		once: function once(node, name, fn) {
			on(node, name, function tempF(e) {
				fn.bind(node)(e);
				off(node, name, tempF);
			});
			return node;
		},
		fire: function fire(node, name) {
			var detail = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			node.dispatchEvent(new CustomEvent(name, { detail: detail }));
			return node;
		}
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(8), __esModule: true };

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(9);
	__webpack_require__(10);
	__webpack_require__(54);
	__webpack_require__(58);
	__webpack_require__(74);
	module.exports = __webpack_require__(18).Set;

/***/ },
/* 9 */
/***/ function(module, exports) {

	

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(11)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(14)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(12)
	  , defined   = __webpack_require__(13);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(15)
	  , $export        = __webpack_require__(16)
	  , redefine       = __webpack_require__(31)
	  , hide           = __webpack_require__(21)
	  , has            = __webpack_require__(32)
	  , Iterators      = __webpack_require__(33)
	  , $iterCreate    = __webpack_require__(34)
	  , setToStringTag = __webpack_require__(50)
	  , getPrototypeOf = __webpack_require__(52)
	  , ITERATOR       = __webpack_require__(51)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(17)
	  , core      = __webpack_require__(18)
	  , ctx       = __webpack_require__(19)
	  , hide      = __webpack_require__(21)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 17 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 18 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(20);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(22)
	  , createDesc = __webpack_require__(30);
	module.exports = __webpack_require__(26) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(23)
	  , IE8_DOM_DEFINE = __webpack_require__(25)
	  , toPrimitive    = __webpack_require__(29)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(26) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(24);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(26) && !__webpack_require__(27)(function(){
	  return Object.defineProperty(__webpack_require__(28)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(27)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(24)
	  , document = __webpack_require__(17).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(24);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(21);

/***/ },
/* 32 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(35)
	  , descriptor     = __webpack_require__(30)
	  , setToStringTag = __webpack_require__(50)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(21)(IteratorPrototype, __webpack_require__(51)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(23)
	  , dPs         = __webpack_require__(36)
	  , enumBugKeys = __webpack_require__(48)
	  , IE_PROTO    = __webpack_require__(45)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(28)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(49).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(22)
	  , anObject = __webpack_require__(23)
	  , getKeys  = __webpack_require__(37);

	module.exports = __webpack_require__(26) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(38)
	  , enumBugKeys = __webpack_require__(48);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(32)
	  , toIObject    = __webpack_require__(39)
	  , arrayIndexOf = __webpack_require__(42)(false)
	  , IE_PROTO     = __webpack_require__(45)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(40)
	  , defined = __webpack_require__(13);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(41);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(39)
	  , toLength  = __webpack_require__(43)
	  , toIndex   = __webpack_require__(44);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(12)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(12)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(46)('keys')
	  , uid    = __webpack_require__(47);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(17)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 47 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 48 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(17).document && document.documentElement;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(22).f
	  , has = __webpack_require__(32)
	  , TAG = __webpack_require__(51)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(46)('wks')
	  , uid        = __webpack_require__(47)
	  , Symbol     = __webpack_require__(17).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(32)
	  , toObject    = __webpack_require__(53)
	  , IE_PROTO    = __webpack_require__(45)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(13);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(55);
	var global        = __webpack_require__(17)
	  , hide          = __webpack_require__(21)
	  , Iterators     = __webpack_require__(33)
	  , TO_STRING_TAG = __webpack_require__(51)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(56)
	  , step             = __webpack_require__(57)
	  , Iterators        = __webpack_require__(33)
	  , toIObject        = __webpack_require__(39);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(14)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(59);

	// 23.2 Set Objects
	module.exports = __webpack_require__(69)('Set', function(get){
	  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.2.3.1 Set.prototype.add(value)
	  add: function add(value){
	    return strong.def(this, value = value === 0 ? 0 : value, value);
	  }
	}, strong);

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var dP          = __webpack_require__(22).f
	  , create      = __webpack_require__(35)
	  , redefineAll = __webpack_require__(60)
	  , ctx         = __webpack_require__(19)
	  , anInstance  = __webpack_require__(61)
	  , defined     = __webpack_require__(13)
	  , forOf       = __webpack_require__(62)
	  , $iterDefine = __webpack_require__(14)
	  , step        = __webpack_require__(57)
	  , setSpecies  = __webpack_require__(67)
	  , DESCRIPTORS = __webpack_require__(26)
	  , fastKey     = __webpack_require__(68).fastKey
	  , SIZE        = DESCRIPTORS ? '_s' : 'size';

	var getEntry = function(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index !== 'F')return that._i[index];
	  // frozen object case
	  for(entry = that._f; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	};

	module.exports = {
	  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
	    var C = wrapper(function(that, iterable){
	      anInstance(that, C, NAME, '_i');
	      that._i = create(null); // index
	      that._f = undefined;    // first entry
	      that._l = undefined;    // last entry
	      that[SIZE] = 0;         // size
	      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear(){
	        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that._f == entry)that._f = next;
	          if(that._l == entry)that._l = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /*, that = undefined */){
	        anInstance(this, C, 'forEach');
	        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
	          , entry;
	        while(entry = entry ? entry.n : this._f){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if(DESCRIPTORS)dP(C.prototype, 'size', {
	      get: function(){
	        return defined(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that._l,             // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that._f)that._f = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index !== 'F')that._i[index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  setStrong: function(C, NAME, IS_MAP){
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    $iterDefine(C, NAME, function(iterated, kind){
	      this._t = iterated;  // target
	      this._k = kind;      // kind
	      this._l = undefined; // previous
	    }, function(){
	      var that  = this
	        , kind  = that._k
	        , entry = that._l;
	      // revert to the last existing entry
	      while(entry && entry.r)entry = entry.p;
	      // get next entry
	      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if(kind == 'keys'  )return step(0, entry.k);
	      if(kind == 'values')return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(NAME);
	  }
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(21);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(19)
	  , call        = __webpack_require__(63)
	  , isArrayIter = __webpack_require__(64)
	  , anObject    = __webpack_require__(23)
	  , toLength    = __webpack_require__(43)
	  , getIterFn   = __webpack_require__(65)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(23);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(33)
	  , ITERATOR   = __webpack_require__(51)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(66)
	  , ITERATOR  = __webpack_require__(51)('iterator')
	  , Iterators = __webpack_require__(33);
	module.exports = __webpack_require__(18).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(41)
	  , TAG = __webpack_require__(51)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(17)
	  , core        = __webpack_require__(18)
	  , dP          = __webpack_require__(22)
	  , DESCRIPTORS = __webpack_require__(26)
	  , SPECIES     = __webpack_require__(51)('species');

	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(47)('meta')
	  , isObject = __webpack_require__(24)
	  , has      = __webpack_require__(32)
	  , setDesc  = __webpack_require__(22).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(27)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global         = __webpack_require__(17)
	  , $export        = __webpack_require__(16)
	  , meta           = __webpack_require__(68)
	  , fails          = __webpack_require__(27)
	  , hide           = __webpack_require__(21)
	  , redefineAll    = __webpack_require__(60)
	  , forOf          = __webpack_require__(62)
	  , anInstance     = __webpack_require__(61)
	  , isObject       = __webpack_require__(24)
	  , setToStringTag = __webpack_require__(50)
	  , dP             = __webpack_require__(22).f
	  , each           = __webpack_require__(70)(0)
	  , DESCRIPTORS    = __webpack_require__(26);

	module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
	  var Base  = global[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
	    new C().entries().next();
	  }))){
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    redefineAll(C.prototype, methods);
	    meta.NEED = true;
	  } else {
	    C = wrapper(function(target, iterable){
	      anInstance(target, C, NAME, '_c');
	      target._c = new Base;
	      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
	    });
	    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
	      var IS_ADDER = KEY == 'add' || KEY == 'set';
	      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
	        anInstance(this, C, KEY);
	        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
	        var result = this._c[KEY](a === 0 ? 0 : a, b);
	        return IS_ADDER ? this : result;
	      });
	    });
	    if('size' in proto)dP(C.prototype, 'size', {
	      get: function(){
	        return this._c.size;
	      }
	    });
	  }

	  setToStringTag(C, NAME);

	  O[NAME] = C;
	  $export($export.G + $export.W + $export.F, O);

	  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

	  return C;
	};

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var ctx      = __webpack_require__(19)
	  , IObject  = __webpack_require__(40)
	  , toObject = __webpack_require__(53)
	  , toLength = __webpack_require__(43)
	  , asc      = __webpack_require__(71);
	module.exports = function(TYPE, $create){
	  var IS_MAP        = TYPE == 1
	    , IS_FILTER     = TYPE == 2
	    , IS_SOME       = TYPE == 3
	    , IS_EVERY      = TYPE == 4
	    , IS_FIND_INDEX = TYPE == 6
	    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
	    , create        = $create || asc;
	  return function($this, callbackfn, that){
	    var O      = toObject($this)
	      , self   = IObject(O)
	      , f      = ctx(callbackfn, that, 3)
	      , length = toLength(self.length)
	      , index  = 0
	      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
	      , val, res;
	    for(;length > index; index++)if(NO_HOLES || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(TYPE){
	        if(IS_MAP)result[index] = res;            // map
	        else if(res)switch(TYPE){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(IS_EVERY)return false;          // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
	var speciesConstructor = __webpack_require__(72);

	module.exports = function(original, length){
	  return new (speciesConstructor(original))(length);
	};

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(24)
	  , isArray  = __webpack_require__(73)
	  , SPECIES  = __webpack_require__(51)('species');

	module.exports = function(original){
	  var C;
	  if(isArray(original)){
	    C = original.constructor;
	    // cross-realm fallback
	    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
	    if(isObject(C)){
	      C = C[SPECIES];
	      if(C === null)C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(41);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(16);

	$export($export.P + $export.R, 'Set', {toJSON: __webpack_require__(75)('Set')});

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var classof = __webpack_require__(66)
	  , from    = __webpack_require__(76);
	module.exports = function(NAME){
	  return function toJSON(){
	    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
	    return from(this);
	  };
	};

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var forOf = __webpack_require__(62);

	module.exports = function(iter, ITERATOR){
	  var result = [];
	  forOf(iter, false, result.push, result, ITERATOR);
	  return result;
	};


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _from = __webpack_require__(78);

	var _from2 = _interopRequireDefault(_from);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = function prevAll(el) {
		var nodes = (0, _from2.default)(el.parentNode.children);
		var pos = nodes.indexOf(el);
		return nodes.slice(0, pos);
	};

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(79), __esModule: true };

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(10);
	__webpack_require__(80);
	module.exports = __webpack_require__(18).Array.from;

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx            = __webpack_require__(19)
	  , $export        = __webpack_require__(16)
	  , toObject       = __webpack_require__(53)
	  , call           = __webpack_require__(63)
	  , isArrayIter    = __webpack_require__(64)
	  , toLength       = __webpack_require__(43)
	  , createProperty = __webpack_require__(81)
	  , getIterFn      = __webpack_require__(65);

	$export($export.S + $export.F * !__webpack_require__(82)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , aLen    = arguments.length
	      , mapfn   = aLen > 1 ? arguments[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $defineProperty = __webpack_require__(22)
	  , createDesc      = __webpack_require__(30);

	module.exports = function(object, index, value){
	  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
	  else object[index] = value;
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(51)('iterator')
	  , SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }

	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(6);

	var fire = _require.fire;


	module.exports = function (_ref) {
		var slideContainer = _ref.slideContainer;

		if (location.hash) {

			var slide = slideContainer.querySelector('.a-slides_slide[data-slide-id="' + location.hash.slice(1) + '"]');

			// Find the slide with the hash to simulate deeplinking
			if (slide) {
				fire(slideContainer, 'a-slides_goto-slide', { slide: slide });
			}

			slideContainer.scrollLeft = 0;
		} else {
			fire(slideContainer, 'a-slides_goto-slide', { slide: 0 });
		}
	};

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(6);

	var fire = _require.fire;
	var on = _require.on;


	module.exports = function (_ref) {
		var slideContainer = _ref.slideContainer;

		window.addEventListener('keyup', function (e) {
			switch (e.keyCode) {

				// Left Arrow
				case 37:
				case 33:
					fire(slideContainer, 'a-slides_previous-slide');
					break;

				// Right Arrow
				case 13:
				case 39:
				case 34:
					fire(slideContainer, 'a-slides_trigger-event');
					break;

				case 66:
				case 70:
					slideContainer.classList.toggle('presentation');
					break;

				case 27:
					slideContainer.classList.remove('presentation');
					break;
			}
		});

		on(slideContainer, 'click', function () {
			fire(this, 'a-slides_trigger-event');
		});
	};

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Hammer = __webpack_require__(86);

	var _require = __webpack_require__(6);

	var fire = _require.fire;


	module.exports = function (config) {

		return function (_ref) {
			var slideContainer = _ref.slideContainer;


			var touches = new Hammer(slideContainer);
			touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });

			if (config.use.indexOf('swipe-forward') !== -1) {
				touches.on('swipeleft', function () {
					return fire(slideContainer, 'a-slides_next-slide');
				});
			}

			if (config.use.indexOf('swipe-back') !== -1) {
				touches.on('swiperight', function () {
					return fire(slideContainer, 'a-slides_previous-slide');
				});
			}
		};
	};

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.7 - 2016-04-22
	 * http://hammerjs.github.io/
	 *
	 * Copyright (c) 2016 Jorik Tangelder;
	 * Licensed under the MIT license */
	(function(window, document, exportName, undefined) {
	  'use strict';

	var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
	var TEST_ELEMENT = document.createElement('div');

	var TYPE_FUNCTION = 'function';

	var round = Math.round;
	var abs = Math.abs;
	var now = Date.now;

	/**
	 * set a timeout with a given scope
	 * @param {Function} fn
	 * @param {Number} timeout
	 * @param {Object} context
	 * @returns {number}
	 */
	function setTimeoutContext(fn, timeout, context) {
	    return setTimeout(bindFn(fn, context), timeout);
	}

	/**
	 * if the argument is an array, we want to execute the fn on each entry
	 * if it aint an array we don't want to do a thing.
	 * this is used by all the methods that accept a single and array argument.
	 * @param {*|Array} arg
	 * @param {String} fn
	 * @param {Object} [context]
	 * @returns {Boolean}
	 */
	function invokeArrayArg(arg, fn, context) {
	    if (Array.isArray(arg)) {
	        each(arg, context[fn], context);
	        return true;
	    }
	    return false;
	}

	/**
	 * walk objects and arrays
	 * @param {Object} obj
	 * @param {Function} iterator
	 * @param {Object} context
	 */
	function each(obj, iterator, context) {
	    var i;

	    if (!obj) {
	        return;
	    }

	    if (obj.forEach) {
	        obj.forEach(iterator, context);
	    } else if (obj.length !== undefined) {
	        i = 0;
	        while (i < obj.length) {
	            iterator.call(context, obj[i], i, obj);
	            i++;
	        }
	    } else {
	        for (i in obj) {
	            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
	        }
	    }
	}

	/**
	 * wrap a method with a deprecation warning and stack trace
	 * @param {Function} method
	 * @param {String} name
	 * @param {String} message
	 * @returns {Function} A new function wrapping the supplied method.
	 */
	function deprecate(method, name, message) {
	    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
	    return function() {
	        var e = new Error('get-stack-trace');
	        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
	            .replace(/^\s+at\s+/gm, '')
	            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

	        var log = window.console && (window.console.warn || window.console.log);
	        if (log) {
	            log.call(window.console, deprecationMessage, stack);
	        }
	        return method.apply(this, arguments);
	    };
	}

	/**
	 * extend object.
	 * means that properties in dest will be overwritten by the ones in src.
	 * @param {Object} target
	 * @param {...Object} objects_to_assign
	 * @returns {Object} target
	 */
	var assign;
	if (typeof Object.assign !== 'function') {
	    assign = function assign(target) {
	        if (target === undefined || target === null) {
	            throw new TypeError('Cannot convert undefined or null to object');
	        }

	        var output = Object(target);
	        for (var index = 1; index < arguments.length; index++) {
	            var source = arguments[index];
	            if (source !== undefined && source !== null) {
	                for (var nextKey in source) {
	                    if (source.hasOwnProperty(nextKey)) {
	                        output[nextKey] = source[nextKey];
	                    }
	                }
	            }
	        }
	        return output;
	    };
	} else {
	    assign = Object.assign;
	}

	/**
	 * extend object.
	 * means that properties in dest will be overwritten by the ones in src.
	 * @param {Object} dest
	 * @param {Object} src
	 * @param {Boolean} [merge=false]
	 * @returns {Object} dest
	 */
	var extend = deprecate(function extend(dest, src, merge) {
	    var keys = Object.keys(src);
	    var i = 0;
	    while (i < keys.length) {
	        if (!merge || (merge && dest[keys[i]] === undefined)) {
	            dest[keys[i]] = src[keys[i]];
	        }
	        i++;
	    }
	    return dest;
	}, 'extend', 'Use `assign`.');

	/**
	 * merge the values from src in the dest.
	 * means that properties that exist in dest will not be overwritten by src
	 * @param {Object} dest
	 * @param {Object} src
	 * @returns {Object} dest
	 */
	var merge = deprecate(function merge(dest, src) {
	    return extend(dest, src, true);
	}, 'merge', 'Use `assign`.');

	/**
	 * simple class inheritance
	 * @param {Function} child
	 * @param {Function} base
	 * @param {Object} [properties]
	 */
	function inherit(child, base, properties) {
	    var baseP = base.prototype,
	        childP;

	    childP = child.prototype = Object.create(baseP);
	    childP.constructor = child;
	    childP._super = baseP;

	    if (properties) {
	        assign(childP, properties);
	    }
	}

	/**
	 * simple function bind
	 * @param {Function} fn
	 * @param {Object} context
	 * @returns {Function}
	 */
	function bindFn(fn, context) {
	    return function boundFn() {
	        return fn.apply(context, arguments);
	    };
	}

	/**
	 * let a boolean value also be a function that must return a boolean
	 * this first item in args will be used as the context
	 * @param {Boolean|Function} val
	 * @param {Array} [args]
	 * @returns {Boolean}
	 */
	function boolOrFn(val, args) {
	    if (typeof val == TYPE_FUNCTION) {
	        return val.apply(args ? args[0] || undefined : undefined, args);
	    }
	    return val;
	}

	/**
	 * use the val2 when val1 is undefined
	 * @param {*} val1
	 * @param {*} val2
	 * @returns {*}
	 */
	function ifUndefined(val1, val2) {
	    return (val1 === undefined) ? val2 : val1;
	}

	/**
	 * addEventListener with multiple events at once
	 * @param {EventTarget} target
	 * @param {String} types
	 * @param {Function} handler
	 */
	function addEventListeners(target, types, handler) {
	    each(splitStr(types), function(type) {
	        target.addEventListener(type, handler, false);
	    });
	}

	/**
	 * removeEventListener with multiple events at once
	 * @param {EventTarget} target
	 * @param {String} types
	 * @param {Function} handler
	 */
	function removeEventListeners(target, types, handler) {
	    each(splitStr(types), function(type) {
	        target.removeEventListener(type, handler, false);
	    });
	}

	/**
	 * find if a node is in the given parent
	 * @method hasParent
	 * @param {HTMLElement} node
	 * @param {HTMLElement} parent
	 * @return {Boolean} found
	 */
	function hasParent(node, parent) {
	    while (node) {
	        if (node == parent) {
	            return true;
	        }
	        node = node.parentNode;
	    }
	    return false;
	}

	/**
	 * small indexOf wrapper
	 * @param {String} str
	 * @param {String} find
	 * @returns {Boolean} found
	 */
	function inStr(str, find) {
	    return str.indexOf(find) > -1;
	}

	/**
	 * split string on whitespace
	 * @param {String} str
	 * @returns {Array} words
	 */
	function splitStr(str) {
	    return str.trim().split(/\s+/g);
	}

	/**
	 * find if a array contains the object using indexOf or a simple polyFill
	 * @param {Array} src
	 * @param {String} find
	 * @param {String} [findByKey]
	 * @return {Boolean|Number} false when not found, or the index
	 */
	function inArray(src, find, findByKey) {
	    if (src.indexOf && !findByKey) {
	        return src.indexOf(find);
	    } else {
	        var i = 0;
	        while (i < src.length) {
	            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
	                return i;
	            }
	            i++;
	        }
	        return -1;
	    }
	}

	/**
	 * convert array-like objects to real arrays
	 * @param {Object} obj
	 * @returns {Array}
	 */
	function toArray(obj) {
	    return Array.prototype.slice.call(obj, 0);
	}

	/**
	 * unique array with objects based on a key (like 'id') or just by the array's value
	 * @param {Array} src [{id:1},{id:2},{id:1}]
	 * @param {String} [key]
	 * @param {Boolean} [sort=False]
	 * @returns {Array} [{id:1},{id:2}]
	 */
	function uniqueArray(src, key, sort) {
	    var results = [];
	    var values = [];
	    var i = 0;

	    while (i < src.length) {
	        var val = key ? src[i][key] : src[i];
	        if (inArray(values, val) < 0) {
	            results.push(src[i]);
	        }
	        values[i] = val;
	        i++;
	    }

	    if (sort) {
	        if (!key) {
	            results = results.sort();
	        } else {
	            results = results.sort(function sortUniqueArray(a, b) {
	                return a[key] > b[key];
	            });
	        }
	    }

	    return results;
	}

	/**
	 * get the prefixed property
	 * @param {Object} obj
	 * @param {String} property
	 * @returns {String|Undefined} prefixed
	 */
	function prefixed(obj, property) {
	    var prefix, prop;
	    var camelProp = property[0].toUpperCase() + property.slice(1);

	    var i = 0;
	    while (i < VENDOR_PREFIXES.length) {
	        prefix = VENDOR_PREFIXES[i];
	        prop = (prefix) ? prefix + camelProp : property;

	        if (prop in obj) {
	            return prop;
	        }
	        i++;
	    }
	    return undefined;
	}

	/**
	 * get a unique id
	 * @returns {number} uniqueId
	 */
	var _uniqueId = 1;
	function uniqueId() {
	    return _uniqueId++;
	}

	/**
	 * get the window object of an element
	 * @param {HTMLElement} element
	 * @returns {DocumentView|Window}
	 */
	function getWindowForElement(element) {
	    var doc = element.ownerDocument || element;
	    return (doc.defaultView || doc.parentWindow || window);
	}

	var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

	var SUPPORT_TOUCH = ('ontouchstart' in window);
	var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
	var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

	var INPUT_TYPE_TOUCH = 'touch';
	var INPUT_TYPE_PEN = 'pen';
	var INPUT_TYPE_MOUSE = 'mouse';
	var INPUT_TYPE_KINECT = 'kinect';

	var COMPUTE_INTERVAL = 25;

	var INPUT_START = 1;
	var INPUT_MOVE = 2;
	var INPUT_END = 4;
	var INPUT_CANCEL = 8;

	var DIRECTION_NONE = 1;
	var DIRECTION_LEFT = 2;
	var DIRECTION_RIGHT = 4;
	var DIRECTION_UP = 8;
	var DIRECTION_DOWN = 16;

	var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
	var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
	var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

	var PROPS_XY = ['x', 'y'];
	var PROPS_CLIENT_XY = ['clientX', 'clientY'];

	/**
	 * create new input type manager
	 * @param {Manager} manager
	 * @param {Function} callback
	 * @returns {Input}
	 * @constructor
	 */
	function Input(manager, callback) {
	    var self = this;
	    this.manager = manager;
	    this.callback = callback;
	    this.element = manager.element;
	    this.target = manager.options.inputTarget;

	    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
	    // so when disabled the input events are completely bypassed.
	    this.domHandler = function(ev) {
	        if (boolOrFn(manager.options.enable, [manager])) {
	            self.handler(ev);
	        }
	    };

	    this.init();

	}

	Input.prototype = {
	    /**
	     * should handle the inputEvent data and trigger the callback
	     * @virtual
	     */
	    handler: function() { },

	    /**
	     * bind the events
	     */
	    init: function() {
	        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
	        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
	        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
	    },

	    /**
	     * unbind the events
	     */
	    destroy: function() {
	        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
	        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
	        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
	    }
	};

	/**
	 * create new input type manager
	 * called by the Manager constructor
	 * @param {Hammer} manager
	 * @returns {Input}
	 */
	function createInputInstance(manager) {
	    var Type;
	    var inputClass = manager.options.inputClass;

	    if (inputClass) {
	        Type = inputClass;
	    } else if (SUPPORT_POINTER_EVENTS) {
	        Type = PointerEventInput;
	    } else if (SUPPORT_ONLY_TOUCH) {
	        Type = TouchInput;
	    } else if (!SUPPORT_TOUCH) {
	        Type = MouseInput;
	    } else {
	        Type = TouchMouseInput;
	    }
	    return new (Type)(manager, inputHandler);
	}

	/**
	 * handle input events
	 * @param {Manager} manager
	 * @param {String} eventType
	 * @param {Object} input
	 */
	function inputHandler(manager, eventType, input) {
	    var pointersLen = input.pointers.length;
	    var changedPointersLen = input.changedPointers.length;
	    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
	    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

	    input.isFirst = !!isFirst;
	    input.isFinal = !!isFinal;

	    if (isFirst) {
	        manager.session = {};
	    }

	    // source event is the normalized value of the domEvents
	    // like 'touchstart, mouseup, pointerdown'
	    input.eventType = eventType;

	    // compute scale, rotation etc
	    computeInputData(manager, input);

	    // emit secret event
	    manager.emit('hammer.input', input);

	    manager.recognize(input);
	    manager.session.prevInput = input;
	}

	/**
	 * extend the data with some usable properties like scale, rotate, velocity etc
	 * @param {Object} manager
	 * @param {Object} input
	 */
	function computeInputData(manager, input) {
	    var session = manager.session;
	    var pointers = input.pointers;
	    var pointersLength = pointers.length;

	    // store the first input to calculate the distance and direction
	    if (!session.firstInput) {
	        session.firstInput = simpleCloneInputData(input);
	    }

	    // to compute scale and rotation we need to store the multiple touches
	    if (pointersLength > 1 && !session.firstMultiple) {
	        session.firstMultiple = simpleCloneInputData(input);
	    } else if (pointersLength === 1) {
	        session.firstMultiple = false;
	    }

	    var firstInput = session.firstInput;
	    var firstMultiple = session.firstMultiple;
	    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

	    var center = input.center = getCenter(pointers);
	    input.timeStamp = now();
	    input.deltaTime = input.timeStamp - firstInput.timeStamp;

	    input.angle = getAngle(offsetCenter, center);
	    input.distance = getDistance(offsetCenter, center);

	    computeDeltaXY(session, input);
	    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

	    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
	    input.overallVelocityX = overallVelocity.x;
	    input.overallVelocityY = overallVelocity.y;
	    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

	    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
	    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

	    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
	        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

	    computeIntervalInputData(session, input);

	    // find the correct target
	    var target = manager.element;
	    if (hasParent(input.srcEvent.target, target)) {
	        target = input.srcEvent.target;
	    }
	    input.target = target;
	}

	function computeDeltaXY(session, input) {
	    var center = input.center;
	    var offset = session.offsetDelta || {};
	    var prevDelta = session.prevDelta || {};
	    var prevInput = session.prevInput || {};

	    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
	        prevDelta = session.prevDelta = {
	            x: prevInput.deltaX || 0,
	            y: prevInput.deltaY || 0
	        };

	        offset = session.offsetDelta = {
	            x: center.x,
	            y: center.y
	        };
	    }

	    input.deltaX = prevDelta.x + (center.x - offset.x);
	    input.deltaY = prevDelta.y + (center.y - offset.y);
	}

	/**
	 * velocity is calculated every x ms
	 * @param {Object} session
	 * @param {Object} input
	 */
	function computeIntervalInputData(session, input) {
	    var last = session.lastInterval || input,
	        deltaTime = input.timeStamp - last.timeStamp,
	        velocity, velocityX, velocityY, direction;

	    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
	        var deltaX = input.deltaX - last.deltaX;
	        var deltaY = input.deltaY - last.deltaY;

	        var v = getVelocity(deltaTime, deltaX, deltaY);
	        velocityX = v.x;
	        velocityY = v.y;
	        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
	        direction = getDirection(deltaX, deltaY);

	        session.lastInterval = input;
	    } else {
	        // use latest velocity info if it doesn't overtake a minimum period
	        velocity = last.velocity;
	        velocityX = last.velocityX;
	        velocityY = last.velocityY;
	        direction = last.direction;
	    }

	    input.velocity = velocity;
	    input.velocityX = velocityX;
	    input.velocityY = velocityY;
	    input.direction = direction;
	}

	/**
	 * create a simple clone from the input used for storage of firstInput and firstMultiple
	 * @param {Object} input
	 * @returns {Object} clonedInputData
	 */
	function simpleCloneInputData(input) {
	    // make a simple copy of the pointers because we will get a reference if we don't
	    // we only need clientXY for the calculations
	    var pointers = [];
	    var i = 0;
	    while (i < input.pointers.length) {
	        pointers[i] = {
	            clientX: round(input.pointers[i].clientX),
	            clientY: round(input.pointers[i].clientY)
	        };
	        i++;
	    }

	    return {
	        timeStamp: now(),
	        pointers: pointers,
	        center: getCenter(pointers),
	        deltaX: input.deltaX,
	        deltaY: input.deltaY
	    };
	}

	/**
	 * get the center of all the pointers
	 * @param {Array} pointers
	 * @return {Object} center contains `x` and `y` properties
	 */
	function getCenter(pointers) {
	    var pointersLength = pointers.length;

	    // no need to loop when only one touch
	    if (pointersLength === 1) {
	        return {
	            x: round(pointers[0].clientX),
	            y: round(pointers[0].clientY)
	        };
	    }

	    var x = 0, y = 0, i = 0;
	    while (i < pointersLength) {
	        x += pointers[i].clientX;
	        y += pointers[i].clientY;
	        i++;
	    }

	    return {
	        x: round(x / pointersLength),
	        y: round(y / pointersLength)
	    };
	}

	/**
	 * calculate the velocity between two points. unit is in px per ms.
	 * @param {Number} deltaTime
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Object} velocity `x` and `y`
	 */
	function getVelocity(deltaTime, x, y) {
	    return {
	        x: x / deltaTime || 0,
	        y: y / deltaTime || 0
	    };
	}

	/**
	 * get the direction between two points
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Number} direction
	 */
	function getDirection(x, y) {
	    if (x === y) {
	        return DIRECTION_NONE;
	    }

	    if (abs(x) >= abs(y)) {
	        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
	    }
	    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
	}

	/**
	 * calculate the absolute distance between two points
	 * @param {Object} p1 {x, y}
	 * @param {Object} p2 {x, y}
	 * @param {Array} [props] containing x and y keys
	 * @return {Number} distance
	 */
	function getDistance(p1, p2, props) {
	    if (!props) {
	        props = PROPS_XY;
	    }
	    var x = p2[props[0]] - p1[props[0]],
	        y = p2[props[1]] - p1[props[1]];

	    return Math.sqrt((x * x) + (y * y));
	}

	/**
	 * calculate the angle between two coordinates
	 * @param {Object} p1
	 * @param {Object} p2
	 * @param {Array} [props] containing x and y keys
	 * @return {Number} angle
	 */
	function getAngle(p1, p2, props) {
	    if (!props) {
	        props = PROPS_XY;
	    }
	    var x = p2[props[0]] - p1[props[0]],
	        y = p2[props[1]] - p1[props[1]];
	    return Math.atan2(y, x) * 180 / Math.PI;
	}

	/**
	 * calculate the rotation degrees between two pointersets
	 * @param {Array} start array of pointers
	 * @param {Array} end array of pointers
	 * @return {Number} rotation
	 */
	function getRotation(start, end) {
	    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
	}

	/**
	 * calculate the scale factor between two pointersets
	 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
	 * @param {Array} start array of pointers
	 * @param {Array} end array of pointers
	 * @return {Number} scale
	 */
	function getScale(start, end) {
	    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
	}

	var MOUSE_INPUT_MAP = {
	    mousedown: INPUT_START,
	    mousemove: INPUT_MOVE,
	    mouseup: INPUT_END
	};

	var MOUSE_ELEMENT_EVENTS = 'mousedown';
	var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

	/**
	 * Mouse events input
	 * @constructor
	 * @extends Input
	 */
	function MouseInput() {
	    this.evEl = MOUSE_ELEMENT_EVENTS;
	    this.evWin = MOUSE_WINDOW_EVENTS;

	    this.pressed = false; // mousedown state

	    Input.apply(this, arguments);
	}

	inherit(MouseInput, Input, {
	    /**
	     * handle mouse events
	     * @param {Object} ev
	     */
	    handler: function MEhandler(ev) {
	        var eventType = MOUSE_INPUT_MAP[ev.type];

	        // on start we want to have the left mouse button down
	        if (eventType & INPUT_START && ev.button === 0) {
	            this.pressed = true;
	        }

	        if (eventType & INPUT_MOVE && ev.which !== 1) {
	            eventType = INPUT_END;
	        }

	        // mouse must be down
	        if (!this.pressed) {
	            return;
	        }

	        if (eventType & INPUT_END) {
	            this.pressed = false;
	        }

	        this.callback(this.manager, eventType, {
	            pointers: [ev],
	            changedPointers: [ev],
	            pointerType: INPUT_TYPE_MOUSE,
	            srcEvent: ev
	        });
	    }
	});

	var POINTER_INPUT_MAP = {
	    pointerdown: INPUT_START,
	    pointermove: INPUT_MOVE,
	    pointerup: INPUT_END,
	    pointercancel: INPUT_CANCEL,
	    pointerout: INPUT_CANCEL
	};

	// in IE10 the pointer types is defined as an enum
	var IE10_POINTER_TYPE_ENUM = {
	    2: INPUT_TYPE_TOUCH,
	    3: INPUT_TYPE_PEN,
	    4: INPUT_TYPE_MOUSE,
	    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
	};

	var POINTER_ELEMENT_EVENTS = 'pointerdown';
	var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

	// IE10 has prefixed support, and case-sensitive
	if (window.MSPointerEvent && !window.PointerEvent) {
	    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
	    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
	}

	/**
	 * Pointer events input
	 * @constructor
	 * @extends Input
	 */
	function PointerEventInput() {
	    this.evEl = POINTER_ELEMENT_EVENTS;
	    this.evWin = POINTER_WINDOW_EVENTS;

	    Input.apply(this, arguments);

	    this.store = (this.manager.session.pointerEvents = []);
	}

	inherit(PointerEventInput, Input, {
	    /**
	     * handle mouse events
	     * @param {Object} ev
	     */
	    handler: function PEhandler(ev) {
	        var store = this.store;
	        var removePointer = false;

	        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
	        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
	        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

	        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

	        // get index of the event in the store
	        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

	        // start and mouse must be down
	        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
	            if (storeIndex < 0) {
	                store.push(ev);
	                storeIndex = store.length - 1;
	            }
	        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
	            removePointer = true;
	        }

	        // it not found, so the pointer hasn't been down (so it's probably a hover)
	        if (storeIndex < 0) {
	            return;
	        }

	        // update the event in the store
	        store[storeIndex] = ev;

	        this.callback(this.manager, eventType, {
	            pointers: store,
	            changedPointers: [ev],
	            pointerType: pointerType,
	            srcEvent: ev
	        });

	        if (removePointer) {
	            // remove from the store
	            store.splice(storeIndex, 1);
	        }
	    }
	});

	var SINGLE_TOUCH_INPUT_MAP = {
	    touchstart: INPUT_START,
	    touchmove: INPUT_MOVE,
	    touchend: INPUT_END,
	    touchcancel: INPUT_CANCEL
	};

	var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
	var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

	/**
	 * Touch events input
	 * @constructor
	 * @extends Input
	 */
	function SingleTouchInput() {
	    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
	    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
	    this.started = false;

	    Input.apply(this, arguments);
	}

	inherit(SingleTouchInput, Input, {
	    handler: function TEhandler(ev) {
	        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

	        // should we handle the touch events?
	        if (type === INPUT_START) {
	            this.started = true;
	        }

	        if (!this.started) {
	            return;
	        }

	        var touches = normalizeSingleTouches.call(this, ev, type);

	        // when done, reset the started state
	        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
	            this.started = false;
	        }

	        this.callback(this.manager, type, {
	            pointers: touches[0],
	            changedPointers: touches[1],
	            pointerType: INPUT_TYPE_TOUCH,
	            srcEvent: ev
	        });
	    }
	});

	/**
	 * @this {TouchInput}
	 * @param {Object} ev
	 * @param {Number} type flag
	 * @returns {undefined|Array} [all, changed]
	 */
	function normalizeSingleTouches(ev, type) {
	    var all = toArray(ev.touches);
	    var changed = toArray(ev.changedTouches);

	    if (type & (INPUT_END | INPUT_CANCEL)) {
	        all = uniqueArray(all.concat(changed), 'identifier', true);
	    }

	    return [all, changed];
	}

	var TOUCH_INPUT_MAP = {
	    touchstart: INPUT_START,
	    touchmove: INPUT_MOVE,
	    touchend: INPUT_END,
	    touchcancel: INPUT_CANCEL
	};

	var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

	/**
	 * Multi-user touch events input
	 * @constructor
	 * @extends Input
	 */
	function TouchInput() {
	    this.evTarget = TOUCH_TARGET_EVENTS;
	    this.targetIds = {};

	    Input.apply(this, arguments);
	}

	inherit(TouchInput, Input, {
	    handler: function MTEhandler(ev) {
	        var type = TOUCH_INPUT_MAP[ev.type];
	        var touches = getTouches.call(this, ev, type);
	        if (!touches) {
	            return;
	        }

	        this.callback(this.manager, type, {
	            pointers: touches[0],
	            changedPointers: touches[1],
	            pointerType: INPUT_TYPE_TOUCH,
	            srcEvent: ev
	        });
	    }
	});

	/**
	 * @this {TouchInput}
	 * @param {Object} ev
	 * @param {Number} type flag
	 * @returns {undefined|Array} [all, changed]
	 */
	function getTouches(ev, type) {
	    var allTouches = toArray(ev.touches);
	    var targetIds = this.targetIds;

	    // when there is only one touch, the process can be simplified
	    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
	        targetIds[allTouches[0].identifier] = true;
	        return [allTouches, allTouches];
	    }

	    var i,
	        targetTouches,
	        changedTouches = toArray(ev.changedTouches),
	        changedTargetTouches = [],
	        target = this.target;

	    // get target touches from touches
	    targetTouches = allTouches.filter(function(touch) {
	        return hasParent(touch.target, target);
	    });

	    // collect touches
	    if (type === INPUT_START) {
	        i = 0;
	        while (i < targetTouches.length) {
	            targetIds[targetTouches[i].identifier] = true;
	            i++;
	        }
	    }

	    // filter changed touches to only contain touches that exist in the collected target ids
	    i = 0;
	    while (i < changedTouches.length) {
	        if (targetIds[changedTouches[i].identifier]) {
	            changedTargetTouches.push(changedTouches[i]);
	        }

	        // cleanup removed touches
	        if (type & (INPUT_END | INPUT_CANCEL)) {
	            delete targetIds[changedTouches[i].identifier];
	        }
	        i++;
	    }

	    if (!changedTargetTouches.length) {
	        return;
	    }

	    return [
	        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
	        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
	        changedTargetTouches
	    ];
	}

	/**
	 * Combined touch and mouse input
	 *
	 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
	 * This because touch devices also emit mouse events while doing a touch.
	 *
	 * @constructor
	 * @extends Input
	 */

	var DEDUP_TIMEOUT = 2500;
	var DEDUP_DISTANCE = 25;

	function TouchMouseInput() {
	    Input.apply(this, arguments);

	    var handler = bindFn(this.handler, this);
	    this.touch = new TouchInput(this.manager, handler);
	    this.mouse = new MouseInput(this.manager, handler);

	    this.primaryTouch = null;
	    this.lastTouches = [];
	}

	inherit(TouchMouseInput, Input, {
	    /**
	     * handle mouse and touch events
	     * @param {Hammer} manager
	     * @param {String} inputEvent
	     * @param {Object} inputData
	     */
	    handler: function TMEhandler(manager, inputEvent, inputData) {
	        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
	            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

	        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
	            return;
	        }

	        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
	        if (isTouch) {
	            recordTouches.call(this, inputEvent, inputData);
	        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
	            return;
	        }

	        this.callback(manager, inputEvent, inputData);
	    },

	    /**
	     * remove the event listeners
	     */
	    destroy: function destroy() {
	        this.touch.destroy();
	        this.mouse.destroy();
	    }
	});

	function recordTouches(eventType, eventData) {
	    if (eventType & INPUT_START) {
	        this.primaryTouch = eventData.changedPointers[0].identifier;
	        setLastTouch.call(this, eventData);
	    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
	        setLastTouch.call(this, eventData);
	    }
	}

	function setLastTouch(eventData) {
	    var touch = eventData.changedPointers[0];

	    if (touch.identifier === this.primaryTouch) {
	        var lastTouch = {x: touch.clientX, y: touch.clientY};
	        this.lastTouches.push(lastTouch);
	        var lts = this.lastTouches;
	        var removeLastTouch = function() {
	            var i = lts.indexOf(lastTouch);
	            if (i > -1) {
	                lts.splice(i, 1);
	            }
	        };
	        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
	    }
	}

	function isSyntheticEvent(eventData) {
	    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
	    for (var i = 0; i < this.lastTouches.length; i++) {
	        var t = this.lastTouches[i];
	        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
	        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
	            return true;
	        }
	    }
	    return false;
	}

	var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
	var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

	// magical touchAction value
	var TOUCH_ACTION_COMPUTE = 'compute';
	var TOUCH_ACTION_AUTO = 'auto';
	var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
	var TOUCH_ACTION_NONE = 'none';
	var TOUCH_ACTION_PAN_X = 'pan-x';
	var TOUCH_ACTION_PAN_Y = 'pan-y';
	var TOUCH_ACTION_MAP = getTouchActionProps();

	/**
	 * Touch Action
	 * sets the touchAction property or uses the js alternative
	 * @param {Manager} manager
	 * @param {String} value
	 * @constructor
	 */
	function TouchAction(manager, value) {
	    this.manager = manager;
	    this.set(value);
	}

	TouchAction.prototype = {
	    /**
	     * set the touchAction value on the element or enable the polyfill
	     * @param {String} value
	     */
	    set: function(value) {
	        // find out the touch-action by the event handlers
	        if (value == TOUCH_ACTION_COMPUTE) {
	            value = this.compute();
	        }

	        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
	            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
	        }
	        this.actions = value.toLowerCase().trim();
	    },

	    /**
	     * just re-set the touchAction value
	     */
	    update: function() {
	        this.set(this.manager.options.touchAction);
	    },

	    /**
	     * compute the value for the touchAction property based on the recognizer's settings
	     * @returns {String} value
	     */
	    compute: function() {
	        var actions = [];
	        each(this.manager.recognizers, function(recognizer) {
	            if (boolOrFn(recognizer.options.enable, [recognizer])) {
	                actions = actions.concat(recognizer.getTouchAction());
	            }
	        });
	        return cleanTouchActions(actions.join(' '));
	    },

	    /**
	     * this method is called on each input cycle and provides the preventing of the browser behavior
	     * @param {Object} input
	     */
	    preventDefaults: function(input) {
	        var srcEvent = input.srcEvent;
	        var direction = input.offsetDirection;

	        // if the touch action did prevented once this session
	        if (this.manager.session.prevented) {
	            srcEvent.preventDefault();
	            return;
	        }

	        var actions = this.actions;
	        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
	        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
	        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

	        if (hasNone) {
	            //do not prevent defaults if this is a tap gesture

	            var isTapPointer = input.pointers.length === 1;
	            var isTapMovement = input.distance < 2;
	            var isTapTouchTime = input.deltaTime < 250;

	            if (isTapPointer && isTapMovement && isTapTouchTime) {
	                return;
	            }
	        }

	        if (hasPanX && hasPanY) {
	            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
	            return;
	        }

	        if (hasNone ||
	            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
	            (hasPanX && direction & DIRECTION_VERTICAL)) {
	            return this.preventSrc(srcEvent);
	        }
	    },

	    /**
	     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
	     * @param {Object} srcEvent
	     */
	    preventSrc: function(srcEvent) {
	        this.manager.session.prevented = true;
	        srcEvent.preventDefault();
	    }
	};

	/**
	 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
	 * @param {String} actions
	 * @returns {*}
	 */
	function cleanTouchActions(actions) {
	    // none
	    if (inStr(actions, TOUCH_ACTION_NONE)) {
	        return TOUCH_ACTION_NONE;
	    }

	    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
	    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

	    // if both pan-x and pan-y are set (different recognizers
	    // for different directions, e.g. horizontal pan but vertical swipe?)
	    // we need none (as otherwise with pan-x pan-y combined none of these
	    // recognizers will work, since the browser would handle all panning
	    if (hasPanX && hasPanY) {
	        return TOUCH_ACTION_NONE;
	    }

	    // pan-x OR pan-y
	    if (hasPanX || hasPanY) {
	        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
	    }

	    // manipulation
	    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
	        return TOUCH_ACTION_MANIPULATION;
	    }

	    return TOUCH_ACTION_AUTO;
	}

	function getTouchActionProps() {
	    if (!NATIVE_TOUCH_ACTION) {
	        return false;
	    }
	    var touchMap = {};
	    var cssSupports = window.CSS && window.CSS.supports;
	    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

	        // If css.supports is not supported but there is native touch-action assume it supports
	        // all values. This is the case for IE 10 and 11.
	        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
	    });
	    return touchMap;
	}

	/**
	 * Recognizer flow explained; *
	 * All recognizers have the initial state of POSSIBLE when a input session starts.
	 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
	 * Example session for mouse-input: mousedown -> mousemove -> mouseup
	 *
	 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
	 * which determines with state it should be.
	 *
	 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
	 * POSSIBLE to give it another change on the next cycle.
	 *
	 *               Possible
	 *                  |
	 *            +-----+---------------+
	 *            |                     |
	 *      +-----+-----+               |
	 *      |           |               |
	 *   Failed      Cancelled          |
	 *                          +-------+------+
	 *                          |              |
	 *                      Recognized       Began
	 *                                         |
	 *                                      Changed
	 *                                         |
	 *                                  Ended/Recognized
	 */
	var STATE_POSSIBLE = 1;
	var STATE_BEGAN = 2;
	var STATE_CHANGED = 4;
	var STATE_ENDED = 8;
	var STATE_RECOGNIZED = STATE_ENDED;
	var STATE_CANCELLED = 16;
	var STATE_FAILED = 32;

	/**
	 * Recognizer
	 * Every recognizer needs to extend from this class.
	 * @constructor
	 * @param {Object} options
	 */
	function Recognizer(options) {
	    this.options = assign({}, this.defaults, options || {});

	    this.id = uniqueId();

	    this.manager = null;

	    // default is enable true
	    this.options.enable = ifUndefined(this.options.enable, true);

	    this.state = STATE_POSSIBLE;

	    this.simultaneous = {};
	    this.requireFail = [];
	}

	Recognizer.prototype = {
	    /**
	     * @virtual
	     * @type {Object}
	     */
	    defaults: {},

	    /**
	     * set options
	     * @param {Object} options
	     * @return {Recognizer}
	     */
	    set: function(options) {
	        assign(this.options, options);

	        // also update the touchAction, in case something changed about the directions/enabled state
	        this.manager && this.manager.touchAction.update();
	        return this;
	    },

	    /**
	     * recognize simultaneous with an other recognizer.
	     * @param {Recognizer} otherRecognizer
	     * @returns {Recognizer} this
	     */
	    recognizeWith: function(otherRecognizer) {
	        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
	            return this;
	        }

	        var simultaneous = this.simultaneous;
	        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
	        if (!simultaneous[otherRecognizer.id]) {
	            simultaneous[otherRecognizer.id] = otherRecognizer;
	            otherRecognizer.recognizeWith(this);
	        }
	        return this;
	    },

	    /**
	     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
	     * @param {Recognizer} otherRecognizer
	     * @returns {Recognizer} this
	     */
	    dropRecognizeWith: function(otherRecognizer) {
	        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
	            return this;
	        }

	        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
	        delete this.simultaneous[otherRecognizer.id];
	        return this;
	    },

	    /**
	     * recognizer can only run when an other is failing
	     * @param {Recognizer} otherRecognizer
	     * @returns {Recognizer} this
	     */
	    requireFailure: function(otherRecognizer) {
	        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
	            return this;
	        }

	        var requireFail = this.requireFail;
	        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
	        if (inArray(requireFail, otherRecognizer) === -1) {
	            requireFail.push(otherRecognizer);
	            otherRecognizer.requireFailure(this);
	        }
	        return this;
	    },

	    /**
	     * drop the requireFailure link. it does not remove the link on the other recognizer.
	     * @param {Recognizer} otherRecognizer
	     * @returns {Recognizer} this
	     */
	    dropRequireFailure: function(otherRecognizer) {
	        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
	            return this;
	        }

	        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
	        var index = inArray(this.requireFail, otherRecognizer);
	        if (index > -1) {
	            this.requireFail.splice(index, 1);
	        }
	        return this;
	    },

	    /**
	     * has require failures boolean
	     * @returns {boolean}
	     */
	    hasRequireFailures: function() {
	        return this.requireFail.length > 0;
	    },

	    /**
	     * if the recognizer can recognize simultaneous with an other recognizer
	     * @param {Recognizer} otherRecognizer
	     * @returns {Boolean}
	     */
	    canRecognizeWith: function(otherRecognizer) {
	        return !!this.simultaneous[otherRecognizer.id];
	    },

	    /**
	     * You should use `tryEmit` instead of `emit` directly to check
	     * that all the needed recognizers has failed before emitting.
	     * @param {Object} input
	     */
	    emit: function(input) {
	        var self = this;
	        var state = this.state;

	        function emit(event) {
	            self.manager.emit(event, input);
	        }

	        // 'panstart' and 'panmove'
	        if (state < STATE_ENDED) {
	            emit(self.options.event + stateStr(state));
	        }

	        emit(self.options.event); // simple 'eventName' events

	        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
	            emit(input.additionalEvent);
	        }

	        // panend and pancancel
	        if (state >= STATE_ENDED) {
	            emit(self.options.event + stateStr(state));
	        }
	    },

	    /**
	     * Check that all the require failure recognizers has failed,
	     * if true, it emits a gesture event,
	     * otherwise, setup the state to FAILED.
	     * @param {Object} input
	     */
	    tryEmit: function(input) {
	        if (this.canEmit()) {
	            return this.emit(input);
	        }
	        // it's failing anyway
	        this.state = STATE_FAILED;
	    },

	    /**
	     * can we emit?
	     * @returns {boolean}
	     */
	    canEmit: function() {
	        var i = 0;
	        while (i < this.requireFail.length) {
	            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
	                return false;
	            }
	            i++;
	        }
	        return true;
	    },

	    /**
	     * update the recognizer
	     * @param {Object} inputData
	     */
	    recognize: function(inputData) {
	        // make a new copy of the inputData
	        // so we can change the inputData without messing up the other recognizers
	        var inputDataClone = assign({}, inputData);

	        // is is enabled and allow recognizing?
	        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
	            this.reset();
	            this.state = STATE_FAILED;
	            return;
	        }

	        // reset when we've reached the end
	        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
	            this.state = STATE_POSSIBLE;
	        }

	        this.state = this.process(inputDataClone);

	        // the recognizer has recognized a gesture
	        // so trigger an event
	        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
	            this.tryEmit(inputDataClone);
	        }
	    },

	    /**
	     * return the state of the recognizer
	     * the actual recognizing happens in this method
	     * @virtual
	     * @param {Object} inputData
	     * @returns {Const} STATE
	     */
	    process: function(inputData) { }, // jshint ignore:line

	    /**
	     * return the preferred touch-action
	     * @virtual
	     * @returns {Array}
	     */
	    getTouchAction: function() { },

	    /**
	     * called when the gesture isn't allowed to recognize
	     * like when another is being recognized or it is disabled
	     * @virtual
	     */
	    reset: function() { }
	};

	/**
	 * get a usable string, used as event postfix
	 * @param {Const} state
	 * @returns {String} state
	 */
	function stateStr(state) {
	    if (state & STATE_CANCELLED) {
	        return 'cancel';
	    } else if (state & STATE_ENDED) {
	        return 'end';
	    } else if (state & STATE_CHANGED) {
	        return 'move';
	    } else if (state & STATE_BEGAN) {
	        return 'start';
	    }
	    return '';
	}

	/**
	 * direction cons to string
	 * @param {Const} direction
	 * @returns {String}
	 */
	function directionStr(direction) {
	    if (direction == DIRECTION_DOWN) {
	        return 'down';
	    } else if (direction == DIRECTION_UP) {
	        return 'up';
	    } else if (direction == DIRECTION_LEFT) {
	        return 'left';
	    } else if (direction == DIRECTION_RIGHT) {
	        return 'right';
	    }
	    return '';
	}

	/**
	 * get a recognizer by name if it is bound to a manager
	 * @param {Recognizer|String} otherRecognizer
	 * @param {Recognizer} recognizer
	 * @returns {Recognizer}
	 */
	function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
	    var manager = recognizer.manager;
	    if (manager) {
	        return manager.get(otherRecognizer);
	    }
	    return otherRecognizer;
	}

	/**
	 * This recognizer is just used as a base for the simple attribute recognizers.
	 * @constructor
	 * @extends Recognizer
	 */
	function AttrRecognizer() {
	    Recognizer.apply(this, arguments);
	}

	inherit(AttrRecognizer, Recognizer, {
	    /**
	     * @namespace
	     * @memberof AttrRecognizer
	     */
	    defaults: {
	        /**
	         * @type {Number}
	         * @default 1
	         */
	        pointers: 1
	    },

	    /**
	     * Used to check if it the recognizer receives valid input, like input.distance > 10.
	     * @memberof AttrRecognizer
	     * @param {Object} input
	     * @returns {Boolean} recognized
	     */
	    attrTest: function(input) {
	        var optionPointers = this.options.pointers;
	        return optionPointers === 0 || input.pointers.length === optionPointers;
	    },

	    /**
	     * Process the input and return the state for the recognizer
	     * @memberof AttrRecognizer
	     * @param {Object} input
	     * @returns {*} State
	     */
	    process: function(input) {
	        var state = this.state;
	        var eventType = input.eventType;

	        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
	        var isValid = this.attrTest(input);

	        // on cancel input and we've recognized before, return STATE_CANCELLED
	        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
	            return state | STATE_CANCELLED;
	        } else if (isRecognized || isValid) {
	            if (eventType & INPUT_END) {
	                return state | STATE_ENDED;
	            } else if (!(state & STATE_BEGAN)) {
	                return STATE_BEGAN;
	            }
	            return state | STATE_CHANGED;
	        }
	        return STATE_FAILED;
	    }
	});

	/**
	 * Pan
	 * Recognized when the pointer is down and moved in the allowed direction.
	 * @constructor
	 * @extends AttrRecognizer
	 */
	function PanRecognizer() {
	    AttrRecognizer.apply(this, arguments);

	    this.pX = null;
	    this.pY = null;
	}

	inherit(PanRecognizer, AttrRecognizer, {
	    /**
	     * @namespace
	     * @memberof PanRecognizer
	     */
	    defaults: {
	        event: 'pan',
	        threshold: 10,
	        pointers: 1,
	        direction: DIRECTION_ALL
	    },

	    getTouchAction: function() {
	        var direction = this.options.direction;
	        var actions = [];
	        if (direction & DIRECTION_HORIZONTAL) {
	            actions.push(TOUCH_ACTION_PAN_Y);
	        }
	        if (direction & DIRECTION_VERTICAL) {
	            actions.push(TOUCH_ACTION_PAN_X);
	        }
	        return actions;
	    },

	    directionTest: function(input) {
	        var options = this.options;
	        var hasMoved = true;
	        var distance = input.distance;
	        var direction = input.direction;
	        var x = input.deltaX;
	        var y = input.deltaY;

	        // lock to axis?
	        if (!(direction & options.direction)) {
	            if (options.direction & DIRECTION_HORIZONTAL) {
	                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
	                hasMoved = x != this.pX;
	                distance = Math.abs(input.deltaX);
	            } else {
	                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
	                hasMoved = y != this.pY;
	                distance = Math.abs(input.deltaY);
	            }
	        }
	        input.direction = direction;
	        return hasMoved && distance > options.threshold && direction & options.direction;
	    },

	    attrTest: function(input) {
	        return AttrRecognizer.prototype.attrTest.call(this, input) &&
	            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
	    },

	    emit: function(input) {

	        this.pX = input.deltaX;
	        this.pY = input.deltaY;

	        var direction = directionStr(input.direction);

	        if (direction) {
	            input.additionalEvent = this.options.event + direction;
	        }
	        this._super.emit.call(this, input);
	    }
	});

	/**
	 * Pinch
	 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
	 * @constructor
	 * @extends AttrRecognizer
	 */
	function PinchRecognizer() {
	    AttrRecognizer.apply(this, arguments);
	}

	inherit(PinchRecognizer, AttrRecognizer, {
	    /**
	     * @namespace
	     * @memberof PinchRecognizer
	     */
	    defaults: {
	        event: 'pinch',
	        threshold: 0,
	        pointers: 2
	    },

	    getTouchAction: function() {
	        return [TOUCH_ACTION_NONE];
	    },

	    attrTest: function(input) {
	        return this._super.attrTest.call(this, input) &&
	            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
	    },

	    emit: function(input) {
	        if (input.scale !== 1) {
	            var inOut = input.scale < 1 ? 'in' : 'out';
	            input.additionalEvent = this.options.event + inOut;
	        }
	        this._super.emit.call(this, input);
	    }
	});

	/**
	 * Press
	 * Recognized when the pointer is down for x ms without any movement.
	 * @constructor
	 * @extends Recognizer
	 */
	function PressRecognizer() {
	    Recognizer.apply(this, arguments);

	    this._timer = null;
	    this._input = null;
	}

	inherit(PressRecognizer, Recognizer, {
	    /**
	     * @namespace
	     * @memberof PressRecognizer
	     */
	    defaults: {
	        event: 'press',
	        pointers: 1,
	        time: 251, // minimal time of the pointer to be pressed
	        threshold: 9 // a minimal movement is ok, but keep it low
	    },

	    getTouchAction: function() {
	        return [TOUCH_ACTION_AUTO];
	    },

	    process: function(input) {
	        var options = this.options;
	        var validPointers = input.pointers.length === options.pointers;
	        var validMovement = input.distance < options.threshold;
	        var validTime = input.deltaTime > options.time;

	        this._input = input;

	        // we only allow little movement
	        // and we've reached an end event, so a tap is possible
	        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
	            this.reset();
	        } else if (input.eventType & INPUT_START) {
	            this.reset();
	            this._timer = setTimeoutContext(function() {
	                this.state = STATE_RECOGNIZED;
	                this.tryEmit();
	            }, options.time, this);
	        } else if (input.eventType & INPUT_END) {
	            return STATE_RECOGNIZED;
	        }
	        return STATE_FAILED;
	    },

	    reset: function() {
	        clearTimeout(this._timer);
	    },

	    emit: function(input) {
	        if (this.state !== STATE_RECOGNIZED) {
	            return;
	        }

	        if (input && (input.eventType & INPUT_END)) {
	            this.manager.emit(this.options.event + 'up', input);
	        } else {
	            this._input.timeStamp = now();
	            this.manager.emit(this.options.event, this._input);
	        }
	    }
	});

	/**
	 * Rotate
	 * Recognized when two or more pointer are moving in a circular motion.
	 * @constructor
	 * @extends AttrRecognizer
	 */
	function RotateRecognizer() {
	    AttrRecognizer.apply(this, arguments);
	}

	inherit(RotateRecognizer, AttrRecognizer, {
	    /**
	     * @namespace
	     * @memberof RotateRecognizer
	     */
	    defaults: {
	        event: 'rotate',
	        threshold: 0,
	        pointers: 2
	    },

	    getTouchAction: function() {
	        return [TOUCH_ACTION_NONE];
	    },

	    attrTest: function(input) {
	        return this._super.attrTest.call(this, input) &&
	            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
	    }
	});

	/**
	 * Swipe
	 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
	 * @constructor
	 * @extends AttrRecognizer
	 */
	function SwipeRecognizer() {
	    AttrRecognizer.apply(this, arguments);
	}

	inherit(SwipeRecognizer, AttrRecognizer, {
	    /**
	     * @namespace
	     * @memberof SwipeRecognizer
	     */
	    defaults: {
	        event: 'swipe',
	        threshold: 10,
	        velocity: 0.3,
	        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
	        pointers: 1
	    },

	    getTouchAction: function() {
	        return PanRecognizer.prototype.getTouchAction.call(this);
	    },

	    attrTest: function(input) {
	        var direction = this.options.direction;
	        var velocity;

	        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
	            velocity = input.overallVelocity;
	        } else if (direction & DIRECTION_HORIZONTAL) {
	            velocity = input.overallVelocityX;
	        } else if (direction & DIRECTION_VERTICAL) {
	            velocity = input.overallVelocityY;
	        }

	        return this._super.attrTest.call(this, input) &&
	            direction & input.offsetDirection &&
	            input.distance > this.options.threshold &&
	            input.maxPointers == this.options.pointers &&
	            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
	    },

	    emit: function(input) {
	        var direction = directionStr(input.offsetDirection);
	        if (direction) {
	            this.manager.emit(this.options.event + direction, input);
	        }

	        this.manager.emit(this.options.event, input);
	    }
	});

	/**
	 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
	 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
	 * a single tap.
	 *
	 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
	 * multi-taps being recognized.
	 * @constructor
	 * @extends Recognizer
	 */
	function TapRecognizer() {
	    Recognizer.apply(this, arguments);

	    // previous time and center,
	    // used for tap counting
	    this.pTime = false;
	    this.pCenter = false;

	    this._timer = null;
	    this._input = null;
	    this.count = 0;
	}

	inherit(TapRecognizer, Recognizer, {
	    /**
	     * @namespace
	     * @memberof PinchRecognizer
	     */
	    defaults: {
	        event: 'tap',
	        pointers: 1,
	        taps: 1,
	        interval: 300, // max time between the multi-tap taps
	        time: 250, // max time of the pointer to be down (like finger on the screen)
	        threshold: 9, // a minimal movement is ok, but keep it low
	        posThreshold: 10 // a multi-tap can be a bit off the initial position
	    },

	    getTouchAction: function() {
	        return [TOUCH_ACTION_MANIPULATION];
	    },

	    process: function(input) {
	        var options = this.options;

	        var validPointers = input.pointers.length === options.pointers;
	        var validMovement = input.distance < options.threshold;
	        var validTouchTime = input.deltaTime < options.time;

	        this.reset();

	        if ((input.eventType & INPUT_START) && (this.count === 0)) {
	            return this.failTimeout();
	        }

	        // we only allow little movement
	        // and we've reached an end event, so a tap is possible
	        if (validMovement && validTouchTime && validPointers) {
	            if (input.eventType != INPUT_END) {
	                return this.failTimeout();
	            }

	            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
	            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

	            this.pTime = input.timeStamp;
	            this.pCenter = input.center;

	            if (!validMultiTap || !validInterval) {
	                this.count = 1;
	            } else {
	                this.count += 1;
	            }

	            this._input = input;

	            // if tap count matches we have recognized it,
	            // else it has began recognizing...
	            var tapCount = this.count % options.taps;
	            if (tapCount === 0) {
	                // no failing requirements, immediately trigger the tap event
	                // or wait as long as the multitap interval to trigger
	                if (!this.hasRequireFailures()) {
	                    return STATE_RECOGNIZED;
	                } else {
	                    this._timer = setTimeoutContext(function() {
	                        this.state = STATE_RECOGNIZED;
	                        this.tryEmit();
	                    }, options.interval, this);
	                    return STATE_BEGAN;
	                }
	            }
	        }
	        return STATE_FAILED;
	    },

	    failTimeout: function() {
	        this._timer = setTimeoutContext(function() {
	            this.state = STATE_FAILED;
	        }, this.options.interval, this);
	        return STATE_FAILED;
	    },

	    reset: function() {
	        clearTimeout(this._timer);
	    },

	    emit: function() {
	        if (this.state == STATE_RECOGNIZED) {
	            this._input.tapCount = this.count;
	            this.manager.emit(this.options.event, this._input);
	        }
	    }
	});

	/**
	 * Simple way to create a manager with a default set of recognizers.
	 * @param {HTMLElement} element
	 * @param {Object} [options]
	 * @constructor
	 */
	function Hammer(element, options) {
	    options = options || {};
	    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
	    return new Manager(element, options);
	}

	/**
	 * @const {string}
	 */
	Hammer.VERSION = '2.0.7';

	/**
	 * default settings
	 * @namespace
	 */
	Hammer.defaults = {
	    /**
	     * set if DOM events are being triggered.
	     * But this is slower and unused by simple implementations, so disabled by default.
	     * @type {Boolean}
	     * @default false
	     */
	    domEvents: false,

	    /**
	     * The value for the touchAction property/fallback.
	     * When set to `compute` it will magically set the correct value based on the added recognizers.
	     * @type {String}
	     * @default compute
	     */
	    touchAction: TOUCH_ACTION_COMPUTE,

	    /**
	     * @type {Boolean}
	     * @default true
	     */
	    enable: true,

	    /**
	     * EXPERIMENTAL FEATURE -- can be removed/changed
	     * Change the parent input target element.
	     * If Null, then it is being set the to main element.
	     * @type {Null|EventTarget}
	     * @default null
	     */
	    inputTarget: null,

	    /**
	     * force an input class
	     * @type {Null|Function}
	     * @default null
	     */
	    inputClass: null,

	    /**
	     * Default recognizer setup when calling `Hammer()`
	     * When creating a new Manager these will be skipped.
	     * @type {Array}
	     */
	    preset: [
	        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
	        [RotateRecognizer, {enable: false}],
	        [PinchRecognizer, {enable: false}, ['rotate']],
	        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
	        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
	        [TapRecognizer],
	        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
	        [PressRecognizer]
	    ],

	    /**
	     * Some CSS properties can be used to improve the working of Hammer.
	     * Add them to this method and they will be set when creating a new Manager.
	     * @namespace
	     */
	    cssProps: {
	        /**
	         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
	         * @type {String}
	         * @default 'none'
	         */
	        userSelect: 'none',

	        /**
	         * Disable the Windows Phone grippers when pressing an element.
	         * @type {String}
	         * @default 'none'
	         */
	        touchSelect: 'none',

	        /**
	         * Disables the default callout shown when you touch and hold a touch target.
	         * On iOS, when you touch and hold a touch target such as a link, Safari displays
	         * a callout containing information about the link. This property allows you to disable that callout.
	         * @type {String}
	         * @default 'none'
	         */
	        touchCallout: 'none',

	        /**
	         * Specifies whether zooming is enabled. Used by IE10>
	         * @type {String}
	         * @default 'none'
	         */
	        contentZooming: 'none',

	        /**
	         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
	         * @type {String}
	         * @default 'none'
	         */
	        userDrag: 'none',

	        /**
	         * Overrides the highlight color shown when the user taps a link or a JavaScript
	         * clickable element in iOS. This property obeys the alpha value, if specified.
	         * @type {String}
	         * @default 'rgba(0,0,0,0)'
	         */
	        tapHighlightColor: 'rgba(0,0,0,0)'
	    }
	};

	var STOP = 1;
	var FORCED_STOP = 2;

	/**
	 * Manager
	 * @param {HTMLElement} element
	 * @param {Object} [options]
	 * @constructor
	 */
	function Manager(element, options) {
	    this.options = assign({}, Hammer.defaults, options || {});

	    this.options.inputTarget = this.options.inputTarget || element;

	    this.handlers = {};
	    this.session = {};
	    this.recognizers = [];
	    this.oldCssProps = {};

	    this.element = element;
	    this.input = createInputInstance(this);
	    this.touchAction = new TouchAction(this, this.options.touchAction);

	    toggleCssProps(this, true);

	    each(this.options.recognizers, function(item) {
	        var recognizer = this.add(new (item[0])(item[1]));
	        item[2] && recognizer.recognizeWith(item[2]);
	        item[3] && recognizer.requireFailure(item[3]);
	    }, this);
	}

	Manager.prototype = {
	    /**
	     * set options
	     * @param {Object} options
	     * @returns {Manager}
	     */
	    set: function(options) {
	        assign(this.options, options);

	        // Options that need a little more setup
	        if (options.touchAction) {
	            this.touchAction.update();
	        }
	        if (options.inputTarget) {
	            // Clean up existing event listeners and reinitialize
	            this.input.destroy();
	            this.input.target = options.inputTarget;
	            this.input.init();
	        }
	        return this;
	    },

	    /**
	     * stop recognizing for this session.
	     * This session will be discarded, when a new [input]start event is fired.
	     * When forced, the recognizer cycle is stopped immediately.
	     * @param {Boolean} [force]
	     */
	    stop: function(force) {
	        this.session.stopped = force ? FORCED_STOP : STOP;
	    },

	    /**
	     * run the recognizers!
	     * called by the inputHandler function on every movement of the pointers (touches)
	     * it walks through all the recognizers and tries to detect the gesture that is being made
	     * @param {Object} inputData
	     */
	    recognize: function(inputData) {
	        var session = this.session;
	        if (session.stopped) {
	            return;
	        }

	        // run the touch-action polyfill
	        this.touchAction.preventDefaults(inputData);

	        var recognizer;
	        var recognizers = this.recognizers;

	        // this holds the recognizer that is being recognized.
	        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
	        // if no recognizer is detecting a thing, it is set to `null`
	        var curRecognizer = session.curRecognizer;

	        // reset when the last recognizer is recognized
	        // or when we're in a new session
	        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
	            curRecognizer = session.curRecognizer = null;
	        }

	        var i = 0;
	        while (i < recognizers.length) {
	            recognizer = recognizers[i];

	            // find out if we are allowed try to recognize the input for this one.
	            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
	            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
	            //      that is being recognized.
	            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
	            //      this can be setup with the `recognizeWith()` method on the recognizer.
	            if (session.stopped !== FORCED_STOP && ( // 1
	                    !curRecognizer || recognizer == curRecognizer || // 2
	                    recognizer.canRecognizeWith(curRecognizer))) { // 3
	                recognizer.recognize(inputData);
	            } else {
	                recognizer.reset();
	            }

	            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
	            // current active recognizer. but only if we don't already have an active recognizer
	            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
	                curRecognizer = session.curRecognizer = recognizer;
	            }
	            i++;
	        }
	    },

	    /**
	     * get a recognizer by its event name.
	     * @param {Recognizer|String} recognizer
	     * @returns {Recognizer|Null}
	     */
	    get: function(recognizer) {
	        if (recognizer instanceof Recognizer) {
	            return recognizer;
	        }

	        var recognizers = this.recognizers;
	        for (var i = 0; i < recognizers.length; i++) {
	            if (recognizers[i].options.event == recognizer) {
	                return recognizers[i];
	            }
	        }
	        return null;
	    },

	    /**
	     * add a recognizer to the manager
	     * existing recognizers with the same event name will be removed
	     * @param {Recognizer} recognizer
	     * @returns {Recognizer|Manager}
	     */
	    add: function(recognizer) {
	        if (invokeArrayArg(recognizer, 'add', this)) {
	            return this;
	        }

	        // remove existing
	        var existing = this.get(recognizer.options.event);
	        if (existing) {
	            this.remove(existing);
	        }

	        this.recognizers.push(recognizer);
	        recognizer.manager = this;

	        this.touchAction.update();
	        return recognizer;
	    },

	    /**
	     * remove a recognizer by name or instance
	     * @param {Recognizer|String} recognizer
	     * @returns {Manager}
	     */
	    remove: function(recognizer) {
	        if (invokeArrayArg(recognizer, 'remove', this)) {
	            return this;
	        }

	        recognizer = this.get(recognizer);

	        // let's make sure this recognizer exists
	        if (recognizer) {
	            var recognizers = this.recognizers;
	            var index = inArray(recognizers, recognizer);

	            if (index !== -1) {
	                recognizers.splice(index, 1);
	                this.touchAction.update();
	            }
	        }

	        return this;
	    },

	    /**
	     * bind event
	     * @param {String} events
	     * @param {Function} handler
	     * @returns {EventEmitter} this
	     */
	    on: function(events, handler) {
	        if (events === undefined) {
	            return;
	        }
	        if (handler === undefined) {
	            return;
	        }

	        var handlers = this.handlers;
	        each(splitStr(events), function(event) {
	            handlers[event] = handlers[event] || [];
	            handlers[event].push(handler);
	        });
	        return this;
	    },

	    /**
	     * unbind event, leave emit blank to remove all handlers
	     * @param {String} events
	     * @param {Function} [handler]
	     * @returns {EventEmitter} this
	     */
	    off: function(events, handler) {
	        if (events === undefined) {
	            return;
	        }

	        var handlers = this.handlers;
	        each(splitStr(events), function(event) {
	            if (!handler) {
	                delete handlers[event];
	            } else {
	                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
	            }
	        });
	        return this;
	    },

	    /**
	     * emit event to the listeners
	     * @param {String} event
	     * @param {Object} data
	     */
	    emit: function(event, data) {
	        // we also want to trigger dom events
	        if (this.options.domEvents) {
	            triggerDomEvent(event, data);
	        }

	        // no handlers, so skip it all
	        var handlers = this.handlers[event] && this.handlers[event].slice();
	        if (!handlers || !handlers.length) {
	            return;
	        }

	        data.type = event;
	        data.preventDefault = function() {
	            data.srcEvent.preventDefault();
	        };

	        var i = 0;
	        while (i < handlers.length) {
	            handlers[i](data);
	            i++;
	        }
	    },

	    /**
	     * destroy the manager and unbinds all events
	     * it doesn't unbind dom events, that is the user own responsibility
	     */
	    destroy: function() {
	        this.element && toggleCssProps(this, false);

	        this.handlers = {};
	        this.session = {};
	        this.input.destroy();
	        this.element = null;
	    }
	};

	/**
	 * add/remove the css properties as defined in manager.options.cssProps
	 * @param {Manager} manager
	 * @param {Boolean} add
	 */
	function toggleCssProps(manager, add) {
	    var element = manager.element;
	    if (!element.style) {
	        return;
	    }
	    var prop;
	    each(manager.options.cssProps, function(value, name) {
	        prop = prefixed(element.style, name);
	        if (add) {
	            manager.oldCssProps[prop] = element.style[prop];
	            element.style[prop] = value;
	        } else {
	            element.style[prop] = manager.oldCssProps[prop] || '';
	        }
	    });
	    if (!add) {
	        manager.oldCssProps = {};
	    }
	}

	/**
	 * trigger dom event
	 * @param {String} event
	 * @param {Object} data
	 */
	function triggerDomEvent(event, data) {
	    var gestureEvent = document.createEvent('Event');
	    gestureEvent.initEvent(event, true, true);
	    gestureEvent.gesture = data;
	    data.target.dispatchEvent(gestureEvent);
	}

	assign(Hammer, {
	    INPUT_START: INPUT_START,
	    INPUT_MOVE: INPUT_MOVE,
	    INPUT_END: INPUT_END,
	    INPUT_CANCEL: INPUT_CANCEL,

	    STATE_POSSIBLE: STATE_POSSIBLE,
	    STATE_BEGAN: STATE_BEGAN,
	    STATE_CHANGED: STATE_CHANGED,
	    STATE_ENDED: STATE_ENDED,
	    STATE_RECOGNIZED: STATE_RECOGNIZED,
	    STATE_CANCELLED: STATE_CANCELLED,
	    STATE_FAILED: STATE_FAILED,

	    DIRECTION_NONE: DIRECTION_NONE,
	    DIRECTION_LEFT: DIRECTION_LEFT,
	    DIRECTION_RIGHT: DIRECTION_RIGHT,
	    DIRECTION_UP: DIRECTION_UP,
	    DIRECTION_DOWN: DIRECTION_DOWN,
	    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
	    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
	    DIRECTION_ALL: DIRECTION_ALL,

	    Manager: Manager,
	    Input: Input,
	    TouchAction: TouchAction,

	    TouchInput: TouchInput,
	    MouseInput: MouseInput,
	    PointerEventInput: PointerEventInput,
	    TouchMouseInput: TouchMouseInput,
	    SingleTouchInput: SingleTouchInput,

	    Recognizer: Recognizer,
	    AttrRecognizer: AttrRecognizer,
	    Tap: TapRecognizer,
	    Pan: PanRecognizer,
	    Swipe: SwipeRecognizer,
	    Pinch: PinchRecognizer,
	    Rotate: RotateRecognizer,
	    Press: PressRecognizer,

	    on: addEventListeners,
	    off: removeEventListeners,
	    each: each,
	    merge: merge,
	    extend: extend,
	    assign: assign,
	    inherit: inherit,
	    bindFn: bindFn,
	    prefixed: prefixed
	});

	// this prevents errors when Hammer is loaded in the presence of an AMD
	//  style loader but by script tag, not by the loader.
	var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
	freeGlobal.Hammer = Hammer;

	if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	        return Hammer;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (typeof module != 'undefined' && module.exports) {
	    module.exports = Hammer;
	} else {
	    window[exportName] = Hammer;
	}

	})(window, document, 'Hammer');


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _from = __webpack_require__(78);

	var _from2 = _interopRequireDefault(_from);

	var _map = __webpack_require__(88);

	var _map2 = _interopRequireDefault(_map);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var marked = __webpack_require__(92);

	// Render the slides markdown.
	module.exports = function (_ref) {
		var slideContainer = _ref.slideContainer;

		var m = new _map2.default();

		// store all of the innerHTMLs
		(0, _from2.default)(slideContainer.querySelectorAll('.marked')).forEach(function (o) {
			return m.set(o, o.innerHTML);
		});

		// then write them all out
		m.forEach(function (v, k) {
			return k.innerHTML = marked(v);
		});
	};

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(89), __esModule: true };

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(9);
	__webpack_require__(10);
	__webpack_require__(54);
	__webpack_require__(90);
	__webpack_require__(91);
	module.exports = __webpack_require__(18).Map;

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(59);

	// 23.1 Map Objects
	module.exports = __webpack_require__(69)('Map', function(get){
	  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key){
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value){
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(16);

	$export($export.P + $export.R, 'Map', {toJSON: __webpack_require__(75)('Map')});

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 */

	;(function() {

	/**
	 * Block-Level Grammar
	 */

	var block = {
	  newline: /^\n+/,
	  code: /^( {4}[^\n]+\n*)+/,
	  fences: noop,
	  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
	  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
	  nptable: noop,
	  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
	  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
	  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
	  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
	  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
	  table: noop,
	  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
	  text: /^[^\n]+/
	};

	block.bullet = /(?:[*+-]|\d+\.)/;
	block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
	block.item = replace(block.item, 'gm')
	  (/bull/g, block.bullet)
	  ();

	block.list = replace(block.list)
	  (/bull/g, block.bullet)
	  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
	  ('def', '\\n+(?=' + block.def.source + ')')
	  ();

	block.blockquote = replace(block.blockquote)
	  ('def', block.def)
	  ();

	block._tag = '(?!(?:'
	  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
	  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
	  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

	block.html = replace(block.html)
	  ('comment', /<!--[\s\S]*?-->/)
	  ('closed', /<(tag)[\s\S]+?<\/\1>/)
	  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
	  (/tag/g, block._tag)
	  ();

	block.paragraph = replace(block.paragraph)
	  ('hr', block.hr)
	  ('heading', block.heading)
	  ('lheading', block.lheading)
	  ('blockquote', block.blockquote)
	  ('tag', '<' + block._tag)
	  ('def', block.def)
	  ();

	/**
	 * Normal Block Grammar
	 */

	block.normal = merge({}, block);

	/**
	 * GFM Block Grammar
	 */

	block.gfm = merge({}, block.normal, {
	  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
	  paragraph: /^/,
	  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
	});

	block.gfm.paragraph = replace(block.paragraph)
	  ('(?!', '(?!'
	    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
	    + block.list.source.replace('\\1', '\\3') + '|')
	  ();

	/**
	 * GFM + Tables Block Grammar
	 */

	block.tables = merge({}, block.gfm, {
	  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
	  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
	});

	/**
	 * Block Lexer
	 */

	function Lexer(options) {
	  this.tokens = [];
	  this.tokens.links = {};
	  this.options = options || marked.defaults;
	  this.rules = block.normal;

	  if (this.options.gfm) {
	    if (this.options.tables) {
	      this.rules = block.tables;
	    } else {
	      this.rules = block.gfm;
	    }
	  }
	}

	/**
	 * Expose Block Rules
	 */

	Lexer.rules = block;

	/**
	 * Static Lex Method
	 */

	Lexer.lex = function(src, options) {
	  var lexer = new Lexer(options);
	  return lexer.lex(src);
	};

	/**
	 * Preprocessing
	 */

	Lexer.prototype.lex = function(src) {
	  src = src
	    .replace(/\r\n|\r/g, '\n')
	    .replace(/\t/g, '    ')
	    .replace(/\u00a0/g, ' ')
	    .replace(/\u2424/g, '\n');

	  return this.token(src, true);
	};

	/**
	 * Lexing
	 */

	Lexer.prototype.token = function(src, top, bq) {
	  var src = src.replace(/^ +$/gm, '')
	    , next
	    , loose
	    , cap
	    , bull
	    , b
	    , item
	    , space
	    , i
	    , l;

	  while (src) {
	    // newline
	    if (cap = this.rules.newline.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[0].length > 1) {
	        this.tokens.push({
	          type: 'space'
	        });
	      }
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      cap = cap[0].replace(/^ {4}/gm, '');
	      this.tokens.push({
	        type: 'code',
	        text: !this.options.pedantic
	          ? cap.replace(/\n+$/, '')
	          : cap
	      });
	      continue;
	    }

	    // fences (gfm)
	    if (cap = this.rules.fences.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'code',
	        lang: cap[2],
	        text: cap[3] || ''
	      });
	      continue;
	    }

	    // heading
	    if (cap = this.rules.heading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[1].length,
	        text: cap[2]
	      });
	      continue;
	    }

	    // table no leading pipe (gfm)
	    if (top && (cap = this.rules.nptable.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i].split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // lheading
	    if (cap = this.rules.lheading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[2] === '=' ? 1 : 2,
	        text: cap[1]
	      });
	      continue;
	    }

	    // hr
	    if (cap = this.rules.hr.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'hr'
	      });
	      continue;
	    }

	    // blockquote
	    if (cap = this.rules.blockquote.exec(src)) {
	      src = src.substring(cap[0].length);

	      this.tokens.push({
	        type: 'blockquote_start'
	      });

	      cap = cap[0].replace(/^ *> ?/gm, '');

	      // Pass `top` to keep the current
	      // "toplevel" state. This is exactly
	      // how markdown.pl works.
	      this.token(cap, top, true);

	      this.tokens.push({
	        type: 'blockquote_end'
	      });

	      continue;
	    }

	    // list
	    if (cap = this.rules.list.exec(src)) {
	      src = src.substring(cap[0].length);
	      bull = cap[2];

	      this.tokens.push({
	        type: 'list_start',
	        ordered: bull.length > 1
	      });

	      // Get each top-level item.
	      cap = cap[0].match(this.rules.item);

	      next = false;
	      l = cap.length;
	      i = 0;

	      for (; i < l; i++) {
	        item = cap[i];

	        // Remove the list item's bullet
	        // so it is seen as the next token.
	        space = item.length;
	        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

	        // Outdent whatever the
	        // list item contains. Hacky.
	        if (~item.indexOf('\n ')) {
	          space -= item.length;
	          item = !this.options.pedantic
	            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
	            : item.replace(/^ {1,4}/gm, '');
	        }

	        // Determine whether the next list item belongs here.
	        // Backpedal if it does not belong in this list.
	        if (this.options.smartLists && i !== l - 1) {
	          b = block.bullet.exec(cap[i + 1])[0];
	          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
	            src = cap.slice(i + 1).join('\n') + src;
	            i = l - 1;
	          }
	        }

	        // Determine whether item is loose or not.
	        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
	        // for discount behavior.
	        loose = next || /\n\n(?!\s*$)/.test(item);
	        if (i !== l - 1) {
	          next = item.charAt(item.length - 1) === '\n';
	          if (!loose) loose = next;
	        }

	        this.tokens.push({
	          type: loose
	            ? 'loose_item_start'
	            : 'list_item_start'
	        });

	        // Recurse.
	        this.token(item, false, bq);

	        this.tokens.push({
	          type: 'list_item_end'
	        });
	      }

	      this.tokens.push({
	        type: 'list_end'
	      });

	      continue;
	    }

	    // html
	    if (cap = this.rules.html.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: this.options.sanitize
	          ? 'paragraph'
	          : 'html',
	        pre: !this.options.sanitizer
	          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
	        text: cap[0]
	      });
	      continue;
	    }

	    // def
	    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.links[cap[1].toLowerCase()] = {
	        href: cap[2],
	        title: cap[3]
	      };
	      continue;
	    }

	    // table (gfm)
	    if (top && (cap = this.rules.table.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i]
	          .replace(/^ *\| *| *\| *$/g, '')
	          .split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // top-level paragraph
	    if (top && (cap = this.rules.paragraph.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'paragraph',
	        text: cap[1].charAt(cap[1].length - 1) === '\n'
	          ? cap[1].slice(0, -1)
	          : cap[1]
	      });
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      // Top-level should never reach here.
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'text',
	        text: cap[0]
	      });
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return this.tokens;
	};

	/**
	 * Inline-Level Grammar
	 */

	var inline = {
	  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
	  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
	  url: noop,
	  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
	  link: /^!?\[(inside)\]\(href\)/,
	  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
	  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
	  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
	  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
	  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
	  br: /^ {2,}\n(?!\s*$)/,
	  del: noop,
	  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
	};

	inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
	inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

	inline.link = replace(inline.link)
	  ('inside', inline._inside)
	  ('href', inline._href)
	  ();

	inline.reflink = replace(inline.reflink)
	  ('inside', inline._inside)
	  ();

	/**
	 * Normal Inline Grammar
	 */

	inline.normal = merge({}, inline);

	/**
	 * Pedantic Inline Grammar
	 */

	inline.pedantic = merge({}, inline.normal, {
	  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
	  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
	});

	/**
	 * GFM Inline Grammar
	 */

	inline.gfm = merge({}, inline.normal, {
	  escape: replace(inline.escape)('])', '~|])')(),
	  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
	  del: /^~~(?=\S)([\s\S]*?\S)~~/,
	  text: replace(inline.text)
	    (']|', '~]|')
	    ('|', '|https?://|')
	    ()
	});

	/**
	 * GFM + Line Breaks Inline Grammar
	 */

	inline.breaks = merge({}, inline.gfm, {
	  br: replace(inline.br)('{2,}', '*')(),
	  text: replace(inline.gfm.text)('{2,}', '*')()
	});

	/**
	 * Inline Lexer & Compiler
	 */

	function InlineLexer(links, options) {
	  this.options = options || marked.defaults;
	  this.links = links;
	  this.rules = inline.normal;
	  this.renderer = this.options.renderer || new Renderer;
	  this.renderer.options = this.options;

	  if (!this.links) {
	    throw new
	      Error('Tokens array requires a `links` property.');
	  }

	  if (this.options.gfm) {
	    if (this.options.breaks) {
	      this.rules = inline.breaks;
	    } else {
	      this.rules = inline.gfm;
	    }
	  } else if (this.options.pedantic) {
	    this.rules = inline.pedantic;
	  }
	}

	/**
	 * Expose Inline Rules
	 */

	InlineLexer.rules = inline;

	/**
	 * Static Lexing/Compiling Method
	 */

	InlineLexer.output = function(src, links, options) {
	  var inline = new InlineLexer(links, options);
	  return inline.output(src);
	};

	/**
	 * Lexing/Compiling
	 */

	InlineLexer.prototype.output = function(src) {
	  var out = ''
	    , link
	    , text
	    , href
	    , cap;

	  while (src) {
	    // escape
	    if (cap = this.rules.escape.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += cap[1];
	      continue;
	    }

	    // autolink
	    if (cap = this.rules.autolink.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[2] === '@') {
	        text = cap[1].charAt(6) === ':'
	          ? this.mangle(cap[1].substring(7))
	          : this.mangle(cap[1]);
	        href = this.mangle('mailto:') + text;
	      } else {
	        text = escape(cap[1]);
	        href = text;
	      }
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // url (gfm)
	    if (!this.inLink && (cap = this.rules.url.exec(src))) {
	      src = src.substring(cap[0].length);
	      text = escape(cap[1]);
	      href = text;
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // tag
	    if (cap = this.rules.tag.exec(src)) {
	      if (!this.inLink && /^<a /i.test(cap[0])) {
	        this.inLink = true;
	      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
	        this.inLink = false;
	      }
	      src = src.substring(cap[0].length);
	      out += this.options.sanitize
	        ? this.options.sanitizer
	          ? this.options.sanitizer(cap[0])
	          : escape(cap[0])
	        : cap[0]
	      continue;
	    }

	    // link
	    if (cap = this.rules.link.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.inLink = true;
	      out += this.outputLink(cap, {
	        href: cap[2],
	        title: cap[3]
	      });
	      this.inLink = false;
	      continue;
	    }

	    // reflink, nolink
	    if ((cap = this.rules.reflink.exec(src))
	        || (cap = this.rules.nolink.exec(src))) {
	      src = src.substring(cap[0].length);
	      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
	      link = this.links[link.toLowerCase()];
	      if (!link || !link.href) {
	        out += cap[0].charAt(0);
	        src = cap[0].substring(1) + src;
	        continue;
	      }
	      this.inLink = true;
	      out += this.outputLink(cap, link);
	      this.inLink = false;
	      continue;
	    }

	    // strong
	    if (cap = this.rules.strong.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.strong(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // em
	    if (cap = this.rules.em.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.em(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.codespan(escape(cap[2], true));
	      continue;
	    }

	    // br
	    if (cap = this.rules.br.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.br();
	      continue;
	    }

	    // del (gfm)
	    if (cap = this.rules.del.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.del(this.output(cap[1]));
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.text(escape(this.smartypants(cap[0])));
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return out;
	};

	/**
	 * Compile Link
	 */

	InlineLexer.prototype.outputLink = function(cap, link) {
	  var href = escape(link.href)
	    , title = link.title ? escape(link.title) : null;

	  return cap[0].charAt(0) !== '!'
	    ? this.renderer.link(href, title, this.output(cap[1]))
	    : this.renderer.image(href, title, escape(cap[1]));
	};

	/**
	 * Smartypants Transformations
	 */

	InlineLexer.prototype.smartypants = function(text) {
	  if (!this.options.smartypants) return text;
	  return text
	    // em-dashes
	    .replace(/---/g, '\u2014')
	    // en-dashes
	    .replace(/--/g, '\u2013')
	    // opening singles
	    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
	    // closing singles & apostrophes
	    .replace(/'/g, '\u2019')
	    // opening doubles
	    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
	    // closing doubles
	    .replace(/"/g, '\u201d')
	    // ellipses
	    .replace(/\.{3}/g, '\u2026');
	};

	/**
	 * Mangle Links
	 */

	InlineLexer.prototype.mangle = function(text) {
	  if (!this.options.mangle) return text;
	  var out = ''
	    , l = text.length
	    , i = 0
	    , ch;

	  for (; i < l; i++) {
	    ch = text.charCodeAt(i);
	    if (Math.random() > 0.5) {
	      ch = 'x' + ch.toString(16);
	    }
	    out += '&#' + ch + ';';
	  }

	  return out;
	};

	/**
	 * Renderer
	 */

	function Renderer(options) {
	  this.options = options || {};
	}

	Renderer.prototype.code = function(code, lang, escaped) {
	  if (this.options.highlight) {
	    var out = this.options.highlight(code, lang);
	    if (out != null && out !== code) {
	      escaped = true;
	      code = out;
	    }
	  }

	  if (!lang) {
	    return '<pre><code>'
	      + (escaped ? code : escape(code, true))
	      + '\n</code></pre>';
	  }

	  return '<pre><code class="'
	    + this.options.langPrefix
	    + escape(lang, true)
	    + '">'
	    + (escaped ? code : escape(code, true))
	    + '\n</code></pre>\n';
	};

	Renderer.prototype.blockquote = function(quote) {
	  return '<blockquote>\n' + quote + '</blockquote>\n';
	};

	Renderer.prototype.html = function(html) {
	  return html;
	};

	Renderer.prototype.heading = function(text, level, raw) {
	  return '<h'
	    + level
	    + ' id="'
	    + this.options.headerPrefix
	    + raw.toLowerCase().replace(/[^\w]+/g, '-')
	    + '">'
	    + text
	    + '</h'
	    + level
	    + '>\n';
	};

	Renderer.prototype.hr = function() {
	  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
	};

	Renderer.prototype.list = function(body, ordered) {
	  var type = ordered ? 'ol' : 'ul';
	  return '<' + type + '>\n' + body + '</' + type + '>\n';
	};

	Renderer.prototype.listitem = function(text) {
	  return '<li>' + text + '</li>\n';
	};

	Renderer.prototype.paragraph = function(text) {
	  return '<p>' + text + '</p>\n';
	};

	Renderer.prototype.table = function(header, body) {
	  return '<table>\n'
	    + '<thead>\n'
	    + header
	    + '</thead>\n'
	    + '<tbody>\n'
	    + body
	    + '</tbody>\n'
	    + '</table>\n';
	};

	Renderer.prototype.tablerow = function(content) {
	  return '<tr>\n' + content + '</tr>\n';
	};

	Renderer.prototype.tablecell = function(content, flags) {
	  var type = flags.header ? 'th' : 'td';
	  var tag = flags.align
	    ? '<' + type + ' style="text-align:' + flags.align + '">'
	    : '<' + type + '>';
	  return tag + content + '</' + type + '>\n';
	};

	// span level renderer
	Renderer.prototype.strong = function(text) {
	  return '<strong>' + text + '</strong>';
	};

	Renderer.prototype.em = function(text) {
	  return '<em>' + text + '</em>';
	};

	Renderer.prototype.codespan = function(text) {
	  return '<code>' + text + '</code>';
	};

	Renderer.prototype.br = function() {
	  return this.options.xhtml ? '<br/>' : '<br>';
	};

	Renderer.prototype.del = function(text) {
	  return '<del>' + text + '</del>';
	};

	Renderer.prototype.link = function(href, title, text) {
	  if (this.options.sanitize) {
	    try {
	      var prot = decodeURIComponent(unescape(href))
	        .replace(/[^\w:]/g, '')
	        .toLowerCase();
	    } catch (e) {
	      return '';
	    }
	    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
	      return '';
	    }
	  }
	  var out = '<a href="' + href + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += '>' + text + '</a>';
	  return out;
	};

	Renderer.prototype.image = function(href, title, text) {
	  var out = '<img src="' + href + '" alt="' + text + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += this.options.xhtml ? '/>' : '>';
	  return out;
	};

	Renderer.prototype.text = function(text) {
	  return text;
	};

	/**
	 * Parsing & Compiling
	 */

	function Parser(options) {
	  this.tokens = [];
	  this.token = null;
	  this.options = options || marked.defaults;
	  this.options.renderer = this.options.renderer || new Renderer;
	  this.renderer = this.options.renderer;
	  this.renderer.options = this.options;
	}

	/**
	 * Static Parse Method
	 */

	Parser.parse = function(src, options, renderer) {
	  var parser = new Parser(options, renderer);
	  return parser.parse(src);
	};

	/**
	 * Parse Loop
	 */

	Parser.prototype.parse = function(src) {
	  this.inline = new InlineLexer(src.links, this.options, this.renderer);
	  this.tokens = src.reverse();

	  var out = '';
	  while (this.next()) {
	    out += this.tok();
	  }

	  return out;
	};

	/**
	 * Next Token
	 */

	Parser.prototype.next = function() {
	  return this.token = this.tokens.pop();
	};

	/**
	 * Preview Next Token
	 */

	Parser.prototype.peek = function() {
	  return this.tokens[this.tokens.length - 1] || 0;
	};

	/**
	 * Parse Text Tokens
	 */

	Parser.prototype.parseText = function() {
	  var body = this.token.text;

	  while (this.peek().type === 'text') {
	    body += '\n' + this.next().text;
	  }

	  return this.inline.output(body);
	};

	/**
	 * Parse Current Token
	 */

	Parser.prototype.tok = function() {
	  switch (this.token.type) {
	    case 'space': {
	      return '';
	    }
	    case 'hr': {
	      return this.renderer.hr();
	    }
	    case 'heading': {
	      return this.renderer.heading(
	        this.inline.output(this.token.text),
	        this.token.depth,
	        this.token.text);
	    }
	    case 'code': {
	      return this.renderer.code(this.token.text,
	        this.token.lang,
	        this.token.escaped);
	    }
	    case 'table': {
	      var header = ''
	        , body = ''
	        , i
	        , row
	        , cell
	        , flags
	        , j;

	      // header
	      cell = '';
	      for (i = 0; i < this.token.header.length; i++) {
	        flags = { header: true, align: this.token.align[i] };
	        cell += this.renderer.tablecell(
	          this.inline.output(this.token.header[i]),
	          { header: true, align: this.token.align[i] }
	        );
	      }
	      header += this.renderer.tablerow(cell);

	      for (i = 0; i < this.token.cells.length; i++) {
	        row = this.token.cells[i];

	        cell = '';
	        for (j = 0; j < row.length; j++) {
	          cell += this.renderer.tablecell(
	            this.inline.output(row[j]),
	            { header: false, align: this.token.align[j] }
	          );
	        }

	        body += this.renderer.tablerow(cell);
	      }
	      return this.renderer.table(header, body);
	    }
	    case 'blockquote_start': {
	      var body = '';

	      while (this.next().type !== 'blockquote_end') {
	        body += this.tok();
	      }

	      return this.renderer.blockquote(body);
	    }
	    case 'list_start': {
	      var body = ''
	        , ordered = this.token.ordered;

	      while (this.next().type !== 'list_end') {
	        body += this.tok();
	      }

	      return this.renderer.list(body, ordered);
	    }
	    case 'list_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.token.type === 'text'
	          ? this.parseText()
	          : this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'loose_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'html': {
	      var html = !this.token.pre && !this.options.pedantic
	        ? this.inline.output(this.token.text)
	        : this.token.text;
	      return this.renderer.html(html);
	    }
	    case 'paragraph': {
	      return this.renderer.paragraph(this.inline.output(this.token.text));
	    }
	    case 'text': {
	      return this.renderer.paragraph(this.parseText());
	    }
	  }
	};

	/**
	 * Helpers
	 */

	function escape(html, encode) {
	  return html
	    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;')
	    .replace(/'/g, '&#39;');
	}

	function unescape(html) {
	  return html.replace(/&([#\w]+);/g, function(_, n) {
	    n = n.toLowerCase();
	    if (n === 'colon') return ':';
	    if (n.charAt(0) === '#') {
	      return n.charAt(1) === 'x'
	        ? String.fromCharCode(parseInt(n.substring(2), 16))
	        : String.fromCharCode(+n.substring(1));
	    }
	    return '';
	  });
	}

	function replace(regex, opt) {
	  regex = regex.source;
	  opt = opt || '';
	  return function self(name, val) {
	    if (!name) return new RegExp(regex, opt);
	    val = val.source || val;
	    val = val.replace(/(^|[^\[])\^/g, '$1');
	    regex = regex.replace(name, val);
	    return self;
	  };
	}

	function noop() {}
	noop.exec = noop;

	function merge(obj) {
	  var i = 1
	    , target
	    , key;

	  for (; i < arguments.length; i++) {
	    target = arguments[i];
	    for (key in target) {
	      if (Object.prototype.hasOwnProperty.call(target, key)) {
	        obj[key] = target[key];
	      }
	    }
	  }

	  return obj;
	}


	/**
	 * Marked
	 */

	function marked(src, opt, callback) {
	  if (callback || typeof opt === 'function') {
	    if (!callback) {
	      callback = opt;
	      opt = null;
	    }

	    opt = merge({}, marked.defaults, opt || {});

	    var highlight = opt.highlight
	      , tokens
	      , pending
	      , i = 0;

	    try {
	      tokens = Lexer.lex(src, opt)
	    } catch (e) {
	      return callback(e);
	    }

	    pending = tokens.length;

	    var done = function(err) {
	      if (err) {
	        opt.highlight = highlight;
	        return callback(err);
	      }

	      var out;

	      try {
	        out = Parser.parse(tokens, opt);
	      } catch (e) {
	        err = e;
	      }

	      opt.highlight = highlight;

	      return err
	        ? callback(err)
	        : callback(null, out);
	    };

	    if (!highlight || highlight.length < 3) {
	      return done();
	    }

	    delete opt.highlight;

	    if (!pending) return done();

	    for (; i < tokens.length; i++) {
	      (function(token) {
	        if (token.type !== 'code') {
	          return --pending || done();
	        }
	        return highlight(token.text, token.lang, function(err, code) {
	          if (err) return done(err);
	          if (code == null || code === token.text) {
	            return --pending || done();
	          }
	          token.text = code;
	          token.escaped = true;
	          --pending || done();
	        });
	      })(tokens[i]);
	    }

	    return;
	  }
	  try {
	    if (opt) opt = merge({}, marked.defaults, opt);
	    return Parser.parse(Lexer.lex(src, opt), opt);
	  } catch (e) {
	    e.message += '\nPlease report this to https://github.com/chjj/marked.';
	    if ((opt || marked.defaults).silent) {
	      return '<p>An error occured:</p><pre>'
	        + escape(e.message + '', true)
	        + '</pre>';
	    }
	    throw e;
	  }
	}

	/**
	 * Options
	 */

	marked.options =
	marked.setOptions = function(opt) {
	  merge(marked.defaults, opt);
	  return marked;
	};

	marked.defaults = {
	  gfm: true,
	  tables: true,
	  breaks: false,
	  pedantic: false,
	  sanitize: false,
	  sanitizer: null,
	  mangle: true,
	  smartLists: false,
	  silent: false,
	  highlight: null,
	  langPrefix: 'lang-',
	  smartypants: false,
	  headerPrefix: '',
	  renderer: new Renderer,
	  xhtml: false
	};

	/**
	 * Expose
	 */

	marked.Parser = Parser;
	marked.parser = Parser.parse;

	marked.Renderer = Renderer;

	marked.Lexer = Lexer;
	marked.lexer = Lexer.lex;

	marked.InlineLexer = InlineLexer;
	marked.inlineLexer = InlineLexer.output;

	marked.parse = marked;

	if (true) {
	  module.exports = marked;
	} else if (typeof define === 'function' && define.amd) {
	  define(function() { return marked; });
	} else {
	  this.marked = marked;
	}

	}).call(function() {
	  return this || (typeof window !== 'undefined' ? window : global);
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(6);

	var on = _require.on;

	// Add a little widget to the top of the screen for some slide functions

	module.exports = function (_ref) {
		var slideContainer = _ref.slideContainer;


		var slideController = document.createElement('div');
		slideController.classList.add('a-slides_slide-controller');

		var closeButton = document.createElement('a');
		closeButton.innerHTML = '×';
		on(closeButton, 'click', function () {
			return slideController.classList.add('hidden');
		});
		closeButton.classList.add('a-slides_slide-controller_close-button');
		slideController.appendChild(closeButton);

		function append(el) {
			slideController.insertBefore(el, closeButton);
		}

		function makeAndBindButton(text, fn) {
			var button = document.createElement('button');
			button.innerHTML = text;
			on(button, 'click', fn);
			append(button);
			return button;
		}

		makeAndBindButton('Begin', function () {
			return slideContainer.classList.toggle('presentation');
		});
		makeAndBindButton('Thumbnail', function () {
			return slideContainer.classList.toggle('hide-presentation');
		});
		on(slideController, 'click', function (e) {
			return e.cancelBubble = true;
		});

		slideContainer.appendChild(slideController);

		module.exports.makeAndBindButton = makeAndBindButton;
		module.exports.append = append;
	};

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(95);

	var _promise2 = _interopRequireDefault(_promise);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var slideController = __webpack_require__(93);
	var prevAll = __webpack_require__(77);

	var _require = __webpack_require__(6);

	var fire = _require.fire;
	var on = _require.on;


	module.exports = function (_ref) {
		var slideContainer = _ref.slideContainer;


		function sendSWMessage(message) {

			// This wraps the message posting/response in a promise, which will resolve if the response doesn't
			// contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
			// controller.postMessage() and set up the onmessage handler independently of a promise, but this is
			// a convenient wrapper.
			return new _promise2.default(function (resolve, reject) {
				var messageChannel = new MessageChannel();
				messageChannel.port1.onmessage = function (event) {
					if (event.data.error) {
						reject(event.data.error);
					} else {
						resolve(event.data);
					}
				};

				// This sends the message data as well as transferring messageChannel.port2 to the service worker.
				// The service worker can then use the transferred port to reply via postMessage(), which
				// will in turn trigger the onmessage handler on messageChannel.port1.
				// See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
				navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
			});
		}

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('sw.js').then(function (reg) {
				console.log('sw registered', reg);
			}).catch(function (error) {
				console.log('sw registration failed with ' + error);
			});

			if (navigator.serviceWorker.controller) {
				(function () {

					/**
	     * Set up bindings
	     */

					var controller = false;

					slideController.makeAndBindButton('Parent', function () {
						controller = true;
						on(slideContainer, 'a-slides_slide-setup', function (_ref2) {
							var detail = _ref2.detail;
							return sendSWMessage({
								aSlideEvent: 'a-slides_goto-slide',
								detail: {
									slide: prevAll(slideContainer.querySelector('.a-slides_slide[data-slide-id="' + detail.slideId + '"]')).length
								}
							});
						});
						on(slideContainer, 'a-slides_trigger-event', function () {
							return sendSWMessage({ aSlideEvent: 'a-slides_trigger-event' });
						});
						on(slideContainer, 'a-slides_previous-slide', function () {
							return sendSWMessage({ aSlideEvent: 'a-slides_previous-slide' });
						});
					});

					navigator.serviceWorker.addEventListener('message', function (e) {
						if (controller) return;
						if (e.data.aSlideEvent) {
							fire(slideContainer, e.data.aSlideEvent, e.data.detail);
						}
					});
				})();
			}
		}
	};

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(96), __esModule: true };

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(9);
	__webpack_require__(10);
	__webpack_require__(54);
	__webpack_require__(97);
	module.exports = __webpack_require__(18).Promise;

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(15)
	  , global             = __webpack_require__(17)
	  , ctx                = __webpack_require__(19)
	  , classof            = __webpack_require__(66)
	  , $export            = __webpack_require__(16)
	  , isObject           = __webpack_require__(24)
	  , aFunction          = __webpack_require__(20)
	  , anInstance         = __webpack_require__(61)
	  , forOf              = __webpack_require__(62)
	  , speciesConstructor = __webpack_require__(98)
	  , task               = __webpack_require__(99).set
	  , microtask          = __webpack_require__(101)()
	  , PROMISE            = 'Promise'
	  , TypeError          = global.TypeError
	  , process            = global.process
	  , $Promise           = global[PROMISE]
	  , process            = global.process
	  , isNode             = classof(process) == 'process'
	  , empty              = function(){ /* empty */ }
	  , Internal, GenericPromiseCapability, Wrapper;

	var USE_NATIVE = !!function(){
	  try {
	    // correct subclassing with @@species support
	    var promise     = $Promise.resolve(1)
	      , FakePromise = (promise.constructor = {})[__webpack_require__(51)('species')] = function(exec){ exec(empty, empty); };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch(e){ /* empty */ }
	}();

	// helpers
	var sameConstructor = function(a, b){
	  // with library wrapper special case
	  return a === b || a === $Promise && b === Wrapper;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var newPromiseCapability = function(C){
	  return sameConstructor($Promise, C)
	    ? new PromiseCapability(C)
	    : new GenericPromiseCapability(C);
	};
	var PromiseCapability = GenericPromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject  = aFunction(reject);
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(promise, isReject){
	  if(promise._n)return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function(){
	    var value = promise._v
	      , ok    = promise._s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , domain  = reaction.domain
	        , result, then;
	      try {
	        if(handler){
	          if(!ok){
	            if(promise._h == 2)onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if(handler === true)result = value;
	          else {
	            if(domain)domain.enter();
	            result = handler(value);
	            if(domain)domain.exit();
	          }
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if(isReject && !promise._h)onUnhandled(promise);
	  });
	};
	var onUnhandled = function(promise){
	  task.call(global, function(){
	    var value = promise._v
	      , abrupt, handler, console;
	    if(isUnhandled(promise)){
	      abrupt = perform(function(){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if(abrupt)throw abrupt.error;
	  });
	};
	var isUnhandled = function(promise){
	  if(promise._h == 1)return false;
	  var chain = promise._a || promise._c
	    , i     = 0
	    , reaction;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var onHandleUnhandled = function(promise){
	  task.call(global, function(){
	    var handler;
	    if(isNode){
	      process.emit('rejectionHandled', promise);
	    } else if(handler = global.onrejectionhandled){
	      handler({promise: promise, reason: promise._v});
	    }
	  });
	};
	var $reject = function(value){
	  var promise = this;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if(!promise._a)promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function(value){
	  var promise = this
	    , then;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if(promise === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      microtask(function(){
	        var wrapper = {_w: promise, _d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch(e){
	    $reject.call({_w: promise, _d: false}, e); // wrap
	  }
	};

	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor){
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch(err){
	      $reject.call(this, err);
	    }
	  };
	  Internal = function Promise(executor){
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(60)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail   = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if(this._a)this._a.push(reaction);
	      if(this._s)notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	  PromiseCapability = function(){
	    var promise  = new Internal;
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject  = ctx($reject, promise, 1);
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
	__webpack_require__(50)($Promise, PROMISE);
	__webpack_require__(67)(PROMISE);
	Wrapper = __webpack_require__(18)[PROMISE];

	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = newPromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
	    var capability = newPromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(82)(function(iter){
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      var values    = []
	        , index     = 0
	        , remaining = 1;
	      forOf(iterable, false, function(promise){
	        var $index        = index++
	          , alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled  = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(23)
	  , aFunction = __webpack_require__(20)
	  , SPECIES   = __webpack_require__(51)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(19)
	  , invoke             = __webpack_require__(100)
	  , html               = __webpack_require__(49)
	  , cel                = __webpack_require__(28)
	  , global             = __webpack_require__(17)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(41)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 100 */
/***/ function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(17)
	  , macrotask = __webpack_require__(99).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(41)(process) == 'process';

	module.exports = function(){
	  var head, last, notify;

	  var flush = function(){
	    var parent, fn;
	    if(isNode && (parent = process.domain))parent.exit();
	    while(head){
	      fn   = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch(e){
	        if(head)notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if(parent)parent.enter();
	  };

	  // Node.js
	  if(isNode){
	    notify = function(){
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if(Observer){
	    var toggle = true
	      , node   = document.createTextNode('');
	    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	    notify = function(){
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if(Promise && Promise.resolve){
	    var promise = Promise.resolve();
	    notify = function(){
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function(){
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }

	  return function(fn){
	    var task = {fn: fn, next: undefined};
	    if(last)last.next = task;
	    if(!head){
	      head = task;
	      notify();
	    } last = task;
	  };
	};

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _stringify = __webpack_require__(103);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _classCallCheck2 = __webpack_require__(105);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(106);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _promise = __webpack_require__(95);

	var _promise2 = _interopRequireDefault(_promise);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var slideController = __webpack_require__(93);
	var EventEmitter = __webpack_require__(110).EventEmitter;
	var Peer = __webpack_require__(111);
	var MASTER_CONTROLLER_NAME = 'ada-slides-controller';

	var _require = __webpack_require__(6);

	var fire = _require.fire;
	var on = _require.on;

	// Define peerJS Details

	var myPeer = void 0; // Peer
	var webRTCStatus = void 0; // Status box

	function webRTCSetup(_ref) {
		var peerSettings = _ref.peerSettings;
		var peerController = _ref.peerController;
		var slideContainer = _ref.slideContainer;


		if (myPeer) {
			myPeer.destroy();
		}

		return new _promise2.default(function (resolve, reject) {
			myPeer = (peerController ? new Peer(MASTER_CONTROLLER_NAME, peerSettings) : new Peer(peerSettings)).on('error', function (e) {
				if (e.type === 'unavailable-id') {
					reject(Error('Cannot take control, controller already present.'));
				} else {
					reject(e);
				}
			}).on('open', resolve);
		}).then(function (id) {
			var WebrtcUser = function () {
				function WebrtcUser(controller) {
					(0, _classCallCheck3.default)(this, WebrtcUser);

					var ev = new EventEmitter();
					this.on = ev.on.bind(this);
					this.fire = ev.emit.bind(this);
					this.slideClients = [];
					this.controller = controller;
				}

				(0, _createClass3.default)(WebrtcUser, [{
					key: 'addClient',
					value: function addClient(dataConn) {
						this.slideClients.push(dataConn);
					}
				}, {
					key: 'sendData',
					value: function sendData(dataConn, type, data) {
						dataConn.send({ type: type, data: data });
					}
				}, {
					key: 'sendSignalToClients',
					value: function sendSignalToClients(type, data) {
						var _this = this;

						this.slideClients.forEach(function (dc) {
							return _this.sendData(dc, type, data);
						});
					}

					// Tell all of the clients to move on one slide

				}, {
					key: 'requestSlide',
					value: function requestSlide(i) {
						console.log('Requesting slide', i);
						this.sendSignalToClients('goToSlide', i);
					}

					// Tell all of the clients to move on one event

				}, {
					key: 'triggerRemoteEvent',
					value: function triggerRemoteEvent() {
						console.log('Triggering remote interaction event');
						this.sendSignalToClients('triggerEvent');
					}

					// Tell all of the clients to move on one event

				}, {
					key: 'triggerRefresh',
					value: function triggerRefresh() {
						console.log('Triggering refresh');
						this.sendSignalToClients('triggerRefresh');
					}
				}]);
				return WebrtcUser;
			}();

			var user = new WebrtcUser(!!peerController);

			return new _promise2.default(function (resolve) {
				if (peerController) {
					console.log('You have the power', id);
					slideContainer.classList.add('controller');
					on(myPeer, 'connection', function (dataConn) {
						console.log('recieved connection from', dataConn.peer);
						user.addClient(dataConn);
					});
				} else {
					console.log('You are a client', id);
					myPeer.connect(MASTER_CONTROLLER_NAME).on('data', function (data) {
						console.log('recieved instructions', (0, _stringify2.default)(data));
						fire(user, data.type, data.data);
					});
					on(myPeer, 'connection', function (dataConn) {
						console.log('recieved connection from', dataConn.peer);
						user.addClient(dataConn);
					});
				}
				resolve(user);
			});
		}).then(function (user) {

			on(slideContainer, 'a-slides_slide-setup', function (_ref2) {
				var slideId = _ref2.detail.slideId;
				return user.requestSlide.bind(user)(slideId);
			});
			on(slideContainer, 'a-slides_trigger-event', function () {
				return user.triggerRemoteEvent.bind(user)();
			});
			on(slideContainer, 'a-slides_refresh-slide', function () {
				return user.triggerRefresh.bind(user)();
			});
			on(user, 'goToSlide', function (slide) {
				return fire(slideContainer, 'a-slides_goto-slide', { slide: slideContainer.querySelector('.slide[data-slide-id="' + slide + '"]') });
			});
			on(user, 'triggerEvent', function () {
				return fire(slideContainer, 'a-slides_trigger-event');
			});
			on(user, 'triggerRefresh', function () {
				return fire(slideContainer, 'a-slides_refresh-slide');
			});

			// Further Event Handling
			on(myPeer, 'error', function (e) {

				// Handle the could not connect situation
				if (e.type === 'peer-unavailable' && e.message === 'Could not connect to peer ada-slides-controller') {

					// Wait a few seconds and try reconnecting
					console.log('Lost connection to client.');
				} else {
					console.log(e);
					myPeer.destroy();
					webRTCStatus.innerHTML = e.type + ': ' + e.message;
					webRTCStatus.classList.remove('green');
					webRTCStatus.classList.add('red');
				}
			});

			on(myPeer, 'disconnected', function () {
				var _this2 = this;

				setTimeout(function () {
					if (!_this2.destroyed) {
						_this2.reconnect();
					}
				}, 3000);
			}.bind(myPeer));
		});
	}

	module.exports = function (_ref3) {
		var peerSettings = _ref3.peerSettings;


		return function (_ref4) {
			var slideContainer = _ref4.slideContainer;


			slideController.makeAndBindButton('WebRTC Parent', function () {
				webRTCSetup({
					peerSettings: peerSettings,
					peerController: true,
					slideContainer: slideContainer
				}).then(function () {
					webRTCStatus.classList.remove('red');
					webRTCStatus.classList.add('green');
					webRTCStatus.innerHTML = 'Controller';
				}).catch(function (e) {
					webRTCStatus.classList.remove('green');
					webRTCStatus.classList.add('red');
					webRTCStatus.innerHTML = e.message;
					console.error(e);
				});
			});

			slideController.makeAndBindButton('WebRTC Child', function () {
				webRTCSetup({
					peerSettings: peerSettings,
					peerController: false,
					slideContainer: slideContainer
				}).then(function () {
					webRTCStatus.classList.remove('red');
					webRTCStatus.classList.add('green');
					webRTCStatus.innerHTML = 'Controlled';
				}).catch(function (e) {
					webRTCStatus.classList.remove('green');
					webRTCStatus.classList.add('red');
					webRTCStatus.innerHTML = e.message;
					console.error(e);
				});
			});

			webRTCStatus = document.createElement('div');
			slideController.append(webRTCStatus);
			webRTCStatus.classList.add('red');
			webRTCStatus.classList.add('status');
			webRTCStatus.innerHTML = 'Not Connected';

			// if the client search param is present then jump
			// straight into presentation and try to connect.
			if (location.search === '?client') {
				slideContainer.classList.add('presentation');
				webRTCSetup({
					peerSettings: peerSettings,
					peerController: false,
					slideContainer: slideContainer
				}).then(function () {
					webRTCStatus.classList.remove('red');
					webRTCStatus.classList.add('green');
					webRTCStatus.innerHTML = 'Controlled';
				}).catch(function (e) {
					webRTCStatus.classList.remove('green');
					webRTCStatus.classList.add('red');
					webRTCStatus.innerHTML = e.message;
					console.error(e);
				});
			}
		};
	};

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(104), __esModule: true };

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(18)
	  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};

/***/ },
/* 105 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _defineProperty = __webpack_require__(107);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(108), __esModule: true };

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(109);
	var $Object = __webpack_require__(18).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(16);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(26), 'Object', {defineProperty: __webpack_require__(22).f});

/***/ },
/* 110 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(112);
	var EventEmitter = __webpack_require__(116);
	var Socket = __webpack_require__(117);
	var MediaConnection = __webpack_require__(118);
	var DataConnection = __webpack_require__(120);

	/**
	 * A peer who can initiate connections with other peers.
	 */
	function Peer(id, options) {
	  if (!(this instanceof Peer)) return new Peer(id, options);
	  EventEmitter.call(this);

	  // Deal with overloading
	  if (id && id.constructor == Object) {
	    options = id;
	    id = undefined;
	  } else if (id) {
	    // Ensure id is a string
	    id = id.toString();
	  }
	  //

	  // Configurize options
	  options = util.extend({
	    debug: 0, // 1: Errors, 2: Warnings, 3: All logs
	    host: util.CLOUD_HOST,
	    port: util.CLOUD_PORT,
	    key: 'peerjs',
	    path: '/',
	    token: util.randomToken(),
	    config: util.defaultConfig
	  }, options);
	  this.options = options;
	  // Detect relative URL host.
	  if (options.host === '/') {
	    options.host = window.location.hostname;
	  }
	  // Set path correctly.
	  if (options.path[0] !== '/') {
	    options.path = '/' + options.path;
	  }
	  if (options.path[options.path.length - 1] !== '/') {
	    options.path += '/';
	  }

	  // Set whether we use SSL to same as current host
	  if (options.secure === undefined && options.host !== util.CLOUD_HOST) {
	    options.secure = util.isSecure();
	  }
	  // Set a custom log function if present
	  if (options.logFunction) {
	    util.setLogFunction(options.logFunction);
	  }
	  util.setLogLevel(options.debug);
	  //

	  // Sanity checks
	  // Ensure WebRTC supported
	  if (!util.supports.audioVideo && !util.supports.data ) {
	    this._delayedAbort('browser-incompatible', 'The current browser does not support WebRTC');
	    return;
	  }
	  // Ensure alphanumeric id
	  if (!util.validateId(id)) {
	    this._delayedAbort('invalid-id', 'ID "' + id + '" is invalid');
	    return;
	  }
	  // Ensure valid key
	  if (!util.validateKey(options.key)) {
	    this._delayedAbort('invalid-key', 'API KEY "' + options.key + '" is invalid');
	    return;
	  }
	  // Ensure not using unsecure cloud server on SSL page
	  if (options.secure && options.host === '0.peerjs.com') {
	    this._delayedAbort('ssl-unavailable',
	      'The cloud server currently does not support HTTPS. Please run your own PeerServer to use HTTPS.');
	    return;
	  }
	  //

	  // States.
	  this.destroyed = false; // Connections have been killed
	  this.disconnected = false; // Connection to PeerServer killed but P2P connections still active
	  this.open = false; // Sockets and such are not yet open.
	  //

	  // References
	  this.connections = {}; // DataConnections for this peer.
	  this._lostMessages = {}; // src => [list of messages]
	  //

	  // Start the server connection
	  this._initializeServerConnection();
	  if (id) {
	    this._initialize(id);
	  } else {
	    this._retrieveId();
	  }
	  //
	}

	util.inherits(Peer, EventEmitter);

	// Initialize the 'socket' (which is actually a mix of XHR streaming and
	// websockets.)
	Peer.prototype._initializeServerConnection = function() {
	  var self = this;
	  this.socket = new Socket(this.options.secure, this.options.host, this.options.port, this.options.path, this.options.key);
	  this.socket.on('message', function(data) {
	    self._handleMessage(data);
	  });
	  this.socket.on('error', function(error) {
	    self._abort('socket-error', error);
	  });
	  this.socket.on('disconnected', function() {
	    // If we haven't explicitly disconnected, emit error and disconnect.
	    if (!self.disconnected) {
	      self.emitError('network', 'Lost connection to server.');
	      self.disconnect();
	    }
	  });
	  this.socket.on('close', function() {
	    // If we haven't explicitly disconnected, emit error.
	    if (!self.disconnected) {
	      self._abort('socket-closed', 'Underlying socket is already closed.');
	    }
	  });
	};

	/** Get a unique ID from the server via XHR. */
	Peer.prototype._retrieveId = function(cb) {
	  var self = this;
	  var http = new XMLHttpRequest();
	  var protocol = this.options.secure ? 'https://' : 'http://';
	  var url = protocol + this.options.host + ':' + this.options.port +
	    this.options.path + this.options.key + '/id';
	  var queryString = '?ts=' + new Date().getTime() + '' + Math.random();
	  url += queryString;

	  // If there's no ID we need to wait for one before trying to init socket.
	  http.open('get', url, true);
	  http.onerror = function(e) {
	    util.error('Error retrieving ID', e);
	    var pathError = '';
	    if (self.options.path === '/' && self.options.host !== util.CLOUD_HOST) {
	      pathError = ' If you passed in a `path` to your self-hosted PeerServer, ' +
	        'you\'ll also need to pass in that same path when creating a new ' +
	        'Peer.';
	    }
	    self._abort('server-error', 'Could not get an ID from the server.' + pathError);
	  };
	  http.onreadystatechange = function() {
	    if (http.readyState !== 4) {
	      return;
	    }
	    if (http.status !== 200) {
	      http.onerror();
	      return;
	    }
	    self._initialize(http.responseText);
	  };
	  http.send(null);
	};

	/** Initialize a connection with the server. */
	Peer.prototype._initialize = function(id) {
	  this.id = id;
	  this.socket.start(this.id, this.options.token);
	};

	/** Handles messages from the server. */
	Peer.prototype._handleMessage = function(message) {
	  var type = message.type;
	  var payload = message.payload;
	  var peer = message.src;
	  var connection;

	  switch (type) {
	    case 'OPEN': // The connection to the server is open.
	      this.emit('open', this.id);
	      this.open = true;
	      break;
	    case 'ERROR': // Server error.
	      this._abort('server-error', payload.msg);
	      break;
	    case 'ID-TAKEN': // The selected ID is taken.
	      this._abort('unavailable-id', 'ID `' + this.id + '` is taken');
	      break;
	    case 'INVALID-KEY': // The given API key cannot be found.
	      this._abort('invalid-key', 'API KEY "' + this.options.key + '" is invalid');
	      break;

	    //
	    case 'LEAVE': // Another peer has closed its connection to this peer.
	      util.log('Received leave message from', peer);
	      this._cleanupPeer(peer);
	      break;

	    case 'EXPIRE': // The offer sent to a peer has expired without response.
	      this.emitError('peer-unavailable', 'Could not connect to peer ' + peer);
	      break;
	    case 'OFFER': // we should consider switching this to CALL/CONNECT, but this is the least breaking option.
	      var connectionId = payload.connectionId;
	      connection = this.getConnection(peer, connectionId);

	      if (connection) {
	        util.warn('Offer received for existing Connection ID:', connectionId);
	        //connection.handleMessage(message);
	      } else {
	        // Create a new connection.
	        if (payload.type === 'media') {
	          connection = new MediaConnection(peer, this, {
	            connectionId: connectionId,
	            _payload: payload,
	            metadata: payload.metadata
	          });
	          this._addConnection(peer, connection);
	          this.emit('call', connection);
	        } else if (payload.type === 'data') {
	          connection = new DataConnection(peer, this, {
	            connectionId: connectionId,
	            _payload: payload,
	            metadata: payload.metadata,
	            label: payload.label,
	            serialization: payload.serialization,
	            reliable: payload.reliable
	          });
	          this._addConnection(peer, connection);
	          this.emit('connection', connection);
	        } else {
	          util.warn('Received malformed connection type:', payload.type);
	          return;
	        }
	        // Find messages.
	        var messages = this._getMessages(connectionId);
	        for (var i = 0, ii = messages.length; i < ii; i += 1) {
	          connection.handleMessage(messages[i]);
	        }
	      }
	      break;
	    default:
	      if (!payload) {
	        util.warn('You received a malformed message from ' + peer + ' of type ' + type);
	        return;
	      }

	      var id = payload.connectionId;
	      connection = this.getConnection(peer, id);

	      if (connection && connection.pc) {
	        // Pass it on.
	        connection.handleMessage(message);
	      } else if (id) {
	        // Store for possible later use
	        this._storeMessage(id, message);
	      } else {
	        util.warn('You received an unrecognized message:', message);
	      }
	      break;
	  }
	};

	/** Stores messages without a set up connection, to be claimed later. */
	Peer.prototype._storeMessage = function(connectionId, message) {
	  if (!this._lostMessages[connectionId]) {
	    this._lostMessages[connectionId] = [];
	  }
	  this._lostMessages[connectionId].push(message);
	};

	/** Retrieve messages from lost message store */
	Peer.prototype._getMessages = function(connectionId) {
	  var messages = this._lostMessages[connectionId];
	  if (messages) {
	    delete this._lostMessages[connectionId];
	    return messages;
	  } else {
	    return [];
	  }
	};

	/**
	 * Returns a DataConnection to the specified peer. See documentation for a
	 * complete list of options.
	 */
	Peer.prototype.connect = function(peer, options) {
	  if (this.disconnected) {
	    util.warn('You cannot connect to a new Peer because you called ' +
	      '.disconnect() on this Peer and ended your connection with the ' +
	      'server. You can create a new Peer to reconnect, or call reconnect ' +
	      'on this peer if you believe its ID to still be available.');
	    this.emitError('disconnected', 'Cannot connect to new Peer after disconnecting from server.');
	    return;
	  }
	  var connection = new DataConnection(peer, this, options);
	  this._addConnection(peer, connection);
	  return connection;
	};

	/**
	 * Returns a MediaConnection to the specified peer. See documentation for a
	 * complete list of options.
	 */
	Peer.prototype.call = function(peer, stream, options) {
	  if (this.disconnected) {
	    util.warn('You cannot connect to a new Peer because you called ' +
	      '.disconnect() on this Peer and ended your connection with the ' +
	      'server. You can create a new Peer to reconnect.');
	    this.emitError('disconnected', 'Cannot connect to new Peer after disconnecting from server.');
	    return;
	  }
	  if (!stream) {
	    util.error('To call a peer, you must provide a stream from your browser\'s `getUserMedia`.');
	    return;
	  }
	  options = options || {};
	  options._stream = stream;
	  var call = new MediaConnection(peer, this, options);
	  this._addConnection(peer, call);
	  return call;
	};

	/** Add a data/media connection to this peer. */
	Peer.prototype._addConnection = function(peer, connection) {
	  if (!this.connections[peer]) {
	    this.connections[peer] = [];
	  }
	  this.connections[peer].push(connection);
	};

	/** Retrieve a data/media connection for this peer. */
	Peer.prototype.getConnection = function(peer, id) {
	  var connections = this.connections[peer];
	  if (!connections) {
	    return null;
	  }
	  for (var i = 0, ii = connections.length; i < ii; i++) {
	    if (connections[i].id === id) {
	      return connections[i];
	    }
	  }
	  return null;
	};

	Peer.prototype._delayedAbort = function(type, message) {
	  var self = this;
	  util.setZeroTimeout(function(){
	    self._abort(type, message);
	  });
	};

	/**
	 * Destroys the Peer and emits an error message.
	 * The Peer is not destroyed if it's in a disconnected state, in which case
	 * it retains its disconnected state and its existing connections.
	 */
	Peer.prototype._abort = function(type, message) {
	  util.error('Aborting!');
	  if (!this._lastServerId) {
	    this.destroy();
	  } else {
	    this.disconnect();
	  }
	  this.emitError(type, message);
	};

	/** Emits a typed error message. */
	Peer.prototype.emitError = function(type, err) {
	  util.error('Error:', err);
	  if (typeof err === 'string') {
	    err = new Error(err);
	  }
	  err.type = type;
	  this.emit('error', err);
	};

	/**
	 * Destroys the Peer: closes all active connections as well as the connection
	 *  to the server.
	 * Warning: The peer can no longer create or accept connections after being
	 *  destroyed.
	 */
	Peer.prototype.destroy = function() {
	  if (!this.destroyed) {
	    this._cleanup();
	    this.disconnect();
	    this.destroyed = true;
	  }
	};


	/** Disconnects every connection on this peer. */
	Peer.prototype._cleanup = function() {
	  if (this.connections) {
	    var peers = Object.keys(this.connections);
	    for (var i = 0, ii = peers.length; i < ii; i++) {
	      this._cleanupPeer(peers[i]);
	    }
	  }
	  this.emit('close');
	};

	/** Closes all connections to this peer. */
	Peer.prototype._cleanupPeer = function(peer) {
	  var connections = this.connections[peer];
	  for (var j = 0, jj = connections.length; j < jj; j += 1) {
	    connections[j].close();
	  }
	};

	/**
	 * Disconnects the Peer's connection to the PeerServer. Does not close any
	 *  active connections.
	 * Warning: The peer can no longer create or accept connections after being
	 *  disconnected. It also cannot reconnect to the server.
	 */
	Peer.prototype.disconnect = function() {
	  var self = this;
	  util.setZeroTimeout(function(){
	    if (!self.disconnected) {
	      self.disconnected = true;
	      self.open = false;
	      if (self.socket) {
	        self.socket.close();
	      }
	      self.emit('disconnected', self.id);
	      self._lastServerId = self.id;
	      self.id = null;
	    }
	  });
	};

	/** Attempts to reconnect with the same ID. */
	Peer.prototype.reconnect = function() {
	  if (this.disconnected && !this.destroyed) {
	    util.log('Attempting reconnection to server with ID ' + this._lastServerId);
	    this.disconnected = false;
	    this._initializeServerConnection();
	    this._initialize(this._lastServerId);
	  } else if (this.destroyed) {
	    throw new Error('This peer cannot reconnect to the server. It has already been destroyed.');
	  } else if (!this.disconnected && !this.open) {
	    // Do nothing. We're still connecting the first time.
	    util.error('In a hurry? We\'re still trying to make the initial connection!');
	  } else {
	    throw new Error('Peer ' + this.id + ' cannot reconnect because it is not disconnected from the server!');
	  }
	};

	/**
	 * Get a list of available peer IDs. If you're running your own server, you'll
	 * want to set allow_discovery: true in the PeerServer options. If you're using
	 * the cloud server, email team@peerjs.com to get the functionality enabled for
	 * your key.
	 */
	Peer.prototype.listAllPeers = function(cb) {
	  cb = cb || function() {};
	  var self = this;
	  var http = new XMLHttpRequest();
	  var protocol = this.options.secure ? 'https://' : 'http://';
	  var url = protocol + this.options.host + ':' + this.options.port +
	    this.options.path + this.options.key + '/peers';
	  var queryString = '?ts=' + new Date().getTime() + '' + Math.random();
	  url += queryString;

	  // If there's no ID we need to wait for one before trying to init socket.
	  http.open('get', url, true);
	  http.onerror = function(e) {
	    self._abort('server-error', 'Could not get peers from the server.');
	    cb([]);
	  };
	  http.onreadystatechange = function() {
	    if (http.readyState !== 4) {
	      return;
	    }
	    if (http.status === 401) {
	      var helpfulError = '';
	      if (self.options.host !== util.CLOUD_HOST) {
	        helpfulError = 'It looks like you\'re using the cloud server. You can email ' +
	          'team@peerjs.com to enable peer listing for your API key.';
	      } else {
	        helpfulError = 'You need to enable `allow_discovery` on your self-hosted ' +
	          'PeerServer to use this feature.';
	      }
	      cb([]);
	      throw new Error('It doesn\'t look like you have permission to list peers IDs. ' + helpfulError);
	    } else if (http.status !== 200) {
	      cb([]);
	    } else {
	      cb(JSON.parse(http.responseText));
	    }
	  };
	  http.send(null);
	};

	module.exports = Peer;


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	var defaultConfig = {'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]};
	var dataCount = 1;

	var BinaryPack = __webpack_require__(113);
	var RTCPeerConnection = __webpack_require__(115).RTCPeerConnection;

	var util = {
	  noop: function() {},

	  CLOUD_HOST: '0.peerjs.com',
	  CLOUD_PORT: 9000,

	  // Browsers that need chunking:
	  chunkedBrowsers: {'Chrome': 1},
	  chunkedMTU: 16300, // The original 60000 bytes setting does not work when sending data from Firefox to Chrome, which is "cut off" after 16384 bytes and delivered individually.

	  // Logging logic
	  logLevel: 0,
	  setLogLevel: function(level) {
	    var debugLevel = parseInt(level, 10);
	    if (!isNaN(parseInt(level, 10))) {
	      util.logLevel = debugLevel;
	    } else {
	      // If they are using truthy/falsy values for debug
	      util.logLevel = level ? 3 : 0;
	    }
	    util.log = util.warn = util.error = util.noop;
	    if (util.logLevel > 0) {
	      util.error = util._printWith('ERROR');
	    }
	    if (util.logLevel > 1) {
	      util.warn = util._printWith('WARNING');
	    }
	    if (util.logLevel > 2) {
	      util.log = util._print;
	    }
	  },
	  setLogFunction: function(fn) {
	    if (fn.constructor !== Function) {
	      util.warn('The log function you passed in is not a function. Defaulting to regular logs.');
	    } else {
	      util._print = fn;
	    }
	  },

	  _printWith: function(prefix) {
	    return function() {
	      var copy = Array.prototype.slice.call(arguments);
	      copy.unshift(prefix);
	      util._print.apply(util, copy);
	    };
	  },
	  _print: function () {
	    var err = false;
	    var copy = Array.prototype.slice.call(arguments);
	    copy.unshift('PeerJS: ');
	    for (var i = 0, l = copy.length; i < l; i++){
	      if (copy[i] instanceof Error) {
	        copy[i] = '(' + copy[i].name + ') ' + copy[i].message;
	        err = true;
	      }
	    }
	    err ? console.error.apply(console, copy) : console.log.apply(console, copy);
	  },
	  //

	  // Returns browser-agnostic default config
	  defaultConfig: defaultConfig,
	  //

	  // Returns the current browser.
	  browser: (function() {
	    if (window.mozRTCPeerConnection) {
	      return 'Firefox';
	    } else if (window.webkitRTCPeerConnection) {
	      return 'Chrome';
	    } else if (window.RTCPeerConnection) {
	      return 'Supported';
	    } else {
	      return 'Unsupported';
	    }
	  })(),
	  //

	  // Lists which features are supported
	  supports: (function() {
	    if (typeof RTCPeerConnection === 'undefined') {
	      return {};
	    }

	    var data = true;
	    var audioVideo = true;

	    var binaryBlob = false;
	    var sctp = false;
	    var onnegotiationneeded = !!window.webkitRTCPeerConnection;

	    var pc, dc;
	    try {
	      pc = new RTCPeerConnection(defaultConfig, {optional: [{RtpDataChannels: true}]});
	    } catch (e) {
	      data = false;
	      audioVideo = false;
	    }

	    if (data) {
	      try {
	        dc = pc.createDataChannel('_PEERJSTEST');
	      } catch (e) {
	        data = false;
	      }
	    }

	    if (data) {
	      // Binary test
	      try {
	        dc.binaryType = 'blob';
	        binaryBlob = true;
	      } catch (e) {
	      }

	      // Reliable test.
	      // Unfortunately Chrome is a bit unreliable about whether or not they
	      // support reliable.
	      var reliablePC = new RTCPeerConnection(defaultConfig, {});
	      try {
	        var reliableDC = reliablePC.createDataChannel('_PEERJSRELIABLETEST', {});
	        sctp = reliableDC.reliable;
	      } catch (e) {
	      }
	      reliablePC.close();
	    }

	    // FIXME: not really the best check...
	    if (audioVideo) {
	      audioVideo = !!pc.addStream;
	    }

	    // FIXME: this is not great because in theory it doesn't work for
	    // av-only browsers (?).
	    if (!onnegotiationneeded && data) {
	      // sync default check.
	      var negotiationPC = new RTCPeerConnection(defaultConfig, {optional: [{RtpDataChannels: true}]});
	      negotiationPC.onnegotiationneeded = function() {
	        onnegotiationneeded = true;
	        // async check.
	        if (util && util.supports) {
	          util.supports.onnegotiationneeded = true;
	        }
	      };
	      negotiationPC.createDataChannel('_PEERJSNEGOTIATIONTEST');

	      setTimeout(function() {
	        negotiationPC.close();
	      }, 1000);
	    }

	    if (pc) {
	      pc.close();
	    }

	    return {
	      audioVideo: audioVideo,
	      data: data,
	      binaryBlob: binaryBlob,
	      binary: sctp, // deprecated; sctp implies binary support.
	      reliable: sctp, // deprecated; sctp implies reliable data.
	      sctp: sctp,
	      onnegotiationneeded: onnegotiationneeded
	    };
	  }()),
	  //

	  // Ensure alphanumeric ids
	  validateId: function(id) {
	    // Allow empty ids
	    return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.exec(id);
	  },

	  validateKey: function(key) {
	    // Allow empty keys
	    return !key || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.exec(key);
	  },


	  debug: false,

	  inherits: function(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  },
	  extend: function(dest, source) {
	    for(var key in source) {
	      if(source.hasOwnProperty(key)) {
	        dest[key] = source[key];
	      }
	    }
	    return dest;
	  },
	  pack: BinaryPack.pack,
	  unpack: BinaryPack.unpack,

	  log: function () {
	    if (util.debug) {
	      var err = false;
	      var copy = Array.prototype.slice.call(arguments);
	      copy.unshift('PeerJS: ');
	      for (var i = 0, l = copy.length; i < l; i++){
	        if (copy[i] instanceof Error) {
	          copy[i] = '(' + copy[i].name + ') ' + copy[i].message;
	          err = true;
	        }
	      }
	      err ? console.error.apply(console, copy) : console.log.apply(console, copy);
	    }
	  },

	  setZeroTimeout: (function(global) {
	    var timeouts = [];
	    var messageName = 'zero-timeout-message';

	    // Like setTimeout, but only takes a function argument.	 There's
	    // no time argument (always zero) and no arguments (you have to
	    // use a closure).
	    function setZeroTimeoutPostMessage(fn) {
	      timeouts.push(fn);
	      global.postMessage(messageName, '*');
	    }

	    function handleMessage(event) {
	      if (event.source == global && event.data == messageName) {
	        if (event.stopPropagation) {
	          event.stopPropagation();
	        }
	        if (timeouts.length) {
	          timeouts.shift()();
	        }
	      }
	    }
	    if (global.addEventListener) {
	      global.addEventListener('message', handleMessage, true);
	    } else if (global.attachEvent) {
	      global.attachEvent('onmessage', handleMessage);
	    }
	    return setZeroTimeoutPostMessage;
	  }(window)),

	  // Binary stuff

	  // chunks a blob.
	  chunk: function(bl) {
	    var chunks = [];
	    var size = bl.size;
	    var start = index = 0;
	    var total = Math.ceil(size / util.chunkedMTU);
	    while (start < size) {
	      var end = Math.min(size, start + util.chunkedMTU);
	      var b = bl.slice(start, end);

	      var chunk = {
	        __peerData: dataCount,
	        n: index,
	        data: b,
	        total: total
	      };

	      chunks.push(chunk);

	      start = end;
	      index += 1;
	    }
	    dataCount += 1;
	    return chunks;
	  },

	  blobToArrayBuffer: function(blob, cb){
	    var fr = new FileReader();
	    fr.onload = function(evt) {
	      cb(evt.target.result);
	    };
	    fr.readAsArrayBuffer(blob);
	  },
	  blobToBinaryString: function(blob, cb){
	    var fr = new FileReader();
	    fr.onload = function(evt) {
	      cb(evt.target.result);
	    };
	    fr.readAsBinaryString(blob);
	  },
	  binaryStringToArrayBuffer: function(binary) {
	    var byteArray = new Uint8Array(binary.length);
	    for (var i = 0; i < binary.length; i++) {
	      byteArray[i] = binary.charCodeAt(i) & 0xff;
	    }
	    return byteArray.buffer;
	  },
	  randomToken: function () {
	    return Math.random().toString(36).substr(2);
	  },
	  //

	  isSecure: function() {
	    return location.protocol === 'https:';
	  }
	};

	module.exports = util;


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	var BufferBuilder = __webpack_require__(114).BufferBuilder;
	var binaryFeatures = __webpack_require__(114).binaryFeatures;

	var BinaryPack = {
	  unpack: function(data){
	    var unpacker = new Unpacker(data);
	    return unpacker.unpack();
	  },
	  pack: function(data){
	    var packer = new Packer();
	    packer.pack(data);
	    var buffer = packer.getBuffer();
	    return buffer;
	  }
	};

	module.exports = BinaryPack;

	function Unpacker (data){
	  // Data is ArrayBuffer
	  this.index = 0;
	  this.dataBuffer = data;
	  this.dataView = new Uint8Array(this.dataBuffer);
	  this.length = this.dataBuffer.byteLength;
	}

	Unpacker.prototype.unpack = function(){
	  var type = this.unpack_uint8();
	  if (type < 0x80){
	    var positive_fixnum = type;
	    return positive_fixnum;
	  } else if ((type ^ 0xe0) < 0x20){
	    var negative_fixnum = (type ^ 0xe0) - 0x20;
	    return negative_fixnum;
	  }
	  var size;
	  if ((size = type ^ 0xa0) <= 0x0f){
	    return this.unpack_raw(size);
	  } else if ((size = type ^ 0xb0) <= 0x0f){
	    return this.unpack_string(size);
	  } else if ((size = type ^ 0x90) <= 0x0f){
	    return this.unpack_array(size);
	  } else if ((size = type ^ 0x80) <= 0x0f){
	    return this.unpack_map(size);
	  }
	  switch(type){
	    case 0xc0:
	      return null;
	    case 0xc1:
	      return undefined;
	    case 0xc2:
	      return false;
	    case 0xc3:
	      return true;
	    case 0xca:
	      return this.unpack_float();
	    case 0xcb:
	      return this.unpack_double();
	    case 0xcc:
	      return this.unpack_uint8();
	    case 0xcd:
	      return this.unpack_uint16();
	    case 0xce:
	      return this.unpack_uint32();
	    case 0xcf:
	      return this.unpack_uint64();
	    case 0xd0:
	      return this.unpack_int8();
	    case 0xd1:
	      return this.unpack_int16();
	    case 0xd2:
	      return this.unpack_int32();
	    case 0xd3:
	      return this.unpack_int64();
	    case 0xd4:
	      return undefined;
	    case 0xd5:
	      return undefined;
	    case 0xd6:
	      return undefined;
	    case 0xd7:
	      return undefined;
	    case 0xd8:
	      size = this.unpack_uint16();
	      return this.unpack_string(size);
	    case 0xd9:
	      size = this.unpack_uint32();
	      return this.unpack_string(size);
	    case 0xda:
	      size = this.unpack_uint16();
	      return this.unpack_raw(size);
	    case 0xdb:
	      size = this.unpack_uint32();
	      return this.unpack_raw(size);
	    case 0xdc:
	      size = this.unpack_uint16();
	      return this.unpack_array(size);
	    case 0xdd:
	      size = this.unpack_uint32();
	      return this.unpack_array(size);
	    case 0xde:
	      size = this.unpack_uint16();
	      return this.unpack_map(size);
	    case 0xdf:
	      size = this.unpack_uint32();
	      return this.unpack_map(size);
	  }
	}

	Unpacker.prototype.unpack_uint8 = function(){
	  var byte = this.dataView[this.index] & 0xff;
	  this.index++;
	  return byte;
	};

	Unpacker.prototype.unpack_uint16 = function(){
	  var bytes = this.read(2);
	  var uint16 =
	    ((bytes[0] & 0xff) * 256) + (bytes[1] & 0xff);
	  this.index += 2;
	  return uint16;
	}

	Unpacker.prototype.unpack_uint32 = function(){
	  var bytes = this.read(4);
	  var uint32 =
	     ((bytes[0]  * 256 +
	       bytes[1]) * 256 +
	       bytes[2]) * 256 +
	       bytes[3];
	  this.index += 4;
	  return uint32;
	}

	Unpacker.prototype.unpack_uint64 = function(){
	  var bytes = this.read(8);
	  var uint64 =
	   ((((((bytes[0]  * 256 +
	       bytes[1]) * 256 +
	       bytes[2]) * 256 +
	       bytes[3]) * 256 +
	       bytes[4]) * 256 +
	       bytes[5]) * 256 +
	       bytes[6]) * 256 +
	       bytes[7];
	  this.index += 8;
	  return uint64;
	}


	Unpacker.prototype.unpack_int8 = function(){
	  var uint8 = this.unpack_uint8();
	  return (uint8 < 0x80 ) ? uint8 : uint8 - (1 << 8);
	};

	Unpacker.prototype.unpack_int16 = function(){
	  var uint16 = this.unpack_uint16();
	  return (uint16 < 0x8000 ) ? uint16 : uint16 - (1 << 16);
	}

	Unpacker.prototype.unpack_int32 = function(){
	  var uint32 = this.unpack_uint32();
	  return (uint32 < Math.pow(2, 31) ) ? uint32 :
	    uint32 - Math.pow(2, 32);
	}

	Unpacker.prototype.unpack_int64 = function(){
	  var uint64 = this.unpack_uint64();
	  return (uint64 < Math.pow(2, 63) ) ? uint64 :
	    uint64 - Math.pow(2, 64);
	}

	Unpacker.prototype.unpack_raw = function(size){
	  if ( this.length < this.index + size){
	    throw new Error('BinaryPackFailure: index is out of range'
	      + ' ' + this.index + ' ' + size + ' ' + this.length);
	  }
	  var buf = this.dataBuffer.slice(this.index, this.index + size);
	  this.index += size;

	    //buf = util.bufferToString(buf);

	  return buf;
	}

	Unpacker.prototype.unpack_string = function(size){
	  var bytes = this.read(size);
	  var i = 0, str = '', c, code;
	  while(i < size){
	    c = bytes[i];
	    if ( c < 128){
	      str += String.fromCharCode(c);
	      i++;
	    } else if ((c ^ 0xc0) < 32){
	      code = ((c ^ 0xc0) << 6) | (bytes[i+1] & 63);
	      str += String.fromCharCode(code);
	      i += 2;
	    } else {
	      code = ((c & 15) << 12) | ((bytes[i+1] & 63) << 6) |
	        (bytes[i+2] & 63);
	      str += String.fromCharCode(code);
	      i += 3;
	    }
	  }
	  this.index += size;
	  return str;
	}

	Unpacker.prototype.unpack_array = function(size){
	  var objects = new Array(size);
	  for(var i = 0; i < size ; i++){
	    objects[i] = this.unpack();
	  }
	  return objects;
	}

	Unpacker.prototype.unpack_map = function(size){
	  var map = {};
	  for(var i = 0; i < size ; i++){
	    var key  = this.unpack();
	    var value = this.unpack();
	    map[key] = value;
	  }
	  return map;
	}

	Unpacker.prototype.unpack_float = function(){
	  var uint32 = this.unpack_uint32();
	  var sign = uint32 >> 31;
	  var exp  = ((uint32 >> 23) & 0xff) - 127;
	  var fraction = ( uint32 & 0x7fffff ) | 0x800000;
	  return (sign == 0 ? 1 : -1) *
	    fraction * Math.pow(2, exp - 23);
	}

	Unpacker.prototype.unpack_double = function(){
	  var h32 = this.unpack_uint32();
	  var l32 = this.unpack_uint32();
	  var sign = h32 >> 31;
	  var exp  = ((h32 >> 20) & 0x7ff) - 1023;
	  var hfrac = ( h32 & 0xfffff ) | 0x100000;
	  var frac = hfrac * Math.pow(2, exp - 20) +
	    l32   * Math.pow(2, exp - 52);
	  return (sign == 0 ? 1 : -1) * frac;
	}

	Unpacker.prototype.read = function(length){
	  var j = this.index;
	  if (j + length <= this.length) {
	    return this.dataView.subarray(j, j + length);
	  } else {
	    throw new Error('BinaryPackFailure: read index out of range');
	  }
	}

	function Packer(){
	  this.bufferBuilder = new BufferBuilder();
	}

	Packer.prototype.getBuffer = function(){
	  return this.bufferBuilder.getBuffer();
	}

	Packer.prototype.pack = function(value){
	  var type = typeof(value);
	  if (type == 'string'){
	    this.pack_string(value);
	  } else if (type == 'number'){
	    if (Math.floor(value) === value){
	      this.pack_integer(value);
	    } else{
	      this.pack_double(value);
	    }
	  } else if (type == 'boolean'){
	    if (value === true){
	      this.bufferBuilder.append(0xc3);
	    } else if (value === false){
	      this.bufferBuilder.append(0xc2);
	    }
	  } else if (type == 'undefined'){
	    this.bufferBuilder.append(0xc0);
	  } else if (type == 'object'){
	    if (value === null){
	      this.bufferBuilder.append(0xc0);
	    } else {
	      var constructor = value.constructor;
	      if (constructor == Array){
	        this.pack_array(value);
	      } else if (constructor == Blob || constructor == File) {
	        this.pack_bin(value);
	      } else if (constructor == ArrayBuffer) {
	        if(binaryFeatures.useArrayBufferView) {
	          this.pack_bin(new Uint8Array(value));
	        } else {
	          this.pack_bin(value);
	        }
	      } else if ('BYTES_PER_ELEMENT' in value){
	        if(binaryFeatures.useArrayBufferView) {
	          this.pack_bin(new Uint8Array(value.buffer));
	        } else {
	          this.pack_bin(value.buffer);
	        }
	      } else if (constructor == Object){
	        this.pack_object(value);
	      } else if (constructor == Date){
	        this.pack_string(value.toString());
	      } else if (typeof value.toBinaryPack == 'function'){
	        this.bufferBuilder.append(value.toBinaryPack());
	      } else {
	        throw new Error('Type "' + constructor.toString() + '" not yet supported');
	      }
	    }
	  } else {
	    throw new Error('Type "' + type + '" not yet supported');
	  }
	  this.bufferBuilder.flush();
	}


	Packer.prototype.pack_bin = function(blob){
	  var length = blob.length || blob.byteLength || blob.size;
	  if (length <= 0x0f){
	    this.pack_uint8(0xa0 + length);
	  } else if (length <= 0xffff){
	    this.bufferBuilder.append(0xda) ;
	    this.pack_uint16(length);
	  } else if (length <= 0xffffffff){
	    this.bufferBuilder.append(0xdb);
	    this.pack_uint32(length);
	  } else{
	    throw new Error('Invalid length');
	  }
	  this.bufferBuilder.append(blob);
	}

	Packer.prototype.pack_string = function(str){
	  var length = utf8Length(str);

	  if (length <= 0x0f){
	    this.pack_uint8(0xb0 + length);
	  } else if (length <= 0xffff){
	    this.bufferBuilder.append(0xd8) ;
	    this.pack_uint16(length);
	  } else if (length <= 0xffffffff){
	    this.bufferBuilder.append(0xd9);
	    this.pack_uint32(length);
	  } else{
	    throw new Error('Invalid length');
	  }
	  this.bufferBuilder.append(str);
	}

	Packer.prototype.pack_array = function(ary){
	  var length = ary.length;
	  if (length <= 0x0f){
	    this.pack_uint8(0x90 + length);
	  } else if (length <= 0xffff){
	    this.bufferBuilder.append(0xdc)
	    this.pack_uint16(length);
	  } else if (length <= 0xffffffff){
	    this.bufferBuilder.append(0xdd);
	    this.pack_uint32(length);
	  } else{
	    throw new Error('Invalid length');
	  }
	  for(var i = 0; i < length ; i++){
	    this.pack(ary[i]);
	  }
	}

	Packer.prototype.pack_integer = function(num){
	  if ( -0x20 <= num && num <= 0x7f){
	    this.bufferBuilder.append(num & 0xff);
	  } else if (0x00 <= num && num <= 0xff){
	    this.bufferBuilder.append(0xcc);
	    this.pack_uint8(num);
	  } else if (-0x80 <= num && num <= 0x7f){
	    this.bufferBuilder.append(0xd0);
	    this.pack_int8(num);
	  } else if ( 0x0000 <= num && num <= 0xffff){
	    this.bufferBuilder.append(0xcd);
	    this.pack_uint16(num);
	  } else if (-0x8000 <= num && num <= 0x7fff){
	    this.bufferBuilder.append(0xd1);
	    this.pack_int16(num);
	  } else if ( 0x00000000 <= num && num <= 0xffffffff){
	    this.bufferBuilder.append(0xce);
	    this.pack_uint32(num);
	  } else if (-0x80000000 <= num && num <= 0x7fffffff){
	    this.bufferBuilder.append(0xd2);
	    this.pack_int32(num);
	  } else if (-0x8000000000000000 <= num && num <= 0x7FFFFFFFFFFFFFFF){
	    this.bufferBuilder.append(0xd3);
	    this.pack_int64(num);
	  } else if (0x0000000000000000 <= num && num <= 0xFFFFFFFFFFFFFFFF){
	    this.bufferBuilder.append(0xcf);
	    this.pack_uint64(num);
	  } else{
	    throw new Error('Invalid integer');
	  }
	}

	Packer.prototype.pack_double = function(num){
	  var sign = 0;
	  if (num < 0){
	    sign = 1;
	    num = -num;
	  }
	  var exp  = Math.floor(Math.log(num) / Math.LN2);
	  var frac0 = num / Math.pow(2, exp) - 1;
	  var frac1 = Math.floor(frac0 * Math.pow(2, 52));
	  var b32   = Math.pow(2, 32);
	  var h32 = (sign << 31) | ((exp+1023) << 20) |
	      (frac1 / b32) & 0x0fffff;
	  var l32 = frac1 % b32;
	  this.bufferBuilder.append(0xcb);
	  this.pack_int32(h32);
	  this.pack_int32(l32);
	}

	Packer.prototype.pack_object = function(obj){
	  var keys = Object.keys(obj);
	  var length = keys.length;
	  if (length <= 0x0f){
	    this.pack_uint8(0x80 + length);
	  } else if (length <= 0xffff){
	    this.bufferBuilder.append(0xde);
	    this.pack_uint16(length);
	  } else if (length <= 0xffffffff){
	    this.bufferBuilder.append(0xdf);
	    this.pack_uint32(length);
	  } else{
	    throw new Error('Invalid length');
	  }
	  for(var prop in obj){
	    if (obj.hasOwnProperty(prop)){
	      this.pack(prop);
	      this.pack(obj[prop]);
	    }
	  }
	}

	Packer.prototype.pack_uint8 = function(num){
	  this.bufferBuilder.append(num);
	}

	Packer.prototype.pack_uint16 = function(num){
	  this.bufferBuilder.append(num >> 8);
	  this.bufferBuilder.append(num & 0xff);
	}

	Packer.prototype.pack_uint32 = function(num){
	  var n = num & 0xffffffff;
	  this.bufferBuilder.append((n & 0xff000000) >>> 24);
	  this.bufferBuilder.append((n & 0x00ff0000) >>> 16);
	  this.bufferBuilder.append((n & 0x0000ff00) >>>  8);
	  this.bufferBuilder.append((n & 0x000000ff));
	}

	Packer.prototype.pack_uint64 = function(num){
	  var high = num / Math.pow(2, 32);
	  var low  = num % Math.pow(2, 32);
	  this.bufferBuilder.append((high & 0xff000000) >>> 24);
	  this.bufferBuilder.append((high & 0x00ff0000) >>> 16);
	  this.bufferBuilder.append((high & 0x0000ff00) >>>  8);
	  this.bufferBuilder.append((high & 0x000000ff));
	  this.bufferBuilder.append((low  & 0xff000000) >>> 24);
	  this.bufferBuilder.append((low  & 0x00ff0000) >>> 16);
	  this.bufferBuilder.append((low  & 0x0000ff00) >>>  8);
	  this.bufferBuilder.append((low  & 0x000000ff));
	}

	Packer.prototype.pack_int8 = function(num){
	  this.bufferBuilder.append(num & 0xff);
	}

	Packer.prototype.pack_int16 = function(num){
	  this.bufferBuilder.append((num & 0xff00) >> 8);
	  this.bufferBuilder.append(num & 0xff);
	}

	Packer.prototype.pack_int32 = function(num){
	  this.bufferBuilder.append((num >>> 24) & 0xff);
	  this.bufferBuilder.append((num & 0x00ff0000) >>> 16);
	  this.bufferBuilder.append((num & 0x0000ff00) >>> 8);
	  this.bufferBuilder.append((num & 0x000000ff));
	}

	Packer.prototype.pack_int64 = function(num){
	  var high = Math.floor(num / Math.pow(2, 32));
	  var low  = num % Math.pow(2, 32);
	  this.bufferBuilder.append((high & 0xff000000) >>> 24);
	  this.bufferBuilder.append((high & 0x00ff0000) >>> 16);
	  this.bufferBuilder.append((high & 0x0000ff00) >>>  8);
	  this.bufferBuilder.append((high & 0x000000ff));
	  this.bufferBuilder.append((low  & 0xff000000) >>> 24);
	  this.bufferBuilder.append((low  & 0x00ff0000) >>> 16);
	  this.bufferBuilder.append((low  & 0x0000ff00) >>>  8);
	  this.bufferBuilder.append((low  & 0x000000ff));
	}

	function _utf8Replace(m){
	  var code = m.charCodeAt(0);

	  if(code <= 0x7ff) return '00';
	  if(code <= 0xffff) return '000';
	  if(code <= 0x1fffff) return '0000';
	  if(code <= 0x3ffffff) return '00000';
	  return '000000';
	}

	function utf8Length(str){
	  if (str.length > 600) {
	    // Blob method faster for large strings
	    return (new Blob([str])).size;
	  } else {
	    return str.replace(/[^\u0000-\u007F]/g, _utf8Replace).length;
	  }
	}


/***/ },
/* 114 */
/***/ function(module, exports) {

	var binaryFeatures = {};
	binaryFeatures.useBlobBuilder = (function(){
	  try {
	    new Blob([]);
	    return false;
	  } catch (e) {
	    return true;
	  }
	})();

	binaryFeatures.useArrayBufferView = !binaryFeatures.useBlobBuilder && (function(){
	  try {
	    return (new Blob([new Uint8Array([])])).size === 0;
	  } catch (e) {
	    return true;
	  }
	})();

	module.exports.binaryFeatures = binaryFeatures;
	var BlobBuilder = module.exports.BlobBuilder;
	if (typeof window != 'undefined') {
	  BlobBuilder = module.exports.BlobBuilder = window.WebKitBlobBuilder ||
	    window.MozBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;
	}

	function BufferBuilder(){
	  this._pieces = [];
	  this._parts = [];
	}

	BufferBuilder.prototype.append = function(data) {
	  if(typeof data === 'number') {
	    this._pieces.push(data);
	  } else {
	    this.flush();
	    this._parts.push(data);
	  }
	};

	BufferBuilder.prototype.flush = function() {
	  if (this._pieces.length > 0) {
	    var buf = new Uint8Array(this._pieces);
	    if(!binaryFeatures.useArrayBufferView) {
	      buf = buf.buffer;
	    }
	    this._parts.push(buf);
	    this._pieces = [];
	  }
	};

	BufferBuilder.prototype.getBuffer = function() {
	  this.flush();
	  if(binaryFeatures.useBlobBuilder) {
	    var builder = new BlobBuilder();
	    for(var i = 0, ii = this._parts.length; i < ii; i++) {
	      builder.append(this._parts[i]);
	    }
	    return builder.getBlob();
	  } else {
	    return new Blob(this._parts);
	  }
	};

	module.exports.BufferBuilder = BufferBuilder;


/***/ },
/* 115 */
/***/ function(module, exports) {

	module.exports.RTCSessionDescription = window.RTCSessionDescription ||
		window.mozRTCSessionDescription;
	module.exports.RTCPeerConnection = window.RTCPeerConnection ||
		window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	module.exports.RTCIceCandidate = window.RTCIceCandidate ||
		window.mozRTCIceCandidate;


/***/ },
/* 116 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Representation of a single EventEmitter function.
	 *
	 * @param {Function} fn Event handler to be called.
	 * @param {Mixed} context Context for function execution.
	 * @param {Boolean} once Only emit once
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}

	/**
	 * Minimal EventEmitter interface that is molded against the Node.js
	 * EventEmitter interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() { /* Nothing to set */ }

	/**
	 * Holds the assigned EventEmitters by name.
	 *
	 * @type {Object}
	 * @private
	 */
	EventEmitter.prototype._events = undefined;

	/**
	 * Return a list of assigned event listeners.
	 *
	 * @param {String} event The events that should be listed.
	 * @returns {Array}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event) {
	  if (!this._events || !this._events[event]) return [];
	  if (this._events[event].fn) return [this._events[event].fn];

	  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
	    ee[i] = this._events[event][i].fn;
	  }

	  return ee;
	};

	/**
	 * Emit an event to all registered event listeners.
	 *
	 * @param {String} event The name of the event.
	 * @returns {Boolean} Indication if we've emitted an event.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  if (!this._events || !this._events[event]) return false;

	  var listeners = this._events[event]
	    , len = arguments.length
	    , args
	    , i;

	  if ('function' === typeof listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, true);

	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }

	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }

	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;

	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }

	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }

	  return true;
	};

	/**
	 * Register a new EventListener for the given event.
	 *
	 * @param {String} event Name of the event.
	 * @param {Functon} fn Callback function.
	 * @param {Mixed} context The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  var listener = new EE(fn, context || this);

	  if (!this._events) this._events = {};
	  if (!this._events[event]) this._events[event] = listener;
	  else {
	    if (!this._events[event].fn) this._events[event].push(listener);
	    else this._events[event] = [
	      this._events[event], listener
	    ];
	  }

	  return this;
	};

	/**
	 * Add an EventListener that's only called once.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} context The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  var listener = new EE(fn, context || this, true);

	  if (!this._events) this._events = {};
	  if (!this._events[event]) this._events[event] = listener;
	  else {
	    if (!this._events[event].fn) this._events[event].push(listener);
	    else this._events[event] = [
	      this._events[event], listener
	    ];
	  }

	  return this;
	};

	/**
	 * Remove event listeners.
	 *
	 * @param {String} event The event we want to remove.
	 * @param {Function} fn The listener that we need to find.
	 * @param {Boolean} once Only remove once listeners.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
	  if (!this._events || !this._events[event]) return this;

	  var listeners = this._events[event]
	    , events = [];

	  if (fn) {
	    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
	      events.push(listeners);
	    }
	    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
	      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
	        events.push(listeners[i]);
	      }
	    }
	  }

	  //
	  // Reset the array, or remove it completely if we have no more listeners.
	  //
	  if (events.length) {
	    this._events[event] = events.length === 1 ? events[0] : events;
	  } else {
	    delete this._events[event];
	  }

	  return this;
	};

	/**
	 * Remove all listeners or only the listeners for the specified event.
	 *
	 * @param {String} event The event want to remove all listeners for.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  if (!this._events) return this;

	  if (event) delete this._events[event];
	  else this._events = {};

	  return this;
	};

	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};

	//
	// Expose the module.
	//
	EventEmitter.EventEmitter = EventEmitter;
	EventEmitter.EventEmitter2 = EventEmitter;
	EventEmitter.EventEmitter3 = EventEmitter;

	//
	// Expose the module.
	//
	module.exports = EventEmitter;


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(112);
	var EventEmitter = __webpack_require__(116);

	/**
	 * An abstraction on top of WebSockets and XHR streaming to provide fastest
	 * possible connection for peers.
	 */
	function Socket(secure, host, port, path, key) {
	  if (!(this instanceof Socket)) return new Socket(secure, host, port, path, key);

	  EventEmitter.call(this);

	  // Disconnected manually.
	  this.disconnected = false;
	  this._queue = [];

	  var httpProtocol = secure ? 'https://' : 'http://';
	  var wsProtocol = secure ? 'wss://' : 'ws://';
	  this._httpUrl = httpProtocol + host + ':' + port + path + key;
	  this._wsUrl = wsProtocol + host + ':' + port + path + 'peerjs?key=' + key;
	}

	util.inherits(Socket, EventEmitter);


	/** Check in with ID or get one from server. */
	Socket.prototype.start = function(id, token) {
	  this.id = id;

	  this._httpUrl += '/' + id + '/' + token;
	  this._wsUrl += '&id=' + id + '&token=' + token;

	  this._startXhrStream();
	  this._startWebSocket();
	}


	/** Start up websocket communications. */
	Socket.prototype._startWebSocket = function(id) {
	  var self = this;

	  if (this._socket) {
	    return;
	  }

	  this._socket = new WebSocket(this._wsUrl);

	  this._socket.onmessage = function(event) {
	    try {
	      var data = JSON.parse(event.data);
	    } catch(e) {
	      util.log('Invalid server message', event.data);
	      return;
	    }
	    self.emit('message', data);
	  };

	  this._socket.onclose = function(event) {
	    util.log('Socket closed.');
	    self.disconnected = true;
	    self.emit('disconnected');
	  };

	  // Take care of the queue of connections if necessary and make sure Peer knows
	  // socket is open.
	  this._socket.onopen = function() {
	    if (self._timeout) {
	      clearTimeout(self._timeout);
	      setTimeout(function(){
	        self._http.abort();
	        self._http = null;
	      }, 5000);
	    }
	    self._sendQueuedMessages();
	    util.log('Socket open');
	  };
	}

	/** Start XHR streaming. */
	Socket.prototype._startXhrStream = function(n) {
	  try {
	    var self = this;
	    this._http = new XMLHttpRequest();
	    this._http._index = 1;
	    this._http._streamIndex = n || 0;
	    this._http.open('post', this._httpUrl + '/id?i=' + this._http._streamIndex, true);
	    this._http.onerror = function() {
	      // If we get an error, likely something went wrong.
	      // Stop streaming.
	      clearTimeout(self._timeout);
	      self.emit('disconnected');
	    }
	    this._http.onreadystatechange = function() {
	      if (this.readyState == 2 && this.old) {
	        this.old.abort();
	        delete this.old;
	      } else if (this.readyState > 2 && this.status === 200 && this.responseText) {
	        self._handleStream(this);
	      }
	    };
	    this._http.send(null);
	    this._setHTTPTimeout();
	  } catch(e) {
	    util.log('XMLHttpRequest not available; defaulting to WebSockets');
	  }
	}


	/** Handles onreadystatechange response as a stream. */
	Socket.prototype._handleStream = function(http) {
	  // 3 and 4 are loading/done state. All others are not relevant.
	  var messages = http.responseText.split('\n');

	  // Check to see if anything needs to be processed on buffer.
	  if (http._buffer) {
	    while (http._buffer.length > 0) {
	      var index = http._buffer.shift();
	      var bufferedMessage = messages[index];
	      try {
	        bufferedMessage = JSON.parse(bufferedMessage);
	      } catch(e) {
	        http._buffer.shift(index);
	        break;
	      }
	      this.emit('message', bufferedMessage);
	    }
	  }

	  var message = messages[http._index];
	  if (message) {
	    http._index += 1;
	    // Buffering--this message is incomplete and we'll get to it next time.
	    // This checks if the httpResponse ended in a `\n`, in which case the last
	    // element of messages should be the empty string.
	    if (http._index === messages.length) {
	      if (!http._buffer) {
	        http._buffer = [];
	      }
	      http._buffer.push(http._index - 1);
	    } else {
	      try {
	        message = JSON.parse(message);
	      } catch(e) {
	        util.log('Invalid server message', message);
	        return;
	      }
	      this.emit('message', message);
	    }
	  }
	}

	Socket.prototype._setHTTPTimeout = function() {
	  var self = this;
	  this._timeout = setTimeout(function() {
	    var old = self._http;
	    if (!self._wsOpen()) {
	      self._startXhrStream(old._streamIndex + 1);
	      self._http.old = old;
	    } else {
	      old.abort();
	    }
	  }, 25000);
	}

	/** Is the websocket currently open? */
	Socket.prototype._wsOpen = function() {
	  return this._socket && this._socket.readyState == 1;
	}

	/** Send queued messages. */
	Socket.prototype._sendQueuedMessages = function() {
	  for (var i = 0, ii = this._queue.length; i < ii; i += 1) {
	    this.send(this._queue[i]);
	  }
	}

	/** Exposed send for DC & Peer. */
	Socket.prototype.send = function(data) {
	  if (this.disconnected) {
	    return;
	  }

	  // If we didn't get an ID yet, we can't yet send anything so we should queue
	  // up these messages.
	  if (!this.id) {
	    this._queue.push(data);
	    return;
	  }

	  if (!data.type) {
	    this.emit('error', 'Invalid message');
	    return;
	  }

	  var message = JSON.stringify(data);
	  if (this._wsOpen()) {
	    this._socket.send(message);
	  } else {
	    var http = new XMLHttpRequest();
	    var url = this._httpUrl + '/' + data.type.toLowerCase();
	    http.open('post', url, true);
	    http.setRequestHeader('Content-Type', 'application/json');
	    http.send(message);
	  }
	}

	Socket.prototype.close = function() {
	  if (!this.disconnected && this._wsOpen()) {
	    this._socket.close();
	    this.disconnected = true;
	  }
	}

	module.exports = Socket;


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(112);
	var EventEmitter = __webpack_require__(116);
	var Negotiator = __webpack_require__(119);

	/**
	 * Wraps the streaming interface between two Peers.
	 */
	function MediaConnection(peer, provider, options) {
	  if (!(this instanceof MediaConnection)) return new MediaConnection(peer, provider, options);
	  EventEmitter.call(this);

	  this.options = util.extend({}, options);

	  this.open = false;
	  this.type = 'media';
	  this.peer = peer;
	  this.provider = provider;
	  this.metadata = this.options.metadata;
	  this.localStream = this.options._stream;

	  this.id = this.options.connectionId || MediaConnection._idPrefix + util.randomToken();
	  if (this.localStream) {
	    Negotiator.startConnection(
	      this,
	      {_stream: this.localStream, originator: true}
	    );
	  }
	};

	util.inherits(MediaConnection, EventEmitter);

	MediaConnection._idPrefix = 'mc_';

	MediaConnection.prototype.addStream = function(remoteStream) {
	  util.log('Receiving stream', remoteStream);

	  this.remoteStream = remoteStream;
	  this.emit('stream', remoteStream); // Should we call this `open`?

	};

	MediaConnection.prototype.handleMessage = function(message) {
	  var payload = message.payload;

	  switch (message.type) {
	    case 'ANSWER':
	      // Forward to negotiator
	      Negotiator.handleSDP(message.type, this, payload.sdp);
	      this.open = true;
	      break;
	    case 'CANDIDATE':
	      Negotiator.handleCandidate(this, payload.candidate);
	      break;
	    default:
	      util.warn('Unrecognized message type:', message.type, 'from peer:', this.peer);
	      break;
	  }
	}

	MediaConnection.prototype.answer = function(stream) {
	  if (this.localStream) {
	    util.warn('Local stream already exists on this MediaConnection. Are you answering a call twice?');
	    return;
	  }

	  this.options._payload._stream = stream;

	  this.localStream = stream;
	  Negotiator.startConnection(
	    this,
	    this.options._payload
	  )
	  // Retrieve lost messages stored because PeerConnection not set up.
	  var messages = this.provider._getMessages(this.id);
	  for (var i = 0, ii = messages.length; i < ii; i += 1) {
	    this.handleMessage(messages[i]);
	  }
	  this.open = true;
	};

	/**
	 * Exposed functionality for users.
	 */

	/** Allows user to close connection. */
	MediaConnection.prototype.close = function() {
	  if (!this.open) {
	    return;
	  }
	  this.open = false;
	  Negotiator.cleanup(this);
	  this.emit('close')
	};

	module.exports = MediaConnection;


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(112);
	var RTCPeerConnection = __webpack_require__(115).RTCPeerConnection;
	var RTCSessionDescription = __webpack_require__(115).RTCSessionDescription;
	var RTCIceCandidate = __webpack_require__(115).RTCIceCandidate;

	/**
	 * Manages all negotiations between Peers.
	 */
	var Negotiator = {
	  pcs: {
	    data: {},
	    media: {}
	  }, // type => {peerId: {pc_id: pc}}.
	  //providers: {}, // provider's id => providers (there may be multiple providers/client.
	  queue: [] // connections that are delayed due to a PC being in use.
	}

	Negotiator._idPrefix = 'pc_';

	/** Returns a PeerConnection object set up correctly (for data, media). */
	Negotiator.startConnection = function(connection, options) {
	  var pc = Negotiator._getPeerConnection(connection, options);

	  if (connection.type === 'media' && options._stream) {
	    // Add the stream.
	    pc.addStream(options._stream);
	  }

	  // Set the connection's PC.
	  connection.pc = connection.peerConnection = pc;
	  // What do we need to do now?
	  if (options.originator) {
	    if (connection.type === 'data') {
	      // Create the datachannel.
	      var config = {};
	      // Dropping reliable:false support, since it seems to be crashing
	      // Chrome.
	      /*if (util.supports.sctp && !options.reliable) {
	        // If we have canonical reliable support...
	        config = {maxRetransmits: 0};
	      }*/
	      // Fallback to ensure older browsers don't crash.
	      if (!util.supports.sctp) {
	        config = {reliable: options.reliable};
	      }
	      var dc = pc.createDataChannel(connection.label, config);
	      connection.initialize(dc);
	    }

	    if (!util.supports.onnegotiationneeded) {
	      Negotiator._makeOffer(connection);
	    }
	  } else {
	    Negotiator.handleSDP('OFFER', connection, options.sdp);
	  }
	}

	Negotiator._getPeerConnection = function(connection, options) {
	  if (!Negotiator.pcs[connection.type]) {
	    util.error(connection.type + ' is not a valid connection type. Maybe you overrode the `type` property somewhere.');
	  }

	  if (!Negotiator.pcs[connection.type][connection.peer]) {
	    Negotiator.pcs[connection.type][connection.peer] = {};
	  }
	  var peerConnections = Negotiator.pcs[connection.type][connection.peer];

	  var pc;
	  // Not multiplexing while FF and Chrome have not-great support for it.
	  /*if (options.multiplex) {
	    ids = Object.keys(peerConnections);
	    for (var i = 0, ii = ids.length; i < ii; i += 1) {
	      pc = peerConnections[ids[i]];
	      if (pc.signalingState === 'stable') {
	        break; // We can go ahead and use this PC.
	      }
	    }
	  } else */
	  if (options.pc) { // Simplest case: PC id already provided for us.
	    pc = Negotiator.pcs[connection.type][connection.peer][options.pc];
	  }

	  if (!pc || pc.signalingState !== 'stable') {
	    pc = Negotiator._startPeerConnection(connection);
	  }
	  return pc;
	}

	/*
	Negotiator._addProvider = function(provider) {
	  if ((!provider.id && !provider.disconnected) || !provider.socket.open) {
	    // Wait for provider to obtain an ID.
	    provider.on('open', function(id) {
	      Negotiator._addProvider(provider);
	    });
	  } else {
	    Negotiator.providers[provider.id] = provider;
	  }
	}*/


	/** Start a PC. */
	Negotiator._startPeerConnection = function(connection) {
	  util.log('Creating RTCPeerConnection.');

	  var id = Negotiator._idPrefix + util.randomToken();
	  var optional = {};

	  if (connection.type === 'data' && !util.supports.sctp) {
	    optional = {optional: [{RtpDataChannels: true}]};
	  } else if (connection.type === 'media') {
	    // Interop req for chrome.
	    optional = {optional: [{DtlsSrtpKeyAgreement: true}]};
	  }

	  var pc = new RTCPeerConnection(connection.provider.options.config, optional);
	  Negotiator.pcs[connection.type][connection.peer][id] = pc;

	  Negotiator._setupListeners(connection, pc, id);

	  return pc;
	}

	/** Set up various WebRTC listeners. */
	Negotiator._setupListeners = function(connection, pc, pc_id) {
	  var peerId = connection.peer;
	  var connectionId = connection.id;
	  var provider = connection.provider;

	  // ICE CANDIDATES.
	  util.log('Listening for ICE candidates.');
	  pc.onicecandidate = function(evt) {
	    if (evt.candidate) {
	      util.log('Received ICE candidates for:', connection.peer);
	      provider.socket.send({
	        type: 'CANDIDATE',
	        payload: {
	          candidate: evt.candidate,
	          type: connection.type,
	          connectionId: connection.id
	        },
	        dst: peerId
	      });
	    }
	  };

	  pc.oniceconnectionstatechange = function() {
	    switch (pc.iceConnectionState) {
	      case 'disconnected':
	      case 'failed':
	        util.log('iceConnectionState is disconnected, closing connections to ' + peerId);
	        connection.close();
	        break;
	      case 'completed':
	        pc.onicecandidate = util.noop;
	        break;
	    }
	  };

	  // Fallback for older Chrome impls.
	  pc.onicechange = pc.oniceconnectionstatechange;

	  // ONNEGOTIATIONNEEDED (Chrome)
	  util.log('Listening for `negotiationneeded`');
	  pc.onnegotiationneeded = function() {
	    util.log('`negotiationneeded` triggered');
	    if (pc.signalingState == 'stable') {
	      Negotiator._makeOffer(connection);
	    } else {
	      util.log('onnegotiationneeded triggered when not stable. Is another connection being established?');
	    }
	  };

	  // DATACONNECTION.
	  util.log('Listening for data channel');
	  // Fired between offer and answer, so options should already be saved
	  // in the options hash.
	  pc.ondatachannel = function(evt) {
	    util.log('Received data channel');
	    var dc = evt.channel;
	    var connection = provider.getConnection(peerId, connectionId);
	    connection.initialize(dc);
	  };

	  // MEDIACONNECTION.
	  util.log('Listening for remote stream');
	  pc.onaddstream = function(evt) {
	    util.log('Received remote stream');
	    var stream = evt.stream;
	    var connection = provider.getConnection(peerId, connectionId);
	    // 10/10/2014: looks like in Chrome 38, onaddstream is triggered after
	    // setting the remote description. Our connection object in these cases
	    // is actually a DATA connection, so addStream fails.
	    // TODO: This is hopefully just a temporary fix. We should try to
	    // understand why this is happening.
	    if (connection.type === 'media') {
	      connection.addStream(stream);
	    }
	  };
	}

	Negotiator.cleanup = function(connection) {
	  util.log('Cleaning up PeerConnection to ' + connection.peer);

	  var pc = connection.pc;

	  if (!!pc && (pc.readyState !== 'closed' || pc.signalingState !== 'closed')) {
	    pc.close();
	    connection.pc = null;
	  }
	}

	Negotiator._makeOffer = function(connection) {
	  var pc = connection.pc;
	  pc.createOffer(function(offer) {
	    util.log('Created offer.');

	    if (!util.supports.sctp && connection.type === 'data' && connection.reliable) {
	      offer.sdp = Reliable.higherBandwidthSDP(offer.sdp);
	    }

	    pc.setLocalDescription(offer, function() {
	      util.log('Set localDescription: offer', 'for:', connection.peer);
	      connection.provider.socket.send({
	        type: 'OFFER',
	        payload: {
	          sdp: offer,
	          type: connection.type,
	          label: connection.label,
	          connectionId: connection.id,
	          reliable: connection.reliable,
	          serialization: connection.serialization,
	          metadata: connection.metadata,
	          browser: util.browser
	        },
	        dst: connection.peer
	      });
	    }, function(err) {
	      connection.provider.emitError('webrtc', err);
	      util.log('Failed to setLocalDescription, ', err);
	    });
	  }, function(err) {
	    connection.provider.emitError('webrtc', err);
	    util.log('Failed to createOffer, ', err);
	  }, connection.options.constraints);
	}

	Negotiator._makeAnswer = function(connection) {
	  var pc = connection.pc;

	  pc.createAnswer(function(answer) {
	    util.log('Created answer.');

	    if (!util.supports.sctp && connection.type === 'data' && connection.reliable) {
	      answer.sdp = Reliable.higherBandwidthSDP(answer.sdp);
	    }

	    pc.setLocalDescription(answer, function() {
	      util.log('Set localDescription: answer', 'for:', connection.peer);
	      connection.provider.socket.send({
	        type: 'ANSWER',
	        payload: {
	          sdp: answer,
	          type: connection.type,
	          connectionId: connection.id,
	          browser: util.browser
	        },
	        dst: connection.peer
	      });
	    }, function(err) {
	      connection.provider.emitError('webrtc', err);
	      util.log('Failed to setLocalDescription, ', err);
	    });
	  }, function(err) {
	    connection.provider.emitError('webrtc', err);
	    util.log('Failed to create answer, ', err);
	  });
	}

	/** Handle an SDP. */
	Negotiator.handleSDP = function(type, connection, sdp) {
	  sdp = new RTCSessionDescription(sdp);
	  var pc = connection.pc;

	  util.log('Setting remote description', sdp);
	  pc.setRemoteDescription(sdp, function() {
	    util.log('Set remoteDescription:', type, 'for:', connection.peer);

	    if (type === 'OFFER') {
	      Negotiator._makeAnswer(connection);
	    }
	  }, function(err) {
	    connection.provider.emitError('webrtc', err);
	    util.log('Failed to setRemoteDescription, ', err);
	  });
	}

	/** Handle a candidate. */
	Negotiator.handleCandidate = function(connection, ice) {
	  var candidate = ice.candidate;
	  var sdpMLineIndex = ice.sdpMLineIndex;
	  connection.pc.addIceCandidate(new RTCIceCandidate({
	    sdpMLineIndex: sdpMLineIndex,
	    candidate: candidate
	  }));
	  util.log('Added ICE candidate for:', connection.peer);
	}

	module.exports = Negotiator;


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(112);
	var EventEmitter = __webpack_require__(116);
	var Negotiator = __webpack_require__(119);
	var Reliable = __webpack_require__(121);

	/**
	 * Wraps a DataChannel between two Peers.
	 */
	function DataConnection(peer, provider, options) {
	  if (!(this instanceof DataConnection)) return new DataConnection(peer, provider, options);
	  EventEmitter.call(this);

	  this.options = util.extend({
	    serialization: 'binary',
	    reliable: false
	  }, options);

	  // Connection is not open yet.
	  this.open = false;
	  this.type = 'data';
	  this.peer = peer;
	  this.provider = provider;

	  this.id = this.options.connectionId || DataConnection._idPrefix + util.randomToken();

	  this.label = this.options.label || this.id;
	  this.metadata = this.options.metadata;
	  this.serialization = this.options.serialization;
	  this.reliable = this.options.reliable;

	  // Data channel buffering.
	  this._buffer = [];
	  this._buffering = false;
	  this.bufferSize = 0;

	  // For storing large data.
	  this._chunkedData = {};

	  if (this.options._payload) {
	    this._peerBrowser = this.options._payload.browser;
	  }

	  Negotiator.startConnection(
	    this,
	    this.options._payload || {
	      originator: true
	    }
	  );
	}

	util.inherits(DataConnection, EventEmitter);

	DataConnection._idPrefix = 'dc_';

	/** Called by the Negotiator when the DataChannel is ready. */
	DataConnection.prototype.initialize = function(dc) {
	  this._dc = this.dataChannel = dc;
	  this._configureDataChannel();
	}

	DataConnection.prototype._configureDataChannel = function() {
	  var self = this;
	  if (util.supports.sctp) {
	    this._dc.binaryType = 'arraybuffer';
	  }
	  this._dc.onopen = function() {
	    util.log('Data channel connection success');
	    self.open = true;
	    self.emit('open');
	  }

	  // Use the Reliable shim for non Firefox browsers
	  if (!util.supports.sctp && this.reliable) {
	    this._reliable = new Reliable(this._dc, util.debug);
	  }

	  if (this._reliable) {
	    this._reliable.onmessage = function(msg) {
	      self.emit('data', msg);
	    };
	  } else {
	    this._dc.onmessage = function(e) {
	      self._handleDataMessage(e);
	    };
	  }
	  this._dc.onclose = function(e) {
	    util.log('DataChannel closed for:', self.peer);
	    self.close();
	  };
	}

	// Handles a DataChannel message.
	DataConnection.prototype._handleDataMessage = function(e) {
	  var self = this;
	  var data = e.data;
	  var datatype = data.constructor;
	  if (this.serialization === 'binary' || this.serialization === 'binary-utf8') {
	    if (datatype === Blob) {
	      // Datatype should never be blob
	      util.blobToArrayBuffer(data, function(ab) {
	        data = util.unpack(ab);
	        self.emit('data', data);
	      });
	      return;
	    } else if (datatype === ArrayBuffer) {
	      data = util.unpack(data);
	    } else if (datatype === String) {
	      // String fallback for binary data for browsers that don't support binary yet
	      var ab = util.binaryStringToArrayBuffer(data);
	      data = util.unpack(ab);
	    }
	  } else if (this.serialization === 'json') {
	    data = JSON.parse(data);
	  }

	  // Check if we've chunked--if so, piece things back together.
	  // We're guaranteed that this isn't 0.
	  if (data.__peerData) {
	    var id = data.__peerData;
	    var chunkInfo = this._chunkedData[id] || {data: [], count: 0, total: data.total};

	    chunkInfo.data[data.n] = data.data;
	    chunkInfo.count += 1;

	    if (chunkInfo.total === chunkInfo.count) {
	      // Clean up before making the recursive call to `_handleDataMessage`.
	      delete this._chunkedData[id];

	      // We've received all the chunks--time to construct the complete data.
	      data = new Blob(chunkInfo.data);
	      this._handleDataMessage({data: data});
	    }

	    this._chunkedData[id] = chunkInfo;
	    return;
	  }

	  this.emit('data', data);
	}

	/**
	 * Exposed functionality for users.
	 */

	/** Allows user to close connection. */
	DataConnection.prototype.close = function() {
	  if (!this.open) {
	    return;
	  }
	  this.open = false;
	  Negotiator.cleanup(this);
	  this.emit('close');
	}

	/** Allows user to send data. */
	DataConnection.prototype.send = function(data, chunked) {
	  if (!this.open) {
	    this.emit('error', new Error('Connection is not open. You should listen for the `open` event before sending messages.'));
	    return;
	  }
	  if (this._reliable) {
	    // Note: reliable shim sending will make it so that you cannot customize
	    // serialization.
	    this._reliable.send(data);
	    return;
	  }
	  var self = this;
	  if (this.serialization === 'json') {
	    this._bufferedSend(JSON.stringify(data));
	  } else if (this.serialization === 'binary' || this.serialization === 'binary-utf8') {
	    var blob = util.pack(data);

	    // For Chrome-Firefox interoperability, we need to make Firefox "chunk"
	    // the data it sends out.
	    var needsChunking = util.chunkedBrowsers[this._peerBrowser] || util.chunkedBrowsers[util.browser];
	    if (needsChunking && !chunked && blob.size > util.chunkedMTU) {
	      this._sendChunks(blob);
	      return;
	    }

	    // DataChannel currently only supports strings.
	    if (!util.supports.sctp) {
	      util.blobToBinaryString(blob, function(str) {
	        self._bufferedSend(str);
	      });
	    } else if (!util.supports.binaryBlob) {
	      // We only do this if we really need to (e.g. blobs are not supported),
	      // because this conversion is costly.
	      util.blobToArrayBuffer(blob, function(ab) {
	        self._bufferedSend(ab);
	      });
	    } else {
	      this._bufferedSend(blob);
	    }
	  } else {
	    this._bufferedSend(data);
	  }
	}

	DataConnection.prototype._bufferedSend = function(msg) {
	  if (this._buffering || !this._trySend(msg)) {
	    this._buffer.push(msg);
	    this.bufferSize = this._buffer.length;
	  }
	}

	// Returns true if the send succeeds.
	DataConnection.prototype._trySend = function(msg) {
	  try {
	    this._dc.send(msg);
	  } catch (e) {
	    this._buffering = true;

	    var self = this;
	    setTimeout(function() {
	      // Try again.
	      self._buffering = false;
	      self._tryBuffer();
	    }, 100);
	    return false;
	  }
	  return true;
	}

	// Try to send the first message in the buffer.
	DataConnection.prototype._tryBuffer = function() {
	  if (this._buffer.length === 0) {
	    return;
	  }

	  var msg = this._buffer[0];

	  if (this._trySend(msg)) {
	    this._buffer.shift();
	    this.bufferSize = this._buffer.length;
	    this._tryBuffer();
	  }
	}

	DataConnection.prototype._sendChunks = function(blob) {
	  var blobs = util.chunk(blob);
	  for (var i = 0, ii = blobs.length; i < ii; i += 1) {
	    var blob = blobs[i];
	    this.send(blob, true);
	  }
	}

	DataConnection.prototype.handleMessage = function(message) {
	  var payload = message.payload;

	  switch (message.type) {
	    case 'ANSWER':
	      this._peerBrowser = payload.browser;

	      // Forward to negotiator
	      Negotiator.handleSDP(message.type, this, payload.sdp);
	      break;
	    case 'CANDIDATE':
	      Negotiator.handleCandidate(this, payload.candidate);
	      break;
	    default:
	      util.warn('Unrecognized message type:', message.type, 'from peer:', this.peer);
	      break;
	  }
	}

	module.exports = DataConnection;


/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(122);

	/**
	 * Reliable transfer for Chrome Canary DataChannel impl.
	 * Author: @michellebu
	 */
	function Reliable(dc, debug) {
	  if (!(this instanceof Reliable)) return new Reliable(dc);
	  this._dc = dc;

	  util.debug = debug;

	  // Messages sent/received so far.
	  // id: { ack: n, chunks: [...] }
	  this._outgoing = {};
	  // id: { ack: ['ack', id, n], chunks: [...] }
	  this._incoming = {};
	  this._received = {};

	  // Window size.
	  this._window = 1000;
	  // MTU.
	  this._mtu = 500;
	  // Interval for setInterval. In ms.
	  this._interval = 0;

	  // Messages sent.
	  this._count = 0;

	  // Outgoing message queue.
	  this._queue = [];

	  this._setupDC();
	};

	// Send a message reliably.
	Reliable.prototype.send = function(msg) {
	  // Determine if chunking is necessary.
	  var bl = util.pack(msg);
	  if (bl.size < this._mtu) {
	    this._handleSend(['no', bl]);
	    return;
	  }

	  this._outgoing[this._count] = {
	    ack: 0,
	    chunks: this._chunk(bl)
	  };

	  if (util.debug) {
	    this._outgoing[this._count].timer = new Date();
	  }

	  // Send prelim window.
	  this._sendWindowedChunks(this._count);
	  this._count += 1;
	};

	// Set up interval for processing queue.
	Reliable.prototype._setupInterval = function() {
	  // TODO: fail gracefully.

	  var self = this;
	  this._timeout = setInterval(function() {
	    // FIXME: String stuff makes things terribly async.
	    var msg = self._queue.shift();
	    if (msg._multiple) {
	      for (var i = 0, ii = msg.length; i < ii; i += 1) {
	        self._intervalSend(msg[i]);
	      }
	    } else {
	      self._intervalSend(msg);
	    }
	  }, this._interval);
	};

	Reliable.prototype._intervalSend = function(msg) {
	  var self = this;
	  msg = util.pack(msg);
	  util.blobToBinaryString(msg, function(str) {
	    self._dc.send(str);
	  });
	  if (self._queue.length === 0) {
	    clearTimeout(self._timeout);
	    self._timeout = null;
	    //self._processAcks();
	  }
	};

	// Go through ACKs to send missing pieces.
	Reliable.prototype._processAcks = function() {
	  for (var id in this._outgoing) {
	    if (this._outgoing.hasOwnProperty(id)) {
	      this._sendWindowedChunks(id);
	    }
	  }
	};

	// Handle sending a message.
	// FIXME: Don't wait for interval time for all messages...
	Reliable.prototype._handleSend = function(msg) {
	  var push = true;
	  for (var i = 0, ii = this._queue.length; i < ii; i += 1) {
	    var item = this._queue[i];
	    if (item === msg) {
	      push = false;
	    } else if (item._multiple && item.indexOf(msg) !== -1) {
	      push = false;
	    }
	  }
	  if (push) {
	    this._queue.push(msg);
	    if (!this._timeout) {
	      this._setupInterval();
	    }
	  }
	};

	// Set up DataChannel handlers.
	Reliable.prototype._setupDC = function() {
	  // Handle various message types.
	  var self = this;
	  this._dc.onmessage = function(e) {
	    var msg = e.data;
	    var datatype = msg.constructor;
	    // FIXME: msg is String until binary is supported.
	    // Once that happens, this will have to be smarter.
	    if (datatype === String) {
	      var ab = util.binaryStringToArrayBuffer(msg);
	      msg = util.unpack(ab);
	      self._handleMessage(msg);
	    }
	  };
	};

	// Handles an incoming message.
	Reliable.prototype._handleMessage = function(msg) {
	  var id = msg[1];
	  var idata = this._incoming[id];
	  var odata = this._outgoing[id];
	  var data;
	  switch (msg[0]) {
	    // No chunking was done.
	    case 'no':
	      var message = id;
	      if (!!message) {
	        this.onmessage(util.unpack(message));
	      }
	      break;
	    // Reached the end of the message.
	    case 'end':
	      data = idata;

	      // In case end comes first.
	      this._received[id] = msg[2];

	      if (!data) {
	        break;
	      }

	      this._ack(id);
	      break;
	    case 'ack':
	      data = odata;
	      if (!!data) {
	        var ack = msg[2];
	        // Take the larger ACK, for out of order messages.
	        data.ack = Math.max(ack, data.ack);

	        // Clean up when all chunks are ACKed.
	        if (data.ack >= data.chunks.length) {
	          util.log('Time: ', new Date() - data.timer);
	          delete this._outgoing[id];
	        } else {
	          this._processAcks();
	        }
	      }
	      // If !data, just ignore.
	      break;
	    // Received a chunk of data.
	    case 'chunk':
	      // Create a new entry if none exists.
	      data = idata;
	      if (!data) {
	        var end = this._received[id];
	        if (end === true) {
	          break;
	        }
	        data = {
	          ack: ['ack', id, 0],
	          chunks: []
	        };
	        this._incoming[id] = data;
	      }

	      var n = msg[2];
	      var chunk = msg[3];
	      data.chunks[n] = new Uint8Array(chunk);

	      // If we get the chunk we're looking for, ACK for next missing.
	      // Otherwise, ACK the same N again.
	      if (n === data.ack[2]) {
	        this._calculateNextAck(id);
	      }
	      this._ack(id);
	      break;
	    default:
	      // Shouldn't happen, but would make sense for message to just go
	      // through as is.
	      this._handleSend(msg);
	      break;
	  }
	};

	// Chunks BL into smaller messages.
	Reliable.prototype._chunk = function(bl) {
	  var chunks = [];
	  var size = bl.size;
	  var start = 0;
	  while (start < size) {
	    var end = Math.min(size, start + this._mtu);
	    var b = bl.slice(start, end);
	    var chunk = {
	      payload: b
	    }
	    chunks.push(chunk);
	    start = end;
	  }
	  util.log('Created', chunks.length, 'chunks.');
	  return chunks;
	};

	// Sends ACK N, expecting Nth blob chunk for message ID.
	Reliable.prototype._ack = function(id) {
	  var ack = this._incoming[id].ack;

	  // if ack is the end value, then call _complete.
	  if (this._received[id] === ack[2]) {
	    this._complete(id);
	    this._received[id] = true;
	  }

	  this._handleSend(ack);
	};

	// Calculates the next ACK number, given chunks.
	Reliable.prototype._calculateNextAck = function(id) {
	  var data = this._incoming[id];
	  var chunks = data.chunks;
	  for (var i = 0, ii = chunks.length; i < ii; i += 1) {
	    // This chunk is missing!!! Better ACK for it.
	    if (chunks[i] === undefined) {
	      data.ack[2] = i;
	      return;
	    }
	  }
	  data.ack[2] = chunks.length;
	};

	// Sends the next window of chunks.
	Reliable.prototype._sendWindowedChunks = function(id) {
	  util.log('sendWindowedChunks for: ', id);
	  var data = this._outgoing[id];
	  var ch = data.chunks;
	  var chunks = [];
	  var limit = Math.min(data.ack + this._window, ch.length);
	  for (var i = data.ack; i < limit; i += 1) {
	    if (!ch[i].sent || i === data.ack) {
	      ch[i].sent = true;
	      chunks.push(['chunk', id, i, ch[i].payload]);
	    }
	  }
	  if (data.ack + this._window >= ch.length) {
	    chunks.push(['end', id, ch.length])
	  }
	  chunks._multiple = true;
	  this._handleSend(chunks);
	};

	// Puts together a message from chunks.
	Reliable.prototype._complete = function(id) {
	  util.log('Completed called for', id);
	  var self = this;
	  var chunks = this._incoming[id].chunks;
	  var bl = new Blob(chunks);
	  util.blobToArrayBuffer(bl, function(ab) {
	    self.onmessage(util.unpack(ab));
	  });
	  delete this._incoming[id];
	};

	// Ups bandwidth limit on SDP. Meant to be called during offer/answer.
	Reliable.higherBandwidthSDP = function(sdp) {
	  // AS stands for Application-Specific Maximum.
	  // Bandwidth number is in kilobits / sec.
	  // See RFC for more info: http://www.ietf.org/rfc/rfc2327.txt

	  // Chrome 31+ doesn't want us munging the SDP, so we'll let them have their
	  // way.
	  var version = navigator.appVersion.match(/Chrome\/(.*?) /);
	  if (version) {
	    version = parseInt(version[1].split('.').shift());
	    if (version < 31) {
	      var parts = sdp.split('b=AS:30');
	      var replace = 'b=AS:102400'; // 100 Mbps
	      if (parts.length > 1) {
	        return parts[0] + replace + parts[1];
	      }
	    }
	  }

	  return sdp;
	};

	// Overwritten, typically.
	Reliable.prototype.onmessage = function(msg) {};

	module.exports.Reliable = Reliable;


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	var BinaryPack = __webpack_require__(113);

	var util = {
	  debug: false,
	  
	  inherits: function(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  },
	  extend: function(dest, source) {
	    for(var key in source) {
	      if(source.hasOwnProperty(key)) {
	        dest[key] = source[key];
	      }
	    }
	    return dest;
	  },
	  pack: BinaryPack.pack,
	  unpack: BinaryPack.unpack,
	  
	  log: function () {
	    if (util.debug) {
	      var copy = [];
	      for (var i = 0; i < arguments.length; i++) {
	        copy[i] = arguments[i];
	      }
	      copy.unshift('Reliable: ');
	      console.log.apply(console, copy);
	    }
	  },

	  setZeroTimeout: (function(global) {
	    var timeouts = [];
	    var messageName = 'zero-timeout-message';

	    // Like setTimeout, but only takes a function argument.	 There's
	    // no time argument (always zero) and no arguments (you have to
	    // use a closure).
	    function setZeroTimeoutPostMessage(fn) {
	      timeouts.push(fn);
	      global.postMessage(messageName, '*');
	    }		

	    function handleMessage(event) {
	      if (event.source == global && event.data == messageName) {
	        if (event.stopPropagation) {
	          event.stopPropagation();
	        }
	        if (timeouts.length) {
	          timeouts.shift()();
	        }
	      }
	    }
	    if (global.addEventListener) {
	      global.addEventListener('message', handleMessage, true);
	    } else if (global.attachEvent) {
	      global.attachEvent('onmessage', handleMessage);
	    }
	    return setZeroTimeoutPostMessage;
	  }(this)),
	  
	  blobToArrayBuffer: function(blob, cb){
	    var fr = new FileReader();
	    fr.onload = function(evt) {
	      cb(evt.target.result);
	    };
	    fr.readAsArrayBuffer(blob);
	  },
	  blobToBinaryString: function(blob, cb){
	    var fr = new FileReader();
	    fr.onload = function(evt) {
	      cb(evt.target.result);
	    };
	    fr.readAsBinaryString(blob);
	  },
	  binaryStringToArrayBuffer: function(binary) {
	    var byteArray = new Uint8Array(binary.length);
	    for (var i = 0; i < binary.length; i++) {
	      byteArray[i] = binary.charCodeAt(i) & 0xff;
	    }
	    return byteArray.buffer;
	  },
	  randomToken: function () {
	    return Math.random().toString(36).substr(2);
	  }
	};

	module.exports = util;


/***/ }
/******/ ])
});
;