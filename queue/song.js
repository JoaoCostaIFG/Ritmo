const { video_basic_info, yt_validate, search } = require("play-dl");

class Song {
  constructor(title, author, duration, url) {
    this.title = title;
    this.author = author;
    this.duration = duration; // in seconds
    this.url = url;
  }

  static async fromUrl(url) {
    if (url.startsWith("https") && yt_validate(url) !== "video") {
      return Promise.reject("Invalid url");
    }

    const songInfo = await video_basic_info(url).catch(Promise.reject);

    return Promise.resolve(
      new this(
        songInfo.video_details.title,
        songInfo.video_details.channel.name,
        songInfo.video_details.durationInSec,
        songInfo.video_details.url,
      ),
    );
  }

  static async fromQuery(query) {
    const searched = await search(query, {
      limit: 1,
      source: { youtube: "video" },
    }).catch(Promise.reject);

    if (searched.length === 0) {
      return Promise.reject("No results found");
    }

    const result = searched[0];
    return Promise.resolve(
      new Song(
        result.title,
        result.channel.name,
        result.durationInSec,
        result.url,
      ),
    );
  }
}

module.exports = Song;
