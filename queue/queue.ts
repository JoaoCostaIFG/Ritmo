import { VoiceBasedChannel, VoiceChannel } from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  StreamType,
  joinVoiceChannel,
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
} from "@discordjs/voice";
import { stream, yt_validate } from "play-dl";

import Song, { SongArgs } from "./song.js";
import { secs2TimeStr } from "../utils/time.js";

interface QueueSongArgs extends SongArgs {
  startTime: number;
  resource: AudioResource<null>;
}

export class QueueSong extends Song {
  private startTime: number;
  private resource: AudioResource<null>;

  private constructor({ title, author, duration, url,
    relatedUrl, thumbnail, startTime, resource }: QueueSongArgs) {
    super({ title, author, duration, url, relatedUrl, thumbnail });
    this.startTime = startTime;
    this.resource = resource;
  }

  public play(player: AudioPlayer): void {
    player.play(this.resource);
  }

  public time(): number {
    return Math.trunc(this.resource.playbackDuration / 1000.0 + this.startTime);
  }

  public timeStr(): string {
    return secs2TimeStr(this.time());
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

export class Queue {
  private songs: Song[];
  private player: AudioPlayer;
  private doAutoplay: boolean;
  private doLoop: boolean;
  private relatedSong: string | undefined;
  private currentSong: QueueSong | undefined;

  constructor() {
    this.songs = [];
    this.player = createAudioPlayer();
    this.doAutoplay = false;
    this.doLoop = false;
    this.relatedSong = undefined;
    this.currentSong = undefined;

    this.player.on(AudioPlayerStatus.Idle, async () => {
      try {
        await this.next();
      } catch (error) {
        console.error(`The player is idle and we got an error while getting to the next song: [error=${error}]`);
      }
    });

    this.player.on('error', error => {
      console.error(`The player found an error: [error=${error}]`);
    });
  }

  hasSong(): boolean {
    return this.currentSong !== undefined;
  }

  getCurrentSong(): QueueSong {
    if (!this.currentSong) {
      throw new Error("No song is playing");
    }
    return this.currentSong;
  }

  autoplay(): void {
    this.doAutoplay = true;
  }

  stopAutoplay(): void {
    this.doAutoplay = false;
  }

  loop(): void {
    this.doLoop = true;
  }

  stopLoop(): void {
    this.doLoop = false;
  }

  resume(): void {
    this.player.unpause();
  }

  pause(): void {
    this.player.pause();
  }

  clear(): void {
    this.songs = [];
    this.relatedSong = undefined;
  }

  stop(): void {
    this.songs = [];
    this.currentSong = undefined;
    this.relatedSong = undefined;
    this.player.stop();
  }

  async seek(seconds: number): Promise<void> {
    if (!this.currentSong) {
      throw new Error("No song is playing");
    } else if (this.currentSong.duration <= seconds) {
      throw new Error("Seeking past song duration");
    }

    this.currentSong.seek(this.player, seconds);
  }

  async next(): Promise<void> {
    if (!this.doLoop) {
      this.currentSong = undefined;
    }
    await this.process();
  }

  async skip(): Promise<void> {
    if (this.doLoop) {
      // force a skip
      this.currentSong = undefined;
    }
    return this.next();
  }

  async add(arg: string): Promise<Song> {
    const isUrl = arg.startsWith("https") && yt_validate(arg) !== "search";

    const song = isUrl ? await Song.fromUrl(arg) : await Song.fromQuery(arg);
    this.songs.push(song);

    // play if there is nothing playing
    await this.process();

    return song;
  }

  join(channel: VoiceBasedChannel): void {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    connection.subscribe(this.player);
  }

  private async process(): Promise<void> {
    if (this.currentSong) {
      // already playing song
      return;
    }

    let song = this.songs.shift();
    if (!song) {
      // end of queue
      this.player.stop();
      if (this.doAutoplay) {
        if (this.relatedSong) {
          await this.add(this.relatedSong);
          await this.process();
        } else {
          console.error("Tried to autoplay but there is no related song");
        }
      }
      return;
    } else {
      // save related song for autoplay
      this.relatedSong = song.relatedUrl;
    }

    this.currentSong = await QueueSong.fromSong(song);
    this.currentSong.play(this.player);
  }
}
