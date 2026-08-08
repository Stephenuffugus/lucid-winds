/* Party cloud room config. Shell owned.

   This is the SAME Firebase project Lucid Winds already uses, and these values
   are the public web config, which is public by design: access is controlled by
   the Realtime Database rules and by anonymous auth, never by hiding this file.

   ⚖ databaseURL is the DEFAULT instance name for a us-central1 database on this
   project. It is the shape the Firebase console produces, but it has not been
   confirmed against a real database because the database does not exist yet.
   PARTY_CLOUD_SETUP.md step 1 asks Stephen to copy the URL the console shows.
   If it differs, this one line is the only thing that changes.

   ⛔ Cloud rooms stay OFF until the console work in PARTY_CLOUD_SETUP.md is
   done. Nothing here turns them on by itself: the transport only reaches for
   the cloud when a page asks for it, and it fails loudly with a pointer to that
   document rather than half working. */
window.PARTY_FIREBASE = {
  apiKey:            'AIzaSyBAE_JvPixhHwt4ziu8LdZ7HAszd9T58zY',
  authDomain:        'focus-grove-fffa8.firebaseapp.com',
  databaseURL:       'https://focus-grove-fffa8-default-rtdb.firebaseio.com',
  projectId:         'focus-grove-fffa8',
  storageBucket:     'focus-grove-fffa8.firebasestorage.app',
  messagingSenderId: '739627513827',
  appId:             '1:739627513827:web:3d4088a90fd388730652d6'
};

/* The compat SDK, same version Lucid Winds pins. Loaded only when a page has
   actually asked for a cloud room, so a practice night makes no network calls
   at all and the pages stay usable with no connection. */
window.PARTY_FIREBASE_SDK = [
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
  /* functions too: each phone claims its own sunbeams through partyComplete */
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-functions-compat.js'
];
