class Logger {

	constructor(scope, log = false, warn = true, error = true) {
		this.scope = scope;
		this.logEnabled = log;
		this.warnEnabled = warn;
		this.errorEnabled = error;
		this.warned = {};
	}

	log(str) {
		this.logEnabled && this._doWrite('log', str);
	}

	warn(str) {
		this.warnEnabled && this._doWrite('warn', str);
	}

	warnOnce(str) {
		if(true !== this.warned[str]) {
			this.warned[str] = true;
			this.warn(str);
		}
	}

	error(str) {
		this.errorEnabled && this._doWrite('error', str);
	}

	/** Used internally only **/

	_doWrite(level, str) {
		console[level](`${this.scope} - ${str}`);
	}
	
}

export default Logger;