import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { yt_validate, playlist_info } from "play-dl";
import { QueueError } from "./queueError";
import Song from "./song";

export interface PlaylistArgs {
    title: string;
    author: string;
    url: string;
    thumbnail: string;
    songs: Song[];
}

export default class Playlist {
    public readonly title: string;
    public readonly author: string;
    public readonly url: string;
    public readonly thumbnail: string;
    public readonly songs: Song[];

    constructor({ title, author, url, thumbnail, songs }: PlaylistArgs) {
        this.title = title;
        this.author = author ?? "Unknown";
        this.url = url;
        this.thumbnail = thumbnail;
        this.songs = songs;
    }

    static fromUrl(url: string, max: number = Infinity): ResultAsync<Playlist, Error> {
        if (!url.startsWith("https") || yt_validate(url) !== "playlist") {
            return errAsync(new Error(QueueError.NotPlaylist));
        }

        return ResultAsync.fromPromise(
            playlist_info(url, { incomplete: true }), () => new Error(QueueError.PlaylistURLFail))
            .andThen(playlist => {
                if (playlist.total_videos < max) {
                    playlist.fetch(max - playlist.total_videos);
                }
                if (playlist.total_videos === 0) {
                    return errAsync(new Error(QueueError.PlaylistURLFail));
                }

                const songs: ResultAsync<Song, Error>[] = [];
                for (let pageIdx = 0; pageIdx < playlist.total_pages &&
                    songs.length < max; ++pageIdx) {
                    const page = playlist.page(pageIdx + 1).slice(0, max - songs.length)
                    for (const songInfo of page) {
                        songs.push(Song.fromUrl(songInfo.url));
                    }
                }

                return ResultAsync.combine(songs)
                    .andThen(songs => {
                        return okAsync(new this({
                            title: playlist.title!,
                            author: playlist.channel!.name!,
                            url: playlist.url!,
                            thumbnail: playlist.thumbnail ? playlist.thumbnail.url : songs[0].thumbnail,
                            songs: songs,
                        }));
                    });
            });
    }
}