import { video_basic_info, yt_validate, search } from "play-dl";

interface SongArgs {
  title: string;
  author: string;
  duration: number;
  url: string;
  relatedUrl: string;
  thumbnail: string;
}

export default class Song {
  public readonly title: string;
  public readonly author: string;
  public readonly duration: number;
  public readonly url: string;
  public readonly relatedUrl: string;
  public readonly thumbnail: string;

  constructor({ title, author, duration, url, relatedUrl, thumbnail }: SongArgs) {
    this.title = title;
    this.author = author;
    this.duration = duration; // in seconds
    this.url = url;
    this.relatedUrl = relatedUrl; // for autoplay
    this.thumbnail = thumbnail;
  }

  static async fromUrl(url: string): Promise<Song> {
    if (url.startsWith("https") && yt_validate(url) !== "video") {
      throw new Error("Invalid url");
    }

    const songInfo = await video_basic_info(url);
    return new this({
        title: songInfo.video_details.title!,
        author: songInfo.video_details.channel!.name!,
        duration: songInfo.video_details.durationInSec,
        url: songInfo.video_details.url,
        relatedUrl: songInfo.related_videos[0],
        thumbnail: songInfo.video_details.thumbnails[0].url,
      });
  }

  static async fromQuery(query: string) {
    const searched = await search(query, {
      limit: 1,
      source: { youtube: "video" },
    });

    if (searched.length === 0) {
      throw new Error("No result found");
    }

    // Note: unfornately, play-dl doesn't have a way to get the related video from search
    const songInfo = await video_basic_info(searched[0].url);
    return new this({
        title: songInfo.video_details.title!,
        author: songInfo.video_details.channel!.name!,
        duration: songInfo.video_details.durationInSec,
        url: songInfo.video_details.url,
        relatedUrl: songInfo.related_videos[0],
        thumbnail: songInfo.video_details.thumbnails[0].url,
      });
  }
}
