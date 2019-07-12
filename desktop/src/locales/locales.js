const en = {
	"header": {
		"greetings": [
			"You’re up early",
			"Good Morning",
			"Good Day",
			"Good Afternoon",
			"Good Evening",
			"Good Night"
		],
			"fraction": "This time will pass today"
	},
	"logform": {
		"misc": {
			"begin": "log time (press enter to commit)",
			"placeholder": "log time",
			"recap": "committed this week:"
		},
		"s0": {
			"placeholder": "time of day? (em|m|md|an|ev|n|ln)",
			"singularHour": "An hour",
			"singularHourNoPronoun": "hour",
			"pluralHour": "hours",
			"minutes": "minutes"
		},
		"s1": {
			"placeholder": "project",
			"values": [
				{ "abbr": "em", "expa": "in the early morning" },
				{ "abbr": "m", "expa": "in the morning" },
				{ "abbr": "md", "expa": "around midday" },
				{ "abbr": "an", "expa": "in the afternoon" },
				{ "abbr": "ev", "expa": "in the evening" },
				{ "abbr": "n", "expa": "around nighttime" },
				{ "abbr": "ln", "expa": "well past sundown" }
			],
			"transition": "working on"
		},
		"s2": {
			"placeholder": "task"
		},
		"s3": {
			"placeholder": "work category",
				"category": "cat"
		},
		"s4": {
			"placeholder": "comments?"
		},
		"s5": {
			"placeholder": "Press Enter to commit this bean",
				"comment": "CMNT"
		},
		"success": "bean committed!"
	},
	"visualiser": [
		'a year',
		'half a year',
		'four months',
		'three months',
		'this month'
	]
}

// NOTE: this file has been significantly pared down
// so as to work without node (for now)
function locales (keys) {
	return en[keys];
}
