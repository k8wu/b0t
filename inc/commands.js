var config = require('.././config.json'),
    c = require('irc-colors'),
    pkg = require('.././package.json');

function score(score, max, end)
{
    max = max || 100;
    if(end === '%'){
        score = Number((parseFloat(score) * 100).toFixed(1));
    }

    var score_color = c.bold.teal;

    if (score < (max * .25)) score_color = c.bold.red;
    else if (score < (max * .50)) score_color = c.bold.brown;
    else if (score < (max * .75)) score_color = c.bold.olive;
    else if (score < (max * .95)) score_color = c.bold.green;

    score_str = score_color(score + end);

    return score_str;
}

function er(err){ //error handling
    console.log(err);
    return c.bold.red('Error: ' + err);
}

var respond = {
    "say_my_name": function(d){
        if(d[0] == '-v') {
            return 'verson: ' + pkg.version; //can we check for updates?
        } else if(d[0] == '-o') {
            return 'owner: ' + c.bold.rainbow(config.owner);
        } else {
            return 'for more info try ' + c.bold(config.bot_nick) + ' -v or -o';
        }      

    },
    "err": function(d){
    },
    "syntax": function(d){
        return 'Please type ' + c.bold.teal(d.syntax) + ' to ' + d.action;
    },
    "enter_room": function(d){  //on chat enter
        return 'holla'; 
    },
    "no_users_registered": function(d){
        return 'No users registered with ' + c.bold(d.label) + ' currently in the channel';
    },
    "not_registered": function(d){
        var register_syntax = config.command_prefix + d.col + ' <' + commands[d.cat][d.col].commands.join('> <') + '>'; 
        return 'Your ' + c.bold(d.label) + ' is not registered! Please type ' + c.bold.teal(register_syntax) + ' to register it';
        
    },
    "cmd_help": function(d){
        var str = c.bold.teal('Usage: ') + d.usage + ' ';
        str += c.bold.teal('Description: ') + d.description + '.';
        return str;
    },
    "commands": function(d){
        return "Your avaliable commands: " + d.commands.join(', ');
    }
}
exports.respond = respond;

