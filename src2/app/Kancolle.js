var Kancolle = {
	master: {
		ships: {
			raw: null,
			names: { }, // key: sortno, value: name
			names2: { }, // key: (internal)id, value: name
			materials: { } // key: sortno, value: { fuel_max: int, bull_max: int }
		}
	},
	user: {
		decks: {
			raw: null,
			deck: { } // key: deckno (0 origin), value: { ships: array of id (int), mission: int, complete: timeStamp, name: str }
		},
		ships: {
			raw: null, // Raw data of "ships" is incompatible with others.
			ship: { } // key: id, value: Copy of API data (the prefix "api_" will be cut)
		},
		ndock: {
			raw: null,
			dock: { } // key: dockno (0 origin), value: { state: int, complete: timeStamp, id: int }
		},
		kdock: {
			raw: null,
			dock: { } // key: dockno (0 origin), value: { state: int, complete: timeStamp }
		},
		quests: {
			raw: null,
			quest: [ ], // array of Quest: { title: string, detail: string, progress: int, type: int, index: int }
			pages: -1
		},
		items: {
			raw: null,
			item: { } // key: itemid, value: name
		},
		basic: {
			raw: null,
			itemsMax: -1,
			shipsMax: -1,
			admiralExp: -1
		},
		material: {
			raw: null
		}
	},
	util: { }
};

Kancolle.set = function(message) {
	var isShip2 = false;
	
	switch(message.path) {
		case '/kcsapi/api_get_master/ship':
			return this.master.ships.set(message.json);
		case '/kcsapi/api_get_member/ndock':
			return this.user.ndock.set(message.json);
		case '/kcsapi/api_get_member/kdock':
			return this.user.kdock.set(message.json);
		case '/kcsapi/api_get_member/deck':
		case '/kcsapi/api_get_member/deck_port':
			return this.user.decks.set(message.json);
		case '/kcsapi/api_get_member/ship2':
			isShip2 = true;
		case '/kcsapi/api_get_member/ship3':
			return this.user.ships.set(message.json, isShip2);
		case '/kcsapi/api_get_member/questlist':
			return this.user.quests.set(message.json);
		case '/kcsapi/api_get_member/slotitem':
			return this.user.items.set(message.json);
		case '/kcsapi/api_get_member/basic':
			return this.user.basic.set(message.json);
		case '/kcsapi/api_get_member/material':
			return this.user.material.set(message.json);
		default:
			break;
	}
}.bind(Kancolle);

Kancolle.start = function(callback) {
	this.timerId = setInterval(function() {
		var params = [ ];
		
		params = params.concat(this.util.ndock());
		params = params.concat(this.util.kdock());
		params = params.concat(this.util.decks());
		
		callback(params);
	}.bind(this), 1000);
}.bind(Kancolle);

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
	
	return [ ];
}.bind(Kancolle.master.ships);

Kancolle.user.ndock.set = function(value) {
	var data = value.api_data,
	    ret = [ ];
	
	this.raw = value;
	
	for (var i = 0; i < data.length; i++) {
		this.dock[i] = {
			state: data[i].api_state,
			complete: data[i].api_complete_time,
			id: data[i].api_ship_id
		};
	}
	
	ret = ret.concat(Kancolle.util.ndock());
	
	return ret;
}.bind(Kancolle.user.ndock);

Kancolle.user.kdock.set = function(value) {
	var data = value.api_data,
	    ret = [ ];
	
	this.raw = value;
	
	for (var i = 0; i < data.length; i++) {
		this.dock[i] = {
			state: data[i].api_state,
			complete: data[i].api_complete_time
		};
	}
	
	ret = ret.concat(Kancolle.util.kdock());
	
	return ret;
}.bind(Kancolle.user.kdock);

Kancolle.user.decks.set = function(value) {
	var data = value.api_data,
	    ret = [ ];
	
	this.raw = value;
	
	for (var i = 0; i < data.length; i++) {
		if (data[i] != -1) {
			this.deck[i] = {
				ships: data[i].api_ship,
				complete: data[i].api_mission[2],
				mission: data[i].api_mission[1],
				name: data[i].api_name
			};
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kantai' + (i + 1) + '-name',
				value: data[i].api_name
			});
		} else {
			this.deck[i] = { };
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kantai' + (i + 1) + '-name',
				value: '未開放'
			});
		}
	}
	
	ret = ret.concat(Kancolle.util.kanmusu());
	ret = ret.concat(Kancolle.util.decks());
	
	return ret;
}.bind(Kancolle.user.decks);

