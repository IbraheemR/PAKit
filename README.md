# PAKit
A tool to pack and unpack Starbound's .pak file format

It works by locating the asset_packer and asset_unpacker executables in your game files (or you can manually select them if they are not found).

Inspired by [resin.io](https://github.com/resin-io)'s Etcher SD Card imager tool.

Probably terribly written, but it works (I hope).

Any spare [Garlic](https://garlicoin.io/) would be appreciated! GacWBGqzawm61FZdbTu2EbSSMKRC8i6QnZ

# Locating your executables
If PAKit fails to find the `asset_packer` and `asset_unpacker` executables in the default Steam path,you will have to locate them manually in order to use PAKit

### First, locate your game files
Open up your Steam library, right click Starbound and select 'Properties'. Go to the 'LOCAL FILES' tab, and press 'BROWSE LOCAL FILES...'

### Then open your executables folder, the files should be there
Windows: `win32` / `win64`

Mac: `osx`

Linux: `linux32` / `linux64`

### Copy the path to these files, and paste it into PAKit when you try to locate your executables and then select the executables