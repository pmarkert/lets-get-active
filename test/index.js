global.TEST_MODE = true;
//process.env.APP_ID = "amzn1.ask.skill.9200600c-ea41-4400-adbe-beb6efef00b1";
const fs = require("fs");
const context = require('aws-lambda-mock-context');
const index = require("../index");
const async = require("async");
const chai = require("chai").should();

describe("Event processing", function(done) {
	async.each(
		fs.readdirSync("./test/events"), 
		function (filename) {
			if(!filename.endsWith(".response.json")) {
				it(filename, function (event_done) {
					const file_content = require(`./events/${filename}`);
					const ctx = context();
					index.handler(file_content, ctx);
					ctx.Promise
						.then(response => {
							try {
								const response_filename = filename.substring(0,filename.length - 5) + ".response.json";
								if(!fs.existsSync(`./test/events/${response_filename}`)) {
									console.log(`Response for ${filename} is not in the test file, but result was:`);
									console.log(JSON.stringify(response, null, 2));
									return event_done("Response was not specified in the test.");
								}
								const expected_response = require(`./events/${response_filename}`);
								response.should.deep.equal(expected_response);			
								return event_done();
							}
							catch(err) {
								debugger;
								return event_done(err);
							}
						})
						.catch(event_done);
				});
			}
		}, done);

});