Kancolle.user.ships.set = function(value, isShip2) {
	var data,
	    ret = [ ];
	
	this.ship = { };
	
	if (isShip2) {
		data = value.api_data;
	} else {
		data = value.api_data.api_ship_data;
	}
	
	this.raw = data;
	
	for (var i = 0; i < data.length; i++) {
		var obj = { };
		
		for (var key in data[i]) {
			obj[key.substring(4)] = data[i][key];
		}
		
		this.ship[data[i].api_id] = obj;
	}
	
	if (Kancolle.user.basic.shipsMax != -1) {
		ret.push({
			event: 'change',
			type: 'label',
			target: 'shipsNum',
			value: '' + (data.length) + ' @' + (Kancolle.user.basic.shipsMax - data.length)
		});
	}
	
	ret = ret.concat(Kancolle.util.kanmusu());
	
	return ret;
}.bind(Kancolle.user.ships);

Kancolle.user.items.set = function(value) {
	var ret = [ ],
	    data = value.api_data;
	
	this.raw = value;
	
	this.item = { };
	
	for (var i = 0; i < data.length; i++) {
		this.item[data[i].api_id] = data[i].api_name;
	}
	
	if (Kancolle.user.basic.itemsMax != -1) {
		ret.push({
			event: 'change',
			type: 'label',
			target: 'itemsNum',
			value: '' + (data.length) + ' @' + (Kancolle.user.basic.itemsMax - data.length)
		});
	}
	
	return ret;
}.bind(Kancolle.user.items);

Kancolle.user.basic.set = function(value) {
	var ret = [ ],
	    data = value.api_data;
	
	this.raw = value;
	
	if (this.admiralExp == data.api_experience) {
		ret.push({
			event: 'change',
			type: 'label',
			target: 'admiralExp',
			value: (function(admiralLv, nowExp) {
				return '' + (Experiences.getTotalAdmiral(admiralLv + 1) - nowExp);
			})(data.api_level, data.api_experience)
		});
	} else {
		ret.push({
			event: 'change',
			type: 'label',
			target: 'admiralExp',
			value: (function(admiralLv, nowExp, beforeExp) {
				return '' + (Experiences.getTotalAdmiral(admiralLv + 1) - nowExp) + ' (+' + (nowExp - beforeExp) + ')';
			})(data.api_level, data.api_experience, this.admiralExp)
		});
	}
	
	this.admiralExp = data.api_experience;
	this.shipsMax = data.api_max_chara;
	this.itemsMax = data.api_max_slotitem + 3;
	
	return ret;
}.bind(Kancolle.user.basic);

Kancolle.user.material.set = function(value) {
	var ret = [ ],
	    data = value.api_data;
	
	this.raw = value;
	
	ret.push({
		event: 'change',
		type: 'label',
		target: 'burnersNum',
		value: data[4].api_value
	});
		
	ret.push({
		event: 'change',
		type: 'label',
		target: 'bucketsNum',
		value: data[5].api_value
	});
	
	return ret;
}.bind(Kancolle.user.material);

