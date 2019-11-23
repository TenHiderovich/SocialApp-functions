const firebase = require('firebase');

const config =  {
  apiKey: "AIzaSyB96kUoCb_ZizoQZt5ifPoveCIeczodB8A",
  authDomain: "socialape-b97d9.firebaseapp.com",
  databaseURL: "https://socialape-b97d9.firebaseio.com",
  projectId: "socialape-b97d9",
  storageBucket: "socialape-b97d9.appspot.com",
  messagingSenderId: "168502712281",
  appId: "1:168502712281:web:27d1bd57c043365b"
};

exports.firebase = firebase.initializeApp(config);
exports.config = config;