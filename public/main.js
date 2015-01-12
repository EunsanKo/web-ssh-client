var eskoMap = (function(){



	var myFlashmobList = [];

	var geocoder;
	var map;
	var markerCluster;
	var opt={};

	var lat="";
	var lng="";
	var infowindows=[];
	var currentMarker=null;
	var image = new google.maps.MarkerImage("/images/markers/smile_marker.png", new google.maps.Size(30,45),'','',new google.maps.Size(30,45));  //새로운 마커 icon
	var flashmobImage = new google.maps.MarkerImage("/images/markers/flashmob.png", new google.maps.Size(30,45),'','',new google.maps.Size(30,45));  //flashmob icon
	var flashmobMarkers = {};
	var x = $('#loc');
	var targetId;
	var autoId;
	
	var center;
	var flashMob = {
		

		drawFlashmobList: function(){			
			
			$.get('/iplist', function(data){			

				center = latlng = new google.maps.LatLng(data.center.lat, data.center.lng);;
				var iplist = data.iplist;

				$(iplist).each(function(inx){				
					fncDrawFlashmobMarker(this);

					
					
				});
			});
		},

		
	};

	var initialize = function () {
	       
		
	       		
	    //초기위치설정
	    geocoder = new google.maps.Geocoder();
	    
	    var latlng = new google.maps.LatLng(lat, lng);
	    
	    
	    if(!opt.center) opt.center= latlng;
	    
	    
	    
	    map = new google.maps.Map(document.getElementById(targetId), opt);
	            
	    
	    var input = /** @type {HTMLInputElement} */(document.getElementById(autoId));

		var mcOption = {gridSize:50, maxZoom:10}
    	markerCluster = new MarkerClusterer(map, null, mcOption);	

	    if(input){
	    	var autocomplete = new google.maps.places.Autocomplete(input);

			autocomplete.bindTo('bounds', map);


		    
		    google.maps.event.addListener(autocomplete, 'place_changed', function() {
		      	fncCloseAllInfowindows();
		      	var place = autocomplete.getPlace();
		      	if (place.geometry.viewport) {
		       	 	map.fitBounds(place.geometry.viewport);
		      	} else {

		      		loca =place.formatted_address;
				    lat = place.geometry.location.lat();
				    lng = place.geometry.location.lng();
				    		
				   
				    
				    		
				     var marker = new google.maps.Marker( {
						map :map,
						position :place.geometry.location,
						icon: image,
						width: "40px"
					});
				    		
				    

				   var detailContent = "<b>"+loca+":"+lat+":"+lng+"</b>";


				    fncOpenInfowindow(detailContent, marker);
				    
		        	map.setCenter(place.geometry.location);
		        	map.setZoom(17);  // Why 17? Because it looks good.
		      	}

		    });
	    }

		
	    google.maps.event.addListener(map, 'zoom_changed', function() {
			
			map.setCenter(((lat!="" && lng!="") ? new google.maps.LatLng(lat, lng) : latlng));
		});
				
	    google.maps.event.addListener(map, 'dragend', function(evt){
			
		});
				
		google.maps.event.addListener(map, 'click', function(event) {
			
			var loca = event.latLng;
			geocoder.geocode({
			    'latLng' : loca
			}, function(results, status){
			    loca = results[0].formatted_address;
			    lat = results[0].geometry.location.lat();
			    lng = results[0].geometry.location.lng();
			    		
			    if( status == google.maps.GeocoderStatus.OK ) {
			    
			    }
			    else {
			    	bootbox.alert("Geocoder failed due to: " + status);
			    }
			    		
			    var marker = makeMarker(results);
			    		
			    
			    		
			    /*var detailContent = "<div><table style='font-size:12px; font-family:맑은 고딕;'><tr><td> "+loca+"</td></tr>"
		   		+"<tr><td style='text-align:right;'><a class='myButton_sm' onclick='javascript:openRegisterPopup(); '>Register Flashmob</a>"
		   		+"</td></tr></table></div>";
	*/

			   var detailContent = "<b>"+loca+":"+lat+":"+lng+"</b>";

				
				
						
				



			    fncOpenInfowindow(detailContent, marker);
			    map.setCenter(results[0].geometry.location);
			});
		});   
		
		google.maps.event.addListenerOnce(map, 'idle', function(){
	    	
	    	flashMob.drawFlashmobList();

		});	

	}
	     
	    
	var fncDrawFlashmobMarker= function (flashmobObj){
		var self = this;
		var latlng;	    
		var dbmarker;
		var locname;

		
			    

		
		latlng = new google.maps.LatLng(flashmobObj.lat, flashmobObj.lng);


		dbmarker = new google.maps.Marker( {
			map :map
			, position :latlng
			, ip : flashmobObj.ip
			, icon: flashmobImage
			, lat:flashmobObj.lat
			, lng:flashmobObj.lng
			, locname:flashmobObj.locname
			, width: "40px"
		});

		flashmobMarkers[dbmarker.ip] = dbmarker;

		markerCluster.addMarker(dbmarker,0);
		google.maps.event.addListener(dbmarker, 'click', function(event) {	     	    	
			
			if(currentMarker != null){
				currentMarker.setMap(null);	
			}
						       	
			var detailContent = "<b>"+dbmarker.locname+" "+dbmarker.lat+" "+dbmarker.lng+"</b>";

			fncOpenInfowindow(detailContent, dbmarker);
		});

		var lineCoordinates = [center];
		lineCoordinates.push(latlng);
	
		
		var line = new google.maps.Polyline({
		    path: lineCoordinates,
		    geodesic: true,
		    strokeColor: '#FF0000',
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		});
		
		line.setMap(map);
	
		  			
		
		
	}

	var fncOpenInfowindow= function (detailContent, marker){
		var infowindow = new google.maps.InfoWindow( 
	   	   	{	
	   	   		content:detailContent,
	   	   		size: new google.maps.Size(500,500)
	   		}
	   	)
	   	infowindow.open(map, marker);
	    infowindows.push(infowindow);
	}

	        
	var moveCenter= function (lat, lng){	
	  	var latLng = new google.maps.LatLng(lat, lng); 
	   	map.setCenter(latLng);
	}
	        
	     
	//클릭한 위치에서 새로운 marker 생성
	var makeMarker= function (result){
		if(currentMarker != null){
			currentMarker.setMap(null);	
		}    

	    var newmarker = new google.maps.Marker( {
			map :map,
			position :result[0].geometry.location,
			icon: image,
			width: "40px"
		});
		
		currentMarker = newmarker;
				
	    google.maps.event.addListener(newmarker, 'click', function(event) {
	    	    	
		    $('#location').val(result[0].formatted_address);
			lat = result[0].geometry.location.lat();
			lng = result[0].geometry.location.lng();
				    	
			
						
		  		    	 
		   var detailContent = "<b>"+result[0].formatted_address+"</b>";			
			


			fncOpenInfowindow(detailContent, newmarker);
		});
	    	    
	    return newmarker;
	}
	        
	        



	
	var getLocation = function (){
		
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(showPosition);
		}else{
			x.append("Geolocation is not supported by browser");
		}


	}

	var showPosition = function (position){

		lat = position.coords.latitude;
		lng = position.coords.longitude;
		
		initialize();
		
		var latlng = new google.maps.LatLng(lat,lng)
		geocoder.geocode({latLng:latlng},function(results,status){
		

			x.html('&nbsp;<i class="icon-location-arrow"></i>&nbsp;<b>'+results[1].formatted_address+'</b>');	
		});
		
	}


	function fncCloseAllInfowindows(){
	    for( var i=0; i<infowindows.length; i++){
	        infowindows[i].close();
	    }
	}

	var setOption = function(option){
		var zo = option.zoom;
		targetId = option.targetId
		if(!targetId){
			alert("지도가 그려질 영역의 id가 없습니다.");
			return;	
		} 
		if(!option.mamapTypeId) option.mapTypeId = google.maps.MapTypeId.ROADMAP;
		var myOptions = {
	        zoom: 2,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    }

		opt = option || myOptions;
		autoId = option.autoComplete;
		getLocation();
	}
	
	return {
		
		init:setOption
	};
}());


