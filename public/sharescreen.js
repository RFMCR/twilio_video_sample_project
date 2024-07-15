async function createScreenTrack(height, width) {
    if (typeof navigator === 'undefined'
      || !navigator.mediaDevices
      || !navigator.mediaDevices.getDisplayMedia) {
      return Promise.reject(new Error('getDisplayMedia is not supported'));
    }
    return navigator.mediaDevices.getDisplayMedia({
      video: {
        height: height,
        width: width
      }
    }).then(function(stream) {
      return new Twilio.Video.LocalVideoTrack(stream.getVideoTracks()[0]);
    });
  }
  