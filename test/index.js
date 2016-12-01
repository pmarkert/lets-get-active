process.env.APP_ID = "amzn1.ask.skill.9200600c-ea41-4400-adbe-beb6efef00b1";
var ast = require("alexa-skill-tester");
var path = require("path");
var module_under_test = require("../index");

describe("Event tests", function(done) {
	describe("search", function(cb) {
		ast(module_under_test.handler, path.resolve(__dirname, path.join("events", "search")), cb);
	});
	describe("list", function(cb) {
		ast(module_under_test.handler, path.resolve(__dirname, path.join("events", "list")), cb);
	});
	describe("none", function(cb) {
		ast(module_under_test.handler, path.resolve(__dirname, path.join("events", "none")), cb);
	});
	describe("list_summary", function(cb) {
		ast(module_under_test.handler, path.resolve(__dirname, path.join("events", "list_summary")), cb);
	});
});
