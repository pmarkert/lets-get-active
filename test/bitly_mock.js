const crypto = require("crypto");
const fs = require("fs");

module.exports =  function Bitly() {
	return {
		shorten : function(options) {
			return { 
				then: function(callback) {
					callback({ data: { url: "http://mockurl", hash: "mockhash" } });
					return { catch: function() { } };
				}
			};
		}
	}
}
