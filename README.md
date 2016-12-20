[![Build Status](https://travis-ci.org/arei/npmbox.svg)](https://travis-ci.org/arei/npmbox)

[![NPM](https://nodei.co/npm/npmbox.png)](https://nodei.co/npm/npmbox/)

-------

## What is npmbox?

npm addon utility for creating and installing from an archive file of an npm install, including dependencies.  This lets you create a "box" of an installable package and move it to an offline system that will only install from that box.

npmbox is intended to be a proof of concept with regards to this issue filled against this npm feature request: [[Feature] Bundle/Include Dependencies](https://github.com/isaacs/npm/issues/4210).  Ideally, we would like to see the npmbox functionality built into npm so a third party tool like npmbox is not required or necessary. Please go add your support over at that ticket to help get us some visibility... or, even better, go write the code!

## npmbox news

UPDATE August 9, 2016: v4.0.0 of npmbox is out.
  * Support for bundling multiple packages into a single .npmbox file! (Hooray!)
  * Roll back version of tar.gz lib to solve large tar file bug.
  * Fix error where npmbox would not give an error on a failure.

Also worthy of note is that npm, inc. has begun thinking and working in how to do this within npm itself (and hopefully obsoletting this project entirely).  There's a good blog post over at npm, inc called "dealing with problematic dependencies in a restricted network environment" that details some of the problems: [Check it out here!](http://blog.npmjs.org/post/145724408060/dealing-with-problematic-dependencies-in-a)

## Usage of `npmbox`

Given some package, like `express` this command will create a archive file of that package and all of its dependencies, such that a npmunbox of that archive file will install express and all of its dependencies.

	npmbox - Create an archive for offline installation of the given package.

	Usage:

  		npmbox --help
  		npmbox [options] <package> <package>...

	Options:

		-v, --verbose         Shows npm output which is normally hidden.
		-s, --silent          Shows no output whatsoever.
		-t, --target          Specify the .npmbox file to write.

You must specify at least one package.

*NEW*: You can specify more than one package and all packages will be bundled into a single archive.

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

*NEW*: If an .npmbox file contains multiple packages, unboxing the .npmbox will install ALL of those packages.

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

5). I used to be able to create multiple .npmbox files with a single command. Why did that change.

In order to support multiple npm packages in a single .npmbox file we had to change how this works.  It's still possible to create multiple .npmbox per package, but you will just need to run the command multiple times.

6). But I wanted it to work the old way with one .npmbox file per package.

Sorry.  The multiple packages per single file change is a big deal.  It lets you create a single .npmbox with multiple packages but without redundent libraries being include multiple times.  So nice. Multiple packages in a single .npmbox file also lets you unbox a single .npmbox file and get multiple installs.
