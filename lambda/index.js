// Skill for Anchorage Bus
var Alexa = require('alexa-sdk');
var http = require('http');

const skillName = "Anchorage Bus";

var options = {
    host: 'bustracker.muni.org',
    path: '/InfoPoint/departures.aspx?stopid=1632'
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = process.env.ALEXA_APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    "WhenNextBusIntent": function() {
        var whereto = this.event.request.intent.slots.ToWhere.value;
        var speechOutput = "";
        if(whereto && whereto.toLowerCase() == "downtown") {
            http.request(options, function(response) {
                var str = '';
                // another chunk of data has been recieved, 
                // so append it to str.
                response.on('data', function (chunk) {
                    str += chunk;
                });
                // the whole response has been recieved, here.
                response.on('end', function () {
                    // regex looks for times: 
                    // <div class='departure'>04:57 PM</div>
                    var rePattern = /<div[^<>]*\ class=\'departure\'[^<>]*>(\d\d:\d\d\s\w+)<\/div>/g;
                    var matches = getMatches(str, rePattern, 1);
                    console.log(matches);
                    speechOutput = "The next Bus 7 to inbound to Downtown is at " + matches[1] + ".";
                });
            }).end();
        } else if(whereto && whereto.toLowerCase() == "diamond center") {
            speechOutput = "The next Bus 7 outbound to Diamond Center is in such and such minutes."
        } else {
            speechOutput = "I don't have that destination in the database."
        }
        this.emit(':tell', speechOutput);
    },

    "AMAZON.StopIntent": function () {
        var speechOutput = "Goodbye";
        this.emit(':tell', speechOutput);
    },
 
    "AMAZON.CancelIntent": function () {
        var speechOutput = "Goodbye";
        this.emit(':tell', speechOutput);
    },

    "LaunchRequest": function() {
        var speechText = "";
        speechText += "Welcome to " + skillName + ". ";
        speechText += "Please say your destination for bus number 7, either downtown or diamond center."
        var repromptText = "For instructions on what you can say, please sayhelp me."
        this.emit(':ask', speechText, repromptText);
    }
};



// get groups out of a regex.
function getMatches(string, regex, index) {
  index || (index = 1);
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

