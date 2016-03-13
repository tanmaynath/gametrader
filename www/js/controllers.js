angular.module('mychat.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
    //console.log('Login Controller Initialized');

    var ref = new Firebase($scope.firebaseUrl);
    var auth = $firebaseAuth(ref);

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.createUser = function (user) {
        console.log("Create User Function called");
        if (user && user.email && user.password && user.displayname) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });

            auth.$createUser({
                email: user.email,
                password: user.password
            }).then(function (userData) {
                alert("User created successfully!");
                ref.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname,
                    //post: ""
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }).catch(function (error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signIn = function (user) {

        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.$authWithPassword({
                email: user.email,
                password: user.pwdForLogin
            }).then(function (authData) {
                console.log("Logged in as:" + authData.uid);
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    
                    var val = snapshot.val();
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.displayName = val;
                    });
                });
                $ionicLoading.hide();
                $state.go('tab.rooms');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
})

.controller('ChatCtrl', function ($scope, Chats, $state) {
    //console.log("Chat Controller initialized");

    $scope.IM = {
        textMessage: ""
    };

    Chats.selectRoom($state.params.roomId);

    var roomName = Chats.getSelectedRoomName();

    // Fetching Chat Records only if a Room is Selected
    if (roomName) {
        $scope.roomName = " - " + roomName;
        $scope.chats = Chats.all();
    }

    $scope.sendMessage = function (msg) {
        console.log(msg);
        Chats.send($scope.displayName, msg);
        $scope.IM.textMessage = "";
    }

    $scope.remove = function (chat) {
        Chats.remove(chat);
    }
})


.controller('DisplayCtrl',function($scope,$firebase,$ionicModal, $ionicLoading, $firebaseAuth, $state){
  console.log("Display Controller initialized");
  var ref = new Firebase($scope.firebaseUrl);
  var auth = $firebaseAuth(ref);
  var authData= ref.getAuth();
  $scope.addPost = function (user) {
        console.log("Post function called");
        if (user && user.newPost) {
          
            $ionicLoading.show({
                template: 'Adding post...'
            });
                if (user.newPost!= "") {
                ref.child("users").child(authData.uid).update({
                    post : user.newPost
                });
                $ionicLoading.hide();
                $scope.modal.hide();
                
        } else {


        }
      } else {
            alert("Please fill all details");       
    }
  }
  


  $ionicModal.fromTemplateUrl('templates/addPost.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

  var post=$firebase(ref.child('users')).$asArray();
  $scope.post=post;
  $scope.whichPost=$state.params.aId;
  console.log(post);
  $scope.toggleStar=function(name){
    name.star=!name.star;
  }



})

.controller('ProfileCtrl',function($scope,$firebase, $firebaseAuth,$state,$stateParams){
  console.log("Profile Controller initialized");
  $state.transitionTo($state.current, $stateParams, {
    reload: true,
    inherit: false,
    notify: true
});
  var ref = new Firebase($scope.firebaseUrl);
  var auth = $firebaseAuth(ref);
  var authData= ref.getAuth();
  /*
  ref.startAt(authData.uid);
  ref.endAt(authData.uid);
  console.log(authData.uid);
  ref.once('value',function(snapshot){
    $scope.userData=snapshot.val();
  }) */

  ref.child("users").orderByKey().startAt(authData.uid).limitToFirst(1).once("value",
function(snapshot) {
   var profile = snapshot.val();
   console.log(profile);
   $scope.userData=profile;
});

  //var profile=$firebase(ref.child(authData.uid).child("users")).$asArray();
  

  
});
