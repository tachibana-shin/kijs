import { isFunction } from "../utils/is";

import each from "./each";

const rbracket = /\[\]$/


function buildParams( prefix: string, obj: any, traditional: boolean, add: (key: string, value: any) => void ): void {
	
	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		each( obj, ( v, i ) => {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && obj && typeof ( obj ) === "object" ) {

		// Serialize object item.
		for ( const name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

function toParam( data?:
    | {
        name: string;
        value: any
      }[]
    | {
        [key: string | number]: any
      } | Kijs, traditional?: boolean ): string {
	const
		s = new Set<string>(),
		add = function( key: string, valueOrFunction: any ) {

			// If value is a function, invoke it and use its return value
			const value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s.add(encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value ));
		};

	if ( data == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( data ) || ( data.kijs && !isPlainObject( data ) ) ) {

		// Serialize the form elements
		each( data, ({ name, value }) => {
			add( name, value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( const prefix in data ) {
			buildParams( prefix, data[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

export default toParam;