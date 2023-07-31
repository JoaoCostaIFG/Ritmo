export enum QueueError {
  ConnectionFailed = "The connection to the voice channel failed",
  NotConnected = "Not connected to a voice channel",
  QueueMaxSize = "Reached the queue's max size",
  SongQueryFail = "Given query yielded no results",
  SongURLFail = "Can't find the given song URL",
  NotPlaylist = "The given URL is not a playlist",
  PlaylistURLFail = "Can't find the given playlist URL",
  StreamFail = "Can't play the given URL",
  NoRelated = "Can't autoplay because there is no related song",
  NoSongPlaying = "There is no song playing",
  InvalidSeek = "Invalid seek time for the current song",
}
