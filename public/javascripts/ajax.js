var data;

function initialize() {
    console.log('1');
    var myLatlng = new google.maps.LatLng(40.1020, -88.2272);
    var light_grey_style = [{
        "featureType": "landscape",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": 65
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "poi",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": 51
        }, {
            "visibility": "simplified"
        }]
    }, {
        "featureType": "road.highway",
        "stylers": [{
            "saturation": -100
        }, {
            "visibility": "simplified"
        }]
    }, {
        "featureType": "road.arterial",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": 30
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "road.local",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": 40
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "transit",
        "stylers": [{
            "saturation": -100
        }, {
            "visibility": "simplified"
        }]
    }, {
        "featureType": "administrative.province",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [{
            "visibility": "on"
        }, {
            "lightness": -25
        }, {
            "saturation": -100
        }]
    }, {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
            "hue": "#ffff00"
        }, {
            "lightness": -25
        }, {
            "saturation": -97
        }]
    }];
    var myOptions = {
        zoom: 2,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    };
    var map = new google.maps.Map(document.getElementById("map-container"), myOptions);
    console.log('2');
    var heatmap;
    var liveTweets = new google.maps.MVCArray();
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: liveTweets,
        radius: 25
    });
    heatmap.setMap(map);
    console.log('3');

    for (var i in data['tweets']) {
        var tweetLocation = new google.maps.LatLng(data['tweets'][i]['coordinates'][0],data['tweets'][i]['coordinates'][1]);
        liveTweets.push(tweetLocation);

        //Flash a dot onto the map quickly
        var image = "images/small-dot-icon.png";
        var marker = new google.maps.Marker({
            position: tweetLocation,
            map: map,
            icon: image
        });
        setTimeout(function(){
            marker.setMap(null);
        },600);
    }
}

function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
               console.log('data');
               data = JSON.parse(xmlhttp.responseText);
               console.log('done');
               initialize();
           }
           else if (xmlhttp.status == 400) {
              alert('There was an error 400');
           }
           else {
               alert('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("GET", "http://localhost:3000/ajax", true);
    xmlhttp.send();
}
