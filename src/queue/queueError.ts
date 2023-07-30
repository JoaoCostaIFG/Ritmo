export enum QueueError {
  ConnectionFailed = "The connection to the voice channel failed",
  NotConnected = "Not connected to a voice channel",
  QueueMaxSize = "Reached the queue's max size",
  SongQueryFail = "Given query yielded no results",
  SongURLFail = "Can't find the given URL",
  StreamFail = "Can't play the given URL",
  NoRelated = "Can't autoplay because there is no related song",
  NoSongPlaying = "There is no song playing",
  InvalidSeek = "Invalid seek time for the current song",
}
