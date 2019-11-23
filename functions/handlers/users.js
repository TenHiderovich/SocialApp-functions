const {
  db,
  admin
} = require('../util/admin');
const {
  firebase,
  config
} = require('../util/firebase');
const {
  validateSingUpData,
  validateLoginData,
  reduceUserDetails
} = require('../util/validators');


// Sing users up
exports.singUp = (req, res) => {
  const {
    email,
    password,
    confirmPassword,
    handle
  } = req.body;
  const newUser = {
    email,
    password,
    confirmPassword,
    handle
  };

  const {
    errors,
    valid
  } = validateSingUpData(newUser);

  if (!valid) {
    return res.status(400).json(errors);
  }

  const noImg = 'user.png';

  // TODO: validate data
  let token, userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({
          handle: 'this handle already taken'
        });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;

      const {
        handle,
        email
      } = newUser;

      const userCredentials = {
        handle,
        email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId
      };

      return db.doc(`/users/${handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({
        token
      });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({
          email: 'email is already is use'
        });
      } else {
        return res.status(500).json({
          general: 'Something went wrong, please try again' 
        });
      }
    });
};

// Login
exports.login = (req, res) => {

  const {
    email,
    password
  } = req.body;

  const user = {
    email,
    password,
  };

  const {
    errors,
    valid
  } = validateLoginData(user);

  if (!valid) {
    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({
        token
      });
    })
    .catch(err => {
      console.error(err);
      // auth/wrong-password
      // auth/auer-not-user
      return res.status(403).json({
        general: 'Wrong credentials, please try again'
      })
    })
};

// Add user details
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({
        message: 'Details added successfully'
      })
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code
      });
    });
};

// Get any user's details
exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection('screams')
          .where('userHandle', '==', req.params.handle)
          .orderBy('createdAt', 'desc')
          .get()
      } else {
        return res.status(400).json({
          error: 'User not found'
        });
      }
    })
    .then(data => {
      userData.screams = [];
      data.forEach(doc => {
        
        const {
          body,
          userHandle,
          createdAt,
          userImage,
          likeCount,
          commentCount
        } = doc.data();

        userData.screams.push({
          body,
          userHandle,
          createdAt,
          userImage,
          likeCount,
          commentCount,
          screamId: doc.id
        });
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code
      });
    });
};

// Get own user details
exports.getAutenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection('likes')
          .where('userHandle', '==', req.user.handle)
          .get();
      }
    })
    .then(data => {
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return db
        .collection('notifications')
        .where('recipient', '==', req.user.handle)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    })
    .then(data => {
      userData.notifications = [];
      data.forEach(doc => {

        const {
          recipient,
          sender,
          createdAt,
          screamId,
          type,
          read
        } = doc.data();

        userData.notifications.push({
          recipient,
          sender,
          createdAt,
          screamId,
          type,
          read,
          notificationId: doc.id
        });
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code
      });
    });
}

// Upload a profile image for user
exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({
    headers: req.headers
  });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jepg' && mimetype !== 'image/png') {
      return res.status(400).json({
        error: 'Wrong file type submitted'
      });
    }
    // my.image.png
    const fileNameArray = filename.split('.');
    const imageExtension = fileNameArray[fileNameArray.length - 1];
    // 23452354235423.png
    imageFileName = `${Math.round(Math.random() * 10000000000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = {
      filepath,
      mimetype
    };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    admin.storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({
          imageUrl
        });
      })
      .then(() => {
        return res.json({
          message: 'Image upload successfully'
        });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({
          errors: err.code
        });
      });
  });

  busboy.end(req.rawBody);
};

exports.markNotificationsRead = (req, res) => {
  let batch = db.batch();
  req.body.forEach(notificationId => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, {
      read: true
    });
  });
  batch.commit()
    .then(() => {
      return res.json({
        message: 'Notification marked read'
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        errors: err.code
      });
    });
};