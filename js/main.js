$(function() {
	// zahl, nachkomma, dezimal, tausender
	// zahlenformatierung
	function nf(num,dig,dec,sep) {
		var x = [];
		var s = (num<0?"-":"");
			num = Math.abs(num).toFixed(dig).split(".");
		var r = num[0].split("").reverse();
		for (var i=1;i<=r.length;i++) {
			x.unshift(r[i-1]);
			if ( i%3===0 && i != r.length )
				x.unshift(sep);
		}
		return s+x.join("")+(num[1]?dec+num[1]:"");
	}

	var ie = (function(){
		var undef,rv = -1; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer')
		{
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null)
				rv = parseFloat( RegExp.$1 );
		}
		return ((rv > -1) ? rv : undef);
	}());

	console.log(ie);
	if ( ie ) {
		if ( $('#results-display').length )
			$('#results-display')[0].style.setProperty( 'height', '600px', 'important' );
	}



	// detect touch & disable slider
	$("#slider-dist input").bind("slider:ready slider:changed", function (event, data) {
		$(this).nextAll(".slider-value").html(nf(data.value, 0, ",", "."));
	});

	$("#slider-taxfree input").bind("slider:changed", function (event, data) {
		$(this).nextAll(".slider-value").html(nf(data.value, 0, ",", ".")+" €");
	});

	$("#slider-taxamt input").bind("slider:changed", function (event, data) {
		$(this).nextAll(".slider-value").html(nf(data.value, 1, ",", ".")+"% pro Jahr");
	});

	// rechner1.html
	$("body").on("click", "#button-dist", function() {
		var value = $("#slider-dist input").val();
		$.cookie("estimate", value);
	});

	// rechner2.html
	
	if ( $(".rechner2").length ) {
		// read cookies
		$("#sachvermoegen").val(parseFloat($.cookie("sachvermoegen")) || "");
		$("#finanzvermoegen").val(parseFloat($.cookie("finanzvermoegen")) || "");
		$("#schulden").val(parseFloat($.cookie("schulden")) || "");
		$("#mitglieder").val(parseFloat($.cookie("mitglieder")) || "");

		// write cookies on click, draw chart
		$("body").on("click", "#button-calculate", function() {
			$.cookie("sachvermoegen", $("#sachvermoegen").val().replace(/\D/g, '' ));
			$.cookie("finanzvermoegen", $("#finanzvermoegen").val().replace(/\D/g, '' ));
			$.cookie("schulden", $("#schulden").val().replace(/\D/g, '' ));
			$.cookie("mitglieder", $("#mitglieder").val().replace(/\D/g, '' ) || 1);

		// read cookies - sanitized :)
		$("#sachvermoegen").val(parseFloat($.cookie("sachvermoegen")) || "");
		$("#finanzvermoegen").val(parseFloat($.cookie("finanzvermoegen")) || "");
		$("#schulden").val(parseFloat($.cookie("schulden")) || "");
		$("#mitglieder").val(parseFloat($.cookie("mitglieder")) || "");

			drawWhoHasWhat();
		});
	}



	// rechner3.html
	$("body").on("click", "#button-simulate", function() {
		$.cookie("steuerfrei", $("#slider-taxfree input").val());
		$.cookie("steuersatz", parseFloat($("#slider-taxamt input").val()).toFixed(1));
		drawMyTaxModel();
	});

	// static data
	at = [ -100168, -8919, -2388, -242, 19, 237, 573, 928, 1281, 1758, 2299, 2949, 3379, 3967, 4534, 5248, 5888, 6620, 7205, 8066, 8816, 9508, 10379, 11418, 12296, 13183, 14017, 14889, 16099, 17387, 18687, 19865, 21445, 22997, 24969, 26894, 28441, 30220, 32033, 34229, 37273, 40987, 44919, 49004, 52761, 56752, 62939, 68726, 75090, 80707, 85857, 92432, 99005, 104718, 110528, 117372, 125725, 134698, 143755, 150946, 157474, 165313, 174863, 183961, 191930, 200287, 208078, 217896, 226892, 233870, 240095, 246935, 254583, 263166, 271066, 278822, 288452, 300966, 311977, 320450, 330598, 343941, 360642, 378466, 394216, 409392, 428540, 451052, 480038, 511415, 541232, 587942, 657257, 729201, 817614, 929024, 1073602, 1332780, 1770352, 5836238 ];
	// at.push(Number.MAX_VALUE);

	// lables
	labels = new Array(100);
	for (var i=1; i<labels.length; i++) {
		if ( (i) % 10 === 0) {
			labels[i] = (i)+" %";
		} else {
			labels[i] = "";
		}
	}
	labels[0] = "";
	labels[1] = "1%";
	labels.pop();
	labels.push("99%");

	findMyPosition = function(balance) {
		for (i = 0; i < at.length; i++) {
			if ( at[i] > balance ) {
				break;
			}
		}
		return i;
	};

	drawWhoHasWhat = function( ) {
		// calculate variables
		var sachvermoegen = parseFloat($.cookie("sachvermoegen")) || 0;
		var finanzvermoegen = parseFloat($.cookie("finanzvermoegen")) || 0;
		var schulden = parseFloat($.cookie("schulden")) || 0;
		var mitglieder = parseFloat($.cookie("mitglieder")) || 1;

		balance = (sachvermoegen + finanzvermoegen - schulden) / mitglieder;
		estimate = parseFloat($.cookie("estimate")) || 0;
		myPosition = findMyPosition(balance);
		$("#f-actual").html(myPosition);
		$("#f-estimate").html(estimate);
		$(".pos-estimate").html(estimate);
		$(".val-estimate").html(nf(at[estimate-1], 0, ",", "."));

		$(".val-actual").html(nf(balance, 0, ",", "."));
		$(".pos-actual").html(myPosition);

		// set up graph
		var ctx = $("#results-display").get(0).getContext("2d");
		var data = {
			labels : labels,
			datasets : [{
				fillColor : "#BE3C14",
				strokeColor : "white",
				highLightPos: myPosition-1,
				highLightColor : "#73A5B1",
				HLP2: estimate-1,
				HLC2: "green",
				data : at
			}]
		};

		var options = {
			// animation : false,
			scaleOverride : true,
			scaleSteps : 13,
			scaleStepWidth : 500000,
			scaleStartValue : -500000,
			scaleFontFamily : "'Lato'",
			barShowStroke : false,
			barStrokeWidth : 0,
			barValueSpacing : 1,
			barDatasetSpacing : 0
		};
		var myNewChart = new Chart(ctx).Bar(data, options);
		$(".showlater").slideDown();
	};


	drawMyTaxModel = function() {
		sachvermoegen = parseFloat($.cookie("sachvermoegen")) || 0;
		finanzvermoegen = parseFloat($.cookie("finanzvermoegen")) || 0;
		schulden = parseFloat($.cookie("schulden")) || 0;
		mitglieder = $.cookie("mitglieder");
		balance = (sachvermoegen + finanzvermoegen - schulden) / mitglieder;
		if (isNaN(balance))
			balance = 0.0;
		estimate = parseFloat($.cookie("estimate"));
		taxfree = parseFloat($.cookie("steuerfrei"));
		taxamt = parseFloat($.cookie("steuersatz"));

		myPosition = findMyPosition(balance);

		// calculate (absolute) tax for every class
		accumTax = 0.0;
		proptax = [];
		var i;
		for (i = at.length - 1; i >= 0; i--) {
			proptax[i] = 1.0 * Math.max(0, at[i] - taxfree) * taxamt / 100.0;
			accumTax += proptax[i];
		}

		percapita = 0.85 * accumTax / 100.0;

		myModel = [];
		for (i = at.length - 1; i >= 0; i--) {
			myModel[i] = percapita - proptax[i];
		}

		$("#percapita").html(nf(percapita,2,",",".") + " €");
		mytax = 1.0 * Math.max(0, balance - taxfree) * taxamt / 100.0;
		$("#mytax").html(nf(mytax, 2, ",", ".") + " €");
		$("#mytaxbalance").html(nf(percapita - mytax, 2, ",", ".") + " €");

		min = Math.floor(myModel[98]/2000)*2000;
		max = Math.ceil(myModel[0]/2000)*2000;
		steps = (max - min ) / 2000;

		// set up graph
		var ctx = $("#results-display").get(0).getContext("2d");
		var data = {
			labels : labels,
			datasets : [{
				fillColor : "#BE3C14",
				strokeColor : "white",
				highLightPos: myPosition-1,
				highLightColor : "#73A5B1",
				data : myModel
			}]
		};

		var options = {
			scaleOverride : true,
			scaleSteps : steps,
			scaleStepWidth : 2000,
			scaleStartValue : min,
			scaleFontFamily : "'Lato'",
			barShowStroke : false,
			barStrokeWidth : 0,
			barValueSpacing : 1,
			barDatasetSpacing : 0
		};
		var myNewChart = new Chart(ctx).Bar(data, options);
	};
});