const crypto = require("crypto");
const fs = require("fs");

module.exports = {
	get : function(options) {
		return { 
			then: function(callback) {
				const url = options.url || options;
				const hash = crypto.createHash("MD5");
				hash.update(url);
				filename = hash.digest("hex");
				try {
					callback(require(`./responses/${filename}.json`));
				}
				catch (err) {
					throw new Error(`Could not load mock-response ./test/responses/${filename}.json for url - ${url}`);
				}
				return { catch: function() { } };
			}
		};
		
	}
}
