npmbox
-------

npm addon utility for creating and installing from an archive file of an npm install, including dependencies.  This lets you create a "box" of an installable package and move it to an offline system that will only install from that box.

## npmbox

Given some package, like `express` this command will create a archive file of that package and all of its dependencies, such that a npmunbox of that archive file will install express and all of its dependencies. 

Usage:

	npmbox --help
	npmbox <package>
	npmbox <package> <package> ...

You must specify at least one package. 

You can specify more than one package and a separate archive will be created for each specified.

npmbox files end with the .npmbox extension.

## npmunbox

Given some .npmbox file (must end with the .npmbox extension), installs the contents and all of it dependencies.

Usage:

	npmunbox --help
	npmunbox <npmbox-file>
	npmunbox <npmbox-file> <npmbox-file> ...

You must specify at least one file.

You may specify more than one file, and each will be installed.

## TO DO

- Verify working .bin files on linux
- Verify versions work when specifying package.
- Add --global switch for npmunbox.  In fact, pass all -- switches through to the underlying npm command.
- Right now specifying multiple packages creates multiple .npmbox files.  Make it create just one .npmbox file by default.  Maybe allow a switch (-multi) to make it generate multiple.