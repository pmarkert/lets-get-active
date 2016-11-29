if(global.TEST_MODE) {
	module.exports = function(logger) { 
		return function(message) {}; 
	};
}
else {
	module.exports = function(logger) { 
		return function(message) { 
			console.log(`${logger}: ${message}`);
		}
	}
}
