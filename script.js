var IST_AVG_DELAY = 13.8;

var airlineNames = {
    "TK": "Turkish Airlines",
    "AT": "Royal Air Maroc",
    "MS": "EgyptAir",
    "SU": "Aeroflot",
    "J2": "Azerbaijan Airlines",
    "GF": "Gulf Air",
    "RJ": "Royal Jordanian",
    "HY": "Uzbekistan Airways",
    "6E": "IndiGo",
    "3U": "Sichuan Airlines",
    "AH": "Air Algerie",
    "B6": "JetBlue",
    "FI": "Icelandair",
    "LO": "LOT Polish Airlines",
    "MH": "Malaysia Airlines",
    "NH": "ANA",
    "OM": "MIAT Mongolian",
    "OZ": "Asiana Airlines",
    "PK": "Pakistan International",
    "SQ": "Singapore Airlines",
    "TG": "Thai Airways",
    "TP": "TAP Air Portugal",
    "UA": "United Airlines",
    "WB": "RwandAir",
    "OTHER": "Another airline"
};

var HOUR_RATES = [15.6,12.8,10.1,21.7,10.7,17.9,6.8,7.4,5.6,7.5,16.1,12.5,14.8,16.5,18.6,18.5,17.2,21.1,15.2,15.8,14.7,15.2,12.1,14.7];

var seasonHistory = {
    2019: { winter: 15.8, spring: 13.9, summer: 21.4, autumn: 16.2 },
    2020: { winter: 12.1, spring: 5.2, summer: 6.8, autumn: 7.4 },
    2021: { winter: 9.8, spring: 8.7, summer: 15.9, autumn: 11.9 },
    2022: { winter: 14.6, spring: 16.8, summer: 26.1, autumn: 19.9 },
    2023: { winter: 15.9, spring: 13.7, summer: 20.4, autumn: 14.8 },
    2024: { winter: 14.8, spring: 12.1, summer: 18.6, autumn: 12.5 },
    2025: { winter: 14.2, spring: 11.4, summer: 17.9, autumn: 11.7 }
};

var airlineFactors = {
    "TK": 1.0, "AT": 1.15, "MS": 1.2, "SU": 1.1, "J2": 0.9, "GF": 0.95,
    "RJ": 1.05, "HY": 1.1, "6E": 1.25, "3U": 1.15, "AH": 1.35, "B6": 1.2,
    "FI": 0.9, "LO": 1.05, "MH": 0.95, "NH": 0.75, "OM": 1.1, "OZ": 0.85,
    "PK": 1.4, "SQ": 0.75, "TG": 1.0, "TP": 1.2, "UA": 1.1, "WB": 1.0,
    "OTHER": 1.05
};

var routeFactors = {
    "LHR": 1.25, "CDG": 1.2, "AMS": 1.15, "FRA": 1.15, "MUC": 1.0, "BER": 1.05,
    "VIE": 0.95, "ZRH": 1.0, "GVA": 0.95, "BRU": 1.0, "CPH": 0.9, "MAD": 1.0,
    "BCN": 1.1, "LIS": 1.15, "FCO": 1.05, "MXP": 1.0, "VCE": 0.95, "ATH": 1.1,
    "BUD": 0.9, "PRG": 0.9, "OTP": 0.95, "BEG": 0.9, "LGW": 1.3, "MAN": 1.1,
    "JFK": 1.3, "DXB": 1.05, "DOH": 0.95, "AMM": 0.9, "CAI": 1.1, "GYD": 0.85,
    "TAS": 0.9, "COV": 1.0, "ADB": 0.85, "AYT": 1.1, "ESB": 0.8, "ASR": 0.85,
    "BJV": 1.05, "DLM": 1.0, "GZT": 0.85, "TZX": 1.05, "OTHER": 1.0
};

var routeRegions = {
    "ADB": "domestic", "AYT": "domestic", "ESB": "domestic", "ASR": "domestic",
    "BJV": "domestic", "DLM": "domestic", "GZT": "domestic", "TZX": "domestic",
    "LHR": "westEurope", "LGW": "westEurope", "MAN": "westEurope", "COV": "westEurope",
    "CDG": "westEurope", "AMS": "westEurope", "FRA": "westEurope", "MUC": "westEurope",
    "BER": "westEurope", "BRU": "westEurope", "CPH": "westEurope", "ZRH": "westEurope",
    "GVA": "westEurope", "VIE": "westEurope",
    "MAD": "southEurope", "BCN": "southEurope", "LIS": "southEurope", "FCO": "southEurope",
    "MXP": "southEurope", "VCE": "southEurope", "ATH": "southEurope",
    "BUD": "eastEurope", "PRG": "eastEurope", "OTP": "eastEurope", "BEG": "eastEurope",
    "DXB": "middleEast", "DOH": "middleEast", "AMM": "middleEast", "CAI": "middleEast",
    "GYD": "centralAsia", "TAS": "centralAsia",
    "JFK": "longHaul"
};

