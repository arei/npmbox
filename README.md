npmbox
-------

UPDATE June 28, 2016: v3.0.0 of npmbox is now available with upgrades all around and a bunch of small fixes.  Also, support for npmbox from git repos, which may help with some offline installs.

Also worthy of note is that npm, inc. has begun thinking and working in how to do this within npm itself (and hopefully obsoletting this project entirely).  There's a good blog post over at npm, inc called "dealing with problematic dependencies in a restricted network environment" that details some of the problems: [Check it out here!](http://blog.npmjs.org/post/145724408060/dealing-with-problematic-dependencies-in-a)

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

		-v, --verbose         Shows npm output which is normally hidden.
		-s, --silent          Shows no output whatsoever.
		-p, --path            Specify the path to a folder where the .npmbox file(s) will be written.

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

		-v, --verbose         Shows npm output which is normally hidden.
		-s, --silent          Shows additional output which is normally hidden.
		-p, --path            Specify the path to a folder from which the .npmbox file(s) will be read.
		-g, --global          Installs package globally as if --global was passed to npm.
		-C, --prefix          npm --prefix switch.
		-S, --save            npm --save switch.
		-D, --save-dev        npm --save-dev switch.
		-O, --save-optional   npm --save-optional switch.
		-B, --save-bundle     npm --save-bundle switch.
		-E, --save-exact      npm --save-exact switch.


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

## Common Problems

Quick FAQ to hopefully answer some of the questions out there that seem to keep creeping up...

1). Help Please!

Sorry, I am only one person and I already have a full time job.  Using open source solutions come at the risk of almost no support. If after reading this entire faq you still think you have a bug, file a bug.  Or better yet, grab the source code, fix it, and submit a pull request.  I love pull requests.

2). npmunbox keep trying to connect to registry.npmjs.org on my offline system.

99% of the time this occurs is because the npmbox didn't get some resource that npmunbox is looking for and cannot find in the npmbox file. This happens.  There are TONS of edge cases that npmbox misses.  Two worth nothing:
  * Some packages reference git repos instead of npm packages.  This has been fixed as of version 3.0 of npmbox.  Very exciting.
  * Packages that execute external scripts that call out to git repos or npm are entirely outside of the controll of npmbox.  Not much we can do about that.

3). When I run the command described above to install npmbox on my offline machine I get an error.

This if frequently caused by incorrectly referencing where the ```.npmbox-cache``` file is.  Please check the section of the command ```---cache .\.npmbox-cache``` and make sure it is pointing at the correct location.

4). When is npm going to add this functionality?

npm, inc. is actively working on this problem as we speak.  Read this blog post for some of the challenges they are facing:  [Check it out here!](http://blog.npmjs.org/post/145724408060/dealing-with-problematic-dependencies-in-a)

## TO DO

- Right now specifying multiple packages creates multiple .npmbox files.  Make it create just one .npmbox file by default.  Maybe allow a switch (-multi) to make it generate multiple.
