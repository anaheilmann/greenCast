const UserModel = require('../models/user.js');


function findOne(username, cb) {
  UserModel.findOne({username: username}, cb);
}

function addOne(user, cb) {
  UserModel.create(user, cb);
}

function removeOne(username, cb) {
  UserModel.findOneAndRemove({username: username}, cb);
}

function addSubscription(username, subscription, podcast, cb) {
  UserModel.findOne({username: username}, (err, user) => {
    if (err) {
      cb(err, null);
    } else if (!user) {
      cb(new Error(`username ${username} not found`), null);
    } else {
      // Checks to see if subscription already is in array
      if (user.subscriptions.includes(subscription)) {
        cb(new Error(`subscription ${subscription} already exists in array`), null);
      } else {
        user.subscriptions.push(subscription);
        user.markModified('subscriptions');
        user.save((err) => cb(err, user));
      }
    }
  });
}

function removeSubscription(username, subscription, cb) {
  UserModel.findOne({username: username}, (err, user) => {
    if (err) {
      cb(err, null);
      return;
    }
    if (!user) {
      cb(new Error(`username ${username} not found`), null);
      return;
    }

    const subscriptions = user.subscriptions;
    const index = subscriptions.indexOf(subscription);
    if (index < 0) {
      cb(new Error(`subscription ${subscription} not found in ${username}'s subscriptions'`), null);
      return;
    }
    subscriptions.splice(index, 1);
    user.markModified('subscriptions');
    user.save((err) => cb(err, user));
  });
}

function addToQueue(username, episode, cb) {
  UserModel.findOne({username: username}, (err, user) => {
    if (err) {
      cb(err, null);
    } else if (!user) {
      cb(new Error(`username ${username} not found`), null);
    } else {
      // Checks to see if subscription already is in array
      if (user.queue.includes(episode)) {
        cb(new Error(`episode ${episode} already exists in array`), null);
      } else {
        user.queue.push(episode);
        user.markModified('queue');
        user.save((err) => cb(err, user));
      }
    }
  });
}

function removeFromQueue(username, episodeId, cb) {
  UserModel.findOne({username: username}, (err, user) => {
    if (err) {
      cb(err, null);
      return;
    }
    if (!user) {
      cb(new Error(`username ${username} not found`), null);
      return;
    }
    const queue = user.queue;
    const index = queue.indexOf(episodeId);
    if (index < 0) {
      cb(new Error(`episode ${episdode} not found in ${username}'s queue'`), null);
      return;
    }
    queue.splice(index, 1);
    user.markModified('queue');
    user.save((err) => cb(err, user));
  });
}


module.exports = {
  findOne: findOne,
  addOne: addOne,
  removeOne: removeOne,
  addSubscription: addSubscription,
  removeSubscription: removeSubscription,
  addToQueue: addToQueue,
  removeFromQueue: removeFromQueue

};