var regionNames = {
    "domestic": "Domestic Turkey",
    "westEurope": "Western Europe",
    "southEurope": "Southern Europe",
    "eastEurope": "Eastern Europe",
    "middleEast": "Middle East",
    "centralAsia": "Central Asia",
    "longHaul": "Long haul",
    "other": "Other routes"
};

var weatherImpact = {
    "domestic":    { clear: 0.95, cloudy: 1.0, rain: 1.25, fog: 1.6, wind: 1.5, snow: 2.3, storm: 2.1 },
    "westEurope":  { clear: 0.95, cloudy: 1.0, rain: 1.3, fog: 1.9, wind: 1.4, snow: 2.0, storm: 2.2 },
    "southEurope": { clear: 0.95, cloudy: 1.0, rain: 1.2, fog: 1.5, wind: 1.35, snow: 1.8, storm: 2.0 },
    "eastEurope":  { clear: 0.95, cloudy: 1.0, rain: 1.2, fog: 1.6, wind: 1.3, snow: 2.1, storm: 2.0 },
    "middleEast":  { clear: 0.95, cloudy: 1.0, rain: 1.15, fog: 1.4, wind: 1.25, snow: 1.6, storm: 1.8 },
    "centralAsia": { clear: 0.95, cloudy: 1.0, rain: 1.15, fog: 1.5, wind: 1.3, snow: 2.0, storm: 1.9 },
    "longHaul":    { clear: 0.95, cloudy: 1.0, rain: 1.2, fog: 1.5, wind: 1.2, snow: 1.7, storm: 1.9 },
    "other":       { clear: 0.95, cloudy: 1.0, rain: 1.2, fog: 1.6, wind: 1.35, snow: 1.9, storm: 2.0 }
};

var weatherNames = {
    "clear": "Clear sky",
    "cloudy": "Cloudy",
    "rain": "Rain",
    "fog": "Fog",
    "wind": "Strong wind",
    "snow": "Snow",
    "storm": "Thunderstorm",
    "unknown": "Unknown"
};

var dayFactors = [1.08, 1.02, 0.9, 0.92, 1.0, 1.12, 0.96];
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getAircraftFactor(model) {
    if (model.indexOf("777") !== -1) return 1.15;
    if (model.indexOf("A330") !== -1 || model.indexOf("A350") !== -1 || model.indexOf("787") !== -1) return 1.1;
    if (model.indexOf("NEO") !== -1) return 1.05;
    return 1.0;
}

function getSeason(month) {
    if (month === 12 || month === 1 || month === 2) return "winter";
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    return "autumn";
}

function getSeasonRate(season) {
    var years = [2023, 2024, 2025];
    var weights = [1, 2, 3];
    var total = 0;
    var weightTotal = 0;
    for (var i = 0; i < years.length; i++) {
        total = total + seasonHistory[years[i]][season] * weights[i];
        weightTotal = weightTotal + weights[i];
    }
    return total / weightTotal;
}

function codeToWeather(code, wind) {
    if (code === null || code === undefined) return "unknown";
    if (code >= 95) return "storm";
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
    if (code === 45 || code === 48) return "fog";
    if (wind > 40) return "wind";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
    if (code === 2 || code === 3) return "cloudy";
    return "clear";
}

async function getWeather(input) {
    if (input.weather !== "auto") {
        return { type: input.weather, source: "chosen by you" };
    }
    try {
        var url = "https://api.open-meteo.com/v1/forecast?latitude=41.27&longitude=28.75&hourly=weather_code,wind_speed_10m&timezone=Europe%2FIstanbul&start_date=" + input.flight_date + "&end_date=" + input.flight_date;
        var res = await fetch(url);
        var data = await res.json();
        if (!data.hourly) {
            return { type: "unknown", source: "forecast not out yet" };
        }
        var hour = parseInt(input.time.split(":")[0], 10);
        var code = data.hourly.weather_code[hour];
        var wind = data.hourly.wind_speed_10m[hour];
        return { type: codeToWeather(code, wind), source: "IST forecast" };
    } catch (e) {
        return { type: "unknown", source: "forecast not available" };
    }
}

