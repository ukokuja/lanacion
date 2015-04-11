function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicPush, $ionicUser) {
        $scope.tokenRef = new Firebase("https://lanacion.firebaseio.com/token");
        $rootScope.$on('$cordovaPush:tokenReceived', function (event, data) {
            $scope.tokenRef.push({"id": data.token});
            console.log('Got token', data.token, data.platform);
        });
        //Basic registration
        $scope.pushRegister = function () {
            alert('Registering...');

            $ionicPush.register({
                canShowAlert: false,
                onNotification: function (notification) {
                    // Called for each notification for custom handling
                    $scope.lastNotification = JSON.stringify(notification);
                }
            }).then(function (deviceToken) {
                $scope.token = deviceToken;
            });
        }

        $scope.identifyUser = function () {
            alert('Identifying');
            console.log('Identifying user');

            var user = $ionicUser.get();
            if (!user.user_id) {
                // Set your user_id here, or generate a random one
                user.user_id = $ionicUser.generateGUID()
            }
            ;

            angular.extend(user, {
                name: 'Test User',
                message: 'I come from planet Ion'
            });

            $ionicUser.identify(user);

        }

    })
    .controller('FeedTabCtrl', function($scope, $timeout, $http, $state, $cordovaSocialSharing, $ionicPlatform) {
        localStorage.setItem("userId", 1);

        $scope.beneficioRef = new Firebase("https://lanacion.firebaseio.com/beneficio");
        $scope.userRef = new Firebase("https://lanacion.firebaseio.com/user/"+localStorage.getItem("userId"));
        $scope.user = {};
        $scope.beneficios = [];
        /*$scope.userRef.once('value', function(userSnap){
            $timeout(function(){
                $scope.user = userSnap.val()
                $http.get('http://23.23.128.233:8080/api/geo/'+$scope.user.ubicacion.latitud + "/" + $scope.user.ubicacion.longitud).
                    success(function(data, status, headers, config) {
                        $timeout(function(){$scope.beneficios = data});
                    }).
                    error(function(data, status, headers, config) {
                        alert("error");
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            });*/
        $scope.to = function(view, id){
            if(id)
            $state.go(view, {"id" : id});
            else
            $state.go(view);
        }
        $ionicPlatform.ready(function() {
            $scope.share = function (item) {
                $cordovaSocialSharing
                    .share(item.beneficio.tipo + " " + item.beneficio.descripcion + "#" + item.establecimiento.nombre, "Club LN Hack") // Share via native share sheet
                    .then(function (result) {
                        // Success!
                    }, function (err) {
                        // An error occured. Show a message to the user
                    });
            }
        });
        $scope.beneficioRef.on('value', function(snaps){
                $timeout(function(){
                    angular.forEach(snaps.val(), function(value, key){
                        if(key%2 == 0){
                            $scope.beneficios[parseInt(key/2)] = [];
                        }
                        if(value.imagen){
                            value.img1 = $scope.giveMePicture(value.imagen);
                            value.img2 = $scope.giveMePicture2(value.imagen)
                        }

                        $scope.beneficios[parseInt(key/2)].push(value)
                    })
                });
        })

        $scope.giveMePicture = function(val){
            if(val.indexOf("nombre=")>=0){
                var aux = "http://club.lanacion.com.ar/imagenes/" + val.substr(val.indexOf("nombre=") + 7, val.indexOf("nombre=") + val.indexOf(":") -7);
                return aux;
            }else{
                return "http://club.lanacion.com.ar/_ui/desktop/imgs/logo.png";
            }

        }

        $scope.giveMePicture2 = function(val){
            if(val && val.length>0){
                var aux = [];
                aux = val.split("-");
                if(aux.length>1){
                    console.log(aux[1]);
                    return $scope.giveMePicture(aux[1]);
                }else{
                    return "http://club.lanacion.com.ar/_ui/desktop/imgs/logo.png";
                }
            }else{
                return "http://club.lanacion.com.ar/_ui/desktop/imgs/logo.png";
            }
        }
    })
    .controller('PromotionCtrl', function($scope, $timeout ,$http, $stateParams, $state) {
        $scope.userRef = new Firebase("https://lanacion.firebaseio.com/user/" + localStorage.getItem("userId"));
        $scope.reservasRef = new Firebase("https://lanacion.firebaseio.com/reservas/");
        $scope.idBeneficio = $stateParams.id;
        $scope.reservas = [];
        $scope.misReservas = [];
        if (!$scope.idBeneficio || $scope.idBeneficio == '') {
            $state.go("tab.feed");
        }
        $scope.reservar = function () {
            if (!$scope.reservado()) {
                $scope.userRef.child("reservas").push({
                    "id": $scope.item.id,
                    "descuento": $scope.item.beneficio.tipo,
                    "negocio": $scope.item.establecimiento.nombre,
                    "fecha": Firebase.ServerValue.TIMESTAMP
                })
                $scope.reservasRef.child($scope.item.id).push({
                    "id": localStorage.getItem("userId"),
                    "fecha": Firebase.ServerValue.TIMESTAMP
                })
            }

        }
        if (!Date.now) {
            Date.now = function () {
                return new Date().getTime();
            }
        }
        $scope.getPedidos = function () {
            var aux = 0;
            angular.forEach($scope.reservas, function (value, key) {
                if (Date.now() - value.fecha < (1000 * 60 * 60)) {
                    aux++;
                }
            });
            return aux;
        }
        $scope.reservado = function () {
            var toreturn = false;
            angular.forEach($scope.misReservas, function (value) {
                if (value.id === $scope.item.id && (Date.now() - value.fecha < (1000 * 60 * 30))) {
                    toreturn = true;
                }
            });
            return toreturn;
        }
        $scope.userRef.child("reservas").on('value', function (misSnap) {
            $timeout(function () {
                $scope.misReservas = misSnap.val();
            })
        });
        $scope.item = {}
        $scope.userRef = new Firebase("https://lanacion.firebaseio.com/user/" + localStorage.getItem("userId"));
        $scope.user = {};
        $scope.userRef.once('value', function (userSnap) {
            $timeout(function () {
                $scope.user = userSnap.val()
            });
        });
        $http.get('http://23.23.128.233:8080/api/beneficio/' + $scope.idBeneficio).
            success(function (data, status, headers, config) {
                $timeout(function () {
                    $scope.item = data[0];
                    if ($scope.item.imagen) {
                        $scope.item.img1 = $scope.giveMePicture($scope.item.imagen);
                        $scope.item.img2 = $scope.giveMePicture2($scope.item.imagen)
                    }
                    $scope.reservasRef.child($scope.item.id).once('value', function (resSnap) {
                        $timeout(function () {
                            $scope.reservas = resSnap.val();
                        })
                    });

                });
            }).
            error(function (data, status, headers, config) {
                console.log(data);
                console.log(status);
                console.log(config);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        $scope.giveMePicture = function (val) {
            if (val.indexOf("nombre=") >= 0) {
                var aux = "http://club.lanacion.com.ar/imagenes/" + val.substr(val.indexOf("nombre=") + 7, val.indexOf("nombre=") + val.indexOf(":") - 7);
                return aux;
            } else {
                return "http://club.lanacion.com.ar/_ui/desktop/imgs/logo.png";
            }

        }
        $scope.getMap = function (loc) {
            var aux = "http://maps.googleapis.com/maps/api/staticmap?center=" + loc[0] + "," + loc[1] + "&zoom=16&size=250x250&maptype=roadmap&markers=color:blue%7Clabel:S%7C" + loc[0] + "," + loc[1] + "&sensor=false&key=AIzaSyCAgfypDIo3-SUODH8MwXoA1u5f9s0hHLQ"
            return aux;
        }
        $scope.giveMePicture2 = function (val) {
            if (val && val.length > 0) {
                var aux = [];
                aux = val.split("-");
                if (aux.length > 1) {
                    console.log(aux[1]);
                    return $scope.giveMePicture(aux[1]);
                } else {
                    return "http://club.lanacion.com.ar/_ui/desktop/imgs/logo.png";
                }
            } else {
                return "http://club.lanacion.com.ar/_ui/desktop/imgs/logo.png";
            }
        }
        $scope.getMinutos = function (val) {
            return (parseInt(getDistanceFromLatLonInKm(val[0], val[1], $scope.user.ubicacion.latitud, $scope.user.ubicacion.longitud)) * 10 + 5) + " minutos";
        }
        $scope.getDistancia = function (val) {
            return (parseFloat(getDistanceFromLatLonInKm(val[0], val[1], $scope.user.ubicacion.latitud, $scope.user.ubicacion.longitud))).toString().substr(0, 3) + "Km";
        }
        $scope.getShow = function (val) {
            return parseInt(getDistanceFromLatLonInKm(val[0], val[1], $scope.user.ubicacion.latitud, $scope.user.ubicacion.longitud)) < 2;
        }
    }).controller('WelcomeCtrl', function($scope, $timeout ,$http, $stateParams, $state, $interval) {
        $scope.pics = [
            "coffee-hands-mobile-phone-4831.jpg",
            "fashion-put-on-shoes-4180.jpeg",
            "chilling-friends-group-4162.jpeg",

        ]
        $scope.indexBackground = 0;
        $scope.animationBackground = 0;
        $scope.par = 1;
        $scope.background = {
            "background-image": "url('img/"+$scope.pics[$scope.indexBackground]+"')",
            "background-size" : "cover"
        };
        var stop;



        stop = $interval(function() {
            $scope.indexBackground  = ($scope.indexBackground + 1 ) % $scope.pics.length;
            $timeout(function(){$scope.animationBackground = ($scope.animationBackground + 1 ) % $scope.pics.length;}, 20);
            $scope.par = $scope.par * (-1);
            $scope.background = {"background-image": "url('img/"+$scope.pics[$scope.indexBackground]+"')"}
        }, 7000);


        $scope.desChangeImages = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

    }).controller('SelectionCtrl', function($scope, $timeout ,$http, $stateParams, $state, $interval) {
        $scope.categoriasRef = new Firebase("https://lanacion.firebaseio.com/categorias/");
        $scope.categorias = [];
        $scope.categoriasRef.once('value', function(caSnap){
           $timeout(function(){
               $scope.categorias = caSnap.val();
           })
        });
        $scope.giveMeColor = function(item){
            var aux = "rgba("+hexToRgb("#"+item).r+","+hexToRgb("#"+item).g+","+hexToRgb("#"+item).b+" ,0.3)";
            return aux;
        }
    })

