import {
  createAudioResource,
  StreamType, AudioPlayer, AudioResource
} from "@discordjs/voice";
import { stream } from "play-dl";
import Song, { SongArgs } from "./song.js";
import { secs2TimeStr } from "../utils/time.js";
import { ResultAsync } from "neverthrow";
import { QueueError } from "./queueError.js";

export interface QueueSongArgs extends SongArgs {
  startTime: number;
  resource: AudioResource<null>;
}

export class QueueSong extends Song {
  private startTime: number;
  private resource: AudioResource<null>;

  private constructor({ title, author, duration, url, relatedUrl, thumbnail, startTime, resource }: QueueSongArgs) {
    super({ title, author, duration, url, relatedUrl, thumbnail });
    this.startTime = startTime;
    this.resource = resource;
  }

  public play(player: AudioPlayer): void {
    player.play(this.resource);
  }

  public time(): number {
    return Math.trunc(this.resource.playbackDuration / 1000 + this.startTime);
  }

  public timeStr(): string {
    return secs2TimeStr(this.time());
  }

  public timeLeft(): number {
    return this.duration - this.time();
  }

  public timeLeftStr(): string {
    return secs2TimeStr(this.timeLeft());
  }

  public seek(player: AudioPlayer, seek: number): ResultAsync<void, Error> {
    return QueueSong.makeResource(this.url, seek)
      .map(resource => {
        this.resource = resource;
        this.startTime = seek;
        this.play(player);
      });
  }

  public replay(player: AudioPlayer): ResultAsync<void, Error> {
    return this.seek(player, 0);
  }

  private static makeResource(url: string, seek?: number): ResultAsync<AudioResource<null>, Error> {
    return ResultAsync.fromPromise(stream(url, { seek: seek }), () => new Error(QueueError.StreamFail))
      .map(songStream => createAudioResource(songStream.stream, {
        inputType: StreamType.Opus,
      }));
  }

  public static fromSong(song: Song, seek?: number): ResultAsync<QueueSong, Error> {
    return this.makeResource(song.url, seek)
      .map(resource => new this({
        title: song.title,
        author: song.author,
        duration: song.duration,
        url: song.url,
        relatedUrl: song.relatedUrl,
        thumbnail: song.thumbnail,
        startTime: (!seek) ? 0 : seek,
        resource: resource,
      }));
  }
}
