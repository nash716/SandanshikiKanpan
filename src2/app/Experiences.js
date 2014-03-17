var Experiences = {
	isInit: false,
	admiralTable: [ ],
	shipTable: [ ]
};

Experiences.init = function() {
	this.admiralTable.push(0); // Lv 0
	this.admiralTable.push(0); // Lv 1
	this.admiralTable.push(100); // Lv 1 -> 2 になるのに必要な経験値
	this.admiralTable.push(200); // Lv 2 -> 3 になるのに必要な経験値
	this.admiralTable.push(300); // ...
	this.admiralTable.push(400);
	this.admiralTable.push(500);
	this.admiralTable.push(600);
	this.admiralTable.push(700);
	this.admiralTable.push(800);
	this.admiralTable.push(900);
	this.admiralTable.push(1000);
	this.admiralTable.push(1100);
	this.admiralTable.push(1200);
	this.admiralTable.push(1300);
	this.admiralTable.push(1400);
	this.admiralTable.push(1500);
	this.admiralTable.push(1600);
	this.admiralTable.push(1700);
	this.admiralTable.push(1800);
	this.admiralTable.push(1900);
	this.admiralTable.push(2000);
	this.admiralTable.push(2100);
	this.admiralTable.push(2200);
	this.admiralTable.push(2300);
	this.admiralTable.push(2400);
	this.admiralTable.push(2500);
	this.admiralTable.push(2600);
	this.admiralTable.push(2700);
	this.admiralTable.push(2800);
	this.admiralTable.push(2900);
	this.admiralTable.push(3000);
	this.admiralTable.push(3100);
	this.admiralTable.push(3200);
	this.admiralTable.push(3300);
	this.admiralTable.push(3400);
	this.admiralTable.push(3500);
	this.admiralTable.push(3600);
	this.admiralTable.push(3700);
	this.admiralTable.push(3800);
	this.admiralTable.push(3900);
	this.admiralTable.push(4000);
	this.admiralTable.push(4100);
	this.admiralTable.push(4200);
	this.admiralTable.push(4300);
	this.admiralTable.push(4400);
	this.admiralTable.push(4500);
	this.admiralTable.push(4600);
	this.admiralTable.push(4700);
	this.admiralTable.push(4800);
	this.admiralTable.push(4900);
	this.admiralTable.push(5000);
	this.admiralTable.push(5200);
	this.admiralTable.push(5400);
	this.admiralTable.push(5600);
	this.admiralTable.push(5800);
	this.admiralTable.push(6000);
	this.admiralTable.push(6200);
	this.admiralTable.push(6400);
	this.admiralTable.push(6600);
	this.admiralTable.push(6800);
	this.admiralTable.push(7000);
	this.admiralTable.push(7300);
	this.admiralTable.push(7600);
	this.admiralTable.push(7900);
	this.admiralTable.push(8200);
	this.admiralTable.push(8500);
	this.admiralTable.push(8800);
	this.admiralTable.push(9100);
	this.admiralTable.push(9400);
	this.admiralTable.push(9700);
	this.admiralTable.push(10000);
	this.admiralTable.push(10400);
	this.admiralTable.push(10800);
	this.admiralTable.push(11200);
	this.admiralTable.push(11600);
	this.admiralTable.push(12000);
	this.admiralTable.push(12400);
	this.admiralTable.push(12800);
	this.admiralTable.push(13200);
	this.admiralTable.push(13600);
	this.admiralTable.push(14000);
	this.admiralTable.push(14500);
	this.admiralTable.push(15000);
	this.admiralTable.push(15500);
	this.admiralTable.push(16000);
	this.admiralTable.push(16500);
	this.admiralTable.push(17000);
	this.admiralTable.push(17500);
	this.admiralTable.push(18000);
	this.admiralTable.push(18500);
	this.admiralTable.push(19000);
	this.admiralTable.push(20000);
	this.admiralTable.push(22000);
	this.admiralTable.push(25000);
	this.admiralTable.push(30000);
	this.admiralTable.push(40000);
	this.admiralTable.push(60000);
	this.admiralTable.push(90000);
	this.admiralTable.push(148500);
	this.admiralTable.push(300000);
	this.admiralTable.push(300000);
	this.admiralTable.push(300000);
	this.admiralTable.push(300000);
	this.admiralTable.push(400000);
	this.admiralTable.push(400000);
	this.admiralTable.push(500000);
	this.admiralTable.push(500000);
	this.admiralTable.push(600000);
	this.admiralTable.push(600000);
	this.admiralTable.push(700000);
	this.admiralTable.push(700000);
	this.admiralTable.push(800000);
	this.admiralTable.push(800000);
	this.admiralTable.push(900000);
	this.admiralTable.push(900000);
	
	this.shipTable.push(0); // Lv 0
	this.shipTable.push(0); // Lv 1
	this.shipTable.push(100); // Lv 1 -> 2 になるのに必要な経験値
	this.shipTable.push(200); // Lv 2 -> 3 になるのに必要な経験値
	this.shipTable.push(300); // ...
	this.shipTable.push(400);
	this.shipTable.push(500);
	this.shipTable.push(600);
	this.shipTable.push(700);
	this.shipTable.push(800);
	this.shipTable.push(900);
	this.shipTable.push(1000);
	this.shipTable.push(1100);
	this.shipTable.push(1200);
	this.shipTable.push(1300);
	this.shipTable.push(1400);
	this.shipTable.push(1500);
	this.shipTable.push(1600);
	this.shipTable.push(1700);
	this.shipTable.push(1800);
	this.shipTable.push(1900);
	this.shipTable.push(2000);
	this.shipTable.push(2100);
	this.shipTable.push(2200);
	this.shipTable.push(2300);
	this.shipTable.push(2400);
	this.shipTable.push(2500);
	this.shipTable.push(2600);
	this.shipTable.push(2700);
	this.shipTable.push(2800);
	this.shipTable.push(2900);
	this.shipTable.push(3000);
	this.shipTable.push(3100);
	this.shipTable.push(3200);
	this.shipTable.push(3300);
	this.shipTable.push(3400);
	this.shipTable.push(3500);
	this.shipTable.push(3600);
	this.shipTable.push(3700);
	this.shipTable.push(3800);
	this.shipTable.push(3900);
	this.shipTable.push(4000);
	this.shipTable.push(4100);
	this.shipTable.push(4200);
	this.shipTable.push(4300);
	this.shipTable.push(4400);
	this.shipTable.push(4500);
	this.shipTable.push(4600);
	this.shipTable.push(4700);
	this.shipTable.push(4800);
	this.shipTable.push(4900);
	this.shipTable.push(5000);
	this.shipTable.push(5200);
	this.shipTable.push(5400);
	this.shipTable.push(5600);
	this.shipTable.push(5800);
	this.shipTable.push(6000);
	this.shipTable.push(6200);
	this.shipTable.push(6400);
	this.shipTable.push(6600);
	this.shipTable.push(6800);
	this.shipTable.push(7000);
	this.shipTable.push(7300);
	this.shipTable.push(7600);
	this.shipTable.push(7900);
	this.shipTable.push(8200);
	this.shipTable.push(8500);
	this.shipTable.push(8800);
	this.shipTable.push(9100);
	this.shipTable.push(9400);
	this.shipTable.push(9700);
	this.shipTable.push(10000);
	this.shipTable.push(10400);
	this.shipTable.push(10800);
	this.shipTable.push(11200);
	this.shipTable.push(11600);
	this.shipTable.push(12000);
	this.shipTable.push(12400);
	this.shipTable.push(12800);
	this.shipTable.push(13200);
	this.shipTable.push(13600);
	this.shipTable.push(14000);
	this.shipTable.push(14500);
	this.shipTable.push(15000);
	this.shipTable.push(15500);
	this.shipTable.push(16000);
	this.shipTable.push(16500);
	this.shipTable.push(17000);
	this.shipTable.push(17500);
	this.shipTable.push(18000);
	this.shipTable.push(18500);
	this.shipTable.push(19000);
	this.shipTable.push(20000);
	this.shipTable.push(22000);
	this.shipTable.push(25000);
	this.shipTable.push(30000);
	this.shipTable.push(40000);
	this.shipTable.push(60000);
	this.shipTable.push(90000);
	this.shipTable.push(148500);
	this.shipTable.push(0);
	this.shipTable.push(10000);
	this.shipTable.push(1000);
	this.shipTable.push(2000);
	this.shipTable.push(3000);
	this.shipTable.push(4000);
	this.shipTable.push(5000);
	this.shipTable.push(6000);
	this.shipTable.push(7000);
	this.shipTable.push(8000);
	this.shipTable.push(9000);
	this.shipTable.push(10000);
	this.shipTable.push(12000);
	this.shipTable.push(14000);
	this.shipTable.push(16000);
	this.shipTable.push(18000);
	this.shipTable.push(20000);
	this.shipTable.push(23000);
	this.shipTable.push(26000);
	this.shipTable.push(29000);
	this.shipTable.push(32000);
	this.shipTable.push(35000);
	this.shipTable.push(39000);
	this.shipTable.push(43000);
	this.shipTable.push(47000);
	this.shipTable.push(51000);
	this.shipTable.push(55000);
	this.shipTable.push(59000);
	this.shipTable.push(63000);
	this.shipTable.push(67000);
	this.shipTable.push(71000);
	this.shipTable.push(75000);
	this.shipTable.push(80000);
	this.shipTable.push(85000);
	this.shipTable.push(90000);
	this.shipTable.push(95000);
	this.shipTable.push(100000);
	this.shipTable.push(105000);
	this.shipTable.push(110000);
	this.shipTable.push(115000);
	this.shipTable.push(120000);
	this.shipTable.push(127000);
	this.shipTable.push(134000);
	this.shipTable.push(141000);
	this.shipTable.push(148000);
	this.shipTable.push(155000);
	this.shipTable.push(163000);
	this.shipTable.push(171000);
	this.shipTable.push(179000);
	this.shipTable.push(187000);
	this.shipTable.push(195000);
	
	this.isInit = true;
}.bind(Experiences);

Experiences.getTotalAdmiral = function(nowLv) {
	if (!this.isInit) this.init();
	
	var ret = 0;
	
    for (var i = 1; i <= nowLv; i++) {
		ret += this.admiralTable[i];
	}
	
	return ret;
}.bind(Experiences);

Experiences.getTotalShip = function(nowLv, isPractice) {
	if (!this.isInit) this.init();
	
	var ret = 0;
	
	if (isPractice && nowLv > 99) {
		return 1000000;
	}
	
	for (var i = 1; i <= nowLv; i++) {
		ret += this.shipTable[i];
	}
	
	return ret;
}.bind(Experiences);