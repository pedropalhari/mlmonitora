const notifier = require('node-notifier');
 
// Object 
notifier.notify({
  title: 'My notification',
  message: 'Hello, there!',
  sound: false
});