Kancolle.user.quests.set = function(value) {
	var ret = [ ],
	    data = value.api_data;
	
	this.raw = value;
	
	if (this.pages != Math.ceil(data.api_count / 5)) {
		this.pages = Math.ceil(data.api_count / 5);
		this.quest = [ ];
	}
	
	var removes = [ ];
	
	for (var i = 0; i < this.quest.length; i++) {
		if (Math.floor(this.quest[i].index / 5) == data.api_disp_page) {
			removes.push(i);
		}
	}
	
	for (var i = removes.length - 1; i > -1; i--) {
		this.quest.splice(removes[i], 1);
	}
	
	for (var i = 0; i < data.api_list.length; i++) {
		if (data.api_list[i] == -1) continue;
		
		if (data.api_list[i].api_state == 1) continue;
		
		var progress;
		
		if (data.api_list[i].api_progress_flag == 0) {
			progress = QuestProgress.STARTED;
		} else if (data.api_list[i].api_progress_flag == 1) {
			progress = QuestProgress.HALF;
		} else if (data.api_list[i].api_progress_flag == 2) {
			progress = QuestProgress.ALMOST;
		} else if (data.api_list[i].api_state == 3) {
			progress = QuestProgress.DONE;
		} else {
			progress = QuestProgress.STARTED;
		}
		
		this.quest.push({
			index: data.api_disp_page * 5 + i,
			title: data.api_list[i].api_title,
			detail: data.api_list[i].api_detail,
			progress: progress,
			type: data.api_list[i].api_category
		});
	}
	
	this.quest.sort(function(a, b) {
		return a.index - b.index;
	});
	
	if (this.quest.length > 5) {
		this.quest = [ ];
	}
	
	for (var i = 0; i < 5; i++) {
		if (this.quest[i]) {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'quest' + (i + 1) + '-progress',
				value: (function(progress) {
					switch (progress) {
						case QuestProgress.STARTED:
							return '遂行中';
						case QuestProgress.HALF:
							return '50%';
						case QuestProgress.ALMOST:
							return '80%';
						case QuestProgress.DONE:
							return '完了！';
						default:
							return '遂行中';
					}
				})(this.quest[i].progress)
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'quest' + (i + 1) + '-type',
				value: Constants.QUEST_TYPE_STR[this.quest[i].type]
			});
			
			ret.push({
				event: 'change',
				type: 'color',
				target: 'quest' + (i + 1) + '-type',
				value: Constants.QUEST_TYPE_COLOR[this.quest[i].type]
			});
			
			ret.push({
				event: 'change',
				type: 'color',
				target: 'quest' + (i + 1) + '-underline',
				value: Constants.QUEST_TYPE_COLOR[this.quest[i].type]
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'quest' + (i + 1) + '-name',
				value: this.quest[i].title
			});
			
			ret.push({
				event: 'change',
				type: 'tooltip',
				target: 'quest' + (i + 1) + '-tooltip',
				value: this.quest[i].detail,
				gravity: 'e'
			});
		} else {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'quest' + (i + 1) + '-progress',
				value: '任務' + (i + 1)
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'quest' + (i + 1) + '-type',
				value: '--'
			});
			
			ret.push({
				event: 'change',
				type: 'color',
				target: 'quest' + (i + 1) + '-type',
				value: Constants.QUEST_TYPE_COLOR[0]
			});
			
			ret.push({
				event: 'change',
				type: 'color',
				target: 'quest' + (i + 1) + '-underline',
				value: Constants.QUEST_TYPE_COLOR[0]
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'quest' + (i + 1) + '-name',
				value: 'なし'
			});
			
			ret.push({
				event: 'change',
				type: 'tooltip',
				target: 'quest' + (i + 1) + '-tooltip',
				value: '',
				gravity: 'e'
			});
		}
	}
	
	return ret;
}.bind(Kancolle.user.quests);

