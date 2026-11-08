(function () {
  'use strict';

  var paths = {
    play: '<path d="m9 5 11 7-11 7Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    fullscreen: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>'
  };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>';
  }

  function time(seconds) {
    if (!isFinite(seconds)) return '0:00';
    return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  }

  document.querySelectorAll('video[controls]').forEach(function (video) {
    var player = document.createElement('div');
    player.className = 'video-player';
    video.parentNode.insertBefore(player, video);
    player.appendChild(video);

    var bar = document.createElement('div');
    bar.className = 'video-player-controls';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Video controls');
    player.appendChild(bar);

    function button(label, symbol, action) {
      var element = document.createElement('button');
      element.type = 'button';
      element.setAttribute('aria-label', label);
      element.title = label;
      element.innerHTML = icon(symbol);
      element.addEventListener('click', action);
      bar.appendChild(element);
      return element;
    }

    var play = button('Play', 'play', function () {
      if (video.paused) {
        video.dataset.userPaused = 'false';
        video.play().catch(function () {});
      } else {
        video.dataset.userPaused = 'true';
        video.pause();
      }
    });

    var seek = document.createElement('input');
    seek.type = 'range';
    seek.className = 'video-player-seek';
    seek.min = 0;
    seek.max = 100;
    seek.step = 0.1;
    seek.value = 0;
    seek.disabled = true;
    seek.setAttribute('aria-label', 'Seek video');
    bar.appendChild(seek);

    var clock = document.createElement('span');
    clock.className = 'video-player-time';
    clock.textContent = '0:00 / 0:00';
    bar.appendChild(clock);

    var fullscreen = button('Fullscreen', 'fullscreen', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(function () {});
      } else if (player.requestFullscreen) {
        player.requestFullscreen().catch(function () {});
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    });
    if (!player.requestFullscreen && !video.webkitEnterFullscreen) fullscreen.hidden = true;

    function updatePlayback() {
      var label = video.paused ? 'Play' : 'Pause';
      play.setAttribute('aria-label', label);
      play.title = label;
      play.innerHTML = icon(video.paused ? 'play' : 'pause');
    }

    function updateTime() {
      var ready = isFinite(video.duration) && video.duration > 0;
      seek.disabled = !ready;
      seek.value = ready ? video.currentTime / video.duration * 100 : 0;
      seek.setAttribute('aria-valuetext', time(video.currentTime) + ' of ' + time(video.duration));
      clock.textContent = time(video.currentTime) + ' / ' + time(video.duration);
    }

    seek.addEventListener('input', function () {
      if (isFinite(video.duration)) video.currentTime = Number(seek.value) / 100 * video.duration;
    });
    video.addEventListener('play', updatePlayback);
    video.addEventListener('pause', updatePlayback);
    video.addEventListener('ended', updatePlayback);
    ['timeupdate', 'durationchange', 'loadedmetadata', 'emptied'].forEach(function (event) {
      video.addEventListener(event, updateTime);
    });
    updatePlayback();
    updateTime();
    video.controls = false;
  });
})();
