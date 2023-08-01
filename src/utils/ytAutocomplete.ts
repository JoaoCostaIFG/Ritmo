import {okAsync, ResultAsync} from "neverthrow";
import {search, yt_validate} from "play-dl";

export default function getYtAutocomplete(query: string): ResultAsync<string[], Error> {
  if (query.startsWith("https://") && yt_validate(query)) {
    // don't autocomplete URLs
    return okAsync([]);
  }

  return ResultAsync.fromPromise(
    search(query, { limit: 10, source: { youtube: "video" } }),
    () => new Error("Failed to autocomplete query"),
  )
    .map(searched =>
      searched.map(song => song.title ?? "").filter(title => title !== ""));
}
