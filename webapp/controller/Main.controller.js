sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("api_open_weather.Exemple_API_Ninja1_OpenWeather.controller.Main", {

		onInit: function () {
			//	this._loadForecast();
		},

		_formatDate: function (date) {
			var d = new Date(date),
				month = '' + (d.getMonth() + 1),
				day = '' + d.getDate(),
				year = d.getFullYear();

			if (month.length < 2) {
				month = '0' + month;
			}
			if (day.length < 2) {
				day = '0' + day;
			}
			return [day, month, year].join('-');
		},

		_formatTime: function (date) {
			debugger;
			var d = new Date(date),
				hour = '' + d.getHours() + 'h';

			if (hour.length < 2) {
				hour = '0' + hour;
			}

			return hour;
		},

		_mapResults: function (results) {
			debugger;
			var oModel = this.getView().getModel();
			oModel.setProperty("/city", results.city.name);
			oModel.setProperty("/country", results.city.country);
			var oCoor = results.city.coord.lat + ', ' + results.city.coord.lon;
			oModel.setProperty("/coordenades", oCoor);

			var aForecastResults = [];
			for (var i = 0; i < results.list.length; i++) {
				var oTemp = results.list[i].main.temp;
				var oClouds = results.list[i].clouds.all;
				var date = this._formatDate(results.list[i].dt * 1000);
				var oTime = this._formatTime(results.list[i].dt_txt);
				var oDesc = results.list[i].weather[0].description;
				var oIcon = results.list[i].weather[0].icon;
				oIcon = 'http://openweathermap.org/img/w/' + oIcon + '.png';

				//****************************************************************************************************
				//Els camps del array s'han de dir igual que els de la vista xml per fer el binding correcte!!!!!!!!
				//*****************************************************************************************************
				aForecastResults.push({
					date: date,
					time: oTime,
					temp: oTemp,
					//	units: "Celsius",
					descr: oDesc,
					icon: oIcon,
					humidity: results.list[i].main.humidity,
					clouds: oClouds,
					wind: results.list[i].wind.speed
				});
			}

			oModel.setProperty("/items", aForecastResults);
		},

		_loadForecast: function (query) {
			var oView = this.getView();
			var vQuery = query;
			var oParams = {
				q: vQuery, //"Cambrils", // Get the weather in london
				units: "metric",
				appid: "a8b736caad2602f08f3869acc188ea39", // Et dones alta a la web del openweathermap i et donen la apikey
				//	cnt: 5, // Només pots fe previsió de 5 dies sense pagar, no cal posar-ho...
				mode: "json" // get it in JSON format 
			};
			var sUrl = "/OpenWeather/data/2.5/forecast";
			oView.setBusy(true);

			var self = this;

			//Diferències entre $.get i $.ajax

			/*
			$.ajax() is the most configurable one, where you get fine grained control over HTTP headers and such. 
			You're also able to get direct access to the XHR-object using this method. Slightly more fine-grained 
			error-handling is also provided. Can therefore be more complicated and often unecessary, but sometimes 
			very useful. You have to deal with the returned data yourself with a callback.
            
            $.get() is just a shorthand for $.ajax() but abstracts some of the configurations away, setting reasonable 
            default values for what it hides from you. Returns the data to a callback. It only allows GET-requests so 
            is accompanied by the $.post() function for similar abstraction, only for POST

            $.load() is similar to $.get() but adds functionality which allows you to define where in the document the 
            returned data is to be inserted. Therefore really only usable when the call only will result in HTML. 
            It is called slightly differently than the other, global, calls, as it is a method tied to a particular 
            jQuery-wrapped DOM element. Therefore, one would do: $('#divWantingContent').load(...)

            It should be noted that all $.get(), $.post(), .load() are all just wrappers for $.ajax() as it's called 
            internally.
			*/
			$.get(sUrl, oParams)
				.done(function (results) {
					oView.setBusy(false);
					self._mapResults(results);
				})
				.fail(function (err) {
					oView.setBusy(false);
					if (err !== undefined) {
						var oErrorResponse = $.parseJSON(err.responseText);
						sap.m.MessageToast.show(oErrorResponse.message, {
							duration: 6000
						});
					} else {
						sap.m.MessageToast.show("Unknown error!");
					}
				});
		},

		onSearchEvent: function (evt) {
			var query = evt.getParameter("query");

			this._loadForecast(query);

			//Si vulguéssim fer la crida amb ajax, també funciona....

			//Posant directament https funciona,, no dona problemes de CORS i no se perque......
			//	var aUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + query +
			//		'&units=metric&APPID=a8b736caad2602f08f3869acc188ea39&cnt=5';

			//	var aUrl = '/OpenWeather/data/2.5/forecast?q=' + query +
			//		'&units=metric&APPID=a8b736caad2602f08f3869acc188ea39';

			/*  S'hauria de treballar la letra d.... pero funciona fer-ho així també!!!!!!
			jQuery.ajax({
				url: aUrl,
				method: 'GET',
				async: false,
				dataType: 'json',
				success: function (data) {
					var d = JSON.stringify(data);
					debugger;

					var res = d.split(":");
					var temp = res[7].split(",");
					var temp_c = temp[1];
					var skytext = res[18].split(",");
					var sky_condition = skytext[0];
					var icone = res[19].split(",");
					var icone_img = icone[0];
					var wind = res[21].split(",");
					var windSpeed_kph = wind[0];
					var preci = res[25].split(",");
					var precipitation_mm = preci[0];
					var hum = res[27].split(",");
					var humidity = hum[0];
					var visible = res[30].split("}");
					var visibility_in_KM = visible[0];
					var str = "Temperature in Celsius: " + temp_c + "\n" +
						"Sky Condition: " + sky_condition + "\n" +
						"Wind speed in kph: " + windSpeed_kph + "\n" +
						"Precipitation in mm: " + precipitation_mm + "\n" +
						"Humidity: " + humidity + "\n" +
						"Visibility in km: " + visibility_in_KM;

					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.show(
						str, {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "Info temps de: " + query,
							actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.Cancel]
						}
					);
				},
				error: function () {
					alert('Error in json call');
				}
			});
		*/
		}

	});
});