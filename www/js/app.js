// Ionic Starter App


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'ionic.service.core', 'ionic.service.push'])

.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // Your App ID
    app_id: '38a0e4f6',
    // The public API key services will use for this app
    api_key: '856628898920f582410d82ea126e1f9a364fcb9bd885d014',
    // Your GCM sender ID/project number (Uncomment if supporting Android)
    gcm_id: '248273376807'
  });

}])

.run(function($ionicPlatform,$cordovaBackgroundGeolocation,$rootScope, $ionicPush, $cordovaPush) {
    $ionicPlatform.ready(function() {
        var didReceiveRemoteNotificationCallBack = function(jsonData) {
            alert("Notification received:\n" + JSON.stringify(jsonData));
            console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
        }
        window.plugins.OneSignal.init("1902f6d8-df4f-11e4-886b-836672e95639",
            {googleProjectNumber: "248273376807"},
            didReceiveRemoteNotificationCallBack);
        window.plugins.OneSignal.registerForPushNotifications();
        var userRef = new Firebase("https://lanacion.firebaseio.com/user/"+localStorage.getItem("userId")+"/ubicacion");
        $cordovaBackgroundGeolocation.configure(
            {
                desiredAccuracy: 100,
                stationaryRadius: 10,
                distanceFilter: 30,
                debug: true
            }
        )
            .then(
            null, // Background never resolves
            function (err) { // error callback
                alert("error on background geo")
            },
            function (location) { // notify callback
                userRef.set({"latitud": location.latitude, "longitud": location.longitude});
            });
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
        StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
        $stateProvider
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })
            .state('tab.feed', {
                url: "/feed",
                views: {
                    'feed-tab': {
                        templateUrl: "templates/feed.html",
                        controller: 'FeedTabCtrl'
                    }
                }
            })
            .state('tab.promotion', {
                url: "/feed/:id",
                views: {
                    'feed-tab': {
                        templateUrl: "templates/promotion.html",
                        controller: 'PromotionCtrl'
                    }
                }
            })
            .state('home', {
                url: "/home",
                templateUrl: "templates/home.html",
                controller: 'AppCtrl'
            })
            .state('welcome', {
                url: "/welcome",
                templateUrl: "templates/welcoem.html",
                controller: 'WelcomeCtrl'
            })
            .state('selection', {
                url: "/selection",
                templateUrl: "templates/selection.html",
                controller: 'SelectionCtrl'
            });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome');

});

