import {VoiceBasedChannel} from "discord.js";
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
import {Result, ResultAsync, err, errAsync, ok, okAsync} from "neverthrow";
import {QueueSong} from "./queueSong.js";
import {QueueError} from "./queueError.js";
import Playlist from "./playlist.js";
import {logger} from "../utils/logger.js";

interface QueueArgs {
  maxSize?: number;
  maxHistory?: number;
}

export class Queue {
  private readonly maxSize: number;
  private readonly maxHistory: number;

  private songs: Song[];
  private history: Song[];
  private player: AudioPlayer;
  private doAutoplay: boolean;
  private doLoop: boolean;
  private relatedSong: string | undefined;
  private currentSong: QueueSong | undefined;

  constructor({maxSize, maxHistory}: QueueArgs) {
    this.maxSize = maxSize ?? 100;
    this.maxHistory = maxHistory ?? 10;

    this.songs = [];
    this.history = [];
    this.player = createAudioPlayer();
    this.doAutoplay = false;
    this.doLoop = false;
    this.relatedSong = undefined;
    this.currentSong = undefined;

    this.player.on(AudioPlayerStatus.Idle, async () => {
      try {
        await this.next();
      } catch (error) {
        logger.error(`The player is idle and we got an error while getting to the next song: [error=${error}]`);
      }
    });

    this.player.on('error', error => {
      logger.error(`The player found an error: [error=${error}]`);
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

  get histSize(): number {
    return this.history.length;
  }

  get hist(): Song[] {
    return this.history;
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

  seek(seconds: number): ResultAsync<void, Error> {
    if (!this.currentSong) {
      return errAsync(Error(QueueError.NoSongPlaying));
    } else if (this.currentSong.duration <= seconds) {
      return errAsync(Error(QueueError.InvalidSeek));
    }

    return this.currentSong.seek(this.player, seconds);
  }

  move(from: number): Result<number, Error>
  move(from: number, to: number | undefined): Result<number, Error>
  move(from: number, to?: number | undefined): Result<number, Error> {
    const fromIdx = from - 1;
    if (fromIdx >= this.songs.length || fromIdx < 0) {
      return err(Error(QueueError.InvalidMove));
    }

    const toIdx = (to === undefined) ? 0 : to - 1;
    if (toIdx >= this.songs.length || toIdx < 0) {
      return err(Error(QueueError.InvalidMove));
    }

    const tmp = this.songs.splice(fromIdx, 1)[0];
    this.songs.splice(toIdx, 0, tmp);

    return ok(toIdx + 1);
  }

  remove(from: number): Result<Song, Error> {
    const fromIdx = from - 1;
    if (fromIdx >= this.songs.length || fromIdx < 0) {
      return err(Error(QueueError.InvalidMove));
    }

    return ok(this.songs.splice(fromIdx, 1)[0]);
  }

  shuffle(): void {
    // Fisher–Yates shuffle algorithm
    // https://blog.codinghorror.com/the-danger-of-naivete/
    for (let i = this.songs.length - 1; i > 0; --i) {
      const n = Math.floor(Math.random() * (i + 1));
      const tmp = this.songs[i];
      this.songs[i] = this.songs[n];
      this.songs[n] = tmp;
    }
  }

  async next(forceSkip: boolean = false): Promise<void> {
    if (this.currentSong) {
      // save history
      if (this.history.length >= this.maxHistory) {
        this.history.splice(0, 1);
      }
      this.history.push(this.currentSong.toSong());

      // loop if wanted/needed
      if (this.doLoop && !forceSkip) {
        this.songs.splice(0, 0, this.currentSong.toSong());
      }
    }

    this.currentSong = undefined;
    await this.process();
  }

  async skip(): Promise<void> {
    return this.next(true);
  }

  private query2Song(arg: string): ResultAsync<Song, Error> {
    if (this.songs.length >= this.maxSize) {
      return errAsync(new Error(QueueError.QueueMaxSize));
    }

    return (arg.startsWith("https")) ? Song.fromUrl(arg) : Song.fromQuery(arg);
  }

  play(arg: string): ResultAsync<Song, Error> {
    return this.query2Song(arg).map(song => {
      this.songs.push(song);
      // play if there is nothing playing
      this.process();
      return song;
    });
  }

  back(): ResultAsync<Song, Error> {
    if (this.history.length > 0) {
      const song = this.history.pop()!;
      return this.play(song.url);
    }
    return errAsync(new Error(QueueError.NoSongPlaying));
  }

  replay(): ResultAsync<Song, Error> {
    if (this.currentSong) {
      const song = this.currentSong.toSong();
      this.songs.splice(0, 0, song);
      return okAsync(song);
    }
    return this.back();
  }

  playskip(arg: string): ResultAsync<Song, Error> {
    return this.query2Song(arg).map(song => {
      this.songs.splice(0, 0, song);
      // play if there is nothing playing
      this.skip();
      return song;
    });
  }

  playlist(arg: string): ResultAsync<Playlist, Error> {
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
    if (connection.listeners(VoiceConnectionStatus.Disconnected).length === 0) {
      // prevent memory leak thing
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
    }

    return ResultAsync.fromPromise(
      entersState(connection, VoiceConnectionStatus.Ready, 3_000),
      () => new Error(QueueError.ConnectionFailed),
    )
      .map(() => {connection.subscribe(this.player);});
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
            logger.error(addRes.error.message);
          }
        } else {
          // should never happen
          logger.warn(QueueError.NoRelated);
        }
      }
      return;
    } else {
      // save related song for autoplay
      this.relatedSong = song.relatedUrl;
    }

    const queueSongRes = await QueueSong.fromSong(song);
    if (queueSongRes.isErr()) {
      logger.error(queueSongRes.error.message);
      return;
    }
    this.currentSong = queueSongRes.value;
    this.currentSong.play(this.player);
  }
}
