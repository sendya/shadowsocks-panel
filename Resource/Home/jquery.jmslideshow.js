(function( $, undefined ) {
		
	/*
	 * JMSlideshow object
	 */
	$.JMSlideshow 				= function( options, element ) {
		
		// the jms-slideshow
		this.$el	= $( element );
		
		this._init( options );
		
	};
	
	$.JMSlideshow.defaults 		= {
		// options for the jmpress plugin.
		// you can add much more options here. Check http://shama.github.com/jmpress.js/
		jmpressOpts	: {
			// set the viewport
			viewPort 		: {
				height	: 400,
				width	: 1000,
				maxScale: 1
			},
			fullscreen		: false,
			hash			: { use : false },
			mouse			: { clickSelects : false },
			keyboard		: { use : false },
			animation		: { transitionDuration : '1s' }
		},
		// for this specific plugin we will have the following options:
		// shows/hides navigation arrows
		arrows		: true,
		// shows/hides navigation dots/pages
		dots		: true,
		// each step's bgcolor transition speed
		bgColorSpeed: '1s',
		// slideshow on / off
		autoplay	: false,
		// time between transitions for the slideshow
		interval	: 6500
    };
	
	$.JMSlideshow.prototype 	= {
		_init 				: function( options ) {
			
			this.options 		= $.extend( true, {}, $.JMSlideshow.defaults, options );
			
			// each one of the slides
			this.$slides		= $('#jms-slideshow').children('div');
			// total number of slides
			this.slidesCount	= this.$slides.length;
			// step's bgcolor
			this.colors			= $.map( this.$slides, function( el, i ) { return $( el ).data( 'color' ); } ).join( ' ' );
			// build the necessary structure to run jmpress
			this._layout();
			// initialize the jmpress plugin
			this._initImpress();
			// if support (function implemented in jmpress plugin)
			if( this.support ) {
			
				// load some events
				this._loadEvents();
				// if autoplay is true start the slideshow
				if( this.options.autoplay ) {
				
					this._startSlideshow();
				
				}
				
			}
			
		},
		// wraps all the slides in the jms-wrapper div;
		// adds the navigation options ( arrows and dots ) if set to true
		_layout				: function() {
			
			// adds a specific class to each one of the steps
			this.$slides.each( function( i ) {
			
				$(this).addClass( 'jmstep' + ( i + 1 ) );
			
			} );
			
			// wrap the slides. This wrapper will be the element on which we will call the jmpress plugin
			this.$jmsWrapper	= this.$slides.wrapAll( '<div class="jms-wrapper"/>' ).parent();
			
			// transition speed for the wrapper bgcolor 
			this.$jmsWrapper.css( {
				'-webkit-transition-duration' 	: this.options.bgColorSpeed,
				'-moz-transition-duration' 		: this.options.bgColorSpeed,
				'-ms-transition-duration' 		: this.options.bgColorSpeed,
				'-o-transition-duration' 		: this.options.bgColorSpeed,
				'transition-duration' 			: this.options.bgColorSpeed
			} );
			
			// add navigation arrows
			if( this.options.arrows ) {
			
				this.$arrows	= $( '<nav class="jms-arrows"></nav>' );
				
				if( this.slidesCount > 1 ) {
				
					this.$arrowPrev	= $( '<span class="jms-arrows-prev"/>' ).appendTo( this.$arrows );
					this.$arrowNext	= $( '<span class="jms-arrows-next"/>' ).appendTo( this.$arrows );
					
				}

				this.$el.append( this.$arrows )
			
			}
			
			// add navigation dots
			if( this.options.dots ) {
			
				this.$dots		= $( '<nav class="jms-dots"></nav>' );
				
				for( var i = this.slidesCount + 1; --i; ) {
				
					this.$dots.append( ( i === this.slidesCount ) ? '<span class="jms-dots-current"/>' : '<span/>' );
				
				}
				
				if( this.options.jmpressOpts.start ) {
					
					this.$start		= this.$jmsWrapper.find( this.options.jmpressOpts.start ), idxSelected = 0;
					
					( this.$start.length ) ? idxSelected = this.$start.index() : this.options.jmpressOpts.start = null;
					
					this.$dots.children().removeClass( 'jms-dots-current' ).eq( idxSelected ).addClass( 'jms-dots-current' );
				
				}
				
				this.$el.append( this.$dots )
			
			}
			
		},
		// initialize the jmpress plugin
		_initImpress		: function() {
			
			var _self = this;
			
			this.$jmsWrapper.jmpress( this.options.jmpressOpts );
			// check if supported (function from jmpress.js):
			// it adds the class not-suported to the wrapper
			this.support	= !this.$jmsWrapper.hasClass( 'not-supported' );
			
			// if not supported remove unnecessary elements
			if( !this.support ) {
			
				if( this.$arrows ) {
				
					this.$arrows.remove();
				
				}
				
				if( this.$dots ) {
				
					this.$dots.remove();
				
				}
				
				return false;
			
			}
			
			// redefine the jmpress setActive method
			this.$jmsWrapper.jmpress( 'setActive', function( slide, eventData ) {
				
				// change the pagination dot active class			
				if( _self.options.dots ) {
					
					// adds the current class to the current dot/page
					_self.$dots
						 .children()
						 .removeClass( 'jms-dots-current' )
						 .eq( slide.index() )
						 .addClass( 'jms-dots-current' );
				
				}
				
				// delete all current bg colors
				this.removeClass( _self.colors );
				// add bg color class
				this.addClass( slide.data( 'color' ) );
				
			} );
			
			// add step's bg color to the wrapper
			this.$jmsWrapper.addClass( this.$jmsWrapper.jmpress('active').data( 'color' ) );
			
		},
		// start slideshow if autoplay is true
		_startSlideshow		: function() {
		
			var _self	= this;
			
			this.slideshow	= setTimeout( function() {
				
				_self.$jmsWrapper.jmpress( 'next' );
				
				if( _self.options.autoplay ) {
				
					_self._startSlideshow();
				
				}
			
			}, this.options.interval );
		
		},
		// stops the slideshow
		_stopSlideshow		: function() {
		
			if( this.options.autoplay ) {
					
				clearTimeout( this.slideshow );
				this.options.autoplay	= false;
			
			}
		
		},
		_loadEvents			: function() {
			
			var _self = this;
			
			// navigation arrows
			if( this.$arrowPrev && this.$arrowNext ) {
			
				this.$arrowPrev.on( 'click.jmslideshow', function( event ) {
					
					_self._stopSlideshow();
				
					_self.$jmsWrapper.jmpress( 'prev' );

					return false;
				
				} );
				
				this.$arrowNext.on( 'click.jmslideshow', function( event ) {
					
					_self._stopSlideshow();
					
					_self.$jmsWrapper.jmpress( 'next' );
					
					return false;
				
				} );
				
			}
			
			// navigation dots
			if( this.$dots ) {
			
				this.$dots.children().on( 'click.jmslideshow', function( event ) {
				 	
					_self._stopSlideshow();
					
					_self.$jmsWrapper.jmpress( 'goTo', '.jmstep' + ( $(this).index() + 1 ) );
					
					return false;
				
				} );
			
			}
			
			// the touchend event is already defined in the jmpress plugin.
			// we just need to make sure the slideshow stops if the event is triggered
			this.$jmsWrapper.on( 'touchend.jmslideshow', function() {
			
				_self._stopSlideshow();
			
			} );
			
		}
	};
	
	var logError 			= function( message ) {
		if ( this.console ) {
			console.error( message );
		}
	};
	
	$.fn.jmslideshow		= function( options ) {
	
		if ( typeof options === 'string' ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			this.each(function() {
			
				var instance = $.data( this, 'jmslideshow' );
				
				if ( !instance ) {
					logError( "cannot call methods on jmslideshow prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for jmslideshow instance" );
					return;
				}
				
				instance[ options ].apply( instance, args );
			
			});
		
		} 
		else {
		
			this.each(function() {
			
				var instance = $.data( this, 'jmslideshow' );
				if ( !instance ) {
					$.data( this, 'jmslideshow', new $.JMSlideshow( options, this ) );
				}
			});
		
		}
		
		return this;
		
	};
	
})( jQuery );