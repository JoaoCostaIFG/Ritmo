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

import Song from "./song.js";
import { Result, ResultAsync, err, errAsync, ok } from "neverthrow";
import { QueueSong } from "./queueSong.js";
import { QueueError } from "./queueError.js";
import Playlist from "./playlist.js";

interface QueueArgs {
  maxSize?: number;
  maxHistory?: number;
}

export class Queue {
  private readonly maxSize: number;
  private readonly maxHistory: number;

  private songs: Song[];
  private player: AudioPlayer;
  private doAutoplay: boolean;
  private doLoop: boolean;
  private relatedSong: string | undefined;
  private currentSong: QueueSong | undefined;

  constructor({ maxSize, maxHistory }: QueueArgs) {
    this.maxSize = maxSize ?? 100;
    this.maxHistory = maxHistory ?? 10;

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
      return err(Error(QueueError.NoSongPlaying));
    }
    return ok(this.currentSong);
  }

  get size(): number {
    return this.songs.length;
  }

  get queue(): Song[] {
    return this.songs;
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
    // TODO remove this
    console.log(this.maxHistory);
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

  seek(seconds: number): ResultAsync<void, Error> {
    if (!this.currentSong) {
      return errAsync(Error(QueueError.NoSongPlaying));
    } else if (this.currentSong.duration <= seconds) {
      return errAsync(Error(QueueError.InvalidSeek));
    }

    return this.currentSong.seek(this.player, seconds);
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

  play(arg: string): ResultAsync<Song, Error> {
    if (this.songs.length >= this.maxSize) {
      return errAsync(new Error(QueueError.QueueMaxSize));
    }

    let songRes: ResultAsync<Song, Error> =
      (arg.startsWith("https")) ? Song.fromUrl(arg) : Song.fromQuery(arg);
    return songRes.map(song => {
      this.songs.push(song);
      // play if there is nothing playing
      this.process();
      return song;
    });
  }

  playList(arg: string): ResultAsync<Playlist, Error> {
    if (this.songs.length >= this.maxSize) {
      return errAsync(new Error(QueueError.QueueMaxSize));
    }

    return Playlist.fromUrl(arg, this.maxSize - this.songs.length)
      .map(playlist => {
        this.songs.push(...playlist.songs);
        // play if there is nothing playing
        this.process();
        return playlist;
      });
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
          entersState(connection, VoiceConnectionStatus.Signalling, 2_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 2_000),
        ]);
        // Seems to be reconnecting to a new channel - ignore disconnect
      } catch (_error) {
        // Seems to be a real disconnect which SHOULDN'T be recovered from
        this.stop();
        try {
          connection.destroy();
        } catch (_error) {
          // ignored
        }
      }
    });

    return ResultAsync.fromPromise(
      entersState(connection, VoiceConnectionStatus.Ready, 3_000),
      () => new Error(QueueError.ConnectionFailed),
    )
      .map(() => { connection.subscribe(this.player); });
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
          const addRes = await this.play(this.relatedSong);
          if (addRes.isErr()) {
            console.error(addRes.error.message);
          }
        } else {
          // should never happen
          console.error(QueueError.NoRelated);
        }
      }
      return;
    } else {
      // save related song for autoplay
      this.relatedSong = song.relatedUrl;
    }

    const queueSongRes = await QueueSong.fromSong(song);
    if (queueSongRes.isErr()) {
      console.error(queueSongRes.error.message);
      return;
    }
    this.currentSong = queueSongRes.value;
    this.currentSong.play(this.player);
  }
}
