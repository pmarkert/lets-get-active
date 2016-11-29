if(global.TEST_MODE) {
	module.exports = function() { };
}
else {
	module.exports = console.log;
}
