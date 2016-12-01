# lets-get-active
An active lifestyle keeps you both healthy and happy... or so they say ;) Now you can use Alexa on an Amazon echo device to find out information about upcoming races and Active.com events. Try it out! "Alexa, open Let's get active!"

This Alexa Skill prompts you to enter a location and optionally a starting date and it will search for the most popular running races that meet your criteria. Whether you are getting ready to jog your first 5k, you are an avid 10k/half-marathon runner, or you've got a few marathon's under your belt. And for any couch-potatoes out there, there are even some short 1k and  1 mile races. Whatever your motivation, just get out there and get moving! 

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
* I developed a helpful unit-testing framework [https://github.com/pmarkert/alexa-skill-tester](https://github.com/pmarkert/alexa-skill-tester) to invoke the skill handler with requests and validate the responses.
    * Provides unit-test coverage capability to test every available intent against each of the states
    * Supports automatic re-generation of expected response values
* Uses mock elements to substitute for real API calls to keep unit tests portable, fast, and avoid authentication issues.
