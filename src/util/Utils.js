const LOGGING_ENABLED = false,
	WARNINGS_ENABLED = true;

class Utils {

	log(str) {
		LOGGING_ENABLED && console.log(str);
	}

	warn(str) {
		WARNINGS_ENABLED && console.warn(str);
	}	
	
}

const utils = new Utils();

export  { utils };