Kancolle.util.kanmusu = function() {
	var ret = [ ];
	
	if (this.user.decks.raw == null || this.master.ships.raw == null || this.user.ships.raw == null || this.user.items.raw == null) return ret;
	
	for (var i = 0; i < this.user.decks.deck[0].ships.length; i++) {
		if (this.user.decks.deck[0].ships[i] != -1) {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kanmusu' + (i + 1) + '-lv',
				value: this.user.ships.ship[this.user.decks.deck[0].ships[i]].lv
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kanmusu' + (i + 1) + '-cond',
				value: (function(cond) {
					if (cond >= 50) {
		                return 'D';
		            } else if (cond >= 30) {
		                return 'A';
		            } else if (cond >= 20) {
		                return 'B';
		            } else {
		                return 'C';
		            }
				})(this.user.ships.ship[this.user.decks.deck[0].ships[i]].cond)
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kanmusu' + (i + 1) + '-name',
				value: this.master.ships.names[this.user.ships.ship[this.user.decks.deck[0].ships[i]].sortno]
			});
			
			ret.push({
				event: 'change',
				type: 'tooltip',
				target: 'kanmusu' + (i + 1) + '-tooltip',
				value: (function(kanmusu) {
					var ret = '<table><tbody>';
					
					ret += '<tr><td>疲労</td><td>' + kanmusu.cond + '</td></tr>';
					ret += '<tr><td>体力</td><td>' + kanmusu.nowhp + '/' + kanmusu.maxhp + '</td></tr>';
					ret += '<tr><td>次のレベルまで</td><td>' + kanmusu.exp[1] + ' exp</td></tr>';
					
					ret += '<tr><td>装備</td><td>';
					
					for (var i = 0; i < kanmusu.slot.length; i++) {
						if (kanmusu.slot[i] == -1) break;
						
						ret += this.user.items.item[kanmusu.slot[i]] + '</td></tr><tr><td></td><td>';
					}
					
					if (i == 0) {
						ret += 'なし</td></tr>'
					} else {
						ret = ret.substring(0, ret.length - '<tr><td></td><td>'.length);
					}
					
					ret += '</tbody></table>';
					
					return ret;
				}.bind(this))(this.user.ships.ship[this.user.decks.deck[0].ships[i]])
			});
		} else {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kanmusu' + (i + 1) + '-lv',
				value: '--'
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kanmusu' + (i + 1) + '-cond',
				value: ''
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kanmusu' + (i + 1) + '-name',
				value: 'なし'
			});
			
			ret.push({
				event: 'change',
				type: 'tooltip',
				target: 'kanmusu' + (i + 1) + '-tooltip',
				value: ''
			});
		}
		
	}
	
	return ret;
}.bind(Kancolle);

Kancolle.util.ndock = function() {
	var ret = [ ];
	
	if (this.raw == null || Kancolle.master.ships.raw == null || Kancolle.user.ships.raw == null) return ret;
	
	for (var i = 0; i < 4; i++) {
		if (this.dock[i].state == -1) {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'ndock' + (i + 1) + '-time',
				value: '未開放'
			});
		} else if (this.dock[i].state == 0) {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'ndock' + (i + 1) + '-time',
				value: '未使用'
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'ndock' + (i + 1) + '-name',
				value: 'ドック' + (i + 1)
			});
		} else if (this.dock[i].state == 1) {
			var sortno = Kancolle.user.ships.ship[this.dock[i].id].sortno;
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'ndock' + (i + 1) + '-name',
				value: Kancolle.master.ships.names[sortno]
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'ndock' + (i + 1) + '-time',
				value: (function(timeStamp) {
					var date = new Date(timeStamp),
					    now = new Date(),
					    ret = ''
					
					var diff = date - now;
					
					if (diff < 0) {
						return '出渠済み';
					}
					
					ret += 'あと ';
					
					var days = Math.floor(diff / (1000 * 60 * 60 * 24));
					diff -=  days * (1000 * 60 * 60 * 24);
					
					var hours = Math.floor(diff / (1000 * 60 * 60));
					diff -= hours * (1000 * 60 * 60);
					
					var minutes = Math.floor(diff / (1000 * 60));
					diff -= minutes * (1000 * 60);
					
					var seconds = Math.floor(diff / 1000);
					diff -= seconds * 1000;
					
					ret += ('0' + (days * 24 + hours)).slice(-2) + ':';
					ret += ('0' + minutes).slice(-2) + ':';
					ret += ('0' + seconds).slice(-2);
					
					return ret;
				})(this.dock[i].complete)
			});
		}
	}
	
	return ret;
}.bind(Kancolle.user.ndock);

Kancolle.util.kdock = function() {
	var ret = [ ];
	
	if (this.raw == null) return ret;
	
	for (var i = 0; i < 4; i++) {
		if (this.dock[i].state == -1) {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kdock' + (i + 1) + '-time',
				value: '未開放'
			});
		} else if (this.dock[i].state == 0) {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kdock' + (i + 1) + '-time',
				value: '未使用'
			});
		} else if (this.dock[i].state == 2) {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kdock' + (i + 1) + '-time',
				value: (function(timeStamp) {
					var date = new Date(timeStamp),
					    now = new Date(),
					    ret = ''
					
					var diff = date - now;
					
					if (diff < 0) {
						return '建造完了';
					}
					
					ret += 'あと ';
					
					var days = Math.floor(diff / (1000 * 60 * 60 * 24));
					diff -=  days * (1000 * 60 * 60 * 24);
					
					var hours = Math.floor(diff / (1000 * 60 * 60));
					diff -= hours * (1000 * 60 * 60);
					
					var minutes = Math.floor(diff / (1000 * 60));
					diff -= minutes * (1000 * 60);
					
					var seconds = Math.floor(diff / 1000);
					diff -= seconds * 1000;
					
					ret += ('0' + (days * 24 + hours)).slice(-2) + ':';
					ret += ('0' + minutes).slice(-2) + ':';
					ret += ('0' + seconds).slice(-2);
					
					return ret;
				})(this.dock[i].complete)
			});
		} else if (this.dock[i].state == 3) {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kdock' + (i + 1) + '-time',
				value: '建造完了'
			});
		}
	}
	
	return ret;
}.bind(Kancolle.user.kdock);

