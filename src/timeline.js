// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

(function(scope, testing) {

  scope.Timeline = function() {
    this.players = [];
    this.currentTime = undefined;
  };

  scope.Timeline.prototype = {
    _play: function(source) {
      var player = new scope.Player(source);
      if (this.currentTime !== undefined) {
        player._startTime = this.currentTime;
      }
      player._timeline = this;
      this.players.push(player);
      return player;
    }
  };

  function tick(t) {
    var timeline = global.document.timeline;
    timeline.currentTime = t;
    timeline.players.sort(function(leftPlayer, rightPlayer) {
      return leftPlayer._sequenceNumber - rightPlayer._sequenceNumber;
    });
    timeline.players.forEach(function(player) {
      if (!(player.paused || player.finished)) {
        if (player.startTime === null)
          player.startTime = t;
        player._currentTime = (t - player.startTime) * player.playbackRate;
      }
    });
    timeline.players = timeline.players.filter(function(player) {
      if (!player._inEffect)
        player._inTimeline = false;
      return player._inEffect;
    });
    if (!TESTING) {
      requestAnimationFrame(tick);
    }
  };

  if (!TESTING) {
    requestAnimationFrame(tick);
  } else {
    testing.tick = tick;
  }

  var timeline = new scope.Timeline();
  scope.timeline = timeline;
  try {
    Object.defineProperty(global.document, 'timeline', {
      configurable: true,
      get: function() { return timeline; }
    });
  } catch (e) { }
  try {
    global.document.timeline = timeline;
  } catch (e) { }

})(minifill, testing);
