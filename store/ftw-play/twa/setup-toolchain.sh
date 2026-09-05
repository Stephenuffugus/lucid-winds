#!/usr/bin/env bash
# Rebuilds the Android toolchain under /tmp/bw after a codespace rebuild. ~600 MB of downloads.
set -euo pipefail
mkdir -p /tmp/bw/jdk /tmp/bw/sdk/cmdline-tools && cd /tmp/bw
[ -d node_modules/@bubblewrap ] || { npm init -y >/dev/null; npm i --no-audit --no-fund @bubblewrap/cli; }
[ -x jdk/bin/java ] || { curl -sL -o jdk17.tar.gz "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse"; tar -xzf jdk17.tar.gz -C jdk --strip-components=1; }
[ -d sdk/cmdline-tools/latest ] || { curl -sL -o clt.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"; unzip -q -o clt.zip -d sdk/cmdline-tools; mv sdk/cmdline-tools/cmdline-tools sdk/cmdline-tools/latest; }
export JAVA_HOME=/tmp/bw/jdk PATH=/tmp/bw/jdk/bin:$PATH
yes | sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/tmp/bw/sdk --licenses >/dev/null 2>&1 || true
sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/tmp/bw/sdk "platform-tools" "build-tools;36.1.0" "platforms;android-36" | tail -1
# Bubblewrap validates the SDK by looking for <sdk>/tools or <sdk>/bin; the modern cmdline-tools layout has neither
ln -sfn /tmp/bw/sdk/cmdline-tools/latest/bin /tmp/bw/sdk/bin
mkdir -p ~/.bubblewrap && printf '{"jdkPath":"/tmp/bw/jdk","androidSdkPath":"/tmp/bw/sdk"}\n' > ~/.bubblewrap/config.json
node_modules/.bin/bubblewrap doctor
