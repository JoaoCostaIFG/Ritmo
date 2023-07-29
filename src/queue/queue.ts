import { VoiceBasedChannel } from "discord.js";
import {
  createAudioPlayer,
  joinVoiceChannel,
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection,
} from "@discordjs/voice";
import { yt_validate } from "play-dl";

import Song from "./song.js";
import { Result, ResultAsync, err, ok } from "neverthrow";
import { QueueSong } from "./queueSong.js";

enum QueueError {
  ConnectionFailed = "The connection to the voice channel failed",
  NotConnected = "Not connected to a voice channel",
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

  getCurrentSong(): Result<QueueSong, Error> {
    if (!this.currentSong) {
      return err(Error("No song is playing"));
    }
    return ok(this.currentSong);
  }

  autoplay(): void {
    this.doAutoplay = true;
  }

  noAutoplay(): void {
    this.doAutoplay = false;
  }

  loop(): void {
    this.doLoop = true;
  }

  noLoop(): void {
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

  join(channel: VoiceBasedChannel): ResultAsync<void, Error> {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });
    connection.on(VoiceConnectionStatus.Disconnected, async (_oldState, _newState) => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Seems to be reconnecting to a new channel - ignore disconnect
      } catch (error) {
        // Seems to be a real disconnect which SHOULDN'T be recovered from
        connection.destroy();
      }
    });

    return ResultAsync.fromPromise(
      entersState(connection, VoiceConnectionStatus.Ready, 3_000),
      () => QueueError.ConnectionFailed
    )
      .map(() => { connection.subscribe(this.player); return; })
      .mapErr((error) => new Error(error));
  }

  disconnect(channel: VoiceBasedChannel): Result<void, Error> {
    const connection = getVoiceConnection(channel.guild.id);
    if (connection) {
      connection.destroy();
      return ok(undefined);
    }
    return err(new Error(QueueError.NotConnected));
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
