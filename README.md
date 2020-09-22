# scproxy

This tool provides a way to show the original UI for the Social Club login, and proxy requests to the right endpoints in the UI.

## Requirements
1. go 1.15
2. modifications to your hosts file:
```
127.0.0.1 prod.ros.rockstargames.com
127.0.0.1 prod.cloud.rockstargames.com
```
3. Replacing your Social Club 'libcef.dll' with 'libcef.dll' in this folder. It has a patch that allows unsafe certificates, without tripping Social Club or GTA5 integrity checks (hint: they dont check DLL mods).

## Starting this stuff
In this folder, run `go run .`. You can then go to https://prod.ros.rockstargames.com/scui/v2/desktop and you should NOT see the "Download Rockstar Launcher" page.

When this works, you can launch PlayGTAV.exe and see the login screen. The console output will show 404's for the API calls, which we are investigating...

## File info
- Renderer folder is from an old install of mine, which has the UI (that I exported to desktop.html). Check with ChromeCacheView.
- UI folder is literally taken from the Social Club install. Seems to be compatible


## RE info
- PlayGTAV.exe+0x32AF00 == File signing certificate public key

## TODO
- Figure out why API calls 404
- Try sending an outdated login response like FiveM does [here](https://github.com/citizenfx/fivem/blob/2e43e64b3a69e8778e45cf7db67f0703eee29c6f/code/components/ros-patches-five/src/LegitimacyNui.cpp#L353) (you could in theory just change desktop.html and see if it works)