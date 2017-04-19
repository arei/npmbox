[![Build Status](https://travis-ci.org/arei/npmbox.svg)](https://travis-ci.org/arei/npmbox)

[![NPM](https://nodei.co/npm/npmbox.png)](https://nodei.co/npm/npmbox/)

-------

## What is npmbox?

npm addon utility for creating and installing from an archive file of an npm install, including dependencies.  This lets you create a "box" of an installable package and move it to an offline system that will only install from that box.

npmbox is intended to be a proof of concept with regards to this issue filled against this npm feature request: [[Feature] Bundle/Include Dependencies](https://github.com/isaacs/npm/issues/4210).  Ideally, we would like to see the npmbox functionality built into npm so a third party tool like npmbox is not required or necessary. Please go add your support over at that ticket to help get us some visibility... or, even better, go write the code!

## npmbox news

UPDATE April 19, 2017: v4.2.1 of npmbox is out.
  * Escapes package names with forward slash characters. #86
  * Minor linting changes.

UPDATE December 22, 2016: v4.2.0 of npmbox is out.
  * Support for accepting a `package.json` file when boxing. This will cause its
    dependencies to get boxed.
  * Start using a temporary directory instead of the CWD for temporary files and
    directories. **Note:** This fixes the problem noted in v4.1.0 whereby
    `npmbox` of the current directory would fail.
  * New unbox option `--install=<pkg>` to install any package while using the
    box contents for dependencies. This can be used to install a local package
    (from the filesystem) while using a box for dependencies, e.g.
    `cd path/to/my/package; npmunbox --install=. path/to/box.npmbox`
  * New unbox option `--scripts` to enable running of scripts. (By default,
    npmbox acts like `--ignore-scripts` was specified.)
  * New options `--proxy` and `--https-proxy` which pass through to the
    underlying `npm` invocation. Works on both `npmbox` and `npmunbox`. In the
    latter case, this can help prevent unboxing from inadvertently hitting the
    network (by specifying nonexistent proxies).

Also worthy of note is that npm, inc. has begun thinking and working in how to do this within npm itself (and hopefully obsoleting this project entirely).  There's a good blog post over at npm, inc called "dealing with problematic dependencies in a restricted network environment" that details some of the problems: [Check it out here!](http://blog.npmjs.org/post/145724408060/dealing-with-problematic-dependencies-in-a)

## Usage of `npmbox`

Given some package, like `express` this command will create a archive file of that package and all of its dependencies, such that a npmunbox of that archive file will install express and all of its dependencies.

    npmbox - Create an archive for offline installation of one or more packages.

    Usage:

          npmbox --help
          npmbox [options] <package> <package>...

    Options:

        -v, --verbose         Shows npm output which is normally hidden.
        -s, --silent          Shows no output whatsoever.
        -t, --target          Specify the .npmbox file to write.
        --proxy=<url>         npm --proxy switch.
        --https-proxy=<url>   npm --https-proxy switch.

You must specify at least one package. Packages can be anything accepted as
an argument to `npm install`, and can also be a local path to a `.json` file,
assumed to be in `package.json` format; in this case, the dependencies listed
in the file are included in the box (except for `devDependencies`).

All specified packages get bundled into a single archive.

npmbox files end with the .npmbox extension.

NOTE: When creating an archive file for a package destined to be installed on an offline machine clear your npm cache before using npmbox.

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
        -i, --install=<pkg>   Installs the indicated package instead of using the .npmbox manifest.
        --scripts             Enable running of scripts during installation.
        -g, --global          Installs package globally as if --global was passed to npm.
        -C, --prefix          npm --prefix switch.
        -S, --save            npm --save switch.
        -D, --save-dev        npm --save-dev switch.
        -O, --save-optional   npm --save-optional switch.
        -B, --save-bundle     npm --save-bundle switch.
        -E, --save-exact      npm --save-exact switch.
        --proxy=<url>         npm --proxy switch.
        --https-proxy=<url>   npm --https-proxy switch.

You must specify at least one file.

You may specify more than one file, and each will be installed.

If an .npmbox file contains multiple packages, unboxing the .npmbox will install ALL of those packages.

## Using `npmunbox` without npmbox being installed

A particular use case with npmunbox comes up fairly often: **how do I use npmbox without first installing npmbox**.  Specifically, many people have asked for a way to run npmunbox as a means to installing npmbox.  You can see that this is a bit of a chicken and egg problem.  How do we install npmbox from an npmbox file?

### Installing npmbox from an .npmbox file

**On a system that does have access to the Internet, you need to do the following:**

1). If npmbox is not globally installed on your online system, do so now:

    npm install -g npmbox

2). In a folder in which you can read/write:

    npmbox npmbox

3). Copy the resulting `npmbox.npmbox` file to you offline system in whatever manner allowed to you,  This could involve coping to movable media and transferring that way, however you would do it.

**On the system you want to install npmbox to, do the following:**

1). Create a new directory:

    mkdir somedir

2). Change to it:

    cd somedir

3). Copy the npmbox.npmbox folder into this directory:

    cp /media/usb/npmbox.npmbox .

or

    copy E:\npmbox.npmbox .

4). Untar the .npmbox file.  This will create the .npmbox.cache folder.

    tar --no-same-owner --no-same-permissions -xvzf npmbox.npmbox

NOTE: If for some reason `--no-same-owner` or `--no-same-permissions` do not work, remove them and adjust the permissions/ownership yourself.  You will need to ensure that npm can see all the files in the .npmbox.cache file structure.

NOTE: On some OSes it may also be necessary to drop the `-z` switch from the tar command as well.

NOTE: On windows you might not have the tar command.  You can use another zip utility (like 7-zip or winzip) to extract the file if you like.  Just please note that the file is a .tar.gz file and thus you may need to extract it twice, once for the zip, the second for the tar.  **If you do this, please make sure to remove the tar file from your local directory before running the npm command below.**

5). Install npmbox globally using the following command.

For unix or macs...

    npm install --global --cache ./.npmbox.cache --optional --cache-min 99999999999 --shrinkwrap false npmbox

For windows...

    npm install --global --cache .\.npmbox.cache --optional --cache-min 99999999999 --shrinkwrap false npmbox

NOTE: If you have a file called `npmbox` (no extension) in the local directory, this will not work correctly.  Please remove said `npmbox` file.

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
  * Packages that execute external scripts that call out to git repos or npm are entirely outside of the control of npmbox.  Not much we can do about that.

3). When I run the command described above to install npmbox on my offline machine I get an error.

This if frequently caused by incorrectly referencing where the `.npmbox-cache` file is.  Please check the section of the command `--cache .\.npmbox-cache` and make sure it is pointing at the correct location.

4). When is npm going to add this functionality?

npm, inc. is actively working on this problem as we speak.  Read this blog post for some of the challenges they are facing:  [Check it out here!](http://blog.npmjs.org/post/145724408060/dealing-with-problematic-dependencies-in-a)

5). I used to be able to create multiple .npmbox files with a single command. Why did that change?

In order to support multiple npm packages in a single .npmbox file we had to change how this works.  It's still possible to create multiple .npmbox per package, but you will just need to run the command multiple times.

6). But I wanted it to work the old way with one .npmbox file per package.

Sorry.  The multiple packages per single file change is a big deal.  It lets you create a single .npmbox with multiple packages but without redundant libraries being include multiple times.  So nice. Multiple packages in a single .npmbox file also lets you unbox a single .npmbox file and get multiple installs.
