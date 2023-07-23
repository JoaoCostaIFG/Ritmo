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
  private autoPlay: boolean;
  private relatedSong: string | undefined;
  public currentSong: Song | undefined;

  constructor() {
    this.songs = [];
    this.player = createAudioPlayer();
    this.autoPlay = false;
    this.relatedSong = undefined;

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
      if (this.autoPlay) {
        if (this.relatedSong) {
          await this.add(this.relatedSong).catch(console.error);
          await this.process().catch(console.error);
        } else {
          console.error("Tried to autoplay but there is no related song");
        }
      }
      return;
    } else {
      // save related song for autoplay
      this.relatedSong = this.currentSong.relatedUrl;
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

  autoplay() {
    this.autoPlay = true;
  }

  stopAutoplay() {
    this.autoPlay = false;
  }

  resume() {
    this.player.unpause();
  }

  pause() {
    this.player.pause();
  }

  stop() {
    this.songs = [];
    this.currentSong = undefined;
    this.relatedSong = undefined;
    this.player.stop();
  }
}
