npmbox
-------

UPDATE September 19,2014: Just two quick notes... 1). Got a awesome patch today from @jamiemcconnell that fixes
the --no-registry error. Everyone should update to v1.0.0 as soon as possible. He also updated the docs section about
running npmbox without npmbox installed below. A massive fix from an awesome dude.  Jamie, the beer is on me should
either of us transcend the pond at some point. 2). npm 2.0.0 shipped
today and I look forward to taking a look at integrating npmbox over to using npm 2.0.0.  That said, npmbox will only
work using npm 1.x.x for the time being.

[![Build Status](https://travis-ci.org/arei/npmbox.svg)](https://travis-ci.org/arei/npmbox)

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

You must specify at least one package.

You can specify more than one package and a separate archive will be created for each specified.

npmbox files end with the .npmbox extension.

## Usage of `npmunbox`

Given some .npmbox file (must end with the .npmbox extension), installs the contents and all of it dependencies.

	npmunbox - Extracts a .npmbox file and installs the contained package.

	Usage:

		npmunbox --help
		npmunbox [options] <nmpbox-file> <npmbox-file>...

	Options:

		-v, -verbose         Shows npm output which is normally hidden.
		-g, -global          Installs package globally as if --global was passed to npm.

You must specify at least one file.

You may specify more than one file, and each will be installed.

## Using `npmunbox` without npmbox being installed

A particular use case with npmunbox comes up fairly often: **how do I use npmbox without first installing npmbox**.  Specifically, many people have asked for a way to run npmunbox as a means to installing npmbox.  You can see that this is a bit of a chicken and egg problem.  How do we install npmbox from an npmbox file?

### Installing npmbox from an .npmbox file

These instructions assume that you have already created a .npmbox file on npmbox using `npmbox npmbbox`

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

4). Untar the .npmbox file.  This will create the .npmbox-cache folder.

	tar -xvfo npmbox.npmbox

5). Install npmbox globally using the following command.  **Note this command may require root access/sudo in order to correctly install.**

	npm install --global --cache ./.npmbox-cache --optional --cache-min 999999 --fetch-retries 0 --fetch-retry-factor 0 --fetch-retry-mintimeout 1 --fetch-retry-maxtimeout 2 npmbox

Once npmbox is installed globally you can use it to install other .npmbox files:

	npmunbox blah

## TO DO

- Right now specifying multiple packages creates multiple .npmbox files.  Make it create just one .npmbox file by default.  Maybe allow a switch (-multi) to make it generate multiple.
