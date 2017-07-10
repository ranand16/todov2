import _ from 'lodash';
import angular from 'angular';
//import authTokenFactory from './authToken-factory';

const userFactory = angular.module('app.userFactory',[])
.factory('userFactory',($http,$q,AuthToken)=>{
  function getUsers($scope){
    $http.get('/api/users').then((response) => {
      $scope.users = response.users;
    });
  }
  function createUser($scope){
    $http.post('/api/signup',{
    name: $scope.name,
    username: $scope.username,
    password: $scope.password,
    data:[]
    }).then((response) => {
      $scope.registered = response.successMessage;
      $scope.notRegistered = response.failureMessage;
      $scope.name = '';
      $scope.username = '';
      $scope.password = '';
    });
   }
   function userLogin($scope,$location){
    $http.post('/api/login',{
      username:$scope.susername,
      password:$scope.spassword
    }).then((response) => {
      console.log(response);
      // console.log(response.data.token);
      $scope.token = response.data.token;
      $scope.success = response.data.success;
      AuthToken.setToken($scope.token);//as soon as its logged in ... set the token you got via response
      //console.log(AuthToken.getToken());
      //console.log(response);
      $scope.user = response.data;
      $location.path('/todoss');
    });
   }
   function getTasks($scope){
     $http.get('/api',{
       headers : { token : AuthToken.getToken() }
     }).then((response) => {
      //  console.log(response.data.todos);
       $scope.todos = response.data.todos;
       //console.log("o/p");
       //console.log($scope.todos);
     });
   }
   function createTask($scope, params){
   //  if(!$scope.createTaskInput) { return; }
     $http.put('/api',{
       task: $scope.createTaskInput,
       isCompleted: false,
       isEditing: false},
       {
         headers : { token : AuthToken.getToken() }
       }).then((response)=>{
       getTasks($scope);
       $scope.createTaskInput = '';
     });
     //params.createHasInput = false;
     //$scope.createTaskInput = '';
   }
   function watchCreateTaskInput(params,$scope,val){
     const createHasInput = params.createHasInput;
     if(!val && createHasInput){
       $scope.todos.pop();
       params.createHasInput = false;
     }else if(val && !createHasInput){
       $scope.todos.push({task:val, isCompleted:false});
       params.createHasInput = true;
     }else if (val && createHasInput) {
       $scope.todos[$scope.todos.length - 1].task = val;
     }
   }
   function updateTask($scope, todo){
     console.log(todo.updatedTask);
     $http.get('/api/me',{
       headers : { token : AuthToken.getToken() }
     }).then((response) => {
       $scope.resp = response.data.resp;
       console.log($scope.resp);
       var uid = $scope.resp._id;
       //console.log($scope.uid);
       $http.put(`/api/${uid}/${todo._id}`,
         {task:todo.updatedTask},
         {
         headers : { token : AuthToken.getToken() }
         }).then((response) => {
           getTasks($scope);
           todo.isEditing = false;
       });
     });
   }
   function deleteTask($scope, todoToDelete){
     console.log(todoToDelete);
     $http.put(`/api/${todoToDelete._id}`,
       {},
       {
       headers : { token : AuthToken.getToken() }
     }).then((response) => {
         getTasks($scope);
       });
   }
   function logout(){
      AuthToken.setToken();
   }
   function isLoggedIn(){
    if(AuthToken.getToken())
      return true;
    else
      return false;
   }
   function getUser(){
    if(AuthToken.getToken())
      return $http.get('/api/me'); //refer routes/user.js line 128
    else
      return $q.reject({message:"Error in getting Token"}) ;
    }
   return {
    getUsers,
    userLogin,
    createUser,
    logout,
    isLoggedIn,
    getUser,

    getTasks,
    watchCreateTaskInput,
    createTask,
    deleteTask,
    updateTask
  };
})


.factory('AuthToken',($window) => {
  function getToken(){
    //console.log($window.localStorage.getItem('token'));
    return $window.localStorage.getItem('token');
  }

  function setToken(token){
    if(token)
      $window.localStorage.setItem('token',token);
    else
      $window.localStorage.removeItem('token');
  }
  return {
    getToken,
    setToken
  };
})

export default userFactory;
