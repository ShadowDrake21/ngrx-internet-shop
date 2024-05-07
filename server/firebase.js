const { initializeApp } = require("firebase/app");
const { default: config } = require("./config");

const firebase = initializeApp(config.firebaseConfig);

export default firebase;
