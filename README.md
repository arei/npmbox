npmbox
-------

npm addon utility for creating and installing from an archive file of an npm install, including dependencies.  This lets you create a "box" of an installable package and move it to an offline system that will only install from that box.

npmbox is intended to be a proof of concept with regards to this issue filled against this npm feature request: [[Feature] Bundle/Include Dependencies](https://github.com/isaacs/npm/issues/4210).  Ideally, we would like to see the npmbox functionality built into npm so a third party tool like npmbox is not required or necessary. Please go add your support over at that ticket to help get us some visibility... or, even better, go write the code!

## Usage of `npmbox`

Given some package, like `express` this command will create a archive file of that package and all of its dependencies, such that a npmunbox of that archive file will install express and all of its dependencies. 

Usage:

	npmbox --help
	npmbox <package>
	npmbox <package> <package> ...

You must specify at least one package. 

You can specify more than one package and a separate archive will be created for each specified.

npmbox files end with the .npmbox extension.

## Usage of `npmunbox`

Given some .npmbox file (must end with the .npmbox extension), installs the contents and all of it dependencies.

Usage:

	npmunbox --help
	npmunbox <npmbox-file>
	npmunbox <npmbox-file> <npmbox-file> ...

You must specify at least one file.

You may specify more than one file, and each will be installed.

## Using `npmunbox` without npmbox being installed

A particular use case with npmunbox comes up fairly often: **how do I use npmbox without first installing npmbox**.  Specifically, many people have asked for a way to run npmunbox as a means to installing npmbox.  You can see that this is a bit of a chicken and egg problem.  How do we install npmbox from an npmbox file?

### Installing npmbox from an .npmbox file

These instructions assume that you have already created a .npmbox file on npmbox using `npmbox npmbbox`

On the system you want to install npmbox to, do the following:

1). Create a new directory

	mkdir somedir
	
2). Change to it: 

	cd somedir

3). Untar the .npmbox file.  This will create the .npmbox-cache folder.
 
	tar -xvf npmbox.npmbox

4). Install npmbox globally using the following command:

	npm install --global --cache ./.npmbox-cache --optional --no-registr --fetch-retries 0 --fetch-retry-factor 0 --fetch-retry-mintimeout 1 --fetch-retry-maxtimeout 2 npmbox

Once npmbox is installed globally you can use it to install other .npmbox files: `npmunbox blah`

## TO DO

- Verify working .bin files on linux
- Verify versions work when specifying package.
- Add --global switch for npmunbox.  In fact, pass all -- switches through to the underlying npm command.
- Right now specifying multiple packages creates multiple .npmbox files.  Make it create just one .npmbox file by default.  Maybe allow a switch (-multi) to make it generate multiple.
