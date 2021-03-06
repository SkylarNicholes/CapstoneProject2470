const http = new XMLHttpRequest();
let url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${formatDate(
	new Date().setDate(new Date().getDate() - 1)
)}&endtime=${formatDate(
	new Date()
)}&latitude=39.419220&longitude=-111.950684&maxradiuskm=175`; // 175 is half of Utah's height on a map in KM

let center,
	map = undefined;
let markers = [];

http.open("GET", url);
http.send();

// Formatting date to YYYY-MM-DD for the API
function formatDate(date) {
	let d = new Date(date),
		month = "" + (d.getMonth() + 1),
		day = "" + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = "0" + month;
	if (day.length < 2) day = "0" + day;

	return [year, month, day].join("-");
}

function changeURL(days) {
	url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${formatDate(
		new Date().setDate(new Date().getDate() - days)
	)}&endtime=${formatDate(
		new Date()
	)}&latitude=39.419220&longitude=-111.950684&maxradiuskm=175`;

	let title = document.getElementById("title");

	if (days === 30) {
		title.innerHTML = "Utah - Past 30 days";
	} else if (days === 180) {
		title.innerHTML = "Utah - Past 6 months";
	} else if (days === 365) {
		title.innerHTML = "Utah - Past Year";
	}

	clearMarkers();

	http.open("GET", url);
	http.send();
}

function initMap() {
	center = { lat: 39.521, lng: -111.0937 };

	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 6.5,
		center,
	});

	marker = new google.maps.Marker({
		map,
	});
}

function clearMarkers() {
	markers.forEach((marker) => {
		marker.setMap(null);
	});
	markers = [];
}

http.onreadystatechange = function () {
	if (this.readyState === 4 && this.status === 200) {
		if (map) {
			let response = JSON.parse(http.responseText);
			markers = response.features.map((feature) => {
				let color = "";
				let mag = feature.properties.mag;
				if (mag < 1) {
					color = "pink";
				} else if (mag >= 1 && mag < 2) {
					color = "purple";
				} else if (mag >= 2 && mag < 3) {
					color = "blue";
				} else if (mag >= 3 && mag < 4) {
					color = "green";
				} else if (mag >= 4 && mag < 5) {
					color = "yellow";
				} else if ((mag >= 5 && mag > 7) || mag === 5.7) {
					color = "orange";
				} else if (mag >= 7) {
					color = "red";
				} else {
					console.log(mag);
					color = "orange";
				}
				let url = `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
				return new google.maps.Marker({
					map: map,
					position: {
						lat: feature.geometry.coordinates[1],
						lng: feature.geometry.coordinates[0],
					},
					title: feature.properties.title,
					icon: {
						url,
					},
				});
			});
		} else {
			http.open("GET", url);
			http.send();
		}
	}
};

function centerMapToMarker() {
	map.setCenter(marker.getPosition());
}
