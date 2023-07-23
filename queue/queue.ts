import {VoiceChannel} from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  StreamType,
  joinVoiceChannel,
  AudioPlayer,
  AudioPlayerStatus,
} from "@discordjs/voice";
import {stream, yt_validate} from "play-dl";

import Song from "./song.js";

export class Queue {
  private songs: Song[];
  private player: AudioPlayer;
  public currentSong: Song | undefined;

  constructor() {
    this.songs = [];
    this.player = createAudioPlayer();
    this.currentSong = undefined;

    this.player.on(AudioPlayerStatus.Idle, async () => {
      await this.next().catch(console.error);
    });

    this.player.on('error', error => {
      console.error(error);
    });
  }

  async add(arg: string) {
    const isUrl = arg.startsWith("https") && yt_validate(arg) !== "search";
    try {
      const song = isUrl ? await Song.fromUrl(arg) : await Song.fromQuery(arg);
      this.songs.push(song);
      return Promise.resolve(song);
    } catch (reject) {
      return Promise.reject(reject);
    }
  }

  async process() {
    if (this.currentSong) {
      // already playing song
      return;
    }

    this.currentSong = this.songs.shift();
    if (!this.currentSong) {
      // end of queue
      this.player.stop();
      return;
    }

    let songStream = await stream(this.currentSong.url).catch(Promise.reject);
    const resource = createAudioResource(songStream.stream, {
      inputType: StreamType.Opus,
    });

    this.player.play(resource);
  }

  join(channel: VoiceChannel) {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    connection.subscribe(this.player);
  }

  async next() {
    this.currentSong = undefined;
    await this.process().catch(console.error);
  }

  resume() {
    this.player.unpause();
  }

  pause() {
    this.player.pause();
  }

  clear() {
    this.songs = [];
    this.currentSong = undefined;
    this.player.stop();
  }
}
