import {video_basic_info, yt_validate, search} from "play-dl";

interface SongArgs {
  title: string;
  author: string;
  duration: number;
  url: string;
}

export default class Song {
  public readonly title: string;
  public readonly author: string;
  public readonly duration: number;
  public readonly url: string;

  constructor({title, author, duration, url}: SongArgs) {
    this.title = title;
    this.author = author;
    this.duration = duration; // in seconds
    this.url = url;
  }

  static async fromUrl(url: string) {
    if (url.startsWith("https") && yt_validate(url) !== "video") {
      return Promise.reject("Invalid url");
    }

    const songInfo = await video_basic_info(url).catch(Promise.reject);
    const songDetails = songInfo.video_details;

    return Promise.resolve(
      new this({
        title: songDetails.title!,
        author: songDetails.channel!.name!,
        duration: songDetails.durationInSec,
        url: songDetails.url,
      }),
    );
  }

  static async fromQuery(query: string) {
    const searched = await search(query, {
      limit: 1,
      source: {youtube: "video"},
    }).catch(Promise.reject);

    if (searched.length === 0) {
      return Promise.reject("No results found");
    }

    const result = searched[0];
    return Promise.resolve(
      new Song({
        title: result.title!,
        author: result.channel!.name!,
        duration: result.durationInSec,
        url: result.url,
      }),
    );
  }
}
