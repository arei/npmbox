var fs=require('fs')
//var findit=require('findit')
var findit=require('findit')('.')

findit.on('file', function(name, stat) {
  if (endsWith(name,'package.json')) {
    handleFile(name)
  }
}).on('end', bundleApp)
 
function handleFile(file) {
  var data = fs.readFile(file, function(err, data) {
    if (err) {
      console.log('Not processesed '+file+' bo the following error: '+err)
    } else {
      var arr = []

      if (data != undefined && data.length > 0)
      {
        var packageFile = JSON.parse(data)
        if (packageFile.bundleDependencies) {
          console.log('Bundledeps already present. Skipping')
        } else {
          for (var d in packageFile.dependencies) {
            arr.push(d+"")
          }
          if (arr.length > 0) {
            packageFile['bundleDependencies'] = arr
            fs.writeFile(file, JSON.stringify(packageFile, null, 4))
          }
        }
      }
    }
  })
}
 
function bundleApp() {
  console.log('Finished. preparing package.json files for packaging. Now run npm pack to create the fullblown tarball')
  //exercise left for the reader to require('npm') and run the pack command
}
 
function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
