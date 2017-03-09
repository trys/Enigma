var Enigma = (function () {
	"use strict";

	var Rotor,
		Reflector = {},
		Rotors = [],
		Plugboard,
		Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		alphaDecode = {},
		alphaEncode = {};

	return {

		Initialise: function () {

			Enigma.CreateDecoders();
			Enigma.CreateReflector([24,17,20,7,16,18,11,3,15,23,13,6,14,10,12,8,4,1,5,25,2,22,21,9,0,19]);

			Enigma.Define.Rotor();
			Enigma.Define.Plugboard();
			
			Plugboard = new Plugboard(['GT', 'ES', 'XU', 'PA', 'VM', 'FB', 'DZ', 'CW', 'IL', 'NQ']);

			Rotors.push( new Rotor( 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', 0, 10 ) );
			Rotors.push( new Rotor( 'AJDKSIRUXBLHWTMCQGZNPYFVOE', 0, 3 ) );
			Rotors.push( new Rotor( 'BDFHJLCPRTXVZNYEIWGAKMUSQO', 0, 17 ) );

			Enigma.EventHandlers();
			
		},

		EventHandlers: function() {

			var input = document.getElementById( 'input' ),
				output = document.getElementById( 'output' ),
				set = document.getElementById( 'set' ),
				flick = document.getElementById( 'flick' ),
				info = document.getElementById( 'info' ),
				result = '';

			input.onkeydown = function () {

				setTimeout(function() {

					if ( alphaDecode[ input.value.toUpperCase() ] === undefined ) {
						input.value = '';
						return;
					}

					result = Enigma.Encode( input.value );
					input.value = '';
					output.innerHTML = output.innerHTML + result;
					$( '.lamps li' ).removeClass( 'active' );
					$( '.lamps .' + result.toLowerCase() ).addClass( 'active' );
					Rotors[ 0 ].tick();
					Enigma.ShiftRotors();

				}, 10 );

			};

			set.onclick = function () {
				for (var i = Rotors.length - 1; i >= 0; i--) {
					Rotors[i].element.onchange();
				}
			};

			flick.onclick = function () {
				this.classList.toggle( 'open' );
			};

			info.onclick = function () {
				this.classList.toggle( 'open' );
			};

		},

		Define: {

			/**
			 * Setup the rotor model
			 * 
			 * @return	object
			 */
			Rotor: function () {

				/**
				 * The rotor model
				 */
				Rotor = (function() {
					
					function Rotor( rotorSettings, turnover, startPosition ) {

						this.id = Rotors.length;
						this.currentPosition = 0;
						this.currentReversePosition = 0;
						this.turnover = turnover;
						this.mapLength = rotorSettings.length;
						this.element = '';

						if ( startPosition ) {
							this.currentPosition = startPosition;
							this.currentReversePosition = parseInt('-' + startPosition)
						}

						/**
						 * Rotor settings
						 */
						this.map = {};

						/**
						 * Rotor settings in reverse used to calculate
						 * the return journey through the machine
						 */
						this.reverse = {};

						this.setMap( rotorSettings );
						document.body.addEventListener( 'tickOver', this.tickOver );
						this.element.onchange = Enigma.getRotorInput;

						if ( startPosition ) {
							this.element.value = this.pad( this.currentPosition + 1 );
						}

					}


					/**
					 * Map rotor settings
					 *
					 * @param	string	rotorSettings
					 * @return	void
					 */
					Rotor.prototype.setMap = function( rotorSettings ) {

						if ( rotorSettings !== undefined ) {
							for ( var i = 0; i < rotorSettings.length; i++ ) {
								var mapLetter = Alphabet[ i ];
								this.map[ mapLetter ] = rotorSettings[ i ];
								this.reverse[ rotorSettings[ i ] ] = mapLetter;
							}
						}

						this.element = document.getElementById( 'rotor_' + this.id );

					};


					/**
					 * Tick the rotor over by one.
					 * If the end of the rotor is reached, reset
					 * and trigger the tickOver event passing in
					 * the current rotor id.
					 * 
					 * @return	int
					 */
					Rotor.prototype.tick = function() {

						if ( ( this.mapLength - 1 ) === this.currentPosition ) {

							this.currentPosition = 0;
							this.currentReversePosition = 0;

						} else {

							this.currentPosition++;
							this.currentReversePosition--;

						}

						if ( this.currentPosition === this.turnover ) {
							Enigma.Trigger( 'tickOver', this.id );
						}

						this.element.value = this.pad( this.currentPosition + 1 );
						this.element.classList.add( 'run' );

						return this.currentPosition;

					};


					/**
					 * Set current position to user-set option
					 * 
					 * @param	int		val
					 * @return	void
					 */
					Rotor.prototype.setRotor = function ( val ) {
						
						if ( val === 0 ) {
							this.currentPosition = 0;
							this.currentReversePosition = 0;
						} else {
							this.currentPosition = val;
							this.currentReversePosition =  parseInt( '-' + val );
						}

						this.element.value = this.pad( this.currentPosition + 1 );
						this.element.classList.add( 'run' );
						Enigma.ShiftRotors();
						
					};


					/**
					 * Tick the next rotor on current rotor tick over
					 * 
					 * @param	object	request
					 * @return	void
					 */
					Rotor.prototype.tickOver = function( request ) {

						if ( Rotors[ request.detail + 1 ] !== undefined ) {
							Rotors[ request.detail + 1 ].tick();
						}
					
					};


					/**
					 * The scrambler
					 *
					 * Takes an encoded letter, offsets it to emulate ticks,
					 * scrambles it and then offsets it again after re-encoding
					 * 
					 * @param	int		letter
					 * @param	bool	reverse
					 * @return	string
					 */
					Rotor.prototype.convertLetter = function( letter, reverse ) {

						if ( reverse ) {

							letter = Enigma.ReverseOffset( letter, this.currentReversePosition );

							letter = alphaDecode[ this.reverse[ alphaEncode[ letter ] ] ];
							return Enigma.ReverseOffset( letter, this.currentReversePosition );

						} else {

							letter = Enigma.Offset( letter, this.currentPosition );

							letter = alphaDecode[ this.map[ alphaEncode[ letter ] ] ];

							return Enigma.Offset( letter, this.currentPosition );

						}

					};

					/**
					 * Pad the rotor number
					 * 
					 * @param	int		val
					 * @return	int
					 */
					Rotor.prototype.pad = function ( val ) {
						val += '';
						return val.length === 2 ? val : '0' + val;
					};

					return Rotor;

				})();

			},


			/**
			 * Setup the plugboard model
			 * 
			 * @return	object
			 */
			Plugboard: function () {

				Plugboard = (function() {
					
					function Plugboard(groups) {

						this.letters = {};
						this.reverse = {};
						this.groups = groups;
						
						this.setup();

						this.visualize();

						var instance = this;
						$('.plugboard li').on('click', function() {
							instance.select();
						});
						
						$('.js-plug-close').on('click', function() {
							instance.close();
						});

						$('.plugboard-overlay__content input').on('keydown', function() {
							var $current = this;
							setTimeout(function() {
								var letters = [];
								var pattern = '[';
								var $inputs = $('.plugboard-overlay__content input');
								for (var i = 0; i < $inputs.length; i++) {
									if ( $inputs[i].checkValidity() ) {
										letters.push($inputs[i].value.toLowerCase());
									}
								}

								for (var i = 0; i < Alphabet.length; i++) {
									if ( letters.indexOf(Alphabet[i].toLowerCase()) === -1 ) {
										pattern += Alphabet[i].toLowerCase() + Alphabet[i].toUpperCase()
									}
								}

								pattern += "]";

								for (var i = 0; i < $inputs.length; i++) {
									if ( $inputs[i].value === '' ) {
										$inputs[i].setAttribute('pattern', pattern);
									} else {
										$inputs[i].removeAttribute('pattern');
									}
								}

								$current.setAttribute('pattern', pattern);

							}, 10)
						});

					}

					Plugboard.prototype.setup = function(group) {

						for (var i = 0; i < Alphabet.length; i++) {
							this.letters[ Alphabet[i] ] = Alphabet[i];
						}

						for (var i = 0; i < this.groups.length; i++) {
							var letterOne = this.groups[i][0],
									letterTwo = this.groups[i][1]

							this.letters[ letterOne ] = letterTwo;
							this.letters[ letterTwo ] = letterOne;
						}

						for (var key in this.letters) {
							this.reverse[ this.letters[ key ] ] = key;
						}

					}

					Plugboard.prototype.visualize = function() {

						$('.plug').remove();
						for (var i = 0; i < this.groups.length; i++) {
							var group = this.groups[i].split('');
							var $in = $( '.plugboard .' + group[0].toLowerCase() );
							var $out = $( '.plugboard .' + group[1].toLowerCase() );

							if ( $in.length > 0 && $out.length > 0 ) {
								$in.append('<span class="plug plug--in"></span>');
								$out.append('<span class="plug plug--out"></span>');
							}
						}

					}

					Plugboard.prototype.select = function() {
						$(document.body).addClass('plugboard-open');
						$('.plugboard-overlay__content input').val('');
						for (var i = 0; i < this.groups.length; i++) {
							var group = this.groups[i].split('');

							var $row = $('.plugboard-overlay__content li:nth-child(' + (i + 1) + ')' );
							$row.find('input:nth-child(2)').val(group[0]);
							$row.find('input:nth-child(3)').val(group[1]);
						}
					}

					Plugboard.prototype.close = function() {
						var $lists = $('.plugboard-overlay__content li');
						var letters = [];
						this.groups = [];
						this.letters = {};
						this.reverse = {};

						for (var i = 0; i < $lists.length; i++) {
							var a = $lists[i].children[1].value.toUpperCase();
							var b = $lists[i].children[2].value.toUpperCase();
							if ( a && b && Alphabet.indexOf(a) !== -1 && Alphabet.indexOf(b) !== -1 ) {
								if ( letters.indexOf(a) === -1 && letters.indexOf(b) === -1 ) {
									letters.push(a);
									letters.push(b);

									this.groups.push(a+b);
								}
							}
						}

						this.setup();
						this.visualize();
						$(document.body).removeClass('plugboard-open');
					}

					Plugboard.prototype.convert = function( letter, reverse ) {

						letter = alphaEncode[ letter ];

						if ( reverse ) {
							letter = this.reverse[ letter ];
						} else {
							letter = this.letters[ letter ];
						}

						return alphaDecode[ letter ];

					};

					return Plugboard;

				})();

			},

		},


		/**
		 * Create the de/encoders on init
		 */
		CreateDecoders: function() {
			for (var i = 0; i < Alphabet.length; i++) {
				alphaDecode[Alphabet[i]] = i;
				alphaEncode[i] = Alphabet[i];
			}
		},


		/**
		 * Fill the reflector object
		 */
		CreateReflector: function( numbers ) {
			for (var i = 0; i < numbers.length; i++) {
				Reflector[i] = numbers[i]
			}
		},


		/**
		 * Encode letters
		 *
		 * @param	letter
		 * @return	string
		 */
		Encode: function( letter ) {

			if ( letter === ' ' )
				return ' ';

			var i;

			letter = alphaDecode[ letter.toUpperCase() ];

			if ( letter === undefined )
				return '';


			letter = Plugboard.convert( letter );

			for ( i = 0; i < Rotors.length; i++)  {
				letter = Rotors[ i ].convertLetter( letter );
			}

			letter = Reflector[ letter ];

			for ( i = Rotors.length - 1; i >= 0; i-- ) {
				letter = Rotors[ i ].convertLetter( letter, true );
			}

			letter = Plugboard.convert( letter, true );


			return alphaEncode[ letter ];

		},


		/**
		 * Offset letters to emulate tick
		 *
		 * @param	int		encodedLetter
		 * @param	int		position
		 * @return	int
		 */
		Offset: function ( encodedLetter, position ) {

			if ( encodedLetter + position > 25  ) {
				return ( encodedLetter + position ) - 26;
			} else {
				return encodedLetter + position;
			}

		},


		/**
		 * Reverse offset letters to emulate tick in reverse
		 *
		 * @param	int		encodedLetter
		 * @param	int		position
		 * @return	int
		 */
		ReverseOffset: function ( encodedLetter, position ) {

			if ( encodedLetter + position < 0  ) {
				return 26 + ( encodedLetter + position );
			} else {
				return encodedLetter + position;
			}

		},


		/**
		 * Document events
		 * 
		 * @param	string	event
		 * @param	mixed	data
		 * @return	void
		 */
		Trigger: function ( event, data ) {

			if ( window.CustomEvent ) {
				event = new CustomEvent( event, { detail: data } );
			} else {
				event = document.createEvent( 'CustomEvent' );
				event.initCustomEvent( event, true, true, data );
			}

			document.body.dispatchEvent( event );

		},

		ShiftRotors: function () {
			
			setTimeout(function() {
				$( '.rotors input' ).removeClass( 'run' );
			}, 250 );

		},

		getRotorInput: function () {
								
			var rotorValue = parseInt( this.value );
			if ( rotorValue && rotorValue <= 26 ) {
				rotorValue--;
			} else {
				rotorValue = 0;
			}

			Rotors[ this.id.replace( 'rotor_', '' ) ].setRotor( rotorValue );

		}
		
	};
}());

Enigma.Initialise();