async function getPrediction(input) {
    var weather = await getWeather(input);
    var factors = [];

    var hour = parseInt(input.time.split(":")[0], 10);
    var hourRate = HOUR_RATES[hour];

    var parts = input.flight_date.split("-");
    var date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var month = date.getMonth() + 1;
    var day = date.getDay();

    var season = getSeason(month);
    var seasonRate = getSeasonRate(season);
    var seasonFactor = seasonRate / IST_AVG_DELAY;
    factors.push({
        name: "Season (" + season + ")",
        text: "Past " + season + "s: 2023 " + seasonHistory[2023][season] + "%, 2024 " + seasonHistory[2024][season] + "%, 2025 " + seasonHistory[2025][season] + "%",
        value: seasonFactor
    });

    var airlineFactor = airlineFactors[input.airline_iata] || 1.0;
    factors.push({
        name: "Airline",
        text: airlineNames[input.airline_iata] || input.airline_iata,
        value: airlineFactor
    });

    var routeFactor = routeFactors[input.destination_airport_iata] || 1.0;
    factors.push({
        name: "Route",
        text: "IST to " + input.destination_airport_iata,
        value: routeFactor
    });

    var aircraftFactor = getAircraftFactor(input.aircraft_model);
    factors.push({
        name: "Aircraft",
        text: input.aircraft_model,
        value: aircraftFactor
    });

    var dayFactor = dayFactors[day];
    factors.push({
        name: "Day of week",
        text: dayNames[day],
        value: dayFactor
    });

    var region = routeRegions[input.destination_airport_iata] || "other";
    var weatherFactor = 1.0;
    if (weather.type !== "unknown") {
        weatherFactor = weatherImpact[region][weather.type];
    }
    factors.push({
        name: "Weather",
        text: weatherNames[weather.type] + " (" + weather.source + ") on " + regionNames[region] + " routes",
        value: weatherFactor
    });

    var percent = hourRate;
    for (var i = 0; i < factors.length; i++) {
        percent = percent * factors[i].value;
    }
    if (percent < 2) percent = 2;
    if (percent > 95) percent = 95;

    return {
        probability: percent / 100,
        hourRate: hourRate,
        hour: hour,
        weather: weather.type,
        factors: factors
    };
}

function getTodayString() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, "0");
    var d = String(now.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
}

function getRiskLabel(percent) {
    if (percent < 10) return "Low";
    if (percent < 25) return "Typical";
    if (percent < 45) return "Raised";
    return "High";
}

function getRiskClass(percent) {
    if (percent < 10) return "status-success";
    if (percent < 25) return "status-success";
    if (percent < 45) return "status-warning";
    return "status-danger";
}

function getRiskColor(percent) {
    if (percent < 10) return "#059669";
    if (percent < 25) return "#059669";
    if (percent < 45) return "#ea580c";
    return "#dc2626";
}

function clearErrors() {
    document.getElementById("dateError").textContent = "";
    document.getElementById("timeError").textContent = "";
}

function saveToHistory(input, probability) {
    try {
        var key = 'delaywatch_history';
        var max = 50;
        var data = localStorage.getItem(key);
        var items = [];
        if (data) {
            try { items = JSON.parse(data); } catch (e) { items = []; }
        }
        if (!Array.isArray(items)) items = [];
        var entry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            airline_iata: input.airline_iata,
            destination_airport_iata: input.destination_airport_iata,
            aircraft_model: input.aircraft_model,
            flight_date: input.flight_date,
            time: input.time,
            weather: input.weather,
            probability: probability,
            checked_at: new Date().toISOString()
        };
        items.push(entry);
        if (items.length > max) {
            items = items.slice(items.length - max);
        }
        localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
    }
}

function handlePredict() {
    clearErrors();

    var dateVal = document.getElementById("dateInput").value;
    var timeVal = document.getElementById("timeInput").value;
    var hasError = false;

    if (!dateVal) {
        document.getElementById("dateError").textContent = "Please select a departure date.";
        hasError = true;
    }

    if (!timeVal) {
        document.getElementById("timeError").textContent = "Please select a departure time.";
        hasError = true;
    }

    if (hasError) return;

    var input = {
        airline_iata: document.getElementById("airlineSelect").value,
        destination_airport_iata: document.getElementById("destinationSelect").value,
        aircraft_model: document.getElementById("aircraftSelect").value,
        flight_date: dateVal,
        time: timeVal,
        weather: document.getElementById("weatherSelect").value
    };

    var btn = document.getElementById("predictBtn");
    btn.disabled = true;
    btn.textContent = "Loading...";

    getPrediction(input).then(function (result) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-search"></i> Predict Delay';
        saveToHistory(input, result.probability);
        showResult(input, result);
    });
}