Kancolle.util.decks = function() {
	var ret = [ ];
	
	if (this.raw == null || Kancolle.user.ships.raw == null || Kancolle.master.ships.raw == null) return ret;
	
	for (var i = 1; i < 4; i++) {
		if (this.deck[i].name) {
			if (this.deck[i].mission) {
				ret.push({
					event: 'change',
					type: 'label',
					target: 'kantai' + (i + 1) + '-mission',
					value: Constants.ENSEI[this.deck[i].mission]
				});
				
				ret.push({
					event: 'change',
					type: 'label',
					target: 'kantai' + (i + 1) + '-return',
					value: (function(timeStamp) {
						var date = new Date(timeStamp),
						    now = new Date(),
						    ret = ''
						
						var diff = date - now;
						
						if (diff < 0) {
							return '帰投済み';
						}
						
						ret += date.getFullYear() + '/';
						ret += ('0' + (date.getMonth() + 1)).slice(-2) + '/';
						ret += ('0' + date.getDate()).slice(-2) + ' ';
						ret += ('0' + date.getHours()).slice(-2) + ':';
						ret += ('0' + date.getMinutes()).slice(-2) + ':';
						ret += ('0' + date.getSeconds()).slice(-2) + '　';
						
						ret += '(あと ';
						
						var days = Math.floor(diff / (1000 * 60 * 60 * 24));
						diff -=  days * (1000 * 60 * 60 * 24);
						
						var hours = Math.floor(diff / (1000 * 60 * 60));
						diff -= hours * (1000 * 60 * 60);
						
						var minutes = Math.floor(diff / (1000 * 60));
						diff -= minutes * (1000 * 60);
						
						var seconds = Math.floor(diff / 1000);
						diff -= seconds * 1000;
						
						ret += ('0' + (days * 24 + hours)).slice(-2) + ':';
						ret += ('0' + minutes).slice(-2) + ':';
						ret += ('0' + seconds).slice(-2);
						
						ret += ')';
						
						return ret;
					})(this.deck[i].complete)
				});
				
				ret.push({
					event: 'change',
					type: 'tooltip',
					target: 'kantai' + (i + 1),
					value: (function(ships) {
						var ret = '<table><tbody><tr><td>所属艦娘</td><td>';
						
						for (var i = 0; i < ships.length; i++) {
							if (ships[i] == -1) break;
							
							var kanmusu = Kancolle.user.ships.ship[ships[i]];
							
							ret += Kancolle.master.ships.names[kanmusu.sortno] + ' (' + kanmusu.lv + ')</td></tr><tr><td></td><td>';
						}
						
						ret = ret.substring(0, ret.length - '<tr><td></td><td>'.length);
						
						ret += '</tbody></table>';
						
						return ret;
					}.bind(this))(this.deck[i].ships)
				});
			} else {
				ret.push({
					event: 'change',
					type: 'label',
					target: 'kantai' + (i + 1) + '-mission',
					value: '未遠征'
				});
					
				ret.push({
					event: 'change',
					type: 'label',
					target: 'kantai' + (i + 1) + '-return',
					value: ''
				});
			}
		} else {
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kantai' + (i + 1) + '-mission',
				value: '未遠征'
			});
				
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kantai' + (i + 1) + '-return',
				value: ''
			});
			
			ret.push({
				event: 'change',
				type: 'label',
				target: 'kantai' + (i + 1),
				value: ''
			});
		}
	}
	
	return ret;
}.bind(Kancolle.user.decks);