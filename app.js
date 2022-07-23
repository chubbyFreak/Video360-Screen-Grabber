const child_process = require('child_process');
const WebSocket = require('ws');

// DEFAULT MAXIMUM SYSTEM PIPE BUFFER SIZE: 65536

var ffmpeg = child_process.spawn('ffmpeg', [
  // '-h',
  // 'encoder=h264_nvenc',
  '-video_size',
  '1920x1080',
  '-framerate',
  '30',
  '-f',
  'x11grab',
  '-i',
  ':0',
  '-i',
  '1.16.5_palette.png',
  '-filter_complex',
  // 340 x 170
  '[0]scale=340:170[b];[b][1:v]paletteuse=dither=none',
  // '[0]scale=-1:144[a];[a][1:v]',
  '-vcodec',
  'png',
  '-pix_fmt',
  'rgba',
  '-f',
  'image2pipe',
  'pipe:1',
  // 'capture.mkv',
]);

const ws = new WebSocket('ws://localhost:8080/');

ffmpeg.on('error', function (err) {
  console.log(err);
});
ffmpeg.on('message', (data) => console.log(data));
ffmpeg.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});
ffmpeg.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

const stream = ffmpeg.stdout;
buffers = [];
stream.on('data', (chunk) => {
  // console.log(chunk.length);
  if (chunk.length === 65536) buffers.push(chunk);
  else {
    buffers.push(chunk);
    const buffer = Buffer.concat(buffers);
    ws.send(buffer);
    buffers = [];
  }
});