function showResult(input, result) {
    var percent = Math.round(result.probability * 100);

    var airlineName = airlineNames[input.airline_iata] || input.airline_iata;
    document.getElementById("detailAirline").textContent = airlineName;
    document.getElementById("detailDestination").textContent = input.destination_airport_iata;
    document.getElementById("detailAircraft").textContent = input.aircraft_model;
    document.getElementById("detailDate").textContent = input.flight_date;
    document.getElementById("detailTime").textContent = input.time;
    document.getElementById("detailWeather").textContent = weatherNames[result.weather];

    var list = document.getElementById("factorList");
    var html = "<li><span><strong>Departure hour</strong><br>" + String(result.hour).padStart(2, "0") + ":00 flights were delayed " + result.hourRate + "% of the time</span><span class=\"factor-same\">" + result.hourRate + "%</span></li>";
    for (var i = 0; i < result.factors.length; i++) {
        var f = result.factors[i];
        var cls = "factor-same";
        if (f.value > 1.001) cls = "factor-up";
        if (f.value < 0.999) cls = "factor-down";
        html = html + "<li><span><strong>" + f.name + "</strong><br>" + f.text + "</span><span class=\"" + cls + "\">x" + f.value.toFixed(2) + "</span></li>";
    }
    list.innerHTML = html;

    var circumference = 2 * Math.PI * 50;
    var offset = circumference - (percent / 100) * circumference;
    var arc = document.getElementById("riskArc");
    arc.style.strokeDasharray = circumference;
    arc.style.strokeDashoffset = offset;
    arc.style.stroke = getRiskColor(percent);

    document.getElementById("riskPercent").textContent = percent + "%";

    var label = document.getElementById("riskLabel");
    label.textContent = getRiskLabel(percent);
    label.className = "status-badge " + getRiskClass(percent);

    var diff = Math.round(percent - IST_AVG_DELAY);
    var compText = "";
    if (diff > 0) {
        compText = diff + " points above the Istanbul average (13.8%).";
    } else if (diff < 0) {
        compText = Math.abs(diff) + " points below the Istanbul average (13.8%).";
    } else {
        compText = "Equal to the Istanbul average (13.8%).";
    }
    document.getElementById("avgComparison").textContent = compText;

    document.getElementById("detailModal").style.display = "block";
}

function closeModal() {
    document.getElementById("detailModal").style.display = "none";
}

window.onclick = function (event) {
    var modal = document.getElementById("detailModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeModal();
    }
});

function closeWelcomeScreen() {
    document.getElementById("welcomeScreen").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
    var dateInput = document.getElementById("dateInput");
    if (dateInput) {
        dateInput.min = getTodayString();
        var threeDays = new Date();
        threeDays.setDate(threeDays.getDate() + 3);
        var y = threeDays.getFullYear();
        var m = String(threeDays.getMonth() + 1).padStart(2, "0");
        var d = String(threeDays.getDate()).padStart(2, "0");
        dateInput.value = y + "-" + m + "-" + d;
    }

    var timeInput = document.getElementById("timeInput");
    if (timeInput) {
        timeInput.value = "18:30";
    }

    var dateField = document.getElementById("dateInput");
    var timeField = document.getElementById("timeInput");

    if (dateField) {
        dateField.addEventListener("input", function () {
            if (dateField.value) {
                document.getElementById("dateError").textContent = "";
            }
        });
    }

    if (timeField) {
        timeField.addEventListener("input", function () {
            if (timeField.value) {
                document.getElementById("timeError").textContent = "";
            }
        });
    }
});

var sunSvg = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
var moonSvg = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

function toggleDarkMode() {
    var body = document.body;
    var icon = document.getElementById("themeIcon");
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        if (icon) icon.innerHTML = moonSvg;
        localStorage.setItem("theme", "dark");
    } else {
        if (icon) icon.innerHTML = sunSvg;
        localStorage.setItem("theme", "light");
    }
}

function loadTheme() {
    var savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        var icon = document.getElementById("themeIcon");
        if (icon) {
            icon.innerHTML = moonSvg;
        }
    }
}

loadTheme();