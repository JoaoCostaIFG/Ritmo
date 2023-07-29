import {
  createAudioResource,
  StreamType, AudioPlayer, AudioResource
} from "@discordjs/voice";
import { stream } from "play-dl";
import Song, { SongArgs } from "./song.js";
import { secs2TimeStr } from "../utils/time.js";

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

  public async seek(player: AudioPlayer, seek: number): Promise<void> {
    this.resource = await QueueSong.makeResource(this.url, seek);
    this.startTime = seek;
    this.play(player);
  }

  public async replay(player: AudioPlayer): Promise<void> {
    await this.seek(player, 0);
  }

  private static async makeResource(url: string, seek?: number): Promise<AudioResource<null>> {
    let songStream = await stream(url, { seek: seek });
    return createAudioResource(songStream.stream, {
      inputType: StreamType.Opus,
    });
  }

  public static async fromSong(song: Song, seek?: number): Promise<QueueSong> {
    return new this({
      title: song.title,
      author: song.author,
      duration: song.duration,
      url: song.url,
      relatedUrl: song.relatedUrl,
      thumbnail: song.thumbnail,
      startTime: (!seek) ? 0 : seek,
      resource: await this.makeResource(song.url, seek),
    });
  }
}
