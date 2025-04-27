// hugely inspired by https://greasyfork.org/zh-CN/scripts/4870-maximize-video

/* eslint-disable @typescript-eslint/naming-convention */
// import { requireYn } from "./_require";
import YouTubePlugin from "./youtube";

// const { waitForSelector } = requireYn();

export default class YouTubePluginNoAd extends YouTubePlugin {
  actualDuration = parseInt(
    ytInitialPlayerResponse?.videoDetails?.lengthSeconds,
    10,
  );
  _runningAd = Number.isNaN(this.actualDuration) ? null : false;
  #adContinueInterval: null | { id: number; retry: number } = null;
  get runningAd() {
    return this._runningAd;
  }
  set runningAd(value) {
    this._runningAd = value;
    if (value === false) {
      window.clearInterval(this.#adContinueInterval?.id ?? -1);
      this.#adContinueInterval = null;
    } else if (value === true && !this.#adContinueInterval) {
      const interval = {
        id: window.setTimeout(() => {
          // retry for 1s
          if (interval.retry++ >= 2) {
            this._runningAd = false;
            window.clearInterval(interval.id);
            this.#adContinueInterval = null;
          } else {
            this.adContinue();
          }
        }, 500),
        retry: 0,
      };
      this.#adContinueInterval = interval;
    }
  }
  adContinue() {
    const clickTarget =
      this.moviePlayer.querySelector<HTMLElement>(".ytp-play-button") ??
      this.moviePlayer;
    clickTarget.click(); // PC
    nativeTouch.call(clickTarget); // Phone
  }

  async onload(): Promise<void> {
    await super.onload();
    if (this.runningAd !== null) {
      const media = this.media;
      const skipAd = () => {
        // if video.duration is within actualDuration+/-1, then it's main video, don't skip
        if (Math.abs(media.duration - this.actualDuration) <= 1) {
          this.runningAd = false;
          return;
        }
        this.runningAd = true;
        // fix mobile browser mute bug
        if (window.location.href.includes("https://m.youtube.com/")) {
          media.muted = true;
        }
        media.currentTime = media.duration;
        // click on the player to dismiss the ad
        this.adContinue();
      };
      skipAd();
      this.media.addEventListener("durationchange", skipAd);
    }

  }


}

function nativeTouch(this: HTMLElement) {
  // 创建 Touch 对象
  const touch = new Touch({
    identifier: Date.now(),
    target: this,
    clientX: 12,
    clientY: 34,
    radiusX: 56,
    radiusY: 78,
    rotationAngle: 0,
    force: 1,
  });

  // 创建 TouchEvent 对象
  const touchStartEvent = new TouchEvent(`touchstart`, {
    bubbles: true,
    cancelable: true,
    view: window,
    touches: [touch],
    targetTouches: [touch],
    changedTouches: [touch],
  });

  // 分派 touchstart 事件到目标元素
  this.dispatchEvent(touchStartEvent);

  // 创建 TouchEvent 对象
  const touchEndEvent = new TouchEvent(`touchend`, {
    bubbles: true,
    cancelable: true,
    view: window,
    touches: [],
    targetTouches: [],
    changedTouches: [touch],
  });

  // 分派 touchend 事件到目标元素
  this.dispatchEvent(touchEndEvent);
}
