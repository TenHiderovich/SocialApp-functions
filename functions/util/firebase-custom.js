const firebase = require('firebase');

const config =  {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

exports.firebase = firebase.initializeApp(config);
exports.config = config;