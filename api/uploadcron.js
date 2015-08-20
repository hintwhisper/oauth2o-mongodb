var CronJob = require('cron').CronJob,
    fs = require('fs'),
    JSFtp = require("jsftp"),
    _ = require('lodash'),
    config = require('config'),
    Ftp ,
    isUploadRunning = false,
    remoteDir = config.optFtp.remoteDir,
    cronTime = config.optFtp.cronTime;
   // process = require('child_process');
var isCsvFile = function(name) {
  return name.indexOf('.csv')>=0
}
var isFullUpload = function(name) {
  return name.indexOf('full') == 0
}
var isPartialUpload = function(name){
  return name.indexOf('partial') == 0
}
module.exports = function(app) {
  //console.log('uploadcron')
  var UploadJob = new CronJob({
    cronTime: cronTime ,//set for 1
    onTick: function() {
      // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
     // console.log('isUploadRunning',isUploadRunning)
      // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
      if(!isUploadRunning){
         partialUploadJobs();
         isUploadRunning = true;
      }

      // at 11:30:00 AM. It does not run on Saturday
      // or Sunday.
    },
    start: true,
    timeZone: "America/Los_Angeles"
  });
  ////////////////////////
  UploadJob.start();
  /////////////////////////


  var partialUploadJobs = function() {
    var str = '';
    Ftp = new JSFtp(config.optFtp.conn);
    Ftp.ls(remoteDir, function(err, res) {
      if (err){
        console.error(err);
        isUploadRunning = false;
      }else {
//         console.log(res);
          res = _.filter(res,function(file) {
            return isCsvFile(file.name);
          })
//          console.log('@@@@@@ RES @@@@@',res);
         if (res.length == 1){
          console.log('@@@@ Going To @@@@@ 1 file')
            // To check file type full/partial
            if(isCsvFile(res[0].name) && isFullUpload(res[0].name)) {//It is full upload
              console.log('Full UPload')
              uploadJobs('full',res[0].name,function(err) {
                 if(err){
                    console.error('$$$$$$$$$ Upload File product err:',err)
                 }else{
                   console.log('%%%%%%%%%%  UPload product file '+res[0].name+ 'done %%%%%%%%%%%%')
                 }
                 isUploadRunning = false;
              });
            }else if(isCsvFile(res[0].name) && isPartialUpload(res[0].name)){// It is full upload
               console.log('partial UPload')
              uploadJobs('partial',res[0].name,function(err) {
                 if(err){
                    console.error('$$$$$$$$$ Upload File product err:',err)
                 }else{
                   console.log('%%%%%%%%%%  UPload product file '+res[0].name+ 'done %%%%%%%%%%%%')
                 }
                 isUploadRunning = false;
              });
            }else{
              isUploadRunning = false;
            }
         }else if(res.length > 1){
            // sort by desc means 7  6 5
            res = _.sortBy(res, function(file) { return  -new Date(file.time); });
            var fullUploadFiles = _.filter(res ,function(file) {
                  return isFullUpload(file.name);
            });

            // If contains Full upload files
            if (fullUploadFiles.length>0) {
              fullUploadFiles = _.sortBy(fullUploadFiles, function(file) { return  -new Date(file.time); });

              var finalFullUploadFile = fullUploadFiles[0];
              var finalFullUploadTime = new Date(fullUploadFiles[0].time);
              console.log('finalFullUploadFile',finalFullUploadFile);
              console.log('finalFullUploadTime',finalFullUploadTime);

              // To check remaining partial
              var remainingPartialFiles = _.filter(res,function(file) {
                return isPartialUpload(file.name) && file.time >=finalFullUploadTime;
              });
              var nonProcessingPatialUploadTime = _.filter(res,function(file) {
                return isPartialUpload(file.name) && file.time <finalFullUploadTime;
              });
              var nonProcessingFullFiles = _.reject(fullUploadFiles,function(file) {
                return file.name == finalFullUploadFile.name;
              })
              /////////////////////////////////////
              deleteFiles(nonProcessingFullFiles);
              deleteFiles(nonProcessingFullFiles);
              //////////////////////////////////////
              //So we have first execute finalFullUploadFile then execute remainingPartialFiles
              uploadJobs('full',finalFullUploadFile.name,function(err,result) {
                var index = 0;
                applyUploadForPartial(remainingPartialFiles,index);
              })
            }else{
                res = _.filter(res ,function(file) {
                  return isPartialUpload(file.name);
                });

                var index =0;
                if (res.length>0) applyUploadForPartial(res,index);
                else isUploadRunning = false;

            }
            //sort fullupload file by latest one

            // check if response contains full upload file


         }else{
            isUploadRunning = false;
         }

      //    Ftp.get('./Flipkart/logs.log', function(err, socket) {
      //     if (err) return;

      //     socket.on("data", function(d) { str += d.toString(); })
      //     socket.on("close", function(hadErr) {
      //       console.log('str',str)
      //       if (hadErr) console.error('There was an error retrieving the file.');
      //       var filename
      //       fs.writeFile('../', xml , function (err,data) {
      //       if (err) console.log(err);
      //       Ftp.destroy();
      //     });
      //    socket.resume();
      //   });
      // }

     //console.log(file);
      }
    });
  }
  var applyUploadForPartial = function(partialfiles,index) {
   if(index < partialfiles.length){
      uploadJobs('partial',partialfiles[index].name,function(err,result) {
           index ++;
           applyUploadForPartial(partialfiles,index);
      })
   }else {
     console.log('Remaining partial upload done');
     isUploadRunning = false;

   }

  }
var uploadJobs = function (uploadType,filename,callback) {
   //console.log(remoteDir+'/'+filename);
   try {
    // Ftp = new JSFtp(config.optFtp.conn);
    Ftp.get(remoteDir+'/'+filename, filename,function(err) {
    //  console.log("read the fiel");
      if (err) callback(err)
      else{
        var workers = require('../api/workers/upload')(app);
        var parmInfo = {
          filePath: filename,
          fileName: filename,
          uploadType: uploadType
        }
        Ftp.rename(remoteDir+'/'+filename, remoteDir+'/'+'processed-'+filename, function(err, res) {
            if (!err) console.log('rename File done');
            //Ftp.destroy();

        });

        workers.upload(parmInfo
        , function(err) {
          if (err) {
            callback(err);
          } else {

            // console.log('@@@@@@@@@Email sent directly@@@@@@@@@@ '+to);
             callback(null,"Success");
          }


        });
      }
    })
   }catch(err){
    isUploadRunning = false;
   }
}
var deleteFiles = function(files) {
  files.forEach(function(file) {

    Ftp.raw.dele(remoteDir+'/'+file.name,function(err){
      if (err) console.error(file.name +' File not deleted');
      else console.log(file.name + ' File  Deleted')
    })
    // Ftp.rename(remoteDir+'/'+file.name, remoteDir+'/'+'UnProcessed-'+filename, function(err, res) {
    //   if (!err)
    //   console.log("Renaming successful!");
    // });
  })

}

}
