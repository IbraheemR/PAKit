# pup.js mini-documentation

## Constant: `PACK` = `'pack'`  
To be used as an argument to functions

## Constant: `UNPACK` = `'unpack'`  
To be used as `mode` argument to functions

## savePath(mode, [p])
- `mode <String>` const `PACK` or const `UNPACK`  
- `p <String>`
- returns `<Object>`:
  - `path <String>`: saved path  
  - `status <Number>`:
    - `3`: path set and stored sucessfully  
    - `2`: path invalid, using default
    - `1`: no path given/configured, using default
    - `0`: cannot find default!

Given mode and an optional path p (else attempt to load from disk), verify the path and store to disk if the path is valid.



## resetPath(mode)
- `mode` `<String>`: const `PACK` or const `UNPACK`  
- returns `<Object>` (see `savePath`)  

Wrapper for `savePath(mode, {default path})`



## paths
- `<object>`
  - `pack <String>`: the path at which the `asset_packer` executable can be located  
  - `unpack <String>`: the path at which the `asset_unpacker` executable can be located

## status
- `<object>`
  - `pack <Number>`: the status of locating the `asset_packer` executable  
  - `unpack <Number>`: the status of locating the `asset_unpacker` executable

    - `3`: path set and stored sucessfully
    - `2`: path invalid, using default
    - `1`: no path given/configured, using default
    - `0`: cannot find default!


## doPUP(mode, pathIn, pathOut, outputCallback)
- `mode <String>`: const `PACK` or const `UNPACK`  
- `pathIn <String>`: the path to the file or folder being input  
- `pathOut <String>`: the path to the file or folder being output

Wrapper for `child_process.spawn()`, feeding command line args etc.

returns `<ChildProcess>`