const {
  createAudioPlayer,
  createAudioResource,
  StreamType,
  joinVoiceChannel,
} = require("@discordjs/voice");
const { stream, yt_validate } = require("play-dl");

const Song = require("./song");

class Queue {
  constructor() {
    this.songs = [];
    this.currentSong = null;
    this.player = createAudioPlayer();
  }

  async add(arg) {
    const isUrl = arg.startsWith("https") && yt_validate(arg) !== "search";
    try {
      const song = isUrl ? await Song.fromUrl(arg) : await Song.fromQuery(arg);
      this.songs.push(song);
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
      return;
    }

    let songStream = await stream(this.currentSong.url).catch(Promise.reject);
    const resource = createAudioResource(songStream.stream, {
      inputType: StreamType.Opus,
    });

    this.player.play(resource);
  }

  join(channel) {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    connection.subscribe(this.player);
  }

  pause() {
    this.player.pause();
  }

  clear() {
    this.songs.clear();
    this.currentSong = null;
  }
}

module.exports = Queue;
