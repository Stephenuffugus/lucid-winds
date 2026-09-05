# SteamPipe for Flock the World

Two placeholders, `FTW_APPID` and `FTW_DEPOTID` (depot = appid + 1 by Steamworks convention; read
the app's Depots page to be sure). Fill them the day Stephen creates the app:

    sed -i "s/FTW_APPID/<appid>/; s/FTW_DEPOTID/<depotid>/" steampipe/*.vdf

The codespace cannot log in to Steam (datacenter IP, permanent), so the build goes up the same
way Jimothy's did: `npm run dist:win` here, zip the `dist/win-unpacked` folder contents with the
exe at the zip root, park it in the vault, and Stephen uploads the zip at
partner.steamgames.com/apps/depotuploads/<appid>. The vdfs are for the day a machine with Steam
runs steamcmd, and for the record of what the depot contains.
