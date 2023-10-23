export function mediaDevices() {
  return (
    navigator.mediaDevices ||
    (navigator.mozGetUserMedia || navigator.webkitGetUserMedia
      ? {
          getUserMedia: function (c) {
            return new Promise(function (y, n) {
              (navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(
                navigator,
                c,
                y,
                n
              );
            });
          },
        }
      : null)
  );
}
