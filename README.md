npmbox
-------

UPDATE March 10, 2015: v2.3.0 of npmbox is now available with a bug fix for permission problems across multiple operating systems.

-------

[![Build Status](https://travis-ci.org/arei/npmbox.svg)](https://travis-ci.org/arei/npmbox)

[![NPM](https://nodei.co/npm/npmbox.png)](https://nodei.co/npm/npmbox/)

-------

npm addon utility for creating and installing from an archive file of an npm install, including dependencies.  This lets you create a "box" of an installable package and move it to an offline system that will only install from that box.

npmbox is intended to be a proof of concept with regards to this issue filled against this npm feature request: [[Feature] Bundle/Include Dependencies](https://github.com/isaacs/npm/issues/4210).  Ideally, we would like to see the npmbox functionality built into npm so a third party tool like npmbox is not required or necessary. Please go add your support over at that ticket to help get us some visibility... or, even better, go write the code!

## Usage of `npmbox`

Given some package, like `express` this command will create a archive file of that package and all of its dependencies, such that a npmunbox of that archive file will install express and all of its dependencies.

	npmbox - Create an archive for offline installation of the given package.

	Usage:

  		npmbox --help
  		npmbox [options] <package> <package>...

	Options:

		-v, -verbose         Shows npm output which is normally hidden.
		-s, -silent          Shows no output whatsoever.
		-p, -path			 Specify the path to a folder where the .npmbox file(s) will be written.

You must specify at least one package.

You can specify more than one package and a separate archive will be created for each specified.

npmbox files end with the .npmbox extension.

NOTE: When creating an archive file for a package destined to be installed on an offline machine clear your npm cache before using npmbox

    npm cache clean

## Usage of `npmunbox`

Given some .npmbox file (must end with the .npmbox extension), installs the contents and all of it dependencies.

	npmunbox - Extracts a .npmbox file and installs the contained package.

	Usage:

		npmunbox --help
		npmunbox [options] <nmpbox-file> <npmbox-file>...

	Options:

		-v, -verbose         Shows npm output which is normally hidden.
		-s, -silent          Shows additional output which is normally hidden.
		-p, path			 Specify the path to a folder from which the .npmbox file(s) will be read.
		-g, -global          Installs package globally as if --global was passed to npm.
		-C, -prefix          npm --prefix switch.
		-S, -save            npm --save switch.
		-D, -save-dev        npm --save-dev switch.
		-O, -save-optional   npm --save-optional switch.
		-B, -save-bundle     npm --save-bundle switch.
		-E, -save-exact      npm --save-exact switch.


You must specify at least one file.

You may specify more than one file, and each will be installed.

## Using `npmunbox` without npmbox being installed

A particular use case with npmunbox comes up fairly often: **how do I use npmbox without first installing npmbox**.  Specifically, many people have asked for a way to run npmunbox as a means to installing npmbox.  You can see that this is a bit of a chicken and egg problem.  How do we install npmbox from an npmbox file?

### Installing npmbox from an .npmbox file

**On a system that does have access to the Internet, you need to do the following:**

1). If npmbox is not globally installed on your online system, do so now:

	npm install -g npmbox

2). In a folder in which you can read/write:

	npmbox npmbox

3). Copy the resulting `npmbox.npmbox` file to you offline system in whatever manner allowed to you,  This could involve coping to movable media and transfering that way, however you would do it.

**On the system you want to install npmbox to, do the following:**

1). Create a new directory

	mkdir somedir

2). Change to it:

	cd somedir

3). Copy the npmbox.npmbox folder into this directory.

	cp /media/usb/npmbox.npmbox .

or

	copy E:\npmbox.npmbox .

4). Untar the .npmbox file.  This will create the .npmbox.cache folder.

	tar --no-same-owner --no-same-permissions -xvzf npmbox.npmbox

NOTE: If for some reason ```--no-same-owner``` or ```--no-same-permissions``` do not work, remove them and adjust the permissions/ownership yourself.  You will need to ensure that npm can see all the files in the .npmbox.cache file structure.

NOTE: On some OSes it may also be necessary to drop the ```-z``` switch from the tar command as well.

NOTE: On windows you might not have the tar command.  You can use another zip utility (like 7-zip or winzip) to extract the file if you like.  Just please note that the file is a .tar.gz file and thus you may need to extract it twice, once for the zip, the second for the tar.  **If you do this, please make sure to remove the tar file from your local directory before running the npm command below.**

5). Install npmbox globally using the following command.

For unix or max...

	npm install --global --cache ./.npmbox.cache --optional --cache-min 99999 --shrinkwrap false npmbox

For windows...

	npm install --global --cache .\.npmbox.cache --optional --cache-min 99999 --shrinkwrap false npmbox

NOTE: If you have a file called ```npmbox``` (no extension) in the local directory, this will not work correctly.  Please remove said ```npmbox``` file.

6). Once npmbox is installed globally you can use it to install other .npmbox files:

	npmunbox blah

NOTE: If you are running into issues where npmunbox is still trying to reach out to the internet it may help to try clearing your npm cache on the machine

    npm cache clean

## TO DO

- Right now specifying multiple packages creates multiple .npmbox files.  Make it create just one .npmbox file by default.  Maybe allow a switch (-multi) to make it generate multiple.
