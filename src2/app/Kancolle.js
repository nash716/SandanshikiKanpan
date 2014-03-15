var Kancolle = {
	master: {
		ships: {
			raw: null,
			names: { }, // key: sortno, value: name
			names2: { }, // key: id, value: name
			materials: { } // key: sortno, value: { fuel_max: int, bull_max: int }
		}
	},
	user: {
		decks: {
			raw: null,
			deck: { } // key: deckno (0 origin), value: { ships: array of id (int), mission: int, complete: timeStamp, name: str }
		},
		ships: { },
		ndock: {
			raw: null,
			dock: { } // key: dockno (0 origin), value: { state: int, complete: timeStamp, id: int }
		},
		kdock: {
			raw: null,
			dock: { } // key: dockno (0 origin), value: { state: int, complete: timeStamp }
		},
		quest: { }
	}
};

Kancolle.set = function(message) {
	switch(message.path) {
		case '/kcsapi/api_get_master/ship':
			Kancolle.master.ships.set(message.json);
			break;
		case '/kcsapi/api_get_member/ndock':
			Kancolle.user.ndock.set(message.json);
			break;
		case '/kcsapi/api_get_member/kdock':
			Kancolle.user.kdock.set(message.json);
			break;
		case '/kcsapi/api_get_member/deck':
			Kancolle.user.decks.set(message.json);
			break;
		default:
			break;
	}
}

Kancolle.master.ships.set = function(value) {
	var data = value.api_data;
	
	this.raw = value;
	
	for (var i = 0; i < data.length; i++) {
		var sortno = data[i].api_sortno;

		if (sortno == 0) continue;

		this.names[sortno] = data[i].api_name;
		this.names2[data[i].api_id] = data[i].api_name;
		this.materials[sortno] = {
			fuel_max: data[i].api_fuel_max,
			bull_max: data[i].api_bull_max
		};
	}
}.bind(Kancolle.master.ships);

Kancolle.user.ndock.set = function(value) {
	var data = value.api_data;
	
	this.raw = value;
	
	for (var i = 0; i < data.length; i++) {
		this.dock[i] = {
			state: data[i].api_state,
			complete: data[i].api_complete_time,
			id: data[i].api_ship_id
		};
	}
}.bind(Kancolle.user.ndock);

Kancolle.user.kdock.set = function(value) {
	var data = value.api_data;
	
	this.raw = value;
	
	for (var i = 0; i < data.length; i++) {
		this.dock[i] = {
			state: data[i].api_state,
			complete: data[i].api_complete_time
		};
	}
}.bind(Kancolle.user.kdock);

Kancolle.user.decks.set = function(value) {
	var data = value.api_data;
	
	this.raw = value;
	
	for (var i = 0; i < data.length; i++) {
		this.deck[i] = {
			ships: data[i].api_ship,
			complete: data[i].api_mission[2],
			mission: data[i].api_mission[1],
			name: data[i].api_name
		};
	}
}.bind(Kancolle.user.decks);