var commands = {
    "other" : {
        "commands": {
            "action": "list all of the available bot commands.",
            "commands": [],
            "format": function(d){
                var str = c.bold.teal("Avaliable commands: ") + d.commands.join(', ');
                str += c.red(' (for more info, you can type any command followed by help)');
                return str;
            }
        },
        "set": {
            "action": "set the channel topic",
            "commands": ["topic"],
            "perm": "+",
            "format": function(d){ 
                return "Topic set!"; 
            }
        },
        "reg": {
            "action": "register a user for any service (lastfm, trakt, location, untappd)",
            "commands": ["service", "irc nick", "data"],
            "perm": "~",
            "format": function(d){ 
                var str = c.bold(d.irc_nick) + '\'s ' + d.label + ' has now been set';
                return str;
            }
        },
        "unreg": {
            "action": "unregister a user for any service (lastfm, trakt, location, untappd)",
            "commands": ["service", "irc nick"],
            "perm": "~",
            "format": function(d){ 
                var str = c.bold(d.irc_nick) + '\'s ' + d.label + ' has now been removed';
                return str;
            }
        },
        "updates": {
            "action": "check for updates to b0t script",
            "commands": [],
            "perm": "@",
            "format": function(d){ 
                if(d === pkg.version) return 'I am up to date!';

                return 'Please update me! My version: ' + pkg.version + ' Current version: ' + d;
            }
        }
    },
    "LastFM" : {
        "np" : {
            "action": "get your last scrobbled song from last.fm",
            "commands": [],
            "register": "lastfm",
            "format": function(d){
                var title = [];
                if(d.artist !== '') title.push(d.artist);
                if(d.name !== '') title.push(d.name);
                if(d.album !== '') title.push(d.album); 

                var str = c.bold(d.irc_nick) + ' ';
                str += d.now_playing ? 'is now playing: ' + c.bold.green(title.join(' - ')) : 'last played: ' + c.bold.gray(title.join(' - ')) 
                str += ' [' + c.bold(d.play_count + 'x') + '] ' + (d.loved ? c.red('♥') + ' (' : '('); 

                if(d.tags.length > 0){
                    var tags = d.tags.splice(0, 4); //max 4 tags
                    tags = tags.map(function(tag){ return c.teal(tag); });
                    str += tags.join(', ');
                } else {
                    str += c.gray('No Tags');
                }

                str += ')';

                return str;
            }
        },
        "wp" : {
            "action": "get all users in current chan w/ registered last.fm nicks last scrobbled song",
            "commands": [],
            "format": function(d){
                var title = [];
                if(d.artist !== '') title.push(d.artist);
                if(d.name !== '') title.push(d.name);
                if(d.album !== '') title.push(d.album); 

                var str = '[ ' + (d.now_playing ? c.bold.green(d.irc_nick) : c.bold.gray(d.irc_nick)) + ' ] ';
                str += c.teal(title.join(' - ')) + ' [' + c.bold(d.play_count + 'x') + '] ' + (d.loved ? c.red('♥') + ' (' : '('); 

                if(d.tags.length > 0){
                    var tags = d.tags.splice(0, 2); //max 2 tags
                    str += tags.join(', ');
                } else {
                    str += c.gray('No Tags');
                }

                str += ')';

                return str;
            }
        },
        "sa" : {
            "action": "get similar artists by percentage",
            "commands": ["artist"],
            "format": function(d){
                var str =  c.teal(' Similar to ' + c.bold(d.artist) + ': ');
                var sa = d.similar_artists.map(function(artist){ 
                    return artist.name + ' ' + score(artist.match, 100, '%'); 
                });
                str += sa.join(', ');

                return str;
            }
        },
        "bio" : {
            "action": "get artist bio",
            "commands": ["artist"],
            "format": function(d){
                var str =  c.teal(' Bio for ' + c.bold(d.artist) + ': ') + d.bio;
                return str;
            }
        },
        "lastfm" : {
            "action": "register your last.fm username with your irc nick",
            "commands": ["last.fm username"],
            "format": function(d){
                var str = 'Thanks ' + c.bold(d.irc_nick) + ' your last.fm username was set!';
                return str;
            }
        }
    },
    "TraktTV" : {
        "nw" : {
            "action": "get your last scrobbled show/movie from trakt.tv",
            "commands": [],
            "register": "trakt",
            "format": function(d) {
                var str = c.bold(d.irc_nick);
                str += (d.now_watching ? ' is now watching: ' + this.symbols[d.type] + ' ' + c.green.bold(d.title) :
                 ' last watched: ' + this.symbols[d.type] + ' ' + c.gray.bold(d.title));
                str += (d.year !== '' ? ' (' + d.year + ')' : '');
            
                return str;
            },
            "symbols": {
                "episode": "📺",
                "movie": "🎥"
            }
        },
        "ww" : {
            "action": "get all users in current chan w/ registered trakt.tv nicks last scrobbled show/movie",
            "commands": [],
            "format": function(d) {
                var str = '[ ';
                str += d.now_watching ? c.bold.green(d.irc_nick) : c.bold.gray(d.irc_nick);
                str += ' ] ' + this.symbols[d.type] + ' ' + c.teal.bold(d.title) + ' ';
                (d.year !== '' ? ' (' + d.year + ')' : '');
            
                return str;
            },
            "symbols": {
                "episode": "📺",
                "movie": "🎥"
            }
        },
        "trend" : {
            "action": "get movies/shows currently trending",
            "commands": ["movies|shows"],
            "format": function(d){
                var str = c.bold.teal('Trending ');
                var high_watch = 0;

                var arr = [];
                for(var i = 0; i < d.length; i++) {
                    if(i === 0){
                       str += c.bold.teal(d[i].type + 's: ');
                       high_watch = d[i].watchers;  
                    }

                    var watch = d[i].title;
                    if(d[i].year !== '') watch += ' (' + d[i].year + ')';
                    watch += ' ' + score(d[i].watchers, high_watch, 'x');

                    arr.push(watch);
                }
                str += arr.join(', ');

                return str;
            }
        },
        "trakt" : {
            "action": "register your trakt.tv username with your irc nick",
            "commands": ["trakt.tv username"],
            "format": function(d){
                var str = 'Thanks ' + c.bold(d.irc_nick) + ' your trakt.tv username was set!';
                return str;
            }
        }
    },
    "UNTAPPD" : {
        "ut" : {
            "action": "get your last beer drank from untappd.com",
            "commands": [],
            "register": "untappd",
            "format": function(d) {
                var str = c.bold(d.irc_nick);
                str += ' last drank ' + c.yellow.bold(this.symbols['beer']) + ' ' + c.gray.bold(d.beer_name);
        		str += ' (' + d.beer_style + ' - ' + d.beer_abv + '%abv)';
        		str += ' (from ' + d.brewery + ')';

        		if (d.venue) {
        			str += ' (at ' + c.green.bold(d.venue) + ')';
        			//UntappdMsg += " on " + checkin.created_at;
        		}
            
                return str;
            },
            "symbols": {
                "beer":  "🍺",
                "cider": "🍺",
                "mead":  "🍺",
                "other": "🍺"
            }
        },
        "wu" : {
            "action": "get all users in current chan w/ registered untappd nicks last checked in beer",
            "commands": [],
            "format": function(d) {
                var str = '[ ' + c.bold(d.irc_nick) + ' ] ';
                str += c.gray.bold(d.beer_name);
        		str += ' (' + d.beer_style + ' - ' + d.beer_abv + '%abv)';
        		str += ' (from ' + d.brewery + ')';

        		if (d.venue) {
        			str += ' (at ' + c.green.bold(d.venue) + ')';
        			//UntappdMsg += " on " + checkin.created_at;
        		}
                    
                return str;
            },
            "symbols": {
                "beer":  "🍺",
                "cider": "🍺",
                "mead":  "🍺",
                "other": "🍺"
            }
        },
        "untappd" : {
            "action": "register your untappd username with your irc nick",
            "commands": ["untappd username"],
            "format": function(d){
                var str = 'Thanks ' + c.bold(d.irc_nick) + ' your untappd username was set!';
                return str;
            }
        }
    },
    "Weather" : {
        "w" : {
            "action": "get current weather (if no zip or city/state is used, attempts to get weather for your registered location)",
            "commands": ["*zip/city, state"],
            "register": "location",
            "format": function(d){
                var str = 'Weather for ' + c.bold(d.location) + ': ' + this.symbols[d.icon] + ' ' + d.weath + ' ' + d.temp + ' ' + d.humid + ' humidity';
                return str;
            },
            "symbols": {
                "chanceflurries": "🌨",
                "chancerain": "🌧",
                "chancesleet": "🌨",
                "chancesnow": "🌨",
                "chancetstorms": "⛈",
                "clear": "🌞",
                "flurries": "🌨",
                "fog": "🌫",
                "hazy": "",
                "mostlycloudy": "🌥",
                "mostlysunny": "🌤",
                "partlycloudy": "⛅",
                "partlysunny": "⛅",
                "sleet": "🌨🌧",
                "rain": "🌧",
                "snow": "🌨",
                "sunny": "🌞",
                "tstorms": "⛈",
                "cloudy": "🌥"
            }
        },
        "location" : {
            "action": "register your location with your irc nick",
            "commands": ["zip/city, state"],
            "format": function(d){
                var str = 'Thanks ' + c.bold(d.irc_nick) + ' your location was set!';
                return str;
            }
        }
    },
    "UrbanDictionary" : {
        "ud" : {
            "action": "get urban dictionary term/word definition",
            "commands": ["term"],
            "format": function(d){
                var str = c.teal(' UD ' + c.underline(d.term) + ': ') + ' ' + d.definition;
                if(d.example !== '') str += '\n' + c.teal('i.e. ') + d.example;

                return str;
            }
        }
    }
}

for(var cat in commands){
    for(var cmd in commands[cat]){
        commands[cat][cmd].format = verify(commands[cat][cmd].format)
    }
}
for(var cat in respond){
    respond[cat] = verify(respond[cat])
}

//this verifies string length and such, 
//and anything else that needs to be verified before
//having the bot send it back.
function verify(fn) {
    return function() {
        console.log(arguments);
        if(arguments && arguments[0] && arguments[0].err) return er(arguments[0].err);

        var arg = arguments[0];

        var parse = function(obj)
        {
            for(var key in obj)
            {
                if(typeof obj[key] === 'string'){

                    var breaks = obj[key].match(/\r?\n|\r/g) || [];

                    //if there are more than 3 new line breaks, remove them.
                    if(breaks.length > 3){
                        obj[key] = obj[key].replace(/\r?\n|\r/g, ' ');
                    }

                    //if a str is long than 434 char, cut it.
                    if(obj[key].length > 434){
                        obj[key] = obj[key].slice(0, 434) + '...';
                    }

                } else if(typeof obj[key] === 'object') {
                    parse(obj[key]);
                }
            }
            
        }
        parse(arg);

        return fn.apply(this, arguments);
    }
}

exports.commands = commands;
