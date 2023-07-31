import { video_basic_info, yt_validate, search } from "play-dl";
import { secs2TimeStr } from "../utils/time";
import { ResultAsync, err, errAsync } from "neverthrow";
import { QueueError } from "./queueError";

export interface SongArgs {
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
    this.author = author ?? "Unknown";
    this.duration = duration; // in seconds
    this.url = url;
    this.relatedUrl = relatedUrl; // for autoplay
    this.thumbnail = thumbnail;
  }

  public durationStr(): string {
    return secs2TimeStr(this.duration);
  }

  static fromQuery(query: string): ResultAsync<Song, Error> {
    return ResultAsync.fromPromise(
      search(query, { limit: 1, source: { youtube: "video" } }),
      () => new Error(QueueError.SongQueryFail),
    )
      .andThen(searched => {
        if (searched.length === 0) {
          return err(new Error(QueueError.SongQueryFail));
        }
        // Note: unfornately, play-dl doesn't have a way to get the related video from search
        return ResultAsync.fromPromise(
          video_basic_info(searched[0].url),
          () => new Error(QueueError.SongQueryFail),
        )
      })
      .map(
        songInfo => new this({
          title: songInfo.video_details.title!,
          author: songInfo.video_details.channel!.name!,
          duration: songInfo.video_details.durationInSec,
          url: songInfo.video_details.url,
          relatedUrl: songInfo.related_videos[0],
          thumbnail: songInfo.video_details.thumbnails[0].url,
        }),
      );
  }

  static fromUrl(url: string): ResultAsync<Song, Error> {
    if (url.startsWith("https")) {
      const validation = yt_validate(url);
      if (validation !== "video" && validation !== "playlist") {
        return errAsync(new Error(QueueError.SongURLFail));
      }
    } else {
      return errAsync(new Error(QueueError.SongURLFail));
    }

    return ResultAsync.fromPromise(video_basic_info(url), () => new Error(QueueError.SongURLFail))
      .map(songInfo => new this({
        title: songInfo.video_details.title!,
        author: songInfo.video_details.channel!.name!,
        duration: songInfo.video_details.durationInSec,
        url: songInfo.video_details.url,
        relatedUrl: songInfo.related_videos[0],
        thumbnail: songInfo.video_details.thumbnails[0].url,
      }));
  }
}
