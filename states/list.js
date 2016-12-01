const moment = require("moment");
const request = require("request-promise"); //global.TEST_MODE ? require("../test/rp_mock") : require("request-promise");
const log = require("../log")(__filename);
const xmlescape = require("xml-escape");
const states = require("../states");
const Bitly = global.TEST_MODE ? require("../test/bitly_mock") : require("bitly");
const bitly = new Bitly(process.env.BITLY_KEY);
const aws = require("aws-sdk");
const s3 = new aws.S3()

module.exports = {
	'ItemSummary': function() {
		const race = this.attributes.results[this.attributes.index];
		const output = `Event number ${this.attributes.index+1} is, the ${race.name}, on ${race.date.readable}, located at ${race.location}`;
		log(`ItemSummary - ${output}`);
		this.emit(':ask', xmlescape(output), "You can say repeat that, more information, next, previous, goto a specific number, or start over");
	},
	'ItemDetail': function() {
		if(this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.index) {
			const index = parseInt(this.event.request.intent.slots.index.value);
			if(index <= this.attributes.total_results && index >= 1) {
				if(index >= this.attributes.results.length) {
					return this.emit(":ask", "I'm sorry, I currently only have access to the first " + this.attributes.results.length.toString() + " results.");
				} 
				else {
					this.attributes.index = index - 1;
				}
			}
			else {
				return this.emit(":ask", "I'm sorry, that number is either too high or too low.");
			}
		}
		const race = this.attributes.results[this.attributes.index];
		const output = `${race.name} is on ${race.date.readable} at ${race.location}`;
		const extension = race.logo.substring(race.logo.lastIndexOf("."));
		log("About to shorten - " + race.register);
		bitly.shorten(race.register).then((response) => {
			log("Bitly response - " + JSON.stringify(response, null, 2));
			const short_link = response.data.url;
			const image = { smallImageUrl : "https://s3.amazonaws.com/lets-get-active/apple-touch-icon-precomposed.png" };
			if(global.TEST_MODE || race.logo == "" || race.logo == "http://www.active.com/images/events/hotrace.gif" || (extension!=".png" && extension!=".jpg" && extension!=".jpeg")) {
				return this.emit(":askWithCard", 
						xmlescape(`I've just sent you a card about ${race.name}`), 
						"You can say next, or previous, or start over, or goto a specific number", 
						xmlescape(race.name), 
						xmlescape(`The ${race.name} is happening on ${race.date.readable} at ${race.location}. \n For Information and registration: ${short_link}`),
						image
					);
			}
			// Download the custom logo, and upload it to S3
			const key = 'raceimages/' + response.data.hash + extension;
			log("About to download logo - " + race.logo);
			request.get({ uri: race.logo, encoding: null }).then((body) => {
				log("Logo downloaded, About to upload to S3 under key - " + key);	
				s3.putObject({ Body: body, Key: key, Bucket: 'lets-get-active', ACL: "public-read", ContentType: "image/" + (extension==".png" ? "png" : "jpeg") }, (error, data) => { 
					if (error) {
						log("error uploading image to s3 " + error);
					} else {
						log("Logo uploaded to s3");
						image.smallImageUrl = "https://s3.amazonaws.com/lets-get-active/" + key;
					}
					this.emit(":askWithCard", 
						xmlescape(`I've just sent you a card about ${race.name}`), 
						"You can say next, or previous, or start over, or goto a specific number", 
						xmlescape(race.name), 
						xmlescape(`The ${race.name} is happening on ${race.date.readable} at ${race.location}. \n For Information and registration: ${short_link}`),
						image
					);
				}); 
			}).catch((err) => {
				log("Error downloading logo - " + err);
				this.emit(":askWithCard", 
					xmlescape(`I've just sent you a card about ${race.name}`), 
					"You can say next, or previous, or start over, or goto a specific number", 
					xmlescape(race.name), 
					xmlescape(`The ${race.name} is happening on ${race.date.readable} at ${race.location}. \n For Information and registration: ${short_link}`),
					image
				);
			});
		}).catch((error) => {
			log("Error shortening link - " + error);
			this.emit(":askWithCard", 
				xmlescape(`I've just sent you a card about ${race.name}`), 
				"You can say next, or previous, or start over, or goto a specific number", 
				xmlescape(race.name), 
				xmlescape(`The ${race.name} is happening on ${race.date.readable} at ${race.location}.`)
			);
		});
	},
	'GotoNumber': function() {
		const index = parseInt(this.event.request.intent.slots.index.value);
		if(index <= this.attributes.total_results && index >= 1) {
			if(index >= this.attributes.results.length) {
				this.emit(":ask", "I'm sorry, I currently only have access to the first " + this.attributes.results.length.toString() + " results.");
			} 
			else {
				this.attributes.index = index - 1;
				this.emitWithState("ItemSummary");
			}
		}
		else {
			this.emit(":ask", "I'm sorry, that number is either too high or too low.");
		}
	},
	'AMAZON.RepeatIntent': function() {
		this.emitWithState('ItemSummary');
	},
	'AMAZON.NextIntent': function() {
		if(this.attributes.index < this.attributes.results.length - 1) {
			this.attributes.index++;
			this.emitWithState("ItemSummary");
		}
		else {
			if(this.attributes.index < this.attributes.total_results - 1) {
				this.emit(":ask", "I'm sorry, I currently only have access to the first " + this.attributes.results.length.toString() + " results.");
			}
			else {
				this.emit(":ask", "There are no more results right now.");
			}
		}
	},
	'AMAZON.PreviousIntent': function() {
		if(this.attributes.index > 0) {
			this.attributes.index--;
			this.emitWithState("ItemSummary");
		}
		else {
			this.emit(":ask", "That is the first race in the list.");
		}
	},
	'AMAZON.HelpIntent': function () {
		this.emit(':ask', "You can navigate the list with next, previous, or goto a specific number. You can also ask me to give you more information, repeat the summary, or start over.");
	},
	'AMAZON.StartOverIntent': function() {
		delete this.attributes.index;
		delete this.attributes.results;
		delete this.attributes.total_results;
		this.handler.state = states.SEARCH;
		this.emit(":ask", "OK, sure. When else or where else would you like for me to search?");
	},
	'AMAZON.CancelIntent': function () {
		this.emit('AMAZON.StopIntent');
	},
	'AMAZON.StopIntent': function () {
		this.emit("AMAZON.StopIntent");
	},
	'SessionEndedRequest': function () {
		this.emit("AMAZON.StopIntent");
	},
	'Unhandled': function() {
		if(this.event.request.intent && ["LaunchRequest", "ClearDate", "SetDate", "SetLocation", "SetLocationAndClearDate"].indexOf(this.event.request.intent.name)>=0) {
			delete this.attributes.results;
			this.handler.state = states.SEARCH;
			log(`Clearing search results and passing back to SEARCH.${this.event.request.intent.name}`);
			return this.emitWithState(this.event.request.intent.name);
		}
		this.emit(':ask', "I'm sorry, I'm not sure what you meant. You can ask me to repeat the summary, go to the next item, go to the previous item, or start over");
	}
};
