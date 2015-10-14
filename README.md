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
		-s, -silent          Shows additional output which is normally hidden.
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

A particular use case with npmunbox comes up fairly often: **how do I use npmbox without first installing npmbox**.  Specifically, many people have asked for a way to run npmunbox as a means to installing npmbox.  You can see that this is a bit of a chicken and egg problem.

To solve this problem, you may pre-pack npmbox as an offline tarball and utilize npm's built-in "npm pack" functionality leveraging package.json's "bundleDependencies" list.

### Building Offline Tarball

1). On a build system/box with internet access, execute the following, from within the npmbox repo.

    ./build-offline-tarball.sh

If everything goes well, you should end up with build output such as the following. Look specifically for the [SUCCESS] build test result.

./build-offline-tarball.sh 
npm http GET https://registry.npmjs.org/npmbox
npm http 304 https://registry.npmjs.org/npmbox
npmbox@2.7.0 node_modules/npmbox
npmbox-2.7.0.tgz
Description:	Ubuntu 14.04.3 LTS
Rules updated
Rules updated (v6)
Rules updated
Rules updated (v6)
Command may disrupt existing ssh connections. Proceed with operation (y|n)? Firewall is active and enabled on system startup
/usr/local/bin/npmbox -> /usr/local/lib/node_modules/npmbox/bin/npmbox
/usr/local/bin/npmunbox -> /usr/local/lib/node_modules/npmbox/bin/npmunbox
npmbox@2.7.0 /usr/local/lib/node_modules/npmbox
/usr/local/bin/npmbox
[SUCCESS] Npmbox established without internet access.
Firewall stopped and disabled on system startup

2). From within the box without internet access, copy the resulting npmbox*.tgz file somewhere from the build box and execute the following command against it:

    npm install -g npmbox-[npmbox_version].tgz

3). Once npmbox is installed globally you can use it to install other .npmbox files:

	npmunbox blah

## TO DO

- Right now specifying multiple packages creates multiple .npmbox files.  Make it create just one .npmbox file by default.  Maybe allow a switch (-multi) to make it generate multiple.
