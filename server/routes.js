const User = require('./db/controllers/user.js');
const Episode = require('./db/controllers/episode.js');
const Podcast = require('./db/controllers/podcast.js');
const db = require('./db/config.js');
const Promise = require('bluebird');
const request = require('request');
const path = require('path');
const podcastData = require('./requestPodcastData.js');

const root = (req, res) => {
  const index = path.join(__dirname, '../public/index.pug');
  console.log(req.user, req.isAuthenticated());
  res.status(200).render(index, {username: req.user});
};

// routes for subscriptions
const getSubscriptions = (req, res) => {
  // returns a user's subscriptions
  var username = req.user.username;
  User.findOne(username, function(err, user) {
    if (err) {
      console.log('The find User error is: ', err);
    }
    res.json(user.subscriptions);
  });
};

const addSubscription = (req, res) => {
  // adds a channel to a user's subscriptions
  var username = req.user.username;
  var subscription = req.body.collectionId;
  let podcast = req.body;
  User.addSubscription(username, subscription, podcast, function(err, user) {
    if (err) {
      console.log('The add Subscription error is: ', err);
    }
    let newPodcast = {
      id: subscription,
      title: podcast.collectionName,
      img: podcast.img,
      recommended: false,
      comment: ''
    };
    Podcast.addOne(newPodcast, function(err, npc) {
      if (err) {
        console.log('The add Podcast error is', err);
      }
    res.sendStatus(201).end();
    })
  });
};

const removeSubscription = (req, res) => {
  // adds a channel to a user's subscriptions
  var username = req.user.username;
  var subscription = req.body.channel;
  User.removeSubscription(username, subscription, function(err, user) {
    if (err) {
      console.log('The remove Subscription error is: ', err);
    }
    res.end();
  });
};


// routes for channel data
const getEpisodes = (req, res) => {
  // grabs rss data, scrapes it, and returns array of episodes
  const channel = req.params.channelId;
  const episodes = podcastData.feedGenerator(channel, function(err, result) {
    if (err) {
      res.sendStatus(400).end();
      console.log('nothing is being sent');
    }
    res.status(200).json(result);
  });
};

const login = (accessToken, refreshToken, profile, done) => {
  const username = profile.username;
  User.findOne(username, (err, user) => {
    if (err) {
      return done(err, null);
    }
    if (!user) {
      const userToSave = {
        username: username,
        subscriptions: []
      };

      User.addOne(userToSave, (err, user) => {
        if (err) {
          console.log('nothing found');
          return done(err, null);
        }
        if (user) {
          console.log(username, 'saved');
        }
      });
    }
  });

  done(null, profile);
};

const logout = (req, res) => {
  req.session.passport = null;
  res.redirect('/');
};

const topPodcasts = (req, res) => {
  podcastData.getTopPodcasts((podcasts) => res.json(podcasts));
};

const addToQueue = (req, res) => {
  const username = req.user.username;
  const episode = req.body.episode;

  //first, check to see if episode already exists to avoid data duplication
  //(not currently doing this)...then...
  Episode.addOne(episode, (err, ep) => {
    if (err) { return res.send(err); }
    User.findOne(username, (err, user) => {
      user.queue.push(ep);
      user.save(function(err) {
        if (err) { return res.send(err); }
        res.sendStatus(201).end();
      });
    });
  });
};


const removeFromQueue = (req, res) => {
  console.log('removed from queue');
  const username = req.user.username;
  const episode = req.body.episode;
  const episodeId = episode._id;


  User.removeFromQueue(username, episodeId, function(err, user) {
    if (err) {
      console.log('The remove Subscription error is: ', err);
    }
    res.sendStatus(202).end();
  });

};

const getQueue = (req, res) => {
  console.log('get queue');
  const username = req.user.username;
  //find user
  User.findOne(username, (err, user) => {
    //from users queue, generate array of episode objects and send that back
    console.log(user);
    Episode.findAll(user.queue, (err, episodes) => {
      if (err) { return handleError(err); }
      res.status(200).json(episodes);
    });
    // user.populate('queue')
    // .exec((err, episodes) => {
    //   if (err) { return handleError(err); }
    //   res.status(200).json(episodes);
    // })
  });
};

// population
// exports.postComment = function(req,res) {
//   // XXX: this all assumes that `postId` is a valid id.
//   var comment = new Comment({
//     content : req.body.content,
//     post    : req.params.postId,
//     user    : req.user._id
//   });
//   comment.save(function(err, comment) {
//     if (err) return res.send(err);
//     Post.findById(req.params.postId, function(err, post) {
//       if (err) return res.send(err);
//       post.commentIds.push(comment);
//       post.save(function(err) {
//         if (err) return res.send(err);
//         res.json({ status : 'done' });
//       });
//     });
//   });
// };


module.exports = {
  root: root,
  getSubscriptions: getSubscriptions,
  addSubscription: addSubscription,
  removeSubscription: removeSubscription,
  getEpisodes: getEpisodes,
  login: login,
  logout: logout,
  topPodcasts: topPodcasts,
  addToQueue: addToQueue,
  removeFromQueue: removeFromQueue,
  getQueue: getQueue
};
