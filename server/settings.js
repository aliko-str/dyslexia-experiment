const _NUM_STIMULI_PER_SESSION = 4;

module.exports = {
	NUM_STIMULI_PER_SESSION: _NUM_STIMULI_PER_SESSION,
	PSY_ASPECTS_NAMES: ["vc", "read"],
	PSY_ASPECTS_SETTINGS: {
		"vc": {
			exposureTime: 500,
			name: "vc",
			nEvalsPerSession: _NUM_STIMULI_PER_SESSION
		},
		"read": {
			exposureTime: 5000,
			name: "read",
			nEvalsPerSession: _NUM_STIMULI_PER_SESSION
		}
	}
}
