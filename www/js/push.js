/**
 * Created by lucas on 10/04/15.
 */
var ionicPushServer = require('ionic-push-server');
var Firebase = require("firebase");

var credentials = {
    IonicApplicationID : "38a0e4f6",
    IonicApplicationAPIsecret : "8083d63b5133306cb0c314094a0920d5b97f7b6670a72acd"
};

var myFirebaseRef = new Firebase("https://lanacion.firebaseio.com/");
myFirebaseRef.child("token").on('value', function(snap){
    for(var index in snap.val()) {
        var id = snap.val()[index].id;
        var notification = {
            "tokens":[id],
            "notification":{
                "alert":"Hi from Ionic Push Service!",
                "android":{
                    "collapseKey":"foo",
                    "delayWhileIdle":true,
                    "timeToLive":300,
                    "payload":{
                        "key1":"value",
                        "key2":"value"
                    }
                }
            }
        };
        console.log(credentials);
        console.log(notification);
        ionicPushServer(credentials, notification);
    }
    setInterval(function(){
        myFirebaseRef.child("user").child("1").child("ubicacion").once('value', function(snap){
            var a = snap.val();
            var aleatorio = parseInt(Math.random()*10);
            var aleatorio2 = parseInt(Math.random()*10);
            var lat = parseFloat(a.latitud);
            var long = parseFloat(a.longitud);
            if(aleatorio > 4){
                lat = lat - parseFloat("0.00000" + aleatorio)
                long = long - parseFloat("0.00000" + aleatorio2)
            }else{
                lat = lat + parseFloat("0.00000" + aleatorio)
                long = long + parseFloat("0.00000" + aleatorio2)
            }

            myFirebaseRef.child("user").child("1").child("ubicacion").update({
                "latitud": lat,
                "longitud" : long
            })
            myFirebaseRef.child("user").child("1").child("activity").push({
                "latitud": lat,
                "longitud" : long,
                "fecha" : Firebase.ServerValue.TIMESTAMP
            })
        });
    }, 1000*60*30);
});

