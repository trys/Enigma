var Enigma = (function () {
	"use strict";

	var Rotor,
		Reflector = {
			0: 24,
			1: 17,
			2: 20,
			3: 7,
			4: 16,
			5: 18,
			6: 11,
			7: 3,
			8: 15,
			9: 23,
			10: 13,
			11: 6,
			12: 14,
			13: 10,
			14: 12,
			15: 8,
			16: 4,
			17: 1,
			18: 5,
			19: 25,
			20: 2,
			21: 22,
			22: 21,
			23: 9,
			24: 0,
			25: 19
		},
		Rotors = [],
		Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		alphaDecode = {A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25},
		alphaEncode = {0:"A",1:"B",2:"C",3:"D",4:"E",5:"F",6:"G",7:"H",8:"I",9:"J",10:"K",11:"L",12:"M",13:"N",14:"O",15:"P",16:"Q",17:"R",18:"S",19:"T",20:"U",21:"V",22:"W",23:"X",24:"Y",25:"Z"};

	return {

		Initialise: function () {

			/**
			 * To begin with I define the concept of a rotor
			 * before creating three of them, passing in the 
			 * A-Z alternatives used to scramble the letters
			 */
			Enigma.Define.Rotor();

			Rotors.push( new Rotor( 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', 0 ) );
			Rotors.push( new Rotor( 'AJDKSIRUXBLHWTMCQGZNPYFVOE', 0 ) );
			Rotors.push( new Rotor( 'BDFHJLCPRTXVZNYEIWGAKMUSQO', 0 ) );

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
					
					function Rotor( rotorSettings, turnover ) {


						/**
						 * Rotor id
						 *
						 * @var	int
						 */
						this.id = Rotors.length;
						

						/**
						 * Current rotor position
						 *
						 * @var	int
						 */
						this.currentPosition = 0;


						/**
						 * Current rotor reverse position
						 *
						 * @var	int
						 */
						this.currentReversePosition = 0;


						/**
						 * Turnover position
						 *
						 * @var	int
						 */
						this.turnover = turnover;


						/**
						 * Rotor settings
						 *
						 * @var	array
						 */
						this.map = {};


						/**
						 * Rotor settings in reverse used to calculate
						 * the return journey through the machine
						 *
						 * @var	array
						 */
						this.reverse = {};


						/**
						 * The size of the rotor
						 *
						 * @var	int
						 */
						this.mapLength = rotorSettings.length;


						/**
						 * Rotor input element
						 *
						 * @var	element
						 */
						this.element = '';


						/**
						 * Map rotor settings
						 *
						 * @param	string	rotorSettings
						 * @return	void
						 */
						this.setMap( rotorSettings );


						/**
						 * Document listener for the tick over
						 *
						 * @param	int		id
						 * @return	void
						 */
						document.body.addEventListener( 'tickOver', this.tickOver );



						this.element.onchange = Enigma.getRotorInput;
						
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

			letter = alphaDecode[ letter.toUpperCase() ];

			if ( letter === undefined )
				return '';

			var i;

			for ( i = 0; i < Rotors.length; i++)  {
				letter = Rotors[ i ].convertLetter( letter );
			}

			letter = Reflector[ letter ];

			for ( i = Rotors.length - 1; i >= 0; i-- ) {
				letter = Rotors[ i ].convertLetter( letter, true );
			}

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



	






