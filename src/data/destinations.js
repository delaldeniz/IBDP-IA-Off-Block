// [IATA, city, airport, lat, lon]
const rows = [
  ["LHR", "London", "Heathrow", 51.47, -0.4543],
  ["CDG", "Paris", "Charles de Gaulle", 49.0097, 2.5479],
  ["AMS", "Amsterdam", "Schiphol", 52.3105, 4.7683],
  ["FRA", "Frankfurt", "Frankfurt Airport", 50.0379, 8.5622],
  ["MUC", "Munich", "Munich Airport", 48.3538, 11.7861],
  ["BER", "Berlin", "Brandenburg", 52.3667, 13.5033],
  ["VIE", "Vienna", "Schwechat", 48.1103, 16.5697],
  ["ZRH", "Zurich", "Zurich Airport", 47.4647, 8.5492],
  ["GVA", "Geneva", "Geneva Airport", 46.2381, 6.1089],
  ["BRU", "Brussels", "Brussels Airport", 50.901, 4.4844],
  ["CPH", "Copenhagen", "Kastrup", 55.618, 12.656],
  ["MAD", "Madrid", "Barajas", 40.4983, -3.5676],
  ["BCN", "Barcelona", "El Prat", 41.2974, 2.0833],
  ["LIS", "Lisbon", "Humberto Delgado", 38.7742, -9.1342],
  ["FCO", "Rome", "Fiumicino", 41.8003, 12.2389],
  ["MXP", "Milan", "Malpensa", 45.6306, 8.7281],
  ["VCE", "Venice", "Marco Polo", 45.5053, 12.3519],
  ["ATH", "Athens", "Eleftherios Venizelos", 37.9364, 23.9445],
  ["BUD", "Budapest", "Ferenc Liszt", 47.4369, 19.2556],
  ["PRG", "Prague", "Vaclav Havel", 50.1008, 14.26],
  ["OTP", "Bucharest", "Henri Coanda", 44.5711, 26.085],
  ["BEG", "Belgrade", "Nikola Tesla", 44.8184, 20.3091],
  ["LGW", "London", "Gatwick", 51.1537, -0.1821],
  ["MAN", "Manchester", "Manchester Airport", 53.3537, -2.275],
  ["JFK", "New York", "John F. Kennedy", 40.6413, -73.7781],
  ["DXB", "Dubai", "Dubai International", 25.2532, 55.3657],
  ["DOH", "Doha", "Hamad", 25.2731, 51.6081],
  ["AMM", "Amman", "Queen Alia", 31.7226, 35.9932],
  ["CAI", "Cairo", "Cairo International", 30.1219, 31.4056],
  ["GYD", "Baku", "Heydar Aliyev", 40.4675, 50.0467],
  ["TAS", "Tashkent", "Islam Karimov", 41.2579, 69.2811],
  ["COV", "Adana-Mersin", "Cukurova", 36.8905, 35.0614],
  ["ADB", "Izmir", "Adnan Menderes", 38.2924, 27.157],
  ["AYT", "Antalya", "Antalya Airport", 36.8987, 30.8005],
  ["ESB", "Ankara", "Esenboga", 40.1281, 32.9951],
  ["ASR", "Kayseri", "Erkilet", 38.7704, 35.4954],
  ["BJV", "Bodrum", "Milas-Bodrum", 37.2506, 27.6643],
  ["DLM", "Dalaman", "Dalaman Airport", 36.7131, 28.7925],
  ["GZT", "Gaziantep", "Oguzeli", 36.9472, 37.4787],
  ["TZX", "Trabzon", "Trabzon Airport", 40.995, 39.7897]
];

export const destinations = rows.map((r) => ({
  code: r[0],
  city: r[1],
  airport: r[2],
  lat: r[3],
  lon: r[4]
}));

destinations.push({ code: "OTHER", city: "Somewhere else", airport: "Other airport", lat: null, lon: null });

export const IST = { code: "IST", city: "Istanbul", lat: 41.2753, lon: 28.7519 };

export function findDestination(code) {
  return destinations.find((d) => d.code === code);
}
