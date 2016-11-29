TEST_MODE = true;
const fs = require("fs");
const context = require('aws-lambda-mock-context');
const index = require("../index");
const async = require("async");
const chai = require("chai").should();

describe("Event processing", function(done) {
	async.each(
		fs.readdirSync("./test/events"), 
		function (filename) {
			it(filename, function (event_done) {
				const file_content = require(`./events/${filename}`);
				const ctx = context();
				index.handler(file_content.event, ctx);
				ctx.Promise
					.then(response => {
						try {
							if(!file_content.response) {
								console.log(`Response for ${filename} is not in the test file, but result was:`);
								console.log(JSON.stringify(response, null, 2));
								return event_done("Response was not specified in the test.");
							}
							response.should.deep.equal(file_content.response);			
							return event_done();
						}
						catch(err) {
							debugger;
							return event_done(err);
						}
					})
					.catch(event_done);
			});
		}, done);

});
