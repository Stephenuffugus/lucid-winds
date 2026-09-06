# Flock the World, the Android bundle (Trusted Web Activity)

The app IS the live URL https://lucidwinds.com/satellites/flock-the-world/ . The bundle is a
thin Android shell that opens it full screen, offline through the game's own service worker.
`twa/twa-manifest.json` is the whole description; Bubblewrap turns it into an Android project.

## Toolchain (lives in /tmp on the codespace; /workspaces is nearly full)

```
/tmp/bw/node_modules/.bin/bubblewrap     npm i @bubblewrap/cli   (in /tmp/bw)
/tmp/bw/jdk                              Temurin JDK 17 (Bubblewrap wants 17, the box has 25)
/tmp/bw/sdk                              Android cmdline-tools + platform-tools + build-tools;36.1.0 + platforms;android-36 (Bubblewrap 1.24 pins 36.1.0), plus a `bin` symlink to cmdline-tools/latest/bin because Bubblewrap validates the SDK by looking for `tools/` or `bin/`
~/.bubblewrap/config.json                {"jdkPath":"/tmp/bw/jdk","androidSdkPath":"/tmp/bw/sdk"}
```
Recreate after a codespace rebuild: `bash store/ftw-play/twa/setup-toolchain.sh` (below).

## Build

Bubblewrap prompts through inquirer and crashes without a TTY (`ERR_USE_AFTER_CLOSE`), so
`~/.bubblewrap/config.json` is written by hand and every command gets `printf '\n\n\n' |` on stdin.

```
cd store/ftw-play/twa
# a THROWAWAY key so the project builds and an APK can be sideloaded for testing.
# It is gitignored. It is NOT the key that signs the store upload.
[ -f DEBUG-NOT-FOR-STORE.keystore ] || /tmp/bw/jdk/bin/keytool -genkeypair -v -keystore DEBUG-NOT-FOR-STORE.keystore \
   -alias debug -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android \
   -dname "CN=Debug, O=Sky Wolf Studio, C=US"
/tmp/bw/node_modules/.bin/bubblewrap update --skipVersionUpgrade      # regenerates the Android project from twa-manifest.json
BUBBLEWRAP_KEYSTORE_PASSWORD=android BUBBLEWRAP_KEY_PASSWORD=android \
/tmp/bw/node_modules/.bin/bubblewrap build --skipPwaValidation        # app-release-signed.apk + app-release-bundle.aab
```
Outputs: `app-release-bundle.aab` (what Play takes), `app-release-signed.apk` (sideload to test).

## Signing for the store (DONE Sep 06 by Fable, option 2)

The upload keystore is `~/.ftw-keys/flock-upload.keystore` on the codespace (alias `upload`, never
in a repo) and in the private vault release `vault-20260906-ftw-upload` with its password in the
README there. The bundle `flock-the-world-1.0-upload-signed.aab` in that release is
`twa/app-release-bundle.aab` with its debug signature stripped and re signed with that key
(jarsigner, SHA256withRSA, verified). To sign a new bundle: strip `META-INF/*.SF`, `*.RSA` and
`MANIFEST.MF`, then `jarsigner -keystore ~/.ftw-keys/flock-upload.keystore -sigalg SHA256withRSA
-digestalg SHA-256 -signedjar out.aab in.aab upload`. The old text follows for the record.

## Signing for the store (the original note, STEPHEN on his own machine, superseded)

Play App Signing: Google keeps the app signing key, you keep an **upload key**. Generate it once,
back it up off the codespace:
```
keytool -genkeypair -v -keystore flock-upload.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
```
Then EITHER sign the bundle yourself (`jarsigner`/`apksigner` with that key) OR point
`twa-manifest.json` → `signingKey` at that keystore and run the build on a machine that has it.
After the first upload, copy the **App signing key certificate SHA-256** from Play Console →
Release → Setup → App signing into `/.well-known/assetlinks.json` and deploy. That is what
removes the URL bar.

## Permissions

Bubblewrap's template requests none beyond what a TWA needs (no location, no camera, no
storage). Check `app/src/main/AndroidManifest.xml` after `update`; anything besides
`INTERNET` and the TWA service bindings comes out.

## Gates

`node scripts/twa_ready.mjs flock-the-world`: ten static and offline checks plus the live
assetlinks check (JSON, no redirect, real fingerprint). `node scripts/_twa_manifest_check.mjs
satellites/flock-the-world` for the web manifest alone.
