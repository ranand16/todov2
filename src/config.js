import angular from 'angular';
import uiRouter from 'angular-ui-router';
//import ngRoute from 'angular-route';

import userFactory from 'factories/user-factory';
//
import userController from 'user/user';
//
// const app = angular.module('app',[ngRoute,uiRouter,todoFactory.name,userFactory.name]);
   const app = angular.module('app',[uiRouter,userFactory.name]);
app.config(($stateProvider,$urlRouterProvider,$locationProvider) => {
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('todoss',{
      url:'/todoss',
      template:require('user/todoss.html'),
      controller:userController
    })
    .state('about',{
      url:'/about',
      template:require('about/about.html')
    })
    .state('user',{
      url:'/',
      template:require('user/user.html'),
      controller:userController
    });
    $locationProvider.html5Mode(true);
});
export default app;
