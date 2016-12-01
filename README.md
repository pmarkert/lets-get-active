# lets-get-active
An active lifestyle keeps you both healthy and happy... or so they say ;) Now you can use Alexa on an Amazon echo device to find out information about upcoming races and Active.com events. Try it out! "Alexa, open Let's get active!"

This Alexa Skill prompts you to enter a location and optionally a starting date and it will search for the most popular running races that meet your criteria. Whether you are getting ready to jog your first 5k, you are an avid 10k/half-marathon runner, or you've got a few marathon's under your belt. And for any couch-potatoes out there, there are even some short 1K and 1 mile races. Whatever your motivation, just get out there and get moving! 

Your race awaits you!

Sample converation:
* You: "Alexa, ask Let's get active to find upcoming 5k races near Marietta, GA"
* Alexa: "OK, I found 81 events within 25 miles of Marietta, GA starting Monday, November 28th or later. Would you like to hear about them?"
* You: "Sure!"
* Alexa: Here are the 3 most popular events. 
    * \#1 is the Run the Lights of Life 5K/1K Presented by Life University on Saturday, December 3rd at Life University. 
    * \#2 is the Dashing Through The Square 5K Walk/Run on Saturday December 3rd at Marietta Square.
    * \#3 is the The Ugly Sweater Run Atlanta on Saturday December 10th, at Piedmont Park.
* You: Tell me about \#4.
* Alexa: Event number 4 is the POLAR BEAR RUN on Saturday, January 28th, located at Johnson Ferry Baptist Church.
* You: Give me more details about that one.
* Alexa: Sure, I've sent a card to your Alexa app where you can get more information and register.
...

## Here are some of the interesting user-facing features and notes about the skill:
* Looks for events near any US location on or after a specified date
* The skill remembers your preferences (like the last search location) to make it quicker to search next time
* Intelligent ranking algorithm recommends events based upon a combination of popularity, date and proximity.
* Provides summary information about the top-3 events and allows users to navigate through additional events.
* Users can ask for more details about any event and receive a card on their phone with information and a shortened link to  register for the event.
* Information card displays the race/event logo if available

## Here are some of the interesting developer notes/features of the skill:
* Uses the Active.com API to query for events
* The skill makes use of multiples states to give context sensitivity to the conversation
* The skill persists select information for future use so that users can get updates more easily
* Persists race logos to S3 with public-read ACL permissions and the proper Content-Type to handle CORS/HTTPS limitations of the original site hosting the images.
* Makes use of the bitly url shortener to mitigate the non-clickable links limitation in the Alexa app. (Please, oh please enable links for certified/white-listed applications).
* Makes use of a forked/patched version of the Alexa Skills Kit SDK for node.js [https://github.com/pmarkert/alexa-skills-kit-sdk-for-nodejs](https://github.com/pmarkert/alexa-skills-kit-sdk-for-nodejs). I have submitted a pull-request to have my changes incorporated into the original project.
    * Fixed defect with missing reprompt text being rendered by Alexa and prompting users with "undefined".
    * Missing documentation in README about DynamoDB Table requirements
    * Other minor documentation edits
* During the development of this skill, I also developed and published a helpful unit-testing framework [https://github.com/pmarkert/alexa-skill-tester](https://github.com/pmarkert/alexa-skill-tester). The framework uses collection of .json files to invoke the skill handler and then validates the responses against matching .response.json files.
    * Provides unit-test coverage capability to test every available intent against each of the states
    * Supports automatic re-generation of expected response values
* Used mock elements to substitute for real API calls to keep unit tests portable, fast, and avoid authentication issues.

## alexa-skill-tester
I wanted a way to easily test my skill and nail down the expected responses. There are a lot of intents, combinations of values for slots, and states that can be managed, so it is difficult/impossible to manually test every possible combination each time a change is made. Additionally, the JSON for the Alexa Skill requests/responses can be rather verbose, so I wanted an easy way to manage the test-cases using standard files. During the development of Alexa Skills, I have found that there are often surprises with the way that Alexa fills in the intents and slots. I wanted an easy way that each time my skill received a request that caused a failure, that I could pull the exact request content from the CloudWatch logs, save it as a new test-case, verify/reproduce the issue locally, and then once repaired, lock in the expected response.

During the development process, I found myself making a lot of small changes to the response text, such as adding/removing punctuation and optimizing the specific words for the spoken audio. The smallest change in the response text causes unit-test failures (by intention), but I wanted an easy way to update the response files. Also, in some cases, it is too time-consuming to type-out what the expected response from a skill interaction should be. In these cases, the alexa-skill-tester that I developed allows a flag to be set as an environment variable. If the flag is set then the test will write-back the response files (if they did not already exist). This makes it easy to do mass update and then let git tell me exactly what changed in the resposnes.

