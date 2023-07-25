import { VoiceChannel, time } from "discord.js";
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

import Song from "./song.js";

export class Queue {
  private songs: Song[];
  private player: AudioPlayer;
  private doAutoplay: boolean;
  private doLoop: boolean;
  private relatedSong: string | undefined;
  private currentSong: AudioResource<Song> | undefined;

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

  private async playResource(song: Song, seek?: number): Promise<void> {
    //let songStream = await stream(song.url, { seek: seek });
    let songStream = await stream("https://www.youtube.com/watch?v=Sj57a1mP_n0", { seek: seek });
    console.log(songStream);
    this.currentSong = createAudioResource(songStream.stream, {
      metadata: song,
    });

    this.player.play(this.currentSong);
  }

  getCurrentSong(): Song {
    if (!this.currentSong) {
      throw new Error("No song is playing");
    }
    return this.currentSong.metadata;
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
    } else if (this.currentSong.metadata.duration <= seconds) {
      throw new Error("Seeking past song duration");
    }

    this.playResource(this.currentSong.metadata, seconds);
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

    return song;
  }

  async process(): Promise<void> {
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

    this.playResource(song);
  }

  join(channel: VoiceChannel): void {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    connection.subscribe(this.player);
  }